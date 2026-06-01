import { useState, useRef, useEffect, useCallback } from 'react'
import { motion as m } from 'framer-motion'
import { PiHandBold } from 'react-icons/pi'
import SceneShell from '../layout/SceneShell'

const PETROGLYPH_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23b8864a' stroke-width='0.5' opacity='0.08'%3E%3Cpath d='M30 5 L35 15 L30 25 L25 15 Z' /%3E%3Ccircle cx='10' cy='10' r='4' /%3E%3Ccircle cx='50' cy='10' r='4' /%3E%3Ccircle cx='10' cy='50' r='4' /%3E%3Ccircle cx='50' cy='50' r='4' /%3E%3Cpath d='M5 30 Q15 20 25 30 Q15 40 5 30' /%3E%3Cpath d='M35 30 Q45 20 55 30 Q45 40 35 30' /%3E%3Cpath d='M30 35 Q35 40 30 55 Q25 40 30 35' /%3E%3C/g%3E%3C/svg%3E")`

const QUOTE = 'La mano que imprimió su contorno en la pared de la cueva ya no está, pero su gesto perdura.'

const WIPE_RADIUS = 130
const SOOT_COLOR = '#16120E'
const AUTO_REVEAL_THRESHOLD = 0.4
const CHECK_INTERVAL_MS = 500

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

function HandprintTrigger({ onClick, disabled }) {
  return (
    <m.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="relative cursor-pointer bg-transparent border-none p-0 flex flex-col items-center gap-3 select-none"
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      aria-label="Toca para revelar la pared de la cueva"
    >
      <m.div
        className="absolute -inset-10 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.2), transparent 70%)',
        }}
        animate={!disabled ? {
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2],
        } : { opacity: 0 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <m.div
        className="relative z-10"
        animate={!disabled ? {
          opacity: [0.25, 0.55, 0.25],
          scale: [1, 1.04, 1],
        } : { opacity: 0.15, scale: 1 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <PiHandBold className="w-20 h-20 sm:w-28 sm:h-28" style={{ color: 'var(--cl-ochre)' }} />
      </m.div>

      {!disabled && (
        <m.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-xs font-mono tracking-[0.2em] uppercase whitespace-nowrap"
          style={{ color: 'var(--cl-ochre)' }}
        >
          Posa tu mano aquí
        </m.span>
      )}
    </m.button>
  )
}

export default function SceneAncestral({ scene, index, direction = 0 }) {
  const [wipeStarted, setWipeStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const canvasRef = useRef(null)
  const revealedRef = useRef(false)

  const handleHandClick = useCallback(() => {
    setWipeStarted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = SOOT_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  useEffect(() => {
    if (!wipeStarted || revealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0)
      const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0)
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    const wipe = (e) => {
      if (revealedRef.current) return
      const { x, y } = getPos(e)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, WIPE_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }

    const handleMouseMove = (e) => wipe(e)
    const handleTouchMove = (e) => {
      wipe(e)
      e.preventDefault()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [wipeStarted, revealed])

  useEffect(() => {
    if (!wipeStarted || revealed) return
    const canvas = canvasRef.current
    if (!canvas) return

    const check = () => {
      if (revealedRef.current) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      let cleared = 0
      const total = pixels.length / 4
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) cleared++
      }
      if (cleared / total >= AUTO_REVEAL_THRESHOLD) {
        revealedRef.current = true
        setRevealed(true)
      }
    }

    const id = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [wipeStarted, revealed])

  useEffect(() => {
    if (!revealed) return
    const canvas = canvasRef.current
    if (!canvas) return

    let opacity = 1
    const fade = () => {
      opacity -= 0.04
      if (opacity <= 0) {
        canvas.style.display = 'none'
        return
      }
      canvas.style.opacity = String(opacity)
      requestAnimationFrame(fade)
    }
    const frame = requestAnimationFrame(fade)
    return () => cancelAnimationFrame(frame)
  }, [revealed])

  return (
    <SceneShell scene={scene} index={index}>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--cl-ochre)',
          backgroundImage: PETROGLYPH_PATTERN,
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-12 lg:px-20 py-20 gap-8 lg:gap-16">
        {/* Left: Text */}
        <div className="w-full lg:w-1/2 max-w-xl flex flex-col gap-5">
          <m.span
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="inline-block text-[0.55rem] tracking-[0.25em] uppercase font-mono"
            style={{ color: 'var(--cl-terracotta)' }}
          >
            Escena {String(index + 1).padStart(2, '0')}
          </m.span>

          <m.h2
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="font-[family-name:var(--font-digital)] text-3xl sm:text-4xl lg:text-5xl leading-tight"
            style={{ color: 'var(--cl-parchment)' }}
          >
            {scene.title}
          </m.h2>

          {scene.subtitle && (
            <m.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
              className="text-lg sm:text-xl leading-relaxed"
              style={{ color: 'var(--cl-terracotta)', fontFamily: "'Newsreader', 'Georgia', serif" }}
            >
              {scene.subtitle}
            </m.p>
          )}

          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative ml-4 pl-4 border-l-2"
            style={{ borderColor: 'var(--cl-terracotta)' }}
          >
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ fontFamily: "'Caveat', cursive", color: 'var(--cl-ink)' }}
            >
              &ldquo;{QUOTE}&rdquo;
            </p>
          </m.div>

          {scene.paragraph && (
            <m.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.6 }}
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--cl-ink)' }}
            >
              {scene.paragraph}
            </m.p>
          )}
        </div>

        {/* Right: Image space */}
        <div className="w-full lg:flex-1 lg:max-w-3xl flex items-center justify-center">
          <div
            className="w-full overflow-hidden rounded-sm relative"
            style={{
              border: '1px solid var(--cl-border, rgba(150,110,70,0.3))',
              background: '#1a1713',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: PETROGLYPH_PATTERN,
                backgroundSize: '40px 40px',
              }}
            />
            <img
              src="https://caracoltv.brightspotcdn.com/dims4/default/5e44ba3/2147483647/strip/true/crop/1024x576+0+54/resize/1280x720!/format/webp/quality/75/?url=https%3A%2F%2Fcaracol-brightspot.s3.us-west-2.amazonaws.com%2F00%2F26%2Fef335d5541efb46e3f551e7ed9d9%2Fwhatsapp-image-2020-12-03-at-7.00.05%20AM.jpeg"
              alt="Pintura rupestre ancestral"
              className="relative z-10 w-full block"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20"
      />

      {!revealed && (
        <div className="absolute z-30 inset-0 flex flex-col lg:flex-row items-center justify-center px-6 sm:px-12 lg:px-20 py-20 gap-8 lg:gap-16 pointer-events-none">
          <div className="flex-shrink-0 pointer-events-auto">
            <HandprintTrigger
              onClick={handleHandClick}
              disabled={wipeStarted}
            />
          </div>
        </div>
      )}
    </SceneShell>
  )
}
