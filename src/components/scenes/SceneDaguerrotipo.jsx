import { useState, useRef, useEffect, useCallback } from 'react'
import { motion as m } from 'framer-motion'
import SceneShell from '../layout/SceneShell'
import ImageReveal from '../interactive/ImageReveal'

const BRUSH_RADIUS = 30
const AUTO_COMPLETE_OPS = 400
const AUTO_COMPLETE_MS = 60000

function createNoiseTexture(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const d = ctx.createImageData(w, h)
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255
    d.data[i] = v
    d.data[i + 1] = v
    d.data[i + 2] = v
    d.data[i + 3] = 12
  }
  ctx.putImageData(d, 0, 0)
  return c
}

const VAPOR_WISPS = Array.from({ length: 7 }, (_, i) => ({
  phaseX: i * 1.8,
  phaseY: i * 2.3,
  phaseR: i * 1.1,
  speedMult: 0.6 + Math.random() * 0.8,
  baseRad: 80 + Math.random() * 80,
  driftX: (Math.random() - 0.5) * 0.06,
  driftY: (Math.random() - 0.5) * 0.06,
}))

export default function SceneDaguerrotipo({ scene, index, direction = 0 }) {
  const [developing, setDeveloping] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [completed, setCompleted] = useState(false)

  const vaporCanvasRef = useRef(null)
  const maskCanvasRef = useRef(null)
  const noiseRef = useRef(null)
  const opsRef = useRef(0)
  const startTimeRef = useRef(null)
  const revealedRef = useRef(false)
  const developingRef = useRef(false)
  const completedRef = useRef(false)
  const animRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const resizeRef = useRef(null)

  useEffect(() => { developingRef.current = developing }, [developing])
  useEffect(() => { completedRef.current = completed }, [completed])

  const initCanvas = useCallback(() => {
    const canvas = vaporCanvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const setSize = () => {
      const rect = parent.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w > 0 && h > 0) {
        const changed = canvas.width !== w || canvas.height !== h
        canvas.width = w
        canvas.height = h
        if (changed) {
          noiseRef.current = createNoiseTexture(w, h)
          const ctx = canvas.getContext('2d')
          drawVaporBase(ctx, w, h, 0, null)
        }
      }
    }

    setSize()

    // ResizeObserver — keep canvas synced
    const ro = new ResizeObserver(setSize)
    ro.observe(parent)
    resizeRef.current = ro
  }, [])

  // Animation loop — reads canvas dimensions each frame for robustness
  useEffect(() => {
    const canvas = vaporCanvasRef.current
    if (!canvas) return

    initCanvas()

    // Mask starts transparent (nothing cleared). User adds opaque dots
    // which the loop composites with destination-out to clear vapor.
    const maskCanvas = document.createElement('canvas')
    const maskCtx = maskCanvas.getContext('2d')
    maskCanvasRef.current = maskCanvas

    const ctx = canvas.getContext('2d')
    const noiseCanvas = noiseRef.current
    let startTime = performance.now()

    const animate = (time) => {
      const cw = canvas.width
      const ch = canvas.height
      if (cw === 0 || ch === 0) {
        animRef.current = requestAnimationFrame(animate)
        return
      }

      // Sync mask size with canvas
      if (maskCanvas.width !== cw || maskCanvas.height !== ch) {
        maskCanvas.width = cw
        maskCanvas.height = ch
      }

      const elapsed = time - startTime
      const isDeveloping = developingRef.current
      const isCompleted = completedRef.current

      ctx.clearRect(0, 0, cw, ch)

      drawVaporBase(ctx, cw, ch, elapsed, noiseCanvas)

      if (!isCompleted) {
        const intensity = isDeveloping ? 1 : 0.35
        for (const wisp of VAPOR_WISPS) {
          const t = elapsed * 0.0004 * wisp.speedMult
          const wx = (Math.sin(t + wisp.phaseX) * 0.22 + 0.5 + Math.sin(elapsed * wisp.driftX) * 0.04) * cw
          const wy = (Math.cos(t * 0.9 + wisp.phaseY) * 0.22 + 0.5 + Math.cos(elapsed * wisp.driftY) * 0.04) * ch
          const rad = wisp.baseRad + Math.sin(elapsed * 0.0006 + wisp.phaseR) * 35

          const vg = ctx.createRadialGradient(wx, wy, 0, wx, wy, rad)
          const alpha = 0.12 * intensity
          vg.addColorStop(0, `rgba(210,200,188,${alpha})`)
          vg.addColorStop(0.4, `rgba(190,180,165,${alpha * 0.6})`)
          vg.addColorStop(1, 'rgba(160,150,135,0)')
          ctx.fillStyle = vg
          ctx.fillRect(0, 0, cw, ch)
        }

        if (isDeveloping) {
          const mx = mouseRef.current.x
          const my = mouseRef.current.y
          if (mx > 0 && my > 0) {
            for (let i = 0; i < 4; i++) {
              const angle = elapsed * 0.002 + i * Math.PI / 2
              const dist = 30 + Math.sin(elapsed * 0.003 + i) * 15
              const px = mx + Math.cos(angle) * dist
              const py = my + Math.sin(angle) * dist
              const pr = 40 + Math.sin(elapsed * 0.005 + i * 2) * 15
              const pg = ctx.createRadialGradient(px, py, 0, px, py, pr)
              pg.addColorStop(0, 'rgba(220,210,198,0.15)')
              pg.addColorStop(1, 'rgba(180,170,155,0)')
              ctx.fillStyle = pg
              ctx.beginPath()
              ctx.arc(px, py, pr, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      ctx.globalCompositeOperation = 'destination-out'
      ctx.drawImage(maskCanvas, 0, 0)
      ctx.globalCompositeOperation = 'source-over'

      const vigGrad = ctx.createRadialGradient(cw * 0.5, ch * 0.5, cw * 0.25, cw * 0.5, ch * 0.5, cw * 0.7)
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.18)')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, cw, ch)

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (resizeRef.current) resizeRef.current.disconnect()
    }
  }, [initCanvas])

  // Attach event listeners to canvas directly (it's inside ImageReveal)
  useEffect(() => {
    const canvas = vaporCanvasRef.current
    if (!canvas) return

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      return {
        x: (cx - rect.left) * (canvas.width / rect.width),
        y: (cy - rect.top) * (canvas.height / rect.height),
      }
    }

    const applyBrush = (x, y) => {
      const maskCanvas = maskCanvasRef.current
      if (!maskCanvas) return
      const mctx = maskCanvas.getContext('2d')
      mctx.fillStyle = 'black'
      mctx.beginPath()
      mctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
      mctx.fill()
    }

    const onStart = (e) => {
      e.preventDefault()
      if (!developingRef.current && !completedRef.current) {
        setDeveloping(true)
        setHintVisible(false)
        startTimeRef.current = Date.now()
        const pos = getPos(e)
        mouseRef.current = pos
        applyBrush(pos.x, pos.y)
        opsRef.current += 1
      }
    }

    const onMove = (e) => {
      if (!developingRef.current || completedRef.current) return
      const pos = getPos(e)
      mouseRef.current = pos
      applyBrush(pos.x, pos.y)

      opsRef.current += 1
      if (opsRef.current > AUTO_COMPLETE_OPS || Date.now() - startTimeRef.current > AUTO_COMPLETE_MS) {
        completeReveal()
      }
    }

    const onTouchMove = (e) => {
      if (!developingRef.current) return
      e.preventDefault()
      onMove(e)
    }

    canvas.addEventListener('mousedown', onStart)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchstart', onStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', onStart)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchstart', onStart)
      canvas.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const completeReveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setCompleted(true)

    const canvas = vaporCanvasRef.current
    if (canvas) {
      canvas.style.transition = 'opacity 1.2s ease-out'
      canvas.style.opacity = '0'
      setTimeout(() => { canvas.style.display = 'none' }, 1400)
    }
  }, [])

  return (
    <SceneShell scene={scene} index={index}>
      <div className="relative w-full h-full overflow-hidden">

        {/* ─── AMBIENT BACKGROUND ─── */}

        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.015] mix-blend-screen">
          <svg viewBox="0 0 400 300" className="w-full max-w-[600px]" fill="none" aria-hidden="true">
            <path d="M120 60L140 40h120l20 20v20h20l30 30v140l-30 30H100l-30-30V110l30-30h20V60z"
              stroke="currentColor" strokeWidth="3" opacity="0.8" />
            <circle cx="200" cy="150" r="50" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="200" cy="150" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <rect x="158" y="180" width="84" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <path d="M70 110l30-30h60" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path d="M330 110l-30-30h-60" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <line x1="200" y1="40" x2="200" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
            <line x1="140" y1="40" x2="120" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="260" y1="40" x2="280" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <path d="M100 240v20h200v-20" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none z-0">
          <m.div
            className="absolute inset-0"
            animate={{ opacity: [0.55, 0.7, 0.55] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(ellipse at 12% 88%, rgba(220, 140, 60, 0.09) 0%, rgba(200, 100, 30, 0.04) 30%, transparent 65%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 88% 12%, rgba(160, 180, 200, 0.04) 0%, transparent 50%)',
            }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply"
          style={{
            background:
              'linear-gradient(to bottom, rgba(160,100,70,0.06) 0%, transparent 15%, transparent 85%, rgba(120,80,50,0.08) 100%), linear-gradient(to right, rgba(140,90,60,0.05) 0%, transparent 12%, transparent 88%, rgba(100,70,40,0.07) 100%)',
          }}
        />

        <div
          className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[480px] h-[90%] max-w-[45vw] pointer-events-none z-0 rounded-sm opacity-40"
          style={{
            background:
              'linear-gradient(180deg, rgba(45,15,15,0.5) 0%, rgba(55,18,18,0.4) 30%, rgba(42,12,12,0.5) 70%, rgba(35,10,10,0.4) 100%)',
            border: '1px solid rgba(180,140,80,0.06)',
            boxShadow: 'inset 0 0 60px rgba(100,30,30,0.1)',
          }}
        />

        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-0"
          style={{
            background: 'linear-gradient(90deg, transparent 5%, rgba(184,134,74,0.08) 20%, rgba(184,134,74,0.15) 50%, rgba(184,134,74,0.08) 80%, transparent 95%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none z-0"
          style={{
            background: 'linear-gradient(90deg, transparent 5%, rgba(184,134,74,0.08) 20%, rgba(184,134,74,0.15) 50%, rgba(184,134,74,0.08) 80%, transparent 95%)',
          }}
        />

        {/* ─── MAIN CONTENT ─── */}
        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-10 lg:px-16 py-16 sm:py-20 gap-8 lg:gap-14">

          {/* ─── LEFT: TEXT ─── */}
          <m.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 max-w-lg lg:max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block w-8 h-px" style={{ background: 'var(--cl-ochre, var(--cl-accent))' }} />
              <span
                className="text-[0.55rem] tracking-[0.25em] uppercase font-mono"
                style={{ color: 'var(--cl-terracotta, var(--cl-accent-dim))', opacity: 0.5 }}
              >
                CAPÍTULO
              </span>
            </div>

            {scene.subtitle && (
              <span
                className="block text-sm sm:text-base leading-relaxed mb-3"
                style={{
                  color: 'var(--cl-terracotta, var(--cl-accent-dim))',
                  opacity: 0.7,
                  fontFamily: 'Newsreader, Georgia, serif',
                  fontStyle: 'italic',
                }}
              >
                {scene.subtitle}
              </span>
            )}

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight mb-6"
              style={{
                color: 'var(--cl-ochre, var(--cl-accent))',
                fontFamily: "'DM Mono', 'Courier New', monospace",
                fontWeight: 500,
              }}
            >
              {scene.title}
            </h2>

            {scene.paragraph && (
              <p
                className="text-base sm:text-lg leading-relaxed max-w-[640px] mb-6"
                style={{ color: 'var(--cl-parchment, var(--cl-text))' }}
              >
                {scene.paragraph}
              </p>
            )}

            <div className="relative pl-5 border-l-2" style={{ borderColor: 'var(--cl-ochre, var(--cl-accent))' }}>
              <span
                className="text-base sm:text-lg leading-relaxed"
                style={{
                  color: 'var(--cl-ochre, var(--cl-accent))',
                  fontFamily: 'Caveat, Segoe Script, cursive',
                  opacity: 0.75,
                }}
              >
                Por primera vez, la naturaleza se pintaba a sí misma.
              </span>
            </div>
          </m.div>

          {/* ─── RIGHT: DAGUERREOTYPE FRAME ─── */}
          <m.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 w-full max-w-[460px]"
          >
            <div className="relative p-4 sm:p-5" style={{ background: 'var(--cl-ink, #0a0806)' }}>
              <m.div
                className="relative"
                animate={{
                  scale: developing && !completed ? [1, 1.008, 1] : 1,
                }}
                transition={{
                  duration: 1.8,
                  ease: 'easeInOut',
                  repeat: developing && !completed ? Infinity : 0,
                }}
                style={{
                  border: '3px solid var(--cl-ochre, var(--cl-accent))',
                  boxShadow: `
                    inset 0 0 12px rgba(184,134,74,0.08),
                    0 0 20px rgba(184,134,74,0.06),
                    0 4px 30px rgba(0,0,0,0.5)
                  `,
                }}
              >
                {/* Enhanced brass corners */}
                <svg
                  className="absolute -top-px -left-px w-12 h-12 sm:w-14 sm:h-14 pointer-events-none z-10"
                  viewBox="0 0 50 50" fill="none"
                  style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}
                >
                  <path d="M0 0h38v2H2v36H0V0z" fill="currentColor" opacity="0.5" />
                  <path d="M0 0v2l34 34h2l2-2V0H0z" fill="currentColor" opacity="0.12" />
                  <path d="M6 0v2h30v30h2V0H6z" fill="currentColor" opacity="0.08" />
                  <circle cx="5" cy="5" r="2.5" fill="currentColor" opacity="0.35" />
                  <circle cx="14" cy="5" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="5" cy="14" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.5" />
                </svg>
                <svg
                  className="absolute -top-px -right-px w-12 h-12 sm:w-14 sm:h-14 pointer-events-none z-10"
                  viewBox="0 0 50 50" fill="none"
                  style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}
                >
                  <path d="M50 0H12v2h36v36h2V0z" fill="currentColor" opacity="0.5" />
                  <path d="M50 0v2L16 36h-2l-2-2V0h38z" fill="currentColor" opacity="0.12" />
                  <path d="M44 0v2H14v30h-2V0h32z" fill="currentColor" opacity="0.08" />
                  <circle cx="45" cy="5" r="2.5" fill="currentColor" opacity="0.35" />
                  <circle cx="36" cy="5" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="45" cy="14" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="45" cy="5" r="1" fill="currentColor" opacity="0.5" />
                </svg>
                <svg
                  className="absolute -bottom-px -left-px w-12 h-12 sm:w-14 sm:h-14 pointer-events-none z-10"
                  viewBox="0 0 50 50" fill="none"
                  style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}
                >
                  <path d="M0 50h38v-2H2V12H0v38z" fill="currentColor" opacity="0.5" />
                  <path d="M0 50v-2l34-34h2l2 2v34H0z" fill="currentColor" opacity="0.12" />
                  <path d="M6 50v-2h30V18h2v32H6z" fill="currentColor" opacity="0.08" />
                  <circle cx="5" cy="45" r="2.5" fill="currentColor" opacity="0.35" />
                  <circle cx="14" cy="45" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="5" cy="36" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="5" cy="45" r="1" fill="currentColor" opacity="0.5" />
                </svg>
                <svg
                  className="absolute -bottom-px -right-px w-12 h-12 sm:w-14 sm:h-14 pointer-events-none z-10"
                  viewBox="0 0 50 50" fill="none"
                  style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}
                >
                  <path d="M50 50H12v-2h36V12h2v38z" fill="currentColor" opacity="0.5" />
                  <path d="M50 50v-2L16 14h-2l-2 2v34h38z" fill="currentColor" opacity="0.12" />
                  <path d="M44 50v-2H14V18h-2v32h32z" fill="currentColor" opacity="0.08" />
                  <circle cx="45" cy="45" r="2.5" fill="currentColor" opacity="0.35" />
                  <circle cx="36" cy="45" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="45" cy="36" r="1.5" fill="currentColor" opacity="0.25" />
                  <circle cx="45" cy="45" r="1" fill="currentColor" opacity="0.5" />
                </svg>

                <div className="absolute inset-[6px] pointer-events-none z-10"
                  style={{ border: '1px solid var(--cl-ochre, var(--cl-accent))', opacity: 0.25 }} />

                <ImageReveal ref={vaporCanvasRef} />

                {/* Pre-click hint */}
                {hintVisible && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none">
                    <m.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.5 }}
                      className="text-sm tracking-wider text-center px-5 py-2.5"
                      style={{
                        color: 'var(--cl-ochre, var(--cl-accent))',
                        fontFamily: 'Newsreader, Georgia, serif',
                        fontStyle: 'italic',
                        background: 'rgba(10,8,6,0.75)',
                        borderRadius: '4px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      ✦ Toca para exponer al vapor de mercurio
                    </m.span>
                  </div>
                )}

                {/* Developing indicator */}
                {developing && !completed && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
                    <span
                      className="text-[0.5rem] tracking-[0.2em] uppercase font-mono"
                      style={{ color: 'var(--cl-ochre, var(--cl-accent))', opacity: 0.3 }}
                    >
                      Mueve para disipar el vapor químico
                    </span>
                  </div>
                )}

                {/* Completed shimmer */}
                {completed && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(200,180,150,0.04) 0%, transparent 40%, rgba(180,160,130,0.02) 60%, transparent 100%)',
                    }}
                  />
                )}
              </m.div>

              <div className="mt-3 flex items-center justify-center gap-3 opacity-30">
                <span className="w-8 h-px" style={{ background: 'var(--cl-ochre, var(--cl-accent))' }} />
                <span className="text-[0.5rem] tracking-[0.3em] uppercase font-mono"
                  style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}>
                  Daguerre 1839
                </span>
                <span className="w-8 h-px" style={{ background: 'var(--cl-ochre, var(--cl-accent))' }} />
              </div>
            </div>
          </m.div>

        </div>
      </div>
    </SceneShell>
  )
}

function drawVaporBase(ctx, w, h, elapsed, noiseCanvas) {
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#c8c0b5')
  grad.addColorStop(0.25, '#a8a090')
  grad.addColorStop(0.5, '#d0c8b8')
  grad.addColorStop(0.75, '#989080')
  grad.addColorStop(1, '#b8b0a0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  if (noiseCanvas) {
    ctx.globalAlpha = 0.08
    ctx.drawImage(noiseCanvas, 0, 0)
    ctx.globalAlpha = 1
  }

  if (elapsed != null) {
    const sx = (Math.sin(elapsed * 0.0005) * 0.3 + 0.5) * w
    const sy = (Math.cos(elapsed * 0.0004) * 0.3 + 0.5) * h
    const highlight = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.5)
    highlight.addColorStop(0, 'rgba(230,220,210,0.04)')
    highlight.addColorStop(0.5, 'rgba(200,190,180,0.02)')
    highlight.addColorStop(1, 'rgba(160,150,135,0)')
    ctx.fillStyle = highlight
    ctx.fillRect(0, 0, w, h)
  }
}
