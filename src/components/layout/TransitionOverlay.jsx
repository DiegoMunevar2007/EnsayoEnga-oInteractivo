import { motion, AnimatePresence } from 'framer-motion'

const TRANSITION_DURATION = 1.4

const overlayVariants = {
  'film-burn': {
    initial: { opacity: 1 },
    animate: {
      opacity: [1, 1, 1, 0],
      transition: {
        duration: TRANSITION_DURATION,
        times: [0, 0.4, 0.5, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  glitch: {
    initial: { opacity: 1 },
    animate: {
      opacity: [1, 1, 1, 0],
      x: [0, 0, -4, 0],
      transition: {
        duration: TRANSITION_DURATION,
        times: [0, 0.35, 0.45, 1],
        ease: 'linear',
      },
    },
  },
  mixed: {
    initial: { opacity: 1 },
    animate: {
      opacity: [1, 1, 1, 0],
      scale: [1, 1, 1.005, 1],
      transition: {
        duration: TRANSITION_DURATION,
        times: [0, 0.4, 0.5, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
}

function OverlayContent({ type }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Base black — always covers everything */}
      <div className="absolute inset-0 bg-black" />

      {/* Film grain + dust texture (applied over black) */}
      {type === 'film-burn' && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* CRT noise + warm scanlines */}
      {type === 'glitch' && (
        <>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
              mixBlendMode: 'screen',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(184,149,46,0.04) 3px, rgba(184,149,46,0.04) 6px)',
            }}
          />
        </>
      )}

      {/* Mixed — subtle radial gradient */}
      {type === 'mixed' && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 60%, #000 100%),
              linear-gradient(90deg, rgba(184,134,74,0.06), rgba(184,149,46,0.06))
            `,
          }}
        />
      )}
    </div>
  )
}

export default function TransitionOverlay({ active, type }) {
  const v = overlayVariants[type] || overlayVariants['film-burn']

  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key={`overlay-${type}`}
          initial={v.initial}
          animate={v.animate}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        >
          <OverlayContent type={type} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
