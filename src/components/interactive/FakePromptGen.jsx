import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fakeImages = [
  'https://cdn.pixabay.com/photo/2024/12/27/11/46/ai-generated-9293891_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/04/23/22/51/ai-generated-8716177_1280.jpg',
  'https://cdn.pixabay.com/photo/2025/09/04/20/36/ai-generated-9816368_1280.jpg',
]

export default function FakePromptGen() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setResult(null)
    setProgress(0)

    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setTimeout(() => {
          setResult(fakeImages[Math.floor(Math.random() * fakeImages.length)])
          setGenerating(false)
        }, 300)
      }
      setProgress(Math.min(p, 100))
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGenerate()
  }

  return (
    <div className="text-center w-full">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe una descripción..."
          disabled={generating}
          className="flex-1 px-4 py-3 text-sm rounded font-mono outline-none transition-all duration-300"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--dg-border)',
            color: 'var(--dg-text)',
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="px-5 py-3 text-xs font-bold tracking-wider uppercase rounded transition-all duration-300"
          style={{
            background: generating ? 'var(--dg-bg-light)' : 'var(--dg-accent)',
            border: 'none',
            color: generating ? 'var(--dg-text-muted)' : 'var(--dg-bg)',
            cursor: generating ? 'wait' : 'pointer',
            fontFamily: 'var(--font-digital)',
          }}
        >
          {generating ? '...' : 'Generar'}
        </button>
      </div>

      {generating && (
        <div className="h-[2px] rounded overflow-hidden mb-4"
          style={{ background: 'var(--dg-bg-light)' }}>
          <div className="h-full rounded transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--dg-accent), var(--dg-accent-secondary))',
            }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {generating && !result && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="aspect-[5/4] flex items-center justify-center rounded font-mono text-xs"
            style={{
              border: '1px solid var(--dg-border)',
              background: 'rgba(0,0,0,0.3)',
              color: 'var(--dg-text-muted)',
            }}
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Procesando prompt...
            </motion.span>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={result}
              alt={`Generado con prompt: ${prompt}`}
              className="w-full aspect-[5/4] object-cover rounded"
              style={{ border: '1px solid var(--dg-border)' }}
            />
            <p className="mt-2 font-mono text-xs text-left"
              style={{ color: 'var(--dg-text-muted)' }}>
              <span style={{ color: 'var(--dg-accent)' }}>&gt;</span> prompt:{' '}
              <span style={{ color: 'var(--dg-text)' }}>"{prompt}"</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
