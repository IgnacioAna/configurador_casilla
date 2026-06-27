// Paso 4 del wizard — Dormitorio (DORM-01, DORM-02, DORM-03).
// Componente presentacional: recibe { estado, dispatch } (contrato de ConfiguratorWizard.jsx:54),
// lee de /data y dispara SET_CAMPO. NO importa ni renderiza el plano (DORM-03): al escribir
// dormitorio.camas el plano reacciona solo (configDesdeEstado → panel del plano con .fp-anim).
// - DORM-01: steppers +/- por tipo C/S/M; dormitorio.camas es Array<{tipo}> (Pattern 4).
// - DORM-02: matrimonial topea en 1 (el botón + queda deshabilitado, con nota de tope).
// - DORM-03: advertencia de capacidad cobre (camasEntran) NO bloqueante (D-03); nota "a medida"
//   para modelos personalizables N5-N7.
import { ACCIONES } from '../../../state/wizardReducer.js'
import { camasEntran } from '../../../utils/validacionCamas.js'
import { MODELOS } from '../../../data/models.js'

// Conjunto de UI (etiquetas de los steppers, no datos de negocio): los tipos de cama son labels
// de la fila, no entran en /data. Copy EXACTO del UI-SPEC "Copywriting Contract".
const TIPOS = [
  { tipo: 'C', label: 'Cucheta marinera (C)', singular: 'cucheta' },
  { tipo: 'S', label: 'Cama simple (S)', singular: 'cama simple' },
  { tipo: 'M', label: 'Matrimonial (M)', singular: 'matrimonial' },
]

export default function PasoDormitorio({ estado, dispatch }) {
  // T-05-08: estado adulterado de localStorage puede traer camas no-array; cae a [] sin crashear.
  const camas = Array.isArray(estado.dormitorio?.camas) ? estado.dormitorio.camas : []

  // Helpers Pattern 4 — array inmutable (NUNCA push/splice; siempre array nuevo con spread/filter).
  const contar = (tipo) => camas.filter((c) => c.tipo === tipo).length
  const setCamas = (nuevas) =>
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'dormitorio', valor: { ...estado.dormitorio, camas: nuevas } })
  const agregar = (tipo) => {
    if (tipo === 'M' && contar('M') >= 1) return // D-02: matrimonial máx 1
    setCamas([...camas, { tipo }])
  }
  const quitar = (tipo) => {
    const idx = camas.findIndex((c) => c.tipo === tipo)
    if (idx === -1) return
    setCamas(camas.filter((_, i) => i !== idx))
  }

  // DORM-03: advertencia de capacidad data-driven (camasEntran). Para modelos personalizables
  // (N5-N7) se muestra la nota "a medida" en lugar de la advertencia.
  const modelo = MODELOS.find((m) => m.id === estado.modeloId)
  const entran = camasEntran(estado.modeloId, camas)
  const personalizable = Boolean(modelo?.personalizable)

  return (
    <div>
      <h2 className="text-xl font-semibold text-impacar-texto">Dormitorio</h2>
      <p className="mt-2 text-sm text-impacar-texto/70">
        Arme el dormitorio combinando los tipos de cama.
      </p>

      {/* Steppers C/S/M (DORM-01, Component Inventory 1) — una fila por tipo. */}
      <div className="mt-6 space-y-2">
        {TIPOS.map((t) => {
          const n = contar(t.tipo)
          const topeMatrimonial = t.tipo === 'M' && contar('M') >= 1
          return (
            <div
              key={t.tipo}
              className="flex items-center justify-between rounded border border-impacar-texto/10 bg-white/40 p-3"
            >
              <span className="text-sm">{t.label}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => quitar(t.tipo)}
                  disabled={n === 0}
                  aria-label={`Quitar ${t.singular}`}
                  className={[
                    'flex min-h-[44px] min-w-[44px] items-center justify-center rounded border text-lg',
                    'border-impacar-texto/10 transition-colors hover:border-impacar-campo/40',
                    'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                  ].join(' ')}
                >
                  −
                </button>
                <span
                  aria-live="polite"
                  className={[
                    'w-8 text-center text-sm font-semibold',
                    n >= 1 ? 'text-impacar-campo' : 'text-impacar-texto/70',
                  ].join(' ')}
                >
                  {n}
                </span>
                <button
                  type="button"
                  onClick={() => agregar(t.tipo)}
                  disabled={topeMatrimonial}
                  aria-disabled={topeMatrimonial}
                  aria-label={`Agregar ${t.singular}`}
                  className={[
                    'flex min-h-[44px] min-w-[44px] items-center justify-center rounded border text-lg',
                    'border-impacar-texto/10 transition-colors hover:border-impacar-campo/40',
                    'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                  ].join(' ')}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota tope matrimonial (D-02) — visible solo cuando ya hay 1 matrimonial. */}
      {contar('M') >= 1 && (
        <p className="mt-2 text-xs text-impacar-texto/70">Máximo 1 matrimonial por casilla.</p>
      )}

      {/* Bloque de capacidad (DORM-03, D-03) — nota "a medida" para personalizables (N5-N7),
          o advertencia cobre NO bloqueante cuando la combinación no entra. NUNCA deshabilita
          la navegación (el botón "Siguiente" vive en la cáscara del wizard). */}
      {personalizable ? (
        <p className="mt-6 text-xs text-impacar-texto/70">
          El modelo {modelo?.nombre} se arma a medida: admite más camas según el largo.
        </p>
      ) : (
        !entran &&
        camas.length > 0 && (
          <div className="mt-6 rounded border border-impacar-cobre p-3 text-sm text-impacar-cobre">
            Esta combinación de camas no entra en el modelo {modelo?.nombre}. Le sugerimos elegir un
            modelo más largo.
          </div>
        )
      )}
    </div>
  )
}
