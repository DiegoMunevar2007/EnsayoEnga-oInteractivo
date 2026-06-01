import { useState, useEffect, useCallback, useRef } from 'react'

export default function usePageNavigation({ totalPages, initialPage = 0 }) {
  const [page, setPage] = useState(initialPage)
  const [direction, setDirection] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionType, setTransitionType] = useState('film-burn')
  const touchStart = useRef(null)
  const wheelTimeout = useRef(null)
  const lastWheelTime = useRef(0)

  // Scene themes for transition type
  const sceneThemes = [
    'mixed', 'classical', 'classical', 'classical', 'classical',
    'classical', 'classical', 'transition', 'digital', 'digital', 'mixed',
  ]

  const goToPage = useCallback((next) => {
    if (next < 0 || next >= totalPages || transitioning) return

    const dir = next > page ? 1 : -1
    const prevTheme = sceneThemes[page] || 'classical'
    const nextTheme = sceneThemes[next] || 'classical'

    let type
    if (prevTheme === 'classical' && nextTheme === 'classical') type = 'film-burn'
    else if (prevTheme === 'digital' && nextTheme === 'digital') type = 'glitch'
    else type = 'mixed'

    setTransitionType(type)
    setDirection(dir)
    setTransitioning(true)
    setPage(next)

    setTimeout(() => setTransitioning(false), 900)
  }, [page, totalPages, transitioning])

  const goNext = useCallback(() => goToPage(page + 1), [goToPage, page])
  const goPrev = useCallback(() => goToPage(page - 1), [goToPage, page])

  // Wheel handler
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelTime.current < 1000 || transitioning) return
      lastWheelTime.current = now

      if (e.deltaY > 0) goNext()
      else goPrev()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [goNext, goPrev, transitioning])

  // Touch handler
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      if (!touchStart.current || transitioning) return
      const diff = touchStart.current - e.changedTouches[0].clientY
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext()
        else goPrev()
      }
      touchStart.current = null
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [goNext, goPrev, transitioning])

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  return { page, direction, transitioning, transitionType, goNext, goPrev, goToPage }
}
