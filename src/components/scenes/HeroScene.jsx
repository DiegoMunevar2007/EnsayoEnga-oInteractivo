import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import SceneShell from '../layout/SceneShell'

const fragments = [
  { text: 'Nada nos engaña tanto como nuestro propio juicio.', author: 'Da Vinci', x: 8, y: 18, size: 'text-sm lg:text-base', rotate: -3 },
  { text: 'Es más fácil engañar a la gente que convencerla de que ha sido engañada.', author: 'Twain', x: 55, y: 12, size: 'text-sm lg:text-base', rotate: 2 },
  { text: 'En una época de engaño universal, decir la verdad es un acto revolucionario.', author: 'Orwell', x: 60, y: 55, size: 'text-sm lg:text-base', rotate: -4 },
  { text: 'Si me engañas una vez, tuya es la culpa; si me engañas dos, es mía.', author: 'Anaxágoras', x: 5, y: 70, size: 'text-sm lg:text-base', rotate: 1 },
  { text: 'El arte de agradar es el arte de engañar.', author: 'Vauvenargues', x: 50, y: 80, size: 'text-sm lg:text-base', rotate: -2 },
  { text: 'La mentira más común es aquella con la que un hombre se engaña a sí mismo.', author: 'Nietzsche', x: 68, y: 38, size: 'text-sm lg:text-base', rotate: 3 },
  { text: 'El mundo quiere ser engañado, pues que se le engañe.', author: 'Petronio', x: 12, y: 50, size: 'text-sm lg:text-base', rotate: -5 },
]

export default function HeroScene({ scene, index, direction = 0 }) {
  const [lit, setLit] = useState(false)
  const [fadeComplete, setFadeComplete] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const handleFullReveal = useCallback(() => {
    setFadeComplete(true)
  }, [])

  const handleActivate = (e) => {
    setLit(true)
    handleMouseMove(e)
  }

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    setMouse({ x, y })
  }

  const radius = 400

  return (
    <SceneShell scene={scene} index={index}>
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center px-8 sm:px-16 lg:px-24 py-16 sm:py-20 lg:py-28 relative overflow-hidden"
        onMouseMove={lit && !fadeComplete ? handleMouseMove : undefined}
        onTouchMove={lit && !fadeComplete ? handleMouseMove : undefined}
      >
        {/* Floating dust motes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full"
              style={{
                background: 'var(--cl-accent)',
                opacity: 0.06,
                left: `${3 + Math.random() * 94}%`,
                top: `${3 + Math.random() * 94}%`,
              }}
              animate={{
                y: [0, -40 - Math.random() * 60],
                x: [0, (Math.random() - 0.5) * 30],
                opacity: [0.06, 0.01, 0.06],
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 6,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Base content — revealed after overlay fades */}
        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
          <div aria-hidden="true" className="h-[130px] sm:h-[180px] lg:h-[300px]" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex flex-col items-center gap-10 sm:gap-12"
          >
            <p className="font-[family-name:var(--font-classical)] font-light italic text-base sm:text-lg lg:text-xl max-w-xl mx-auto leading-relaxed"
              style={{ color: 'var(--cl-text-muted)' }}>
              De Zeuxis y Parrasio a la inteligencia artificial — la historia de cómo aprendimos a crear mundos que nunca existieron.
            </p>

            <span className="text-[0.5rem] sm:text-[0.55rem] tracking-[0.25em] uppercase font-mono"
              style={{ color: 'var(--cl-text-muted)', opacity: 0.25 }}>
              Haz scroll o usa las flechas ↓
            </span>
          </motion.div>
        </div>

        {/* Hidden fragments — only visible through torchlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{ zIndex: 15, opacity: fadeComplete ? 0 : 1 }}
        >
          <div className="relative w-full h-full">
            {fragments.map((f, i) => (
              <div
                key={i}
                className="absolute max-w-[300px] sm:max-w-[360px]"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  transform: `rotate(${f.rotate}deg)`,
                }}
              >
                <p
                  className={`font-[family-name:var(--font-classical)] italic ${f.size} leading-relaxed`}
                  style={{
                    color: 'var(--cl-text-muted)',
                    opacity: 0.5,
                    textShadow: '0 0 20px rgba(184, 134, 74, 0.1)',
                  }}
                >
                  &ldquo;{f.text}&rdquo;
                  <span
                    className="block text-[0.45rem] sm:text-[0.5rem] tracking-[0.1em] mt-1"
                    style={{ fontFamily: "'Caveat', cursive", opacity: 0.6 }}
                  >
                    — {f.author}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle + Title — always above the overlay */}
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-30 left-1/2 -translate-x-1/2 top-[17%] text-center pointer-events-none text-[0.55rem] sm:text-[0.65rem] tracking-[0.4em] uppercase font-mono"
          style={{ color: 'var(--cl-accent)', opacity: 0.45 }}
        >
          Un ensayo sobre la manipulación visual
        </motion.span>

        <h1
          className="absolute z-30 left-1/2 -translate-x-1/2 top-[22%] text-center pointer-events-none font-[family-name:var(--font-classical)] font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] leading-[1.1] px-8 sm:px-16 max-w-[420px] sm:max-w-[560px] lg:max-w-[720px]"
          style={{ color: 'var(--cl-text)', letterSpacing: '-0.02em' }}
        >
          El Arte del{' '}
          <span
            className="inline-block"
            style={{
              color: 'var(--cl-accent)',
              textShadow: '0 0 80px rgba(184, 134, 74, 0.25)',
            }}
          >
            Engaño
          </span>
        </h1>

        {/* Overlay with torchlight spotlight */}
        <div
          className="absolute inset-0 z-20"
          style={{
            pointerEvents: fadeComplete ? 'none' : 'auto',
            opacity: fadeComplete ? 0 : 1,
            background: lit && !fadeComplete
              ? `radial-gradient(circle ${radius}px at ${mouse.x}px ${mouse.y}px, transparent 0px, transparent ${radius - 60}px, rgba(0,0,0,0.75) ${radius - 20}px, rgba(0,0,0,0.92) 100%)`
              : 'rgba(0,0,0,0.92)',
            transition: 'opacity 1.5s ease',
            cursor: !lit ? 'pointer' : (fadeComplete ? 'default' : 'pointer'),
          }}
          onClick={!lit ? handleActivate : (!fadeComplete ? handleFullReveal : undefined)}
          onTouchStart={!lit ? handleActivate : (!fadeComplete ? handleFullReveal : undefined)}
        >
          {!lit && (
            <div className="absolute inset-x-0 text-center" style={{ top: '58%' }}>
              <motion.span
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xs sm:text-sm tracking-[0.25em] uppercase font-mono"
                style={{ color: 'var(--cl-accent)' }}
              >
                ✦ Toca para iluminar
              </motion.span>
            </div>
          )}
        </div>
      </div>
    </SceneShell>
  )
}
