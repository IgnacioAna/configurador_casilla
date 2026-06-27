// Paso 5 del wizard — Cocina y estar (COCINA-01, COCINA-02, COCINA-03).
// Componente presentacional: recibe { estado, dispatch } (contrato de ConfiguratorWizard.jsx:54),
// lee de /data y dispara SET_CAMPO. NO importa ni renderiza el plano: al escribir extras[] el plano
// reacciona solo (configDesdeEstado deriva horno/heladera/mesa, D-14).
// - COCINA-01: toggle horno (checkbox data-driven, va en extras[]).
// - COCINA-02: selector EXCLUSIVO de heladera (Sin/220V/12V, D-05, Pattern 2) — elegir una quita la
//   otra; ids derivados por prefijo de EXTRAS (anti-hardcodeo).
// - COCINA-03: toggles del estar (mesa de caño, banco despensero).
import { EXTRAS } from '../../../data/extras.js'
import { ACCIONES } from '../../../state/wizardReducer.js'

// Segmentos del selector de heladera (D-05): "Sin" no lleva id; las 2 heladeras usan ids reales.
// Labels cortos del UI-SPEC "Copywriting Contract"; los ids son los reales de data/extras.js.
const SEGMENTOS_HELADERA = [
  { id: null, label: 'Sin' },
  { id: 'heladera-220', label: '220V A++' },
  { id: 'heladera-12v', label: '12V c/pantalla' },
]

// Toggles del estar/cocina (COCINA-01/03): horno + mesa + banco, en extras[] como checkboxes.
// Labels EXACTOS del UI-SPEC; ids reales de data/extras.js.
const TOGGLES = [
  { id: 'cocina-horno', label: 'Cocina con horno industrial' },
  { id: 'mesa-cano', label: 'Mesa de caño' },
  { id: 'banco-despensero', label: 'Banco despensero' },
]

// COCINA-02 / D-05 / Pattern 2: ids de heladera DERIVADOS de EXTRAS por prefijo (anti-hardcodeo,
// T-05-09). Constante de módulo: EXTRAS es inmutable en runtime, así que se computa una sola vez
// (WR-02 code review 05: antes se filtraba dentro del componente, re-corriendo en cada render y
// dando identidad nueva a elegirHeladera). Referencia estable para memoización.
const IDS_HELADERA = EXTRAS.filter(
  (e) => e.categoria === 'cocina' && e.id.startsWith('heladera-')
).map((e) => e.id)

export default function PasoCocina({ estado, dispatch }) {
  // T-05-08: extras adulterado de localStorage cae a [] sin crashear antes de includes/filter.
  const extras = Array.isArray(estado.extras) ? estado.extras : []

  // Toggle inmutable en extras[] (idéntico a PasoBano — Pitfall 3: array nuevo, nunca mutar).
  const toggleExtra = (id) => {
    const nuevos = extras.includes(id) ? extras.filter((x) => x !== id) : [...extras, id]
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
  }

  // COCINA-02 / D-05 / Pattern 2: el handler garantiza exclusividad mutua usando IDS_HELADERA
  // (constante de módulo): filtra AMBAS heladeras y agrega la elegida (o ninguna para "Sin").
  // Imposible quedar con 2 heladeras (Pitfall 2).
  const elegirHeladera = (id /* string | null */) => {
    const sinHeladera = extras.filter((x) => !IDS_HELADERA.includes(x))
    const nuevos = id ? [...sinHeladera, id] : sinHeladera
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
  }
  const hayHeladera = extras.some((x) => IDS_HELADERA.includes(x))

  return (
    <div>
      <h2 className="text-xl font-semibold text-impacar-texto">Cocina y estar</h2>
      <p className="mt-2 text-sm text-impacar-texto/70">
        La cocina incluye mesada, bacha y cocina a gas. Sume las opciones que necesite.
      </p>

      {/* Selector exclusivo de heladera (COCINA-02, Component Inventory 2) — semántica radio. */}
      <p className="mt-6 text-sm font-medium text-impacar-texto/70" id="label-heladera">
        Heladera
      </p>
      <div role="radiogroup" aria-labelledby="label-heladera" className="mt-3 flex flex-wrap gap-2">
        {SEGMENTOS_HELADERA.map((s) => {
          // "Sin" marcado = ninguna heladera presente; 220V/12V = ese id en extras[].
          const marcado = s.id === null ? !hayHeladera : extras.includes(s.id)
          return (
            <button
              key={s.label}
              type="button"
              aria-pressed={marcado}
              onClick={() => elegirHeladera(s.id)}
              className={[
                'min-h-[44px] min-w-[44px] rounded px-4 py-2 text-sm transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
                marcado
                  ? 'border border-impacar-campo bg-impacar-campo/10 font-semibold text-impacar-campo'
                  : 'border border-impacar-texto/10 hover:border-impacar-campo/40',
              ].join(' ')}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Toggles horno / mesa / banco (COCINA-01/03, Component Inventory 3) — checkboxes como PasoBano. */}
      <div className="mt-6 space-y-2">
        {TOGGLES.map((t) => {
          const marcado = extras.includes(t.id)
          return (
            <label
              key={t.id}
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
                onChange={() => toggleExtra(t.id)}
                className="accent-[#2D5016]"
              />
              <span className="text-sm">{t.label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
