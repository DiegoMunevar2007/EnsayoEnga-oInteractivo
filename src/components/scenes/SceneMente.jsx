import { useState, useEffect, useCallback } from 'react'
import { motion as m, AnimatePresence } from 'framer-motion'
import { PiSpiralBold } from 'react-icons/pi'
import SceneShell from '../layout/SceneShell'

const QUOTE = 'El ojo no ve lo que el ojo ve, sino lo que la mente quiere ver.'

export default function SceneMente({ scene, index }) {
  const [shattered, setShattered] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const handleClick = useCallback(() => {
    if (shattered) return
    setShattered(true)
  }, [shattered])

  useEffect(() => {
    if (!shattered || revealed) return
    const id = setTimeout(() => setRevealed(true), 800)
    return () => clearTimeout(id)
  }, [shattered, revealed])

  return (
    <SceneShell scene={scene} index={index} theme="classical">
      {/* Pre-reveal: spinning spiral */}
      <AnimatePresence>
        {!shattered && (
          <m.div
            key="pre-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <PiSpiralBold
                className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
                style={{ color: 'var(--cl-accent)', opacity: 0.5 }}
              />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Post-reveal layout: two columns, centered */}
      <div
        className="absolute inset-0 z-10 pointer-events-none overflow-y-auto"
        style={{ display: shattered ? 'block' : 'none' }}
      >
        <div className="w-full min-h-full flex flex-col lg:flex-row items-center justify-start gap-8 px-6 sm:px-12 lg:px-20 py-12">
          {/* Left: Title + Text */}
          <div className="w-full lg:w-[55%] lg:max-w-2xl lg:flex-shrink-0 flex flex-col items-center justify-center gap-5 text-center lg:pl-24">
            <m.h2
              layoutId="scene-title"
              className="font-[family-name:var(--font-mono)] text-4xl sm:text-5xl lg:text-6xl leading-tight whitespace-nowrap"
              style={{ color: 'var(--cl-accent)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              La mente del<br />observador.
            </m.h2>

            {/* Blockquote */}
            <m.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-[family-name:var(--font-hand)] text-lg sm:text-xl leading-relaxed"
              style={{ color: 'var(--cl-text)' }}
            >
              &ldquo;{QUOTE}&rdquo;
            </m.blockquote>

            {/* Paragraph */}
            {scene.paragraph && (
              <m.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="font-[family-name:var(--font-classical)] text-base sm:text-lg leading-relaxed"
                style={{ color: 'var(--cl-text)' }}
              >
                {scene.paragraph}
              </m.p>
            )}
          </div>

          {/* Right: Image */}
          <div className="w-full lg:flex-1 flex items-center justify-center">
            <div className="w-full max-w-xl">
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div
                  className="w-full rounded-sm"
                  style={{ background: 'var(--cl-ink)' }}
                >
                  <div
                    className="relative w-full flex items-center justify-center overflow-hidden"
                    style={{
                      border: '1px solid var(--cl-accent)',
                    }}
                  >
                    {scene.image ? (
                      <img
                        src={scene.image}
                        alt="Ilusión perceptual"
                        className="w-full h-auto"
                      />
                    ) : (
                      <>
                        <svg
                          className="absolute inset-0 w-full h-full opacity-[0.12]"
                          viewBox="0 0 200 150" fill="none" aria-hidden="true"
                          style={{ color: 'var(--cl-accent)' }}
                        >
                          <defs>
                            <radialGradient id="target-grad" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          <circle cx="100" cy="75" r="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                          <circle cx="100" cy="75" r="40" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                          <circle cx="100" cy="75" r="25" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
                          <circle cx="100" cy="75" r="10" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
                          <circle cx="100" cy="75" r="80" fill="url(#target-grad)" opacity="0.5" />
                          <line x1="45" y1="75" x2="155" y2="75" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                          <line x1="100" y1="20" x2="100" y2="130" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        </svg>
                        <span className="text-[0.5rem] tracking-[0.25em] uppercase font-mono"
                          style={{ color: 'var(--cl-accent)', opacity: 0.3 }}>
                          Percepción
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </div>
      </div>

      {/* Click trigger */}
      {!shattered && (
        <div
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={handleClick}
        >
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 sm:pb-4 pointer-events-none">
            <m.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-xs font-mono tracking-[0.2em] uppercase"
              style={{ color: 'var(--cl-ochre)' }}
            >
              ✧ Toca para romper la ilusión
            </m.span>
          </div>
        </div>
      )}
    </SceneShell>
  )
}
