// Paso 1 del wizard — Uso y ocupantes (USO-01, USO-02, USO-03).
// Componente presentacional: recibe { estado, dispatch } (contrato de ConfiguratorWizard.jsx:54),
// lee de /data y dispara SET_CAMPO. NO duplica el contenedor blanco: la <section> del wizard ya lo aporta.
// NO pasa props al plano: al escribir modeloId el plano reacciona solo (configDesdeEstado → PlanoPanel).
import { ACCIONES } from '../../../state/wizardReducer.js'
import { SUGERENCIA_OCUPANTES } from '../../../data/models.js'

// Conjunto de UI (no datos de negocio): los usos son etiquetas de la card, no entran en /data.
const USOS = [
  { id: 'contratista', label: 'Contratista rural' },
  { id: 'ganadero', label: 'Ganadero' },
  { id: 'agricola', label: 'Agrícola' },
  { id: 'vivienda', label: 'Vivienda' },
  { id: 'otro', label: 'Otro' },
]

// Opciones de ocupantes (USO-02). Conjunto fijo de chips numéricos.
const OCUPANTES = [2, 3, 4, 5, 6, 8]

// Íconos SVG inline 24×24 (line icons a mano, sin librería). stroke="currentColor" fill="none"
// strokeWidth="1.5": heredan el color del contenedor (impacar-campo si seleccionada, texto/70 si no).
function IconoUso({ id, className }) {
  const props = {
    className,
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  switch (id) {
    case 'contratista': // casco de obra
      return (
        <svg {...props}>
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M12 4a4 4 0 0 0-4 4v2h8V8a4 4 0 0 0-4-4Z" />
          <path d="M3 16h18" />
          <path d="M3 19h18" />
        </svg>
      )
    case 'ganadero': // vaca / ganado
      return (
        <svg {...props}>
          <path d="M5 8c0-2 1.5-3 3-3 1 0 2 .5 2 1.5" />
          <path d="M19 8c0-2-1.5-3-3-3-1 0-2 .5-2 1.5" />
          <path d="M5 8c-1 1-2 2-2 4 0 4 4 7 9 7s9-3 9-7c0-2-1-3-2-4" />
          <path d="M9 13h.01" />
          <path d="M15 13h.01" />
        </svg>
      )
    case 'agricola': // espiga / trigo
      return (
        <svg {...props}>
          <path d="M12 21V9" />
          <path d="M12 9c0-3 1.5-5 1.5-5S15 6 15 9c0 1.5-1.5 2.5-3 2.5" />
          <path d="M12 9c0-3-1.5-5-1.5-5S9 6 9 9c0 1.5 1.5 2.5 3 2.5" />
          <path d="M12 14c0-2 2-3.5 2-3.5s.5 2.5-1 3.5c-.5.35-1 .35-1 0" />
          <path d="M12 14c0-2-2-3.5-2-3.5s-.5 2.5 1 3.5c.5.35 1 .35 1 0" />
        </svg>
      )
    case 'vivienda': // casa
      return (
        <svg {...props}>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      )
    case 'otro': // tres puntos
    default:
      return (
        <svg {...props}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      )
  }
}

export default function PasoUso({ estado, dispatch }) {
  // USO-01: selección única de uso (escribe la clave entera vía SET_CAMPO).
  const elegirUso = (id) => dispatch({ type: ACCIONES.SET_CAMPO, campo: 'uso', valor: id })

  // USO-03: al elegir ocupantes pre-seleccionar el modelo data-driven (NO hardcodear el mapeo).
  const elegirOcupantes = (n) => {
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'ocupantes', valor: n })
    const sugerido = SUGERENCIA_OCUPANTES[n]
    if (sugerido) dispatch({ type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: sugerido })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-impacar-texto">Uso y ocupantes</h2>

      {/* Bloque USO (USO-01) — 5 cards de selección única con ícono. */}
      <p className="mt-2 text-sm text-impacar-texto/70">¿Para qué va a usar la casilla?</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {USOS.map((u) => {
          const seleccionado = estado.uso === u.id
          return (
            <button
              key={u.id}
              type="button"
              aria-pressed={seleccionado}
              onClick={() => elegirUso(u.id)}
              className={[
                'min-h-[44px] rounded p-4 text-left transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
                seleccionado
                  ? 'border border-impacar-campo bg-impacar-campo/10'
                  : 'border border-impacar-texto/10 bg-white/40 hover:border-impacar-campo/40 hover:bg-impacar-campo/5',
              ].join(' ')}
            >
              <IconoUso
                id={u.id}
                className={seleccionado ? 'text-impacar-campo' : 'text-impacar-texto/70'}
              />
              <span
                className={[
                  'mt-2 block text-sm',
                  seleccionado ? 'font-semibold text-impacar-campo' : 'text-impacar-texto',
                ].join(' ')}
              >
                {u.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bloque OCUPANTES (USO-02) — chips segmentados, separados del bloque uso por mt-6. */}
      <p className="mt-6 text-sm text-impacar-texto/70">¿Cuántas personas la van a habitar?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OCUPANTES.map((n) => {
          const activo = estado.ocupantes === n
          return (
            <button
              key={n}
              type="button"
              aria-pressed={activo}
              onClick={() => elegirOcupantes(n)}
              className={[
                'min-h-[44px] min-w-[44px] rounded px-4 py-2 text-sm transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
                activo
                  ? 'border border-impacar-campo bg-impacar-campo/10 font-semibold text-impacar-campo'
                  : 'border border-impacar-texto/10 hover:border-impacar-campo/40',
              ].join(' ')}
            >
              {n}
            </button>
          )
        })}
      </div>

      {/* Feedback de sugerencia (USO-03, Patrón D) — panel inline, solo si hay ocupantes elegidos
          y existe sugerencia (protege contra ocupantes adulterado de localStorage → undefined). */}
      {estado.ocupantes && SUGERENCIA_OCUPANTES[estado.ocupantes] && (
        <div className="mt-3 rounded border border-impacar-campo/30 bg-impacar-campo/5 p-3 text-sm text-impacar-texto">
          Le sugerimos el modelo {SUGERENCIA_OCUPANTES[estado.ocupantes]} para {estado.ocupantes} personas. Lo puede cambiar en el paso siguiente.
        </div>
      )}
    </div>
  )
}
