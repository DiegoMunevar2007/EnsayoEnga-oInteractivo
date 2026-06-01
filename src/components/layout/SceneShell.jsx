import { motion } from 'framer-motion'

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

export default function SceneShell({ scene, index, className = '', children }) {
  const theme = scene?.theme || 'classical'
  const isClassical = theme === 'classical'
  const isDigital = theme === 'digital'
  const isMixed = theme === 'mixed' || theme === 'transition'
  const numeral = romanNumerals[index] ?? ''

  const bgClass = isDigital
    ? 'scene-digital'
    : isClassical
      ? 'scene-classical'
      : ''

  return (
    <motion.section
      data-scene-id={scene?.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`
        absolute inset-0 w-full h-dvh flex overflow-hidden
        ${bgClass} ${className}
      `}
    >
      {/* Decorative background */}
      {isClassical && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-[5%] w-72 h-72 rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, var(--cl-accent), transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-[5%] w-96 h-96 rounded-full opacity-[0.02]"
            style={{ background: 'radial-gradient(circle, var(--cl-accent), transparent 70%)' }} />
        </div>
      )}
      {isDigital && (
        <div className="absolute inset-0 pointer-events-none grid-bg opacity-40" />
      )}
      {isMixed && (
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/2 h-full opacity-[0.02]"
            style={{ background: 'linear-gradient(135deg, var(--cl-accent), transparent)' }} />
          <div className="w-1/2 h-full opacity-[0.02]"
            style={{ background: 'linear-gradient(225deg, var(--dg-accent), transparent)' }} />
        </div>
      )}

      {/* Page numeral */}
      {numeral && (
        <div className="absolute top-8 left-4 sm:left-8 lg:left-12 z-20 text-[0.6rem] tracking-[0.3em] font-mono"
          style={{ color: isDigital ? 'var(--dg-text-muted)' : 'var(--cl-text-muted)', opacity: 0.3 }}>
          {numeral}
        </div>
      )}

      {/* Children */}
      <div className="relative z-10 w-full h-full flex">
        {children}
      </div>
    </motion.section>
  )
}
