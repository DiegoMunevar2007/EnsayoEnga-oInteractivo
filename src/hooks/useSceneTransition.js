import { useState, useEffect, useRef } from 'react'

export default function useSceneTransition(activeScene, scenes) {
  const [transitioning, setTransitioning] = useState(false)
  const [transitionType, setTransitionType] = useState(null)
  const prevSceneRef = useRef(activeScene)

  useEffect(() => {
    const prev = prevSceneRef.current
    if (prev !== activeScene) {
      const prevTheme = scenes[prev]?.theme || 'classical'
      const nextTheme = scenes[activeScene]?.theme || 'classical'

      let type
      if (prevTheme === 'classical' && nextTheme === 'classical') {
        type = 'film-burn'
      } else if (prevTheme === 'digital' && nextTheme === 'digital') {
        type = 'glitch'
      } else {
        type = 'mixed'
      }

      setTransitionType(type)
      setTransitioning(true)

      const timer = setTimeout(() => {
        setTransitioning(false)
        setTransitionType(null)
      }, 1000)

      prevSceneRef.current = activeScene
      return () => clearTimeout(timer)
    }
  }, [activeScene, scenes])

  return { transitioning, transitionType }
}
