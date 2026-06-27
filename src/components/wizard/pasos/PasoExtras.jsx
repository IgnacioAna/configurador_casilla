// Paso 6 del wizard — Extras (EXTRAS-01).
// Componente presentacional: recibe { estado, dispatch } (contrato de ConfiguratorWizard.jsx:54),
// lee de /data y dispara SET_CAMPO. NO toca el plano (D-09: estos extras no tienen footprint); solo
// escribe extras[] (la BarraPrecio del Plan 05-04 los suma).
// - EXTRAS-01 / D-08: los 9 extras categoria 'extras' agrupados por metadato `subgrupo` (Confort 7 /
//   Energía 2), DATA-DRIVEN — sin lista de ids hardcodeada (Pattern 3, gate anti-hardcodeo).
import { EXTRAS } from '../../../data/extras.js'
import { ACCIONES } from '../../../state/wizardReducer.js'
import { formatPrecio } from '../../../utils/formato.js'

// Subgrupos de UI (solo el título visible): el split lo aporta el metadato `subgrupo` en /data.
// Copy EXACTO del UI-SPEC "Copywriting Contract" (encabezados de subgrupo).
const SUBGRUPOS = [
  { id: 'confort', titulo: 'Confort' },
  { id: 'energia', titulo: 'Energía' },
]

export default function PasoExtras({ estado, dispatch }) {
  // T-05-08: extras adulterado de localStorage cae a [] sin crashear antes de includes/filter.
  const extras = Array.isArray(estado.extras) ? estado.extras : []

  // Toggle inmutable en extras[] (idéntico a PasoBano — Pitfall 3: array nuevo, nunca mutar).
  const toggleExtra = (id) => {
    const nuevos = extras.includes(id) ? extras.filter((x) => x !== id) : [...extras, id]
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-impacar-texto">Extras</h2>
      <p className="mt-2 text-sm text-impacar-texto/70">
        Sume los accesorios de confort y energía que prefiera.
      </p>

      {/* Extras agrupados Confort/Energía (EXTRAS-01, Component Inventory 4) — data-driven por
          metadato `subgrupo`, sin lista de ids hardcodeada (gate anti-hardcodeo, D-08). */}
      {SUBGRUPOS.map((g) => {
        const items = EXTRAS.filter((e) => e.categoria === 'extras' && e.subgrupo === g.id)
        return (
          <div key={g.id} className="mt-6">
            <p className="text-sm font-semibold text-impacar-campo">{g.titulo}</p>
            <div className="mt-3 space-y-2">
              {items.map((e) => {
                const marcado = extras.includes(e.id)
                return (
                  <label
                    key={e.id}
                    className={[
                      'flex min-h-[44px] cursor-pointer items-center gap-3 rounded border p-3 transition-colors',
                      marcado
                        ? 'border-impacar-campo bg-impacar-campo/10'
                        : 'border-impacar-texto/10 bg-white/40 hover:border-impacar-campo/40',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => toggleExtra(e.id)}
                      className="accent-[#2D5016]"
                    />
                    <span className="text-sm">{e.nombre}</span>
                    <span className="ml-auto text-xs text-impacar-texto/70">
                      {formatPrecio(e.precioNeto)} + IVA
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
