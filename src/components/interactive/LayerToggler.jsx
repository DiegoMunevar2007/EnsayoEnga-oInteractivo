import { motion } from 'framer-motion'

const baseImage = 'https://live.staticflickr.com/6050/6321475884_dc467832c8_b.jpg'

export default function LayerToggler() {
  return (
    <div className="text-center">
      <div className="relative w-full max-w-[500px] mx-auto rounded"
        style={{ border: '1px solid var(--cl-border)' }}>
        <img
          src={baseImage}
          alt="Manipulación digital"
          className="w-full block"
        />
      </div>
      <p
        className="mt-3 text-[0.55rem] sm:text-[0.6rem] leading-relaxed max-w-[500px] mx-auto"
        style={{ color: 'var(--cl-text-muted)', opacity: 0.65 }}
      >
        Portada de TV Guide (1989): la cabeza de Oprah Winfrey fue superpuesta digitalmente sobre el cuerpo de Ann-Margret. Uno de los primeros escándalos públicos de manipulación digital en los medios.
      </p>
    </div>
  )
}
