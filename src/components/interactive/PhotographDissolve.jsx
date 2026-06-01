import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GLITCH_DURATION = 2800
const DISSOLVE_DURATION = 2200
const CHAR_INTERVAL = 35

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default function PhotographDissolve({
  sentence = '',
  onComplete,
}) {
  const [phase, setPhase] = useState('showing')
  const [step, setStep] = useState(0)
  const [revealedChars, setRevealedChars] = useState(0)
  const [showFin, setShowFin] = useState(false)
  const canvasRef = useRef(null)
  const offscreenRef = useRef(null)
  const containerRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const animRef = useRef(null)
  const startTimeRef = useRef(0)
  const [canvasReady, setCanvasReady] = useState(false)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = canvasWrapRef.current
    if (!canvas || !wrap) return

    const rect = wrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const offscreen = document.createElement('canvas')
    offscreen.width = w * dpr
    offscreen.height = h * dpr
    const offCtx = offscreen.getContext('2d')
    offCtx.scale(dpr, dpr)
    offscreenRef.current = offscreen

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = `${import.meta.env.BASE_URL}images/Fake_trump_image.png`
    img.onload = () => {
      const fitScale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const reduce = 0.75
      const scale = fitScale * reduce
      const dx = (w - img.naturalWidth * scale) / 2
      const dy = (h - img.naturalHeight * scale) / 2
      offCtx.fillStyle = '#080604'
      offCtx.fillRect(0, 0, w, h)
      offCtx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale)
      ctx.drawImage(offscreen, 0, 0, w, h)
      setCanvasReady(true)
    }
    img.onerror = () => {
      offCtx.fillStyle = '#080604'
      offCtx.fillRect(0, 0, w, h)
      ctx.drawImage(offscreen, 0, 0, w, h)
      setCanvasReady(true)
    }
  }, [])

  useEffect(() => {
    initCanvas()
    const ro = new ResizeObserver(() => initCanvas())
    if (canvasWrapRef.current) ro.observe(canvasWrapRef.current)
    return () => ro.disconnect()
  }, [initCanvas])

  const startGlitch = useCallback(() => {
    setPhase('glitching')
    const canvas = canvasRef.current
    const wrap = canvasWrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    const rect = wrap.getBoundingClientRect()
    const w = rect.width, h = rect.height
    const offscreen = offscreenRef.current
    const dpr = window.devicePixelRatio || 1
    startTimeRef.current = performance.now()

    let prevIntensity = 0

    const glitchLoop = (now) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(1, elapsed / GLITCH_DURATION)
      const intensity = progress * progress * progress

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(offscreen, 0, 0, w, h)

      if (intensity > 0.05) {
        const shift = 4 * intensity
        const imageData = ctx.getImageData(0, 0, w * dpr, h * dpr)
        const data = imageData.data
        const iw = Math.floor(w * dpr)
        const ih = Math.floor(h * dpr)
        const rowSkip = Math.max(1, Math.floor(3 - intensity * 2.5))

        for (let y = 0; y < ih; y += rowSkip) {
          if (Math.random() > intensity * 0.3) continue
          const xShift = Math.floor((Math.random() - 0.5) * shift * 2)
          if (xShift === 0) continue
          for (let x = 0; x < iw; x++) {
            const i = (y * iw + x) * 4
            const srcX = Math.min(iw - 1, Math.max(0, x + xShift))
            const srcI = (y * iw + srcX) * 4
            data[i] = data[srcI]
            data[i + 1] = data[srcI + 1]
            data[i + 2] = data[srcI + 2]
          }
        }

        if (intensity > 0.15) {
          for (let y = 0; y < ih; y += Math.max(1, Math.floor(rowSkip * 1.5))) {
            if (Math.random() > intensity * 0.2) continue
            const xShift = Math.floor((Math.random() - 0.5) * shift * 3)
            if (xShift === 0) continue
            for (let x = 0; x < iw; x++) {
              const i = (y * iw + x) * 4
              const srcR = (y * iw + Math.min(iw - 1, Math.max(0, x + xShift))) * 4
              const srcB = (y * iw + Math.min(iw - 1, Math.max(0, x - xShift))) * 4
              data[i] = data[srcR]
              data[i + 2] = data[srcB]
            }
          }
        }

        ctx.putImageData(imageData, 0, 0)
      }

      if (intensity > 0.3) {
        ctx.fillStyle = `rgba(0,0,0,${0.08 + 0.15 * intensity})`
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1)
        }
      }

      if (intensity > 0.5) {
        const numBlocks = Math.floor(intensity * 18)
        for (let i = 0; i < numBlocks; i++) {
          const bx = Math.random() * w
          const by = Math.random() * h
          const bw = 4 + Math.random() * 25 * intensity
          const bh = 4 + Math.random() * 25 * intensity
          const v = Math.random() > 0.5 ? 255 : 0
          ctx.fillStyle = `rgba(${v},${v},${v},${0.4 + 0.4 * intensity})`
          ctx.fillRect(bx, by, bw, bh)
        }
      }

      if (intensity > 0.7) {
        const bands = Math.floor(3 + intensity * 12)
        for (let i = 0; i < bands; i++) {
          const by = Math.random() * h
          const bh = 1 + Math.random() * 4
          ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.1 * intensity})`
          ctx.fillRect(0, by, w, bh)
        }
      }

      if (intensity > 0.85 && Math.random() > 0.7) {
        ctx.fillStyle = `rgba(0,0,0,${0.1 + 0.3 * (intensity - 0.85) * 5})`
        ctx.fillRect(0, 0, w, h)
      }

      prevIntensity = intensity

      if (progress < 1) {
        animRef.current = requestAnimationFrame(glitchLoop)
      } else {
        startDissolve(ctx, w, h, dpr)
      }
    }

    animRef.current = requestAnimationFrame(glitchLoop)
  }, [])

  const startDissolve = useCallback((ctx, w, h, dpr) => {
    setPhase('dissolving')
    const offscreen = offscreenRef.current

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(offscreen, 0, 0, w, h)

    const imageData = ctx.getImageData(0, 0, w * dpr, h * dpr)
    const data = imageData.data
    const iw = Math.floor(w * dpr)
    const ih = Math.floor(h * dpr)
    const particles = []
    const targetCount = 5000
    const step = Math.max(1, Math.floor(Math.sqrt((iw * ih) / targetCount)))

    for (let y = 0; y < ih; y += step) {
      for (let x = 0; x < iw; x += step) {
        const i = (y * iw + x) * 4
        if (data[i + 3] > 100) {
          const r = data[i], g = data[i + 1], b = data[i + 2]
          if (r + g + b < 720) {
            particles.push({
              ox: x / dpr, oy: y / dpr,
              x: x / dpr, y: y / dpr,
              color: `rgb(${r},${g},${b})`,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6 - 3,
            })
          }
        }
      }
    }

    ctx.clearRect(0, 0, w, h)
    const dissolveStart = performance.now()

    const dissolveLoop = () => {
      const elapsed = performance.now() - dissolveStart
      const progress = Math.min(1, elapsed / DISSOLVE_DURATION)
      const ease = easeOutCubic(progress)

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, 1 - ease * 1.2)
        ctx.fillStyle = p.color
        const size = 2 * Math.max(0.1, 1 - ease * 0.6)
        const px = p.ox + p.vx * ease * 70
        const py = p.oy + p.vy * ease * 70
        ctx.fillRect(px, py, size, size)
      }
      ctx.globalAlpha = 1

      if (progress < 1) {
        animRef.current = requestAnimationFrame(dissolveLoop)
      } else {
        ctx.clearRect(0, 0, w, h)
        setPhase('text')
        setStep(0)
      }
    }

    animRef.current = requestAnimationFrame(dissolveLoop)
  }, [])

  const handleClick = useCallback(() => {
    if (phase === 'showing' && canvasReady) {
      startGlitch()
    }
  }, [phase, canvasReady, startGlitch])

  useEffect(() => {
    if (phase === 'text') {
      const t1 = setTimeout(() => setStep(1), 2500)
      const t2 = setTimeout(() => setStep(2), 5000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'text' && step >= 2) {
      setRevealedChars(0)
      let timer
      let finTimer
      timer = setInterval(() => {
        setRevealedChars(prev => {
          if (prev >= sentence.length) {
            clearInterval(timer)
            finTimer = setTimeout(() => {
              setShowFin(true)
              onComplete?.()
            }, 1500)
            return prev
          }
          return prev + 1
        })
      }, CHAR_INTERVAL)
      return () => {
        clearInterval(timer)
        clearTimeout(finTimer)
      }
    }
  }, [phase, step, sentence, onComplete])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onClick={handleClick}
      style={{ background: '#080604', cursor: phase === 'showing' ? 'pointer' : 'default' }}
    >
      <div ref={canvasWrapRef} className="relative flex-1 w-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: phase === 'showing' || phase === 'text' || phase === 'fin' ? 1 : 1,
          }}
        />

        {phase === 'showing' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(8,6,4,0.6) 100%)',
            }}
          />
        )}

        <AnimatePresence>
          {phase === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="max-w-3xl w-full px-6 sm:px-8 text-center">
              <AnimatePresence mode="wait">
                {step >= 0 && (
                  <motion.p
                    key="reflection1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="font-[family-name:Caveat,var(--font-classical)] text-xl sm:text-2xl lg:text-3xl leading-relaxed mb-6"
                    style={{ color: 'var(--cl-accent)' }}
                  >
                    El suceso que retrata esa imagen nunca existió. ¿Te diste cuenta?
                  </motion.p>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {step >= 1 && (
                  <motion.p
                    key="reflection2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="font-[family-name:var(--font-classical)] italic text-sm sm:text-base lg:text-lg leading-relaxed mb-10"
                    style={{ color: 'var(--cl-text-muted)', opacity: 0.7 }}
                  >
                    Zeuxis engañó pájaros. Parrasio engañó a un pintor. Esto engaña a todos.
                  </motion.p>
                )}
              </AnimatePresence>
              {step >= 2 && (
                <p
                  className="font-[family-name:var(--font-classical)] italic text-base sm:text-lg lg:text-xl leading-relaxed"
                  style={{ color: 'var(--cl-text)' }}
                >
                  {sentence.split('').map((char, i) => {
                    const threshold = Math.round(sentence.length * 0.62)
                    return (
                      <span
                        key={i}
                        className="transition-all duration-75"
                        style={{
                          opacity: i < revealedChars ? 1 : 0,
                          filter: i < revealedChars ? 'blur(0)' : 'blur(4px)',
                          color: i >= threshold ? 'var(--dg-accent)' : 'var(--cl-text)',
                        }}
                      >
                        {char}
                      </span>
                    )
                  })}
                </p>
              )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFin && (
            <motion.div
              key="fin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            >
              <span
                className="font-[family-name:var(--font-classical)] text-[0.6rem] tracking-[0.25em] uppercase"
                style={{ color: 'var(--cl-text-muted)', opacity: 0.5 }}
              >
                Fin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'showing' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex-shrink-0 py-3 text-center"
        >
          <span
            className="text-sm tracking-[0.2em]"
            style={{ color: 'var(--cl-accent)', opacity: 0.65 }}
          >
            → Toca para exponer la verdad
          </span>
        </motion.div>
      )}
    </div>
  )
}
