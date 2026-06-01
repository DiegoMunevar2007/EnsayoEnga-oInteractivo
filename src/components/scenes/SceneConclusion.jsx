import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import SceneShell from '../layout/SceneShell'

const finalSentence = 'La apariencia de una fotografía ya no implica necesariamente la existencia de un referente real.'

export default function SceneConclusion({ scene, index, direction = 0 }) {
  const [revealedChars, setRevealedChars] = useState(0)
  const [mergeProgress, setMergeProgress] = useState(0)
  const [showFin, setShowFin] = useState(false)
  const containerRef = useRef(null)
  const [maxDrag, setMaxDrag] = useState(200)

  useEffect(() => {
    setRevealedChars(0)
    setMergeProgress(0)
    setShowFin(false)
    if (containerRef.current) {
      setMaxDrag(Math.round(containerRef.current.offsetWidth * 0.3))
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setMaxDrag(Math.round(containerRef.current.offsetWidth * 0.3))
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!showFin && mergeProgress > 0.3) {
      if (revealedChars < finalSentence.length) {
        const timer = setTimeout(() => {
          setRevealedChars((prev) => prev + 1)
        }, 28)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setShowFin(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [mergeProgress, revealedChars, showFin])

  const handleDrag = (event, info) => {
    const p = Math.min(1, Math.max(0, info.offset.x / maxDrag))
    setMergeProgress(p)
  }

  const handleDragEnd = (event, info) => {
    if (info.offset.x >= maxDrag * 0.9) {
      setMergeProgress(1)
    }
  }

  return (
    <SceneShell scene={scene} index={index}>
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      >
        {/* === BACKGROUNDS === */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Classical half (left) */}
          <div
            className="absolute inset-y-0 left-0"
            style={{
              right: '50%',
              background: 'linear-gradient(135deg, #100e0b 0%, rgba(184,134,74,0.04) 50%, transparent 100%)',
              opacity: 1 - mergeProgress,
              transition: 'opacity 0.2s ease-out',
            }}
          />
          {/* Digital half (right) */}
          <div
            className="absolute inset-y-0 right-0"
            style={{
              left: '50%',
              background: 'linear-gradient(225deg, #0e0d10 0%, rgba(184,149,46,0.03) 50%, transparent 100%)',
              opacity: 1 - mergeProgress,
              transition: 'opacity 0.2s ease-out',
            }}
          />
          {/* Unified overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, #1a1510 0%, #100e0b 60%, #0e0d10 100%)',
              opacity: mergeProgress,
              transition: 'opacity 0.2s ease-out',
            }}
          />
          {/* Grain texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5' /%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              opacity: 0.03 * (1 - mergeProgress),
              mixBlendMode: 'overlay',
              transition: 'opacity 0.5s ease',
            }}
          />
        </div>

        {/* === DRAG AREA (upper portion) === */}
        <div className="relative z-10 flex-1 w-full flex items-center justify-center min-h-[200px]">
          {/* Vertical divider line — follows the handle */}
          <div
            className="absolute inset-y-0 w-px pointer-events-none"
            style={{
              left: `calc(50% + ${mergeProgress * maxDrag}px)`,
              background:
                mergeProgress > 0.5
                  ? 'linear-gradient(180deg, transparent, var(--cl-accent), transparent)'
                  : 'linear-gradient(180deg, transparent, var(--cl-accent), var(--dg-accent), transparent)',
              opacity: 0.5,
              boxShadow:
                mergeProgress > 0.5
                  ? '0 0 10px rgba(184,134,74,0.25)'
                  : '0 0 10px rgba(184,149,46,0.25)',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}
          />

          {/* Handle wrapper — centered; inner motion.div handles drag */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: maxDrag }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-ew-resize select-none pointer-events-auto"
              style={{
                background:
                  mergeProgress > 0.5
                    ? 'radial-gradient(circle at 40% 35%, var(--cl-accent), #8a6540)'
                    : 'radial-gradient(circle at 40% 35%, var(--dg-accent), #7a5a30)',
                boxShadow:
                  mergeProgress > 0.5
                    ? '0 0 28px rgba(184,134,74,0.45), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 0 28px rgba(184,149,46,0.45), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '1.1rem',
              }}
            >
              ↔
            </motion.div>
          </div>

          {/* Instruction text — visible only before dragging */}
          {mergeProgress === 0 && (
            <div
              className="absolute text-xs tracking-[0.15em] uppercase pointer-events-none"
              style={{
                color: 'var(--cl-text-muted)',
                opacity: 0.5,
                top: 'calc(50% + 48px)',
              }}
            >
              Arrastra para unir ambas historias
            </div>
          )}
        </div>

        {/* === CONTENT (lower portion) === */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Title */}
          <div
            style={{
              opacity: mergeProgress,
              transform: `translateY(${(1 - mergeProgress) * 12}px)`,
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <h2
              className="font-[family-name:var(--font-classical)] font-bold text-3xl sm:text-4xl lg:text-5xl mb-6"
              style={{ color: 'var(--cl-accent)' }}
            >
              {scene.title}
            </h2>
          </div>

          {/* Paragraph */}
          <div
            style={{
              opacity: mergeProgress,
              transform: `translateY(${(1 - mergeProgress) * 12}px)`,
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <p
              className="font-[family-name:var(--font-classical)] text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
              style={{ color: 'var(--cl-text)' }}
            >
              {scene.paragraph}
            </p>
          </div>

          {/* Horizontal divider line */}
          <div
            className="h-px mb-10 origin-center"
            style={{
              background:
                mergeProgress > 0.5
                  ? 'linear-gradient(90deg, transparent, var(--cl-accent), transparent)'
                  : 'linear-gradient(90deg, transparent, var(--cl-accent), var(--dg-accent), transparent)',
              opacity: 0.4 * mergeProgress,
              transform: `scaleX(${mergeProgress})`,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          />

          {/* Final sentence — character-by-character reveal */}
          <div
            style={{
              opacity: mergeProgress > 0.3
                ? Math.min(1, (mergeProgress - 0.3) / 0.7)
                : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            <p
              className="font-[family-name:var(--font-classical)] italic text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto min-h-[4rem]"
              style={{ color: 'var(--cl-text)' }}
            >
              {finalSentence.split('').map((char, i) => {
                const threshold = Math.round(finalSentence.length * 0.65)
                return (
                  <span
                    key={i}
                    className="transition-all duration-75"
                    style={{
                      opacity: i < revealedChars ? 1 : 0,
                      filter: i < revealedChars ? 'blur(0)' : 'blur(4px)',
                      color:
                        i >= threshold ? 'var(--dg-accent)' : 'var(--cl-text)',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
            </p>
          </div>

          {/* Fin */}
          {showFin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-12"
            >
              <span
                className="font-[family-name:var(--font-classical)] text-[0.6rem] tracking-[0.25em] uppercase"
                style={{ color: 'var(--cl-text-muted)', opacity: 0.5 }}
              >
                Fin
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </SceneShell>
  )
}
