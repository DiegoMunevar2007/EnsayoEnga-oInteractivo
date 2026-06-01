import { useRef, useEffect, useCallback, useState } from 'react'

const TOTAL_STEPS = 100
const DENOISE_DURATION = 6000
const NOISE_SCALE = 4 // noise overlay at 1/4 resolution for speed

// Resolution levels for multi‑resolution progressive rendering
// [appearP, opaqueStartP, opaqueEndP, disappearP, width]
const RES_LEVELS = [
  [0.00, 0.00, 0.20, 0.33, 64],
  [0.20, 0.33, 0.45, 0.50, 128],
  [0.45, 0.50, 0.70, 0.75, 256],
  [0.70, 0.75, 1.00, 1.00, null],
]

// ---- Value Noise 2D ----
function hash(px, py) {
  const n = Math.sin(px * 127.1 + py * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothstep01(t) {
  const v = Math.max(0, Math.min(1, t))
  return v * v * (3 - 2 * v)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function valueNoise2D(x, y) {
  const ix = Math.floor(x); const iy = Math.floor(y)
  const fx = x - ix; const fy = y - iy
  const sx = smoothstep01(fx); const sy = smoothstep01(fy)
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), sx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), sx),
    sy,
  )
}

// Pre‑compute tiling noise lookup (256×256)
const LOOKUP_SIZE = 256

function buildNoiseLookup() {
  const freq = 4
  const a = new Float32Array(LOOKUP_SIZE * LOOKUP_SIZE)
  for (let y = 0; y < LOOKUP_SIZE; y++)
    for (let x = 0; x < LOOKUP_SIZE; x++)
      a[y * LOOKUP_SIZE + x] = valueNoise2D(x * freq / LOOKUP_SIZE, y * freq / LOOKUP_SIZE)
  return a
}

const noiseLookup = buildNoiseLookup()

function sampleNoise(x, y) {
  const ix = ((Math.floor(x * LOOKUP_SIZE) % LOOKUP_SIZE) + LOOKUP_SIZE) % LOOKUP_SIZE
  const iy = ((Math.floor(y * LOOKUP_SIZE) % LOOKUP_SIZE) + LOOKUP_SIZE) % LOOKUP_SIZE
  return noiseLookup[iy * LOOKUP_SIZE + ix]
}

// ---- DDPM cosine schedule ----
function ddpmAlphaBar(t) {
  const val = Math.cos((((t / TOTAL_STEPS) + 0.008) / 1.008) * Math.PI / 2)
  return Math.min(1, Math.max(0, val * val))
}

// ---- Resolution level opacity ----
function levelOpacity(progress, idx) {
  const [appear, opaqueStart, opaqueEnd, disappear] = RES_LEVELS[idx]
  if (progress <= appear || progress >= disappear) return 0
  if (progress >= opaqueStart && progress <= opaqueEnd) return 1
  if (progress < opaqueStart) return smoothstep01((progress - appear) / (opaqueStart - appear))
  return smoothstep01(1 - (progress - opaqueEnd) / (disappear - opaqueEnd))
}

export default function DenoisingCanvas({
  imageSrc = 'https://cdn.pixabay.com/photo/2024/01/06/15/26/ai-generated-8491587_1280.jpg',
  onComplete,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const resCanvasesRef = useRef([])
  const srcAspectRef = useRef(null)
  const startTimeRef = useRef(null)
  const animRef = useRef(null)
  const dprRef = useRef(1)
  const [phase, setPhase] = useState('loading')

  // ---- Load image + pre‑render resolution levels ----
  const loadImage = useCallback(() => {
    setPhase('loading')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ow = img.naturalWidth
      const oh = img.naturalHeight
      srcAspectRef.current = ow / oh
      const canvases = RES_LEVELS.map(([, , , , width]) => {
        const c = document.createElement('canvas')
        if (width === null) {
          c.width = ow; c.height = oh
        } else {
          const ratio = oh / ow
          c.width = width; c.height = Math.round(width * ratio)
        }
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        return c
      })
      resCanvasesRef.current = canvases
      setPhase('denoising')
    }
    img.onerror = () => setPhase('loading')
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => { loadImage() }, [loadImage])

  // ---- Resize canvas to container ----
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return
    const resize = () => {
      const rect = containerRef.current.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      const c = canvasRef.current
      c.width = rect.width * dpr
      c.height = rect.height * dpr
      c.style.width = `${rect.width}px`
      c.style.height = `${rect.height}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ---- Denoising animation ----
  useEffect(() => {
    if (phase !== 'denoising') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = dprRef.current
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    const canvases = resCanvasesRef.current
    if (!canvases.length) return

    startTimeRef.current = performance.now()

    const ZOOM = 1.12
    const aspect = srcAspectRef.current
    const getRect = (w, h) => {
      const dstAspect = w / h
      let dw, dh, dx, dy
      if (aspect > dstAspect) {
        dw = w; dh = w / aspect
      } else {
        dh = h; dw = h * aspect
      }
      dw *= ZOOM; dh *= ZOOM
      dx = (w - dw) / 2; dy = (h - dh) / 2
      return { dx, dy, dw, dh }
    }

    const loop = (now) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(1, elapsed / DENOISE_DURATION)

      // DDPM cosine schedule
      const t = (1 - progress) * TOTAL_STEPS
      const noiseAmount = Math.sqrt(Math.max(0, 1 - ddpmAlphaBar(t)))

      // ---- Step 1: render multi‑resolution layers ----
      const { dx, dy, dw, dh } = getRect(cw, ch)
      ctx.fillStyle = '#0a0806'
      ctx.fillRect(0, 0, cw, ch)
      for (let i = 0; i < RES_LEVELS.length; i++) {
        const op = levelOpacity(progress, i)
        if (op < 0.005) continue
        const src = canvases[i]
        const isFull = RES_LEVELS[i][4] === null
        ctx.globalAlpha = op
        ctx.imageSmoothingEnabled = isFull
        ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy, dw, dh)
      }
      ctx.globalAlpha = 1

      // ---- Step 2: coherent value noise (getImageData at 1/4 resolution) ----
      if (noiseAmount > 0.005) {
        const rw = Math.ceil(cw / NOISE_SCALE)
        const rh = Math.ceil(ch / NOISE_SCALE)

        // Offscreen render at reduced resolution
        const tmp = document.createElement('canvas')
        tmp.width = rw; tmp.height = rh
        const tctx = tmp.getContext('2d')
        tctx.drawImage(canvas, 0, 0, rw, rh)

        const imgData = tctx.getImageData(0, 0, rw, rh)
        const data = imgData.data
        for (let py = 0; py < rh; py++) {
          for (let px = 0; px < rw; px++) {
            const n = (sampleNoise(px / rw, py / rh) - 0.5) * 2 * noiseAmount * 255
            const off = (py * rw + px) * 4
            data[off] = Math.max(0, Math.min(255, data[off] + n))
            data[off + 1] = Math.max(0, Math.min(255, data[off + 1] + n))
            data[off + 2] = Math.max(0, Math.min(255, data[off + 2] + n))
          }
        }
        tctx.putImageData(imgData, 0, 0)

        // Scale up to full resolution (creates blocky noise → looks like real diffusion)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(tmp, 0, 0, cw, ch)
        ctx.imageSmoothingEnabled = true
      }

      // ---- Step 3: HUD overlays ----
      // Step counter
      const step = Math.floor(progress * TOTAL_STEPS)
      ctx.save()
      ctx.fillStyle = 'rgba(10, 8, 6, 0.6)'
      ctx.fillRect(0, ch - 22, 120, 22)
      ctx.fillStyle = 'rgba(180, 149, 46, 0.7)'
      ctx.font = '9px monospace'
      ctx.textBaseline = 'middle'
      ctx.fillText(`step ${step} / ${TOTAL_STEPS}`, 10, ch - 11)

      // Progress bar
      ctx.fillStyle = 'rgba(180, 149, 46, 0.1)'
      ctx.fillRect(0, 0, cw, 2)
      ctx.fillStyle = 'rgba(180, 149, 46, 0.35)'
      ctx.fillRect(0, 0, cw * progress, 2)
      ctx.restore()

      // ---- Step 4: continue or finish ----
      if (progress < 1) {
        animRef.current = requestAnimationFrame(loop)
      } else {
        ctx.fillStyle = '#0a0806'
        ctx.fillRect(0, 0, cw, ch)
        const fullCanvas = canvases[RES_LEVELS.length - 1]
        const { dx: fx, dy: fy, dw: fw, dh: fh } = getRect(cw, ch)
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(fullCanvas, 0, 0, fullCanvas.width, fullCanvas.height, fx, fy, fw, fh)
        setPhase('complete')
        onComplete?.()
      }
    }

    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [phase, onComplete])

  // ---- Click to replay ----
  const handleClick = useCallback(() => {
    if (phase === 'denoising') return
    loadImage()
  }, [phase, loadImage])

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden select-none"
      onClick={handleClick}
      style={{ cursor: phase !== 'denoising' ? 'pointer' : 'default' }}
    >
      {phase === 'loading' && (
        <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0806' }}>
          <span className="text-[0.55rem] tracking-[0.25em] uppercase font-mono"
            style={{ color: 'var(--dg-text-muted)', opacity: 0.5 }}>
            Loading...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: phase === 'loading' ? 'none' : 'block', background: '#0a0806' }}
      />
    </div>
  )
}
