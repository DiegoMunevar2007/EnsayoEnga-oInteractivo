import { useState, useEffect } from 'react'
import { motion as m } from 'framer-motion'
import SceneShell from '../layout/SceneShell'


const TITLE = 'Difusión'
const SUBTITLE = '# La imagen sintética'

const terminalLog = [
  { prefix: '$', text: './generar-imagen.sh --model diffusion-v3 --prompt "retrato realista"', type: 'command' },
  { prefix: '', text: '[INFO] Cargando modelo... DONE', type: 'info' },
  { prefix: '', text: '[INFO] Inicializando espacio latente... DONE', type: 'info' },
  { prefix: '', text: '[INFO] Generando...', type: 'info' },
]

const generatedOutput = [
]

const CURSOR = <span className="inline-block w-[2px] h-[1em] align-middle ml-0.5"
  style={{
    background: 'var(--dg-accent)',
    animation: 'crt-blink 1s step-end infinite',
  }} />

export default function SceneDifusion({ scene, index, direction = 0 }) {
  const [logIndex, setLogIndex] = useState(0)
  const [titleChars, setTitleChars] = useState(0)
  const [showSubtitle, setShowSubtitle] = useState(false)

  const [showOutput, setShowOutput] = useState(false)
  const [showParagraph, setShowParagraph] = useState(false)

  useEffect(() => {
    if (logIndex < terminalLog.length) {
      const t = setTimeout(() => setLogIndex(i => i + 1), 600)
      return () => clearTimeout(t)
    }
  }, [logIndex])

  useEffect(() => {
    if (logIndex >= terminalLog.length && titleChars < TITLE.length) {
      const t = setTimeout(() => setTitleChars(c => c + 1), 100)
      return () => clearTimeout(t)
    }
  }, [logIndex, titleChars])

  useEffect(() => {
    if (logIndex >= terminalLog.length && titleChars >= TITLE.length && !showSubtitle) {
      const t = setTimeout(() => setShowSubtitle(true), 400)
      return () => clearTimeout(t)
    }
  }, [logIndex, titleChars, showSubtitle])


  useEffect(() => {
    if (showSubtitle && !showOutput) {
      const t = setTimeout(() => setShowOutput(true), 800)
      return () => clearTimeout(t)
    }
  }, [showSubtitle, showOutput])

  useEffect(() => {
    if (showOutput && !showParagraph) {
      const t = setTimeout(() => setShowParagraph(true), 600)
      return () => clearTimeout(t)
    }
  }, [showOutput, showParagraph])

  return (
    <SceneShell scene={scene} index={index}>
      <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 lg:p-6"
        style={{ background: 'var(--dg-bg, #0a0806)' }}>

        {/* CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(184, 149, 46, 0.025) 2px,
              rgba(184, 149, 46, 0.025) 4px
            )`,
          }}
        />

        {/* CRT vignette */}
        <div className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Terminal window */}
        <div className="relative z-10 w-full max-w-4xl 2xl:max-w-5xl mx-auto font-mono border overflow-hidden"
          style={{
            borderColor: 'var(--dg-border)',
            background: 'rgba(10, 8, 6, 0.96)',
            boxShadow: '0 0 50px rgba(184, 149, 46, 0.05), inset 0 0 80px rgba(0,0,0,0.4)',
          }}>

          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b text-[0.55rem] tracking-[0.2em] uppercase select-none"
            style={{
              borderColor: 'var(--dg-border)',
              background: 'rgba(14, 13, 16, 0.95)',
              color: 'var(--dg-text-muted)',
            }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-700/50" />
            <span className="ml-auto opacity-40">difusión — bash</span>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 text-sm leading-relaxed overflow-y-auto overflow-x-hidden max-h-[75vh]"
            style={{ color: 'var(--dg-text)' }}>

            {/* Terminal log */}
            {terminalLog.map((line, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: -3 }}
                animate={i < logIndex ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex gap-2 items-baseline"
              >
                {line.type === 'command' && (
                  <span style={{ color: 'var(--dg-accent)' }}>$</span>
                )}
                {line.type === 'info' && (
                  <span className="inline-block w-4 text-center text-[0.5rem]"
                    style={{ color: 'var(--dg-text-muted)' }}>◆</span>
                )}
                <span style={{
                  color: line.type === 'command' ? 'var(--dg-text)' : 'var(--dg-text-muted)',
                }}>
                  {line.text}
                </span>
              </m.div>
            ))}

            {/* Pause after log, show cursor if still typing title */}
            {logIndex >= terminalLog.length && titleChars < TITLE.length && (
              <div className="flex gap-2 items-baseline">
                <span style={{ color: 'var(--dg-accent)' }}>$</span>
                <span style={{ color: 'var(--dg-text-muted)', opacity: 0.4 }}>
                  {CURSOR}
                </span>
              </div>
            )}

            {/* Title */}
            {logIndex >= terminalLog.length && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 items-baseline pt-1"
              >
                <span style={{ color: 'var(--dg-accent)' }}>$</span>
                <span className="text-base sm:text-lg tracking-tight"
                  style={{ color: 'var(--dg-accent)' }}>
                  {TITLE.slice(0, titleChars)}
                  {titleChars < TITLE.length ? CURSOR : null}
                </span>
              </m.div>
            )}

            {/* Subtitle */}
            {showSubtitle && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2 pl-4 text-xs"
              >
                <span style={{ color: 'var(--dg-text-muted)', opacity: 0.5 }}>#</span>
                <span style={{ color: 'var(--dg-text-muted)', opacity: 0.5 }} className="italic">
                  {SUBTITLE.replace('# ', '')}
                </span>
                {CURSOR}
              </m.div>
            )}


            {/* Generated output */}
            {showOutput && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="pt-3"
              >
                <div className="flex gap-2 pb-1 text-xs" style={{ color: 'var(--dg-text-muted)' }}>
                  <span style={{ color: 'var(--dg-accent)' }}>$</span>
                  <span>cat ./output/ultima_generacion.log</span>
                </div>
                <div className="pl-4 mt-1 space-y-0.5 text-xs"
                  style={{
                    color: 'var(--dg-text-muted)',
                  }}>
                  {generatedOutput.map((line, i) => (
                    <m.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.15 }}
                      className="flex gap-2"
                    >
                      <span style={{ color: 'var(--dg-accent)', opacity: 0.6 }}>{'>'}</span>
                      <span>{line.text}</span>
                    </m.div>
                  ))}
                </div>
              </m.div>
            )}

            {/* Essay paragraph */}
            {showParagraph && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="pt-3"
              >
                <div className="flex gap-2 pb-1 text-xs" style={{ color: 'var(--dg-text-muted)' }}>
                  <span style={{ color: 'var(--dg-accent)' }}>$</span>
                  <span>cat ./ensayo/difusion.txt</span>
                  {CURSOR}
                </div>
                <div className="pl-4 mt-1"
                  style={{
                    color: 'var(--dg-text)',
                  }}>
                  <p className="text-sm sm:text-base leading-relaxed break-words" style={{ color: 'var(--dg-text)' }}>
                    {scene.paragraph}
                  </p>
                </div>
              </m.div>
            )}

            {/* Final prompt */}
            {showParagraph && (
              <div className="flex gap-2 items-baseline pt-2">
                <span style={{ color: 'var(--dg-accent)' }}>$</span>
                <span style={{ color: 'var(--dg-text-muted)', opacity: 0.4 }}>
                  {CURSOR}
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Global blink keyframes */}
        <style>{`
          @keyframes crt-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    </SceneShell>
  )
}
