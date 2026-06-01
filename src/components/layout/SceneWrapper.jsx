import { motion } from 'framer-motion'
import SceneShell from './SceneShell'

export default function SceneWrapper({ scene, children, className = '', index, direction = 0 }) {
  const isClassical = scene.theme === 'classical'
  const isDigital = scene.theme === 'digital'
  const isMixed = scene.theme === 'mixed' || scene.theme === 'transition'

  // Alternate layout pattern
  const useAltLayout = index % 3 === 1
  const useStackedLayout = index % 5 === 3

  if (useStackedLayout) {
    return (
      <SceneShell scene={scene} index={index} className={className}>
        <div className="w-full flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 py-16 sm:py-20 lg:py-24">
          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-3 self-start">
              <span className={`inline-block w-6 h-px ${isDigital ? 'bg-dg-accent' : 'bg-cl-accent'}`} />
              <span className={`text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] uppercase font-mono ${isDigital ? 'text-dg-text-muted' : 'text-cl-text-muted'}`}
                style={{ opacity: 0.5 }}>
                {isDigital ? 'SISTEMA' : isClassical ? 'CAPÍTULO' : '—'}
              </span>
            </div>

            {scene.subtitle && (
              <span className={`text-[0.6rem] sm:text-[0.65rem] tracking-[0.3em] uppercase ${isDigital ? 'text-dg-text-muted' : 'text-cl-text-muted'}`}
                style={{ opacity: 0.6 }}>
                {scene.subtitle}
              </span>
            )}

            <h2 className={`
              text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight max-w-3xl
              ${isDigital
                ? 'text-dg-accent font-[family-name:var(--font-digital)] font-medium'
                : 'text-cl-accent font-[family-name:var(--font-classical)] font-bold'}
            `}>
              {scene.title}
            </h2>

            {scene.paragraph && (
              <p className={`text-base sm:text-lg leading-relaxed max-w-2xl ${isDigital ? 'text-dg-text' : 'text-cl-text'}`}>
                {scene.paragraph}
              </p>
            )}

            <div className="w-full mt-4 max-w-3xl">
              {children}
            </div>
          </div>
        </div>
      </SceneShell>
    )
  }

  return (
    <SceneShell scene={scene} index={index} className={className}>
      <div className="w-full flex items-center justify-center px-4 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24">
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col gap-4 ${useAltLayout ? 'lg:order-2' : 'lg:order-1'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`inline-block w-8 h-px ${isDigital ? 'bg-dg-accent' : 'bg-cl-accent'}`} />
              <span className={`text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] uppercase font-mono ${isDigital ? 'text-dg-text-muted' : 'text-cl-text-muted'}`}
                style={{ opacity: 0.5 }}>
                {isDigital ? 'SISTEMA' : isClassical ? 'CAPÍTULO' : '—'}
              </span>
            </div>

            {scene.subtitle && (
              <span className={`text-[0.6rem] sm:text-[0.65rem] tracking-[0.3em] uppercase ${isDigital ? 'text-dg-text-muted' : 'text-cl-text-muted'}`}
                style={{ opacity: 0.6 }}>
                {scene.subtitle}
              </span>
            )}

            <h2 className={`
              text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight
              ${isDigital
                ? 'text-dg-accent font-[family-name:var(--font-digital)] font-medium'
                : 'text-cl-accent font-[family-name:var(--font-classical)] font-bold'}
            `}>
              {scene.title}
            </h2>

            {scene.paragraph && (
              <p className={`text-base sm:text-lg leading-relaxed max-w-[640px] ${isDigital ? 'text-dg-text' : 'text-cl-text'}`}>
                {scene.paragraph}
              </p>
            )}

            {isClassical && (
              <span className="font-[family-name:var(--font-hand)] text-sm sm:text-base opacity-40 mt-2"
                style={{ color: 'var(--cl-accent-dim)' }}>
                ~ {scene.id === 'ancestral' ? 'la memoria de la luz' : scene.id === 'zeuxis' ? 'más allá del engaño' : 'lo que el ojo no ve'} ~
              </span>
            )}
          </motion.div>

          {/* Interactive column */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full ${useAltLayout ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <div className={`${isClassical ? 'film-content p-4 sm:p-6' : ''} ${isDigital ? 'glitch-content' : ''}`}>
              {children}
            </div>

            {isClassical && (
              <div className="mt-4 flex gap-2 justify-end opacity-20">
                <span className="w-8 h-px" style={{ background: 'var(--cl-accent)' }} />
                <span className="w-4 h-px" style={{ background: 'var(--cl-accent)' }} />
                <span className="w-2 h-px" style={{ background: 'var(--cl-accent)' }} />
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </SceneShell>
  )
}
