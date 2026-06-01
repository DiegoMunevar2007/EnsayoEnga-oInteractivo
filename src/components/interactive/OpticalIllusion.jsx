import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

const SNAKE_COLORS = [
  '#16120E',
  '#6B4423',
  '#E8E0D4',
  '#B8864A',
]

function drawSnake(ctx, cx, cy, radius, angle) {
  const pi2 = Math.PI * 2
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * pi2 + angle
    const a1 = ((i + 1) / 4) * pi2 + angle
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, a0, a1)
    ctx.closePath()
    ctx.fillStyle = SNAKE_COLORS[i]
    ctx.fill()
  }

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, pi2)
  ctx.strokeStyle = 'rgba(184,134,74,0.1)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.12, 0, pi2)
  ctx.fillStyle = SNAKE_COLORS[3]
  ctx.fill()
}

const OpticalIllusion = forwardRef(({ fullScreen = false, active = true }, ref) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const gridRef = useRef({ cols: 0, rows: 0, cellSize: 0, spacing: 0, startX: 0, startY: 0 })
  const angleRef = useRef(0)

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getGrid: () => gridRef.current,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, running = true
    let cols, rows, cellSize, spacing, startX, startY

    const resize = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      w = Math.round(rect.width)
      h = Math.round(rect.height)
      if (w === 0 || h === 0) return
      canvas.width = w
      canvas.height = h

      cols = Math.max(4, Math.round(w / 80))
      rows = Math.max(3, Math.round(h / 80))
      cellSize = Math.min(w / cols, h / rows) * 0.78
      spacing = cellSize * 1.06
      startX = (w - cols * spacing) / 2 + spacing / 2
      startY = (h - rows * spacing) / 2 + spacing / 2
      gridRef.current = { cols, rows, cellSize, spacing, startX, startY }
    }

    resize()

    const observer = fullScreen ? new ResizeObserver(() => resize()) : null
    if (observer && containerRef.current) observer.observe(containerRef.current)

    const draw = () => {
      if (!running || !active) return
      ctx.clearRect(0, 0, w, h)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = startX + c * spacing
          const cy = startY + r * spacing
          const drift = Math.sin(c * 0.7 + r * 0.5) * 0.15
          drawSnake(ctx, cx, cy, cellSize / 2, angleRef.current * (1 + drift))
        }
      }

      angleRef.current += 0.002
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      running = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (observer) observer.disconnect()
    }
  }, [active, fullScreen])

  return (
    <div ref={containerRef} className={fullScreen ? 'absolute inset-0 overflow-hidden' : ''}>
      <canvas
        ref={canvasRef}
        className={fullScreen ? 'w-full h-full block' : 'max-w-full h-auto rounded'}
        style={!fullScreen ? { border: '1px solid var(--cl-border)' } : undefined}
      />
    </div>
  )
})

OpticalIllusion.displayName = 'OpticalIllusion'
export default OpticalIllusion
