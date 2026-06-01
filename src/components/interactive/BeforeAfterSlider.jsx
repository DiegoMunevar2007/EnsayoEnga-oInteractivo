import { useState, useRef, useEffect } from 'react'

/* IMAGEN: Reemplaza con imágenes de antes/después de manipulación fotográfica. */
/* Original: Lenin con Trotsky — Retocada: Trotsky eliminado por censura soviética */
const beforeImg = `${import.meta.env.BASE_URL}images/Trotsky_Unedited.png`
const afterImg = 'https://upload.wikimedia.org/wikipedia/commons/8/85/Lenin_houdt_een_speech%2C_vlakbij_stond_Trotski_maar_die_is_weg_-geretoucheerd%2C_SFA001018178.jpg'

export default function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const handleMove = (clientX) => {
    if (!containerRef.current || !dragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(0, Math.min(100, x)))
  }

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e.clientX)
    const onTouchMove = (e) => handleMove(e.touches[0].clientX)
    const onEnd = () => { dragging.current = false }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onEnd)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseDown={() => { dragging.current = true }}
      onTouchStart={() => { dragging.current = true }}
      className="relative w-full max-w-[500px] mx-auto aspect-[5/6] overflow-hidden rounded select-none"
      style={{
        cursor: 'ew-resize',
        border: '1px solid var(--cl-border)',
      }}
    >
      <img
        src={afterImg}
        alt="Versión manipulada"
        className="w-full h-full object-cover absolute inset-0"
      />

      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImg}
          alt="Versión original"
          className="h-full object-cover block"
          style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: `${sliderPos}%`,
          width: 3,
          background: 'var(--cl-accent)',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 8px rgba(201, 169, 110, 0.5)',
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--cl-accent)', color: '#0f0d0a' }}>
          ↔
        </div>
      </div>

      <div className="absolute bottom-3 left-3 text-[0.6rem] tracking-[0.1em] uppercase"
        style={{ color: 'var(--cl-text)', opacity: 0.7 }}>
        Original
      </div>
      <div className="absolute bottom-3 right-3 text-[0.6rem] tracking-[0.1em] uppercase"
        style={{ color: 'var(--cl-accent)', opacity: 0.7 }}>
        Manipulada
      </div>
    </div>
  )
}
