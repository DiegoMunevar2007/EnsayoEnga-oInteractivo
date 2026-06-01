import { useState, useRef, useEffect } from 'react'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`

const STRIPE_PATTERN = 'repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.12) 30px, transparent 60px, rgba(255,255,255,0.02) 90px, transparent 120px)'

export default function CurtainReveal({
  children,
  className = '',
  variant = 'single',
  gapPercent = 50,
  overlayContent,
  onReveal,
}) {
  const [revealed, setRevealed] = useState(false)
  const containerRef = useRef(null)
  const mouseXRef = useRef(50)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const singlePanelRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!revealed) return

    const handleMouse = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      mouseXRef.current = Math.max(0, Math.min(100, x))
    }

    window.addEventListener('mousemove', handleMouse)

    const animate = () => {
      const mx = mouseXRef.current
      const half = gapPercent / 2
      if (variant === 'single' && singlePanelRef.current) {
        singlePanelRef.current.style.width = `${mx}%`
      } else if (variant === 'split') {
        if (leftPanelRef.current)
          leftPanelRef.current.style.width = `${Math.max(0, mx - half)}%`
        if (rightPanelRef.current)
          rightPanelRef.current.style.width = `${Math.max(0, 100 - mx - half)}%`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [revealed, variant, gapPercent])

  const handleClick = () => {
    if (!revealed) {
      setRevealed(true)
      onReveal?.()
    }
  }

  const panelBg = 'linear-gradient(135deg, #2a2218, #1a1713)'

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative w-full h-full max-w-none overflow-hidden select-none ${className}`}
      style={{ cursor: revealed ? 'ew-resize' : 'pointer' }}
    >
      <div className="w-full h-full">
        {children}
      </div>

      {!revealed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 cursor-pointer overflow-hidden"
          style={{
            background: panelBg,
            color: 'var(--cl-accent)',
            fontFamily: 'var(--font-classical)',
          }}
        >
          <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: NOISE_SVG, backgroundSize: '200px 200px' }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: STRIPE_PATTERN }} />
          <div className="relative z-10">
            {overlayContent ?? (
              <p className="italic opacity-80 text-base sm:text-lg">Toca para correr la cortina</p>
            )}
          </div>
        </div>
      )}

      {revealed && variant === 'single' && (
        <div
          ref={singlePanelRef}
          className="absolute top-0 left-0 bottom-0 pointer-events-none overflow-hidden"
          style={{ background: panelBg }}
        >
          <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{ backgroundImage: NOISE_SVG, backgroundSize: '200px 200px' }} />
          <div className="absolute inset-0"
            style={{ background: STRIPE_PATTERN }} />
        </div>
      )}

      {revealed && variant === 'split' && (
        <>
          <div
            ref={leftPanelRef}
            className="absolute top-0 left-0 bottom-0 pointer-events-none overflow-hidden"
            style={{ background: panelBg }}
          >
            <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
              style={{ backgroundImage: NOISE_SVG, backgroundSize: '200px 200px' }} />
            <div className="absolute inset-0"
              style={{ background: STRIPE_PATTERN }} />
          </div>
          <div
            ref={rightPanelRef}
            className="absolute top-0 bottom-0 pointer-events-none overflow-hidden"
            style={{ right: 0, background: panelBg }}
          >
            <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
              style={{ backgroundImage: NOISE_SVG, backgroundSize: '200px 200px' }} />
            <div className="absolute inset-0"
              style={{ background: STRIPE_PATTERN }} />
          </div>
        </>
      )}

      {revealed && variant === 'split' && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs italic"
          style={{ color: 'var(--cl-accent)', opacity: 0.6 }}
        >
          Mueve el mouse para explorar
        </div>
      )}
    </div>
  )
}
