import { motion as m } from 'framer-motion'
import SceneShell from '../layout/SceneShell'
import BeforeAfterSlider from '../interactive/BeforeAfterSlider'

export default function SceneManipulacion({ scene, index, direction = 0 }) {
  return (
    <SceneShell scene={scene} index={index}>
      <div className="relative w-full h-full flex overflow-hidden">

        <style>{`
          .sprocket-strip {
            position: absolute;
            top: 0;
            width: 14px;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            background: rgba(26, 21, 19, 0.5);
            border-left: 1px solid rgba(201, 169, 110, 0.12);
            border-right: 1px solid rgba(201, 169, 110, 0.12);
          }
          .sprocket-strip::after {
            content: '';
            position: absolute;
            inset: 6px 2px;
            background: repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 8px,
              rgba(201, 169, 110, 0.35) 8px,
              rgba(201, 169, 110, 0.35) 12px,
              transparent 12px,
              transparent 48px
            );
            border-radius: 1px;
          }
          .sprocket-strip--left { left: 0; }
          .sprocket-strip--right { right: 0; }
        `}</style>

        {/* Safelight glow from bottom-left corner */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at 15% 85%, rgba(200, 60, 25, 0.10) 0%, transparent 60%)',
          }}
        />

        {/* Subtle secondary safelight top-right */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at 85% 10%, rgba(220, 120, 40, 0.06) 0%, transparent 50%)',
          }}
        />

        {/* Film strips */}
        <div className="sprocket-strip sprocket-strip--left" />
        <div className="sprocket-strip sprocket-strip--right" />

        {/* Main content */}
        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center gap-8 px-6 sm:px-12 lg:px-20 py-12 overflow-y-auto">

          {/* Left: BeforeAfterSlider */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2 flex-shrink-0 flex items-center justify-center"
          >
            <div className="w-full max-w-lg">
              <BeforeAfterSlider />
            </div>
          </m.div>

          {/* Right: Text content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-5 max-w-2xl">

            <m.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-[0.55rem] tracking-[0.25em] uppercase font-mono"
              style={{ color: 'var(--cl-accent)', opacity: 0.6 }}
            >
              Cuarto oscuro
            </m.span>

            <m.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="font-[family-name:var(--font-mono)] text-3xl sm:text-4xl lg:text-5xl leading-tight"
              style={{ color: 'var(--cl-accent)' }}
            >
              {scene.title}
            </m.h2>

            <m.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="font-[family-name:var(--font-classical)] italic text-lg sm:text-xl"
              style={{ color: 'var(--cl-accent-dim)' }}
            >
              {scene.subtitle}
            </m.span>

            <m.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="font-[family-name:var(--font-hand)] text-base sm:text-lg leading-relaxed pl-4 border-l-2"
              style={{
                color: 'var(--cl-text)',
                borderColor: 'var(--cl-accent)',
                opacity: 0.85,
              }}
            >
              &ldquo;El negativo no miente, pero el positivador sí.&rdquo;
            </m.blockquote>

            {scene.paragraph && (
              <m.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="font-[family-name:var(--font-classical)] text-sm sm:text-base leading-relaxed"
                style={{ color: 'var(--cl-text)', opacity: 0.9 }}
              >
                {scene.paragraph}
              </m.p>
            )}

          </div>
        </div>
      </div>
    </SceneShell>
  )
}
