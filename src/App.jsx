import { AnimatePresence } from 'framer-motion'
import usePageNavigation from './hooks/usePageNavigation'
import Navigation from './components/layout/Navigation'
import TransitionOverlay from './components/layout/TransitionOverlay'
import HeroScene from './components/scenes/HeroScene'
import SceneAncestral from './components/scenes/SceneAncestral'
import SceneZeuxis from './components/scenes/SceneZeuxis'
import SceneMente from './components/scenes/SceneMente'
import SceneDaguerrotipo from './components/scenes/SceneDaguerrotipo'
import SceneManipulacion from './components/scenes/SceneManipulacion'
import ScenePropaganda from './components/scenes/ScenePropaganda'
import SceneDigital from './components/scenes/SceneDigital'
import SceneGANs from './components/scenes/SceneGANs'
import SceneDifusion from './components/scenes/SceneDifusion'
import SceneConclusion from './components/scenes/SceneConclusion'
import SceneReferencias from './components/scenes/SceneReferencias'
import { scenes } from './data/essayContent'

const sceneComponents = {
  hero: HeroScene,
  ancestral: SceneAncestral,
  zeuxis: SceneZeuxis,
  mente: SceneMente,
  daguerrotipo: SceneDaguerrotipo,
  manipulacion: SceneManipulacion,
  propaganda: ScenePropaganda,
  digital: SceneDigital,
  gans: SceneGANs,
  difusion: SceneDifusion,
  conclusion: SceneConclusion,
  referencias: SceneReferencias,
}

export default function App() {
  const total = scenes.length
  const { page, direction, transitioning, transitionType, goToPage } =
    usePageNavigation({ totalPages: total, initialPage: 0 })
  const scene = scenes[page]
  const Comp = sceneComponents[scene?.id]

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-[#0f0d0a]">
      <Navigation
        activeScene={page}
        totalScenes={total}
        onGoTo={goToPage}
        transitioning={transitioning}
      />

      <TransitionOverlay active={transitioning} type={transitionType} />

      <AnimatePresence mode="wait">
        {Comp && (
          <Comp
            key={scene.id}
            scene={scene}
            index={page}
            direction={direction}
          />
        )}
      </AnimatePresence>

      {/* Navigation hints */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
        {page > 0 && page < total - 1 && (
          <span className="text-xs tracking-widest uppercase animate-pulse"
            style={{ color: 'var(--cl-text-muted)', opacity: 0.3 }}>
            Scroll ↓
          </span>
        )}
      </div>
    </div>
  )
}
