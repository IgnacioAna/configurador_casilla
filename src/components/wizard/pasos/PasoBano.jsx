// Paso 3 del wizard — Baño (BANO-01, BANO-02, BANO-03).
// Componente presentacional: recibe { estado, dispatch } (contrato de ConfiguratorWizard.jsx:54).
// - BANO-01: equipamiento por checkboxes (data-driven desde EXTRAS, categoria 'bano'); el toggle
//   se guarda en extras[] (Pitfall 5), NUNCA en un campo de equipamiento dentro de bano.
// - BANO-02: selector de tamaño Estándar/Ampliado; "Ampliado" deshabilitado en N1/N2 vía el helper
//   puro permiteBanoAmpliado (tolera modeloId adulterado de localStorage → deshabilitado por defecto).
// - BANO-03: al escribir bano.tamano el plano reacciona solo vía el cableado existente del wizard
//   (configDesdeEstado → panel del plano) con .fp-anim. NO se importa ni se renderiza el plano acá.
import { EXTRAS } from '../../../data/extras.js'
import { ACCIONES } from '../../../state/wizardReducer.js'
import { permiteBanoAmpliado } from '../../../utils/banoReglas.js'

export default function PasoBano({ estado, dispatch }) {
  // BANO-01: equipamiento data-driven — filtrar EXTRAS por categoria, NO hardcodear ids.
  const extrasBano = EXTRAS.filter((e) => e.categoria === 'bano')

  // Toggle inmutable en extras[] (Pitfall 3: construir array nuevo, nunca mutar). Pitfall 5: va en
  // extras[] (no en un sub-campo de bano), para que Phase 5 lo sume sin migración.
  const toggleExtra = (id) => {
    const nuevos = estado.extras.includes(id)
      ? estado.extras.filter((x) => x !== id)
      : [...estado.extras, id]
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
  }

  // BANO-02: el umbral lo deriva el helper puro de MODELOS.largo (>= 6,1 m). N1/N2 → false.
  const ampliadoHabilitado = permiteBanoAmpliado(estado.modeloId)

  // Cambio de tamaño: clonar bano con spread (Pitfall 3: nunca mutar estado.bano).
  const setTamano = (tamano) =>
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'bano', valor: { ...estado.bano, tamano } })

  return (
    <div>
      <h2 className="text-xl font-semibold text-impacar-texto">Baño</h2>
      {/* Subtítulo de ubicación (BANO-01, fijo). */}
      <p className="mt-2 text-sm text-impacar-texto/70">
        El baño va en su posición fija, entre la baulera y el dormitorio.
      </p>

      {/* Equipamiento (BANO-01, Patrón C) — selección múltiple por checkboxes, data-driven. */}
      <p className="mt-6 text-sm font-medium text-impacar-texto/70">Equipamiento del baño</p>
      <div className="mt-3 space-y-2">
        {extrasBano.map((e) => {
          const marcado = estado.extras.includes(e.id)
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
            </label>
          )
        })}
      </div>

      {/* Tamaño del baño (BANO-02, Patrón B) — "Ampliado" disabled en N1/N2 con nota explicativa. */}
      <p className="mt-6 text-sm font-medium text-impacar-texto/70">Tamaño del baño</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={estado.bano.tamano === 'estandar'}
          onClick={() => setTamano('estandar')}
          className={[
            'min-h-[44px] min-w-[44px] rounded px-4 py-2 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
            estado.bano.tamano === 'estandar'
              ? 'border border-impacar-campo bg-impacar-campo/10 font-semibold text-impacar-campo'
              : 'border border-impacar-texto/10 hover:border-impacar-campo/40',
          ].join(' ')}
        >
          Estándar
        </button>
        <button
          type="button"
          aria-pressed={estado.bano.tamano === 'ampliado'}
          disabled={!ampliadoHabilitado}
          aria-disabled={!ampliadoHabilitado}
          onClick={() => setTamano('ampliado')}
          className={[
            'min-h-[44px] min-w-[44px] rounded px-4 py-2 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
            'disabled:cursor-not-allowed disabled:opacity-40',
            estado.bano.tamano === 'ampliado'
              ? 'border border-impacar-campo bg-impacar-campo/10 font-semibold text-impacar-campo'
              : 'border border-impacar-texto/10 hover:border-impacar-campo/40',
          ].join(' ')}
        >
          Ampliado
        </button>
      </div>
      {!ampliadoHabilitado && (
        <p className="mt-2 text-xs text-impacar-texto/70">Disponible desde el modelo N3 (6,10 m) en adelante.</p>
      )}
    </div>
  )
}
