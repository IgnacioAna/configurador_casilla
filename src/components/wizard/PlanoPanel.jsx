import { useState } from 'react'
import FloorPlan from '../FloorPlan.jsx'

// Mapeo color de zona → nombre, para la leyenda (UI-SPEC Fase 2). Los fills coinciden con los
// del plano (zona.bano/dormitorio/cocina + neutros para baulera/estar).
const ZONAS_LEYENDA = [
  { nombre: 'Baño', color: '#BFE3EE' },
  { nombre: 'Dormitorio', color: '#C9A66B' },
  { nombre: 'Cocina', color: '#A7C796' },
  { nombre: 'Estar/comedor', color: '#ECECE4' },
  { nombre: 'Baulera', color: '#ECECE4' },
]

// El plano + su leyenda. Wrapper con padding md=16px (UI-SPEC). FloorPlan escala con width="100%".
function Plano({ config }) {
  return (
    <div>
      <div className="rounded border border-impacar-texto/10 bg-impacar-fondo p-4">
        <FloorPlan config={config} />
      </div>
      <div className="mt-4">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {ZONAS_LEYENDA.map((z) => (
            <li key={z.nombre} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-3 w-3 rounded-sm border border-impacar-texto/20"
                style={{ backgroundColor: z.color }}
                aria-hidden="true"
              />
              {z.nombre}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-impacar-texto/70">C cucheta · S simple · M matrimonial</p>
      </div>
    </div>
  )
}

// Contenedor responsive del plano (PLANO-03): sticky a la derecha en desktop (lg+), siempre visible;
// colapsable tras "Ver plano actual" en mobile. Embebe el FloorPlan de Fase 2 sin reimplementar el dibujo.
export default function PlanoPanel({ config }) {
  const [abiertoMobile, setAbiertoMobile] = useState(false)

  return (
    <>
      {/* Desktop: plano sticky, siempre visible. */}
      <aside className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-impacar-texto/70">
          Plano actual
        </h2>
        <Plano config={config} />
      </aside>

      {/* Mobile: disparador colapsable (touch target ≥44px, UI-SPEC). */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setAbiertoMobile((v) => !v)}
          aria-expanded={abiertoMobile}
          className="flex min-h-[44px] w-full items-center justify-between rounded border border-impacar-campo px-4 py-2 text-sm font-semibold text-impacar-campo transition-colors hover:bg-impacar-campo/5 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40"
        >
          <span>{abiertoMobile ? 'Ocultar plano' : 'Ver plano actual'}</span>
          <span aria-hidden="true">{abiertoMobile ? '▲' : '▼'}</span>
        </button>
        {abiertoMobile && (
          <div className="mt-3">
            <Plano config={config} />
          </div>
        )}
      </div>
    </>
  )
}
