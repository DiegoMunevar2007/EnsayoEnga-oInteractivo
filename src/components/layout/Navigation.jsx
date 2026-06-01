function getThemeColor(theme) {
  switch (theme) {
    case 'hero':
    case 'mixed': return '#b8864a'
    case 'classical': return '#b8864a'
    case 'transition': return '#a0765c'
    case 'digital': return '#b8952e'
    default: return '#b8864a'
  }
}

const sceneThemes = [
  'mixed', 'classical', 'classical', 'classical', 'classical',
  'classical', 'classical', 'transition', 'digital', 'digital', 'mixed',
]

export default function Navigation({ activeScene, totalScenes, onGoTo, transitioning }) {
  return (
    <nav className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
      {Array.from({ length: totalScenes }).map((_, i) => {
        const isActive = i === activeScene
        const color = getThemeColor(sceneThemes[i] || 'classical')
        const theme = sceneThemes[i] || 'classical'

        // Classical = film sprocket hole (rounded rect), Digital = pixel (square)
        const isClassical = theme === 'classical' || theme === 'transition'
        const shapeClass = isClassical
          ? 'rounded-sm'
          : ''

        return (
          <button
            key={i}
            onClick={() => !transitioning && onGoTo(i)}
            aria-label={`Ir a página ${i + 1}`}
            className={`cursor-pointer transition-all duration-500 ${shapeClass}`}
            style={{
              width: isActive ? '16px' : '8px',
              height: isActive ? '6px' : '4px',
              background: isActive
                ? (isClassical ? `linear-gradient(90deg, ${color}, ${color}80)` : color)
                : 'transparent',
              border: `1px solid ${isActive ? color : `${color}60`}`,
              boxShadow: isActive ? `0 0 12px ${color}50` : 'none',
              opacity: transitioning && !isActive ? 0.2 : 1,
              transform: isActive ? 'scaleY(1.2)' : 'scaleY(1)',
            }}
          />
        )
      })}
    </nav>
  )
}
