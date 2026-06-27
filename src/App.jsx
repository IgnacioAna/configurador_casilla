import { useState } from 'react'
import FloorPlan from './components/FloorPlan.jsx'
import { CONFIGS_MOCK } from './data/mockConfig.js'

// Mapeo color de zona -> nombre, para la leyenda (UI-SPEC "Leyenda" + paleta "Color").
// Los fills coinciden con los de la zona en el plano (zona.bano/dormitorio/cocina + neutros).
const ZONAS_LEYENDA = [
  { nombre: 'Baño', color: '#BFE3EE' },
  { nombre: 'Dormitorio', color: '#C9A66B' },
  { nombre: 'Cocina', color: '#A7C796' },
  { nombre: 'Estar/comedor', color: '#ECECE4' },
  { nombre: 'Baulera', color: '#ECECE4' },
]

export default function App() {
  // Demo del motor del plano: ciclamos entre las configs mock para mostrar la transición de
  // 300ms (PLANO-02). El wizard real llega en fases posteriores; acá lo simulamos.
  const [idx, setIdx] = useState(0)
  const config = CONFIGS_MOCK[idx]

  // (idx + 1) % length mantiene el índice acotado (T-02-08): nunca accede a un config undefined.
  const cambiarModelo = () => setIdx((i) => (i + 1) % CONFIGS_MOCK.length)

  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      <header className="bg-impacar-campo text-white px-6 py-4">
        <h1 className="text-2xl font-bold tracking-wide">IMPACAR</h1>
        <p className="text-sm opacity-90">Configurador de casillas rurales</p>
      </header>

      <main className="p-6">
        {/* Control de demo: cambia el modelo y dispara la transición del plano. */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={cambiarModelo}
            className="min-h-[44px] rounded bg-impacar-cobre px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-impacar-cobre/90 focus:outline-none focus:ring-2 focus:ring-impacar-cobre/40"
          >
            Cambiar modelo
          </button>
          <span className="text-sm font-medium text-impacar-texto/70">
            Modelo {config.modeloId}
          </span>
        </div>

        {/* Contenedor del plano: padding md=16px (UI-SPEC spacing), fondo claro, escala al ancho. */}
        <section className="max-w-2xl">
          <div className="rounded border border-impacar-texto/10 bg-impacar-fondo p-4">
            <FloorPlan config={config} />
          </div>

          {/* Leyenda HTML debajo del plano: separación lg=24px (UI-SPEC). */}
          <div className="mt-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {ZONAS_LEYENDA.map((z) => (
                <li key={z.nombre} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-4 w-4 rounded-sm border border-impacar-texto/20"
                    style={{ backgroundColor: z.color }}
                    aria-hidden="true"
                  />
                  {z.nombre}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-impacar-texto/70">
              C cucheta · S simple · M matrimonial
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
