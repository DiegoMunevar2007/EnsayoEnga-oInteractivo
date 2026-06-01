import { motion as m } from 'framer-motion'
import SceneShell from '../layout/SceneShell'
import LayerToggler from '../interactive/LayerToggler'

export default function SceneDigital({ scene, index, direction = 0 }) {
  return (
    <SceneShell scene={scene} index={index}>
      <div className="relative w-full h-full overflow-hidden"
        style={{
          background: 'linear-gradient(200deg, #0e0d10 0%, #1a1418 30%, #121016 70%, #0e0d10 100%)',
        }}
      >

        <style>{`
          .sd-grid {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 1;
            background-image:
              linear-gradient(rgba(184, 149, 46, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(184, 149, 46, 0.06) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>

        {/* Grid pattern */}
        <div className="sd-grid" />

        {/* Content overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-8 sm:py-12 pointer-events-none">

          {/* Title block */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-6 sm:mb-8"
          >
            <span
              className="block text-[0.55rem] sm:text-[0.6rem] tracking-[0.3em] uppercase font-mono mb-2 sm:mb-3"
              style={{ color: 'var(--dg-text-muted)', opacity: 0.5 }}
            >
              VII — Transición
            </span>
            <h2
              className="font-[family-name:var(--font-digital)] uppercase text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight"
              style={{
                color: 'var(--dg-accent)',
                textShadow: '0 0 40px var(--dg-glow)',
              }}
            >
              {scene.title}
            </h2>
            {scene.subtitle && (
              <p
                className="font-[family-name:var(--font-classical)] italic text-lg sm:text-xl lg:text-2xl mt-2"
                style={{ color: 'var(--cl-accent-dim)' }}
              >
                {scene.subtitle}
              </p>
            )}
          </m.div>

          {/* Quote */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full text-center mb-4 sm:mb-5 lg:mb-6 pointer-events-auto"
          >
            <blockquote
              className="font-[family-name:var(--font-hand)] italic text-lg sm:text-xl lg:text-2xl leading-relaxed"
              style={{ color: 'var(--cl-accent)', opacity: 0.7 }}
            >
              &ldquo;El píxel no tiene memoria.&rdquo;
            </blockquote>
          </m.div>

          {/* LayerToggler + Paragraph */}
          <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-8 pointer-events-auto">

            {/* LayerToggler */}
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[400px] lg:max-w-[380px] flex-shrink-0"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(184, 149, 46, 0.1))',
              }}
            >
              <LayerToggler />
            </m.div>

            {/* Paragraph */}
            {scene.paragraph && (
              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full lg:flex-1 lg:min-w-0 lg:pl-4 xl:pl-8"
              >
                <div className="lg:max-w-2xl space-y-3 sm:space-y-4">
                  <p
                    className="font-[family-name:var(--font-classical)] text-sm sm:text-base lg:text-[15px] leading-[1.8]"
                    style={{ color: 'var(--cl-text)', opacity: 0.92 }}
                  >
                    {scene.paragraph}
                  </p>
                </div>
              </m.div>
            )}
          </div>
        </div>

      </div>
    </SceneShell>
  )
}
