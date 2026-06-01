import SceneShell from '../layout/SceneShell'
import CurtainReveal from '../interactive/CurtainReveal'

export default function SceneZeuxis({ scene, index, direction = 0 }) {
  return (
    <SceneShell scene={scene} index={index}>
      <CurtainReveal variant="split" gapPercent={56}>
        <div className="w-full h-full flex items-center justify-center px-8 sm:px-16 lg:px-24 py-20 overflow-y-auto">
          <div className="w-full max-w-3xl flex flex-col items-center text-center gap-5">
            <span className="inline-block text-[0.55rem] tracking-[0.25em] uppercase font-mono"
              style={{ color: 'var(--cl-accent)', opacity: 0.6 }}>
              Zeuxis y Parrasio
            </span>

            <h2 className="font-[family-name:var(--font-classical)] text-3xl sm:text-4xl lg:text-5xl leading-tight"
              style={{ color: 'var(--cl-accent)' }}>
              {scene.title}
            </h2>

            {scene.subtitle && (
              <p className="font-[family-name:var(--font-classical)] italic text-lg sm:text-xl leading-relaxed"
                style={{ color: 'var(--cl-accent-dim)' }}>
                {scene.subtitle}
              </p>
            )}

            <p className="font-[family-name:var(--font-classical)] text-base sm:text-lg leading-relaxed max-w-2xl"
              style={{ color: 'var(--cl-text)' }}>
              {scene.paragraph}
            </p>

            <div className="flex gap-3 items-center mt-2">
              <span className="w-12 h-px" style={{ background: 'var(--cl-accent)', opacity: 0.4 }} />
              <span className="font-[family-name:var(--font-hand)] text-base"
                style={{ color: 'var(--cl-accent-dim)', opacity: 0.6 }}>
                — más allá del engaño
              </span>
              <span className="w-12 h-px" style={{ background: 'var(--cl-accent)', opacity: 0.4 }} />
            </div>
          </div>
        </div>
      </CurtainReveal>
    </SceneShell>
  )
}
