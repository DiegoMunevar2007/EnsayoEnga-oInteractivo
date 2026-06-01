import { useState, useRef } from 'react'
import { motion as m } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import SceneShell from '../layout/SceneShell'

const posters = [
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Lenin_houdt_een_speech%2C_vlakbij_stond_Trotski_maar_die_is_weg_-geretoucheerd%2C_SFA001018178.jpg',
    caption: 'EL PODER SOVIÉTICO',
    truth: 'Trotsky fue eliminado del negativo tras caer en desgracia. La foto original de 1920 mostraba a Lenin junto a su sucesor, borrado de la historia oficial soviética.',
  },
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Stalin_and_Molotov_along_the_Volga%E2%80%93Don_Canal%2C_Nikolai_Yezhov_removed.jpg',
    caption: 'LEALTAD AL PARTIDO',
    truth: 'Nikolái Yezhov, jefe de la NKVD, fue eliminado de esta fotografía tras ser ejecutado en 1940. Ejemplo clásico de damnatio memoriae soviético.',
  },
{
  img: 'https://static01.nyt.com/images/2009/08/22/weekinreview/29682583.JPG',
  caption: 'EL COMITÉ CENTRAL UNIDO',
  truth: 'Originalmente la Banda de los Cuatro aparecía en la fila. Fueron arrestados poco después del funeral y borrados de la fotografía oficial, dejando huecos visibles en la alineación.'
},
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Manipulated_portrait_of_Abraham_Lincoln_%281860%27s%29.jpg',
    caption: 'EL HÉROE AMERICANO',
    truth: 'La cabeza de Lincoln fue superpuesta sobre el cuerpo del político esclavista John C. Calhoun. Durante casi un siglo nadie notó que el lunar estaba del lado equivocado.',
  },
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Grande_Boucherie_Canine_a_Paris_%28canular_photographique%29.jpg',
    caption: 'LA GRAN ESTAFA CÁRNICA',
    truth: 'Fotomontaje de 1909 creado para vender la imagen a la prensa sensacionalista. No existió tal carnicería: el propio autor confesó el engaño en 1910.',
  },
{
  img: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mussolini_spada_islam.jpg',
  caption: 'EL LÍDER INVENCIBLE',
truth: 'Originalmente había un asistente sujetando las riendas del caballo, eliminado para proyectar una imagen de líder invencible que no necesita ayuda de nadie.'}
]

export default function ScenePropaganda({ scene, index, direction = 0 }) {
  const [heldIndex, setHeldIndex] = useState(null)
  const holdTimers = useRef({})
  const heldRef = useRef(null)

  const handlePointerDown = (i) => {
    holdTimers.current[i] = setTimeout(() => {
      heldRef.current = i
      setHeldIndex(i)
    }, 400)
  }

  const handlePointerUp = (i) => {
    clearTimeout(holdTimers.current[i])
    if (heldRef.current === i) {
      heldRef.current = null
      setHeldIndex(null)
    }
  }

  const handlePointerLeave = (i) => {
    clearTimeout(holdTimers.current[i])
    if (heldRef.current === i) {
      heldRef.current = null
      setHeldIndex(null)
    }
  }

  return (
    <SceneShell scene={scene} index={index}>
      <div className="relative w-full h-full flex overflow-hidden">

        <style>{`
          .projector-beam {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            background:
              conic-gradient(
                from 30deg at 100% 0%,
                transparent 0deg,
                rgba(232, 205, 170, 0.08) 15deg,
                rgba(232, 205, 170, 0.04) 20deg,
                transparent 25deg,
                transparent 360deg
              ),
              radial-gradient(
                ellipse at 80% 20%,
                rgba(255, 220, 180, 0.06) 0%,
                transparent 60%
              );
          }
          .sprocket-corner {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 1.5px solid var(--cl-ochre, var(--cl-accent));
            opacity: 0.25;
            pointer-events: none;
            z-index: 2;
          }
          .sprocket-corner--tl { top: 14px; left: 14px; }
          .sprocket-corner--tr { top: 14px; right: 14px; }
          .sprocket-corner--bl { bottom: 14px; left: 14px; }
          .sprocket-corner--br { bottom: 14px; right: 14px; }
          .film-leader {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            pointer-events: none;
            z-index: 2;
            background: repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 28px,
              var(--cl-ochre, var(--cl-accent)) 28px,
              var(--cl-ochre, var(--cl-accent)) 30px,
              transparent 30px,
              transparent 56px
            );
            opacity: 0.12;
          }
          .film-leader--top { top: 0; }
          .film-leader--bottom { bottom: 0; }
        `}</style>

        <div className="projector-beam" />

        <div className="sprocket-corner sprocket-corner--tl" />
        <div className="sprocket-corner sprocket-corner--tr" />
        <div className="sprocket-corner sprocket-corner--bl" />
        <div className="sprocket-corner sprocket-corner--br" />
        <div className="film-leader film-leader--top" />
        <div className="film-leader film-leader--bottom" />

        {/* Main content: text left, gallery right */}
        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 px-6 sm:px-10 lg:px-16 pr-12 sm:pr-14 lg:pr-20 py-8 lg:py-0">

          {/* ─── LEFT: TEXT ─── */}
          <div className="w-full lg:flex-1 flex flex-col justify-center gap-4 max-w-lg">

            <div>
              <span
                className="block font-[family-name:var(--font-mono)] uppercase tracking-[0.3em] text-[0.55rem] sm:text-xs mb-1"
                style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}
              >
                Capítulo VI
              </span>
              <h2
                className="font-[family-name:var(--font-mono)] uppercase text-3xl sm:text-4xl lg:text-5xl leading-tight mb-2"
                style={{ color: 'var(--cl-parchment, var(--cl-text))' }}
              >
                {scene.title}
              </h2>
              <p
                className="font-[family-name:var(--font-classical)] italic text-lg sm:text-xl"
                style={{ color: 'var(--cl-terracotta, var(--cl-accent-dim))' }}
              >
                {scene.subtitle}
              </p>
            </div>

            <m.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-[family-name:var(--font-hand)] text-base sm:text-lg leading-relaxed pl-4 border-l-2"
              style={{
                color: 'var(--cl-ochre, var(--cl-accent))',
                borderColor: 'var(--cl-ochre, var(--cl-accent))',
              }}
            >
              &ldquo;Una imagen vale más que mil disparos.&rdquo;
            </m.blockquote>

            {scene.paragraph && (
              <m.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-classical)] text-xs sm:text-sm leading-relaxed"
                style={{ color: 'var(--cl-ink, var(--cl-text))' }}
              >
                {scene.paragraph}
              </m.p>
            )}

            {scene.paragraph && (
              <m.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2 text-[0.6rem] sm:text-[0.65rem] tracking-[0.1em] mt-2"
                style={{ color: 'var(--cl-terracotta, var(--cl-accent-dim))' }}
              >
                <FiArrowRight className="text-xs" />
                Manten presionadas las imágenes para descubrir su verdad
              </m.p>
            )}

          </div>

          {/* ─── RIGHT: GALLERY ─── */}
          <div className="w-full lg:max-w-[45%] flex items-center justify-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full grid grid-cols-3 gap-3 sm:gap-4"
            >
              {posters.map((poster, i) => (
                <m.div
                  key={i}
                  layoutId={`poster-${i}`}
                  onPointerDown={() => handlePointerDown(i)}
                  onPointerUp={() => handlePointerUp(i)}
                  onPointerLeave={() => handlePointerLeave(i)}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center cursor-pointer group select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div
                    className="w-full overflow-hidden rounded-sm relative"
                    style={{
                      border: '1px solid var(--cl-border, rgba(150,110,70,0.3))',
                      background: '#1a1713',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Truth layer (back) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 text-center gap-1">
                      <p
                        className="font-[family-name:var(--font-classical)] text-sm sm:text-base leading-snug max-w-full px-1"
                        style={{ color: 'var(--cl-parchment, var(--cl-text))', opacity: 0.95 }}
                      >
                        {poster.truth}
                      </p>
                      <span
                        className="text-[0.6rem] uppercase tracking-[0.3em] mt-1 border-t border-dotted inline-block pt-1"
                        style={{ color: 'var(--cl-terracotta, var(--cl-accent-dim))', borderColor: 'var(--cl-border, rgba(150,110,70,0.3))' }}
                      >
                        VERDAD
                      </span>
                    </div>

                    {/* Propaganda image (front) — se desprende al mantener presionado */}
                    <m.div
                      className="relative z-10"
                      animate={
                        heldIndex === i
                          ? { y: '105%', rotate: 4, opacity: 0, scale: 0.9 }
                          : { y: 0, rotate: 0, opacity: 1, scale: 1 }
                      }
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <img
                        src={poster.img}
                        alt={poster.caption}
                        className="w-full block pointer-events-none"
                        loading="lazy"
                      />
                    </m.div>
                  </div>
                  <span
                    className="mt-3 text-[0.5rem] sm:text-[0.55rem] tracking-[0.15em] uppercase text-center leading-tight"
                    style={{ color: 'var(--cl-ochre, var(--cl-accent))' }}
                  >
                    {poster.caption}
                  </span>
                </m.div>
              ))}
            </m.div>
          </div>

        </div>

      </div>
    </SceneShell>
  )
}
