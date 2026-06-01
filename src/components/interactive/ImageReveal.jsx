import { useEffect, useState, forwardRef } from 'react'

const placeholderImg = '/images/Daguerrotipo.jpg'

const ImageReveal = forwardRef(function ImageReveal(_props, canvasRef) {
  const [blur, setBlur] = useState(20)

  useEffect(() => {
    let start = null
    const duration = 2500
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setBlur(20 * (1 - eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [])

  return (
    <div className="text-center">
      <div
        className="relative w-full max-w-[500px] mx-auto aspect-[5/6] overflow-hidden rounded"
        style={{
          filter: `blur(${blur}px)`,
          border: '1px solid var(--cl-border)',
          transition: 'filter 0.05s ease-out',
        }}
      >
        <img
          src={placeholderImg}
          alt="Fotografía antigua"
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
      <p
        className="mt-4 text-sm italic transition-opacity duration-1000 font-[family-name:var(--font-classical)]"
        style={{ opacity: blur < 1 ? 0 : 0.6 }}
      >
        La imagen se revela lentamente, como un daguerrotipo en su baño químico
      </p>
    </div>
  )
})

export default ImageReveal
