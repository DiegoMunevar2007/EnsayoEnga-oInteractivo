import SceneShell from '../layout/SceneShell'

const references = [
  { author: 'Caballo Ardila, D.', year: '2005', title: 'La manipulación fotográfica: imágenes para engañar a la historia', journal: 'Cuadernos de Periodistas', volume: '2', pages: '145–152', url: 'https://www.apmadrid.es/wp-content/uploads/2012/07/5(5).pdf' },
  { author: 'Computer History Museum', year: 's.f.', title: 'Photoshop: Make software, change the world!', url: 'https://www.computerhistory.org/makesoftware/exhibit/photoshop/' },
  { author: 'Fontcuberta, J.', year: '2010', title: 'La cámara de Pandora: La fotografi@ después de la fotografía', publisher: 'Gustavo Gili', url: 'https://proyectoidis.org/el-beso-de-judas/' },
  { author: 'Franganillo, J.', year: '2023', title: 'La inteligencia artificial generativa y su impacto en la creación de contenidos mediáticos', journal: 'Methaodos: Revista de Ciencias Sociales', volume: '11', issue: '2', pages: 'm231102a10', url: 'https://doi.org/10.17502/mrcs.v11i2.710' },
  { author: 'Goodfellow, I. J., Pouget-Abadie, J., Mirza, M., Xu, B., Warde-Farley, D., Ozair, S., Courville, A., & Bengio, Y.', year: '2014', title: 'Generative adversarial nets', journal: 'Advances in Neural Information Processing Systems', volume: '27', url: 'https://arxiv.org/abs/1406.2661' },
  { author: 'History.com Editors', year: '2022', title: 'How photos became a weapon in Stalin\'s Great Purge', publisher: 'HISTORY', url: 'https://www.history.com/articles/josef-stalin-great-purge-photo-retouching' },
  { author: 'Library of Congress', year: 's.f.', title: 'The daguerreotype medium', url: 'https://www.loc.gov/collections/daguerreotypes/articles-and-essays/the-daguerreotype-medium/' },
  { author: 'Metropolitan Museum of Art', year: '2004', title: 'Daguerre (1787–1851) and the invention of photography', url: 'https://www.metmuseum.org/essays/daguerre-1787-1851-and-the-invention-of-photography' },
  { author: 'Plinio el Viejo', year: 'ca. 77 d.C.', title: 'Historia natural, Libro XXXV: Tratado de la pintura y el color', url: 'https://historia-del-arte-erotico.com/Plinio_el_viejo/libro35.htm' },
  { author: 'Princeton University Art Museum', year: '1993', title: 'The Two Ways of Life', note: 'Registro de colección', url: 'https://artmuseum.princeton.edu/art/collections/objects/18132' },
  { author: 'Ramos Lahiguera, C. M., Téllez Infantes, A., & Martínez Guirao, J. E.', year: '2017', title: 'Simulacro, ficción y manipulación de la realidad en la era digital: Photoshop y el retoque fotográfico', journal: 'Observatorio (OBS*)', volume: '11', issue: '4', url: 'https://doi.org/10.15847/obsOBS11420171044' },
  { author: 'Rath, A.', year: '2015', date: 'febrero 21', title: 'Adobe Photoshop: \'Democratizing\' photo editing for 25 years', publisher: 'NPR', url: 'https://www.npr.org/sections/alltechconsidered/2015/02/21/387839022/adobe-photoshop-democratizing-photo-editing-for-25-years' },
  { author: 'Rombach, R., Blattmann, A., Lorenz, D., Esser, P., & Ommer, B.', year: '2022', title: 'High-resolution image synthesis with latent diffusion models', journal: 'Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition', pages: '10684–10695', url: 'https://arxiv.org/abs/2112.10752' },
  { author: 'Rubin, E.', year: '1915', title: 'Synsoplevede figurer [Figuras visualmente experimentadas]', publisher: 'Gyldendalske Boghandel', url: 'https://www.illusionsindex.org/i/rubin-s-vase' },
  { author: 'Stability AI', year: '2022', date: 'agosto 22', title: 'Stable Diffusion public release', url: 'https://stability.ai' },
  { author: 'Victoria and Albert Museum', year: 's.f.', title: 'The Two Ways of Life', note: 'Registro de colección', url: 'https://collections.vam.ac.uk/item/O1276365/the-two-ways-of-life-photograph-oscar-gustav-rejlander' },
]

export default function SceneReferencias({ scene, index }) {
  return (
    <SceneShell scene={scene} index={index}>
      <div className="w-full h-full flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 py-12 sm:py-16">
        <div className="w-full max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block w-6 h-px" style={{ background: 'var(--dg-accent)' }} />
          <span className="text-[0.55rem] tracking-[0.25em] uppercase font-mono"
            style={{ color: 'var(--dg-text-muted)', opacity: 0.5 }}>
            REFERENCIAS
          </span>
        </div>

        <h2 className="font-[family-name:var(--font-digital)] text-2xl sm:text-3xl lg:text-4xl leading-tight mb-8"
          style={{ color: 'var(--dg-accent)' }}>
          {scene.title}
        </h2>

        <div className="space-y-2">
          {references.map((ref, i) => (
            <p key={i} className="font-[family-name:var(--font-classical)] text-xs sm:text-sm leading-[1.6]"
              style={{ color: 'var(--dg-text)' }}>
              <span className="inline-block w-5 text-[0.5rem] tracking-wider font-mono align-top"
                style={{ color: 'var(--dg-text-muted)', opacity: 0.3 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {ref.author}.{' '}
              {ref.date && ref.date !== ref.year
                ? <span style={{ color: 'var(--dg-text-muted)', opacity: 0.55 }}>({ref.date} {ref.year}). </span>
                : ref.year
                  ? <span style={{ color: 'var(--dg-text-muted)', opacity: 0.55 }}>({ref.year}). </span>
                  : null}
              <span style={{ fontStyle: 'italic' }}>{ref.title}</span>.{' '}
              {ref.journal && (
                <>
                  <span style={{ fontStyle: 'italic' }}>{ref.journal}</span>
                  {ref.volume && <span>, <span style={{ fontWeight: 600 }}>{ref.volume}</span></span>}
                  {ref.issue && <span> ({ref.issue})</span>}
                  {ref.pages && <span>, {ref.pages}</span>}
                  .{' '}
                </>
              )}
              {ref.publisher && <span>{ref.publisher}. </span>}
              {ref.note && <span>{ref.note}. </span>}
              <a href={ref.url} target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2"
                style={{ color: 'var(--dg-accent)', opacity: 0.6, wordBreak: 'break-all' }}>
                {ref.url}
              </a>
            </p>
          ))}
        </div>
        </div>
      </div>
    </SceneShell>
  )
}
