import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import SceneShell from '../layout/SceneShell'
import DenoisingCanvas from '../interactive/DenoisingCanvas'

function splitText(text, n = 3) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const groups = []
  for (let i = 0; i < sentences.length; i += n) {
    groups.push(sentences.slice(i, i + n).join(' ').trim())
  }
  return groups
}

export default function SceneDifusion({ scene, index, direction = 0 }) {
  const paragraphs = useMemo(() => splitText(scene.paragraph), [scene.paragraph])

  return (
    <SceneShell scene={scene} index={index}>
      <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-10 lg:px-16 py-16 sm:py-20 gap-8 lg:gap-16 xl:gap-24">
        {/* Left: text */}
        <motion.div
          initial={{ x: -15 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 max-w-xl lg:max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-6 h-px" style={{ background: 'var(--dg-accent)' }} />
            <span className="text-[0.55rem] tracking-[0.25em] uppercase font-mono"
              style={{ color: 'var(--dg-text-muted)', opacity: 0.5 }}>
              DIFUSIÓN
            </span>
          </div>

          {scene.subtitle && (
            <span className="block text-[0.6rem] tracking-[0.3em] uppercase mb-3 font-mono"
              style={{ color: 'var(--dg-text-muted)', opacity: 0.6 }}>
              {scene.subtitle}
            </span>
          )}

          <h2 className="font-[family-name:var(--font-digital)] text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4"
            style={{ color: 'var(--dg-accent)' }}>
            {scene.title}
          </h2>

          <div className="space-y-3">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-classical)] text-sm sm:text-base lg:text-[15px] leading-[1.8]"
                style={{ color: 'var(--dg-text)' }}
              >
                {p}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Right: DenoisingCanvas */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 w-full max-w-[500px] aspect-square"
        >
          <DenoisingCanvas />
        </motion.div>
      </div>
    </SceneShell>
  )
}
