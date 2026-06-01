import { useEffect, useRef, useState } from 'react'

const FACE_URL = 'https://thispersondoesnotexist.com'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 184, g: 149, b: 46 }
}

function toRGBA(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function splitParagraphs(text, n = 3) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const groups = []
  for (let i = 0; i < sentences.length; i += n) {
    groups.push(sentences.slice(i, i + n).join(' ').trim())
  }
  return groups
}

export default function MorphingCanvas({
  subjectIndex = 0,
  showSubjectNumber = false,
  onRegenerate,
  canvasSize = 360,
  primaryColor = '#b8952e',
  secondaryColor = '#7a5a30',
  bgColor = '#0e0d10',
  glowColor,
  borderColor,
}) {
  const [phase, setPhase] = useState('loading')
  const [progress, setProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [imgSrc, setImgSrc] = useState(null)
  const animRef = useRef(null)

  const resolvedGlow = glowColor || `var(--dg-glow)`
  const resolvedBorder = borderColor || `var(--dg-border)`

  useEffect(() => {
    const src = `${FACE_URL}?t=${Date.now()}_${subjectIndex}_${retryCount}`
    setImgSrc(src)
    setPhase('loading')
    setProgress(0)
  }, [subjectIndex, retryCount])

  useEffect(() => {
    if (phase !== 'loading' || !imgSrc) return
    const start = Date.now()
    const duration = 400

    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setProgress(p)
      if (p < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    const tOut = setTimeout(() => {
      if (phase === 'loading') setPhase('error')
    }, 10000)

    return () => {
      cancelAnimationFrame(animRef.current)
      clearTimeout(tOut)
    }
  }, [phase, imgSrc])

  const handleImgLoad = () => {
    if (phase === 'loading') setPhase('ready')
  }

  const handleImgError = () => {
    if (phase === 'loading') setPhase('error')
  }

  const handleRegenerate = () => {
    if (onRegenerate) onRegenerate()
  }

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
  }

  const renderLoading = () => (
    <div
      className="aspect-square max-w-full mx-auto rounded flex flex-col items-center justify-center gap-3"
      style={{ maxWidth: canvasSize, border: `1px solid ${resolvedBorder}`, background: bgColor }}
    >
      <span className="font-mono text-xs" style={{ color: resolvedBorder }}>
        Generando rostro sintético...
      </span>
      <div className="w-3/5 h-[2px] rounded overflow-hidden" style={{ background: bgColor }}>
        <div
          className="h-full rounded transition-all duration-75"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />
      </div>
      <span className="font-mono text-[0.5rem]" style={{ color: resolvedBorder, opacity: 0.5 }}>
        {Math.round(progress * 100)}%
      </span>
    </div>
  )

  const renderReady = () => (
    <div
      className="relative mx-auto aspect-square overflow-hidden rounded"
      style={{
        maxWidth: canvasSize,
        border: `1px solid ${resolvedBorder}`,
        boxShadow: `0 0 60px ${resolvedGlow}`,
      }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt="Rostro generado por IA — esta persona no existe"
          className="w-full h-full object-cover"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${toRGBA(primaryColor, 0.04)} 0%, transparent 50%, ${toRGBA(secondaryColor, 0.03)} 100%)`,
        }}
      />
    </div>
  )

  const renderError = () => (
    <div
      className="aspect-square max-w-full mx-auto rounded flex flex-col items-center justify-center gap-3"
      style={{ maxWidth: canvasSize, border: `1px solid ${resolvedBorder}`, background: bgColor }}
    >
      <span className="font-mono text-xs" style={{ color: resolvedBorder }}>
        No se pudo cargar la imagen
      </span>
      <button
        onClick={handleRetry}
        className="font-mono text-xs px-4 py-2 rounded transition-colors"
        style={{ border: `1px solid ${resolvedBorder}`, color: primaryColor }}
      >
        Reintentar
      </button>
    </div>
  )

  return (
    <div className="text-center">
      {phase === 'loading' && renderLoading()}
      {phase === 'ready' && renderReady()}
      {phase === 'error' && renderError()}

      {imgSrc && phase === 'loading' && (
        <div aria-hidden style={{ height: 0, overflow: 'hidden', opacity: 0, position: 'absolute', pointerEvents: 'none' }}>
          <img src={imgSrc} onLoad={handleImgLoad} onError={handleImgError} alt="" />
        </div>
      )}

      <div className="mt-3 font-mono text-xs flex items-center justify-center gap-2" style={{ color: resolvedBorder }}>
        <span style={{ color: primaryColor }}>&gt;</span>
        {phase === 'loading' ? (
          <>
            <span>Sintetizando...</span>
            <span className="inline-block w-[120px] h-[2px] rounded overflow-hidden align-middle" style={{ background: bgColor }}>
              <span
                className="block h-full rounded transition-all duration-100"
                style={{
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />
            </span>
            <span className="inline-block w-2 h-2 rounded-full animate-pulse align-middle" style={{ background: primaryColor }} />
          </>
        ) : phase === 'ready' ? (
          <span style={{ color: primaryColor }}>Rostro sintético generado</span>
        ) : (
          <span style={{ color: secondaryColor }}>Error de carga</span>
        )}
      </div>

      {phase === 'ready' && showSubjectNumber && (
        <div className="mt-2 font-mono text-xs" style={{ color: resolvedBorder }}>
          <span style={{ color: primaryColor }}>$</span> SUJETO_#{String(subjectIndex + 1).padStart(4, '0')}
        </div>
      )}

      {phase === 'ready' && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={handleRegenerate}
            className="group relative font-mono text-xs tracking-[0.15em] uppercase px-6 py-3 rounded transition-all duration-300"
            style={{
              border: `1px solid ${resolvedBorder}`,
              color: primaryColor,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = primaryColor
              e.currentTarget.style.boxShadow = `0 0 20px ${resolvedGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = resolvedBorder
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span className="group-hover:opacity-100 transition-opacity duration-300" style={{ opacity: 0.5 }}>
              ❖
            </span>
            <span className="ml-2">Generar otro rostro</span>
          </button>
        </div>
      )}

      <p
        className="mt-4 text-xs italic leading-relaxed max-w-md mx-auto"
        style={{ color: resolvedBorder, opacity: 0.6 }}
      >
        {phase === 'ready'
          ? 'Esta persona no existe. Su rostro fue generado por una Red Generativa Antagónica (GAN).'
          : 'La máquina aprende a crear desde el ruido.'}
      </p>
    </div>
  )
}
