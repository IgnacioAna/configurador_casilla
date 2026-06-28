// Paso 2 del wizard — Dimensiones / Modelo (DIM-01, DIM-02).
// Componente presentacional: recibe { estado, dispatch }, deriva TODO de MODELOS (anti-hardcodeo)
// y dispara SET_CAMPO. NO importa ni renderiza el plano: al escribir modeloId el plano reacciona
// solo vía el cableado existente del wizard (configDesdeEstado en ConfiguratorWizard) con la transición .fp-anim.
import { MODELOS, SUGERENCIA_OCUPANTES } from '../../../data/models.js'
import { ACCIONES } from '../../../state/wizardReducer.js'
import { permiteBanoAmpliado } from '../../../utils/banoReglas.js'

// Metadatos de la card (DIM-01) — formato argentino con coma decimal; camasBase null → texto a medida.
// NO se hardcodean largos ni la lista de modelos: se mapea sobre MODELOS.
function metadatosCard(m) {
  const largo = `${m.largo.toFixed(2).replace('.', ',')} m` // "6,60 m"
  const camas = m.camasBase === null ? 'camas a medida' : `${m.camasBase} camas`
  return `${largo} · ${camas} · ideal para ${m.ocupantesIdeal} personas`
}

export default function PasoDimensiones({ estado, dispatch }) {
  // DIM-02 + corrección silenciosa Q4: al elegir un modelo que no permite ampliado, forzar 'estandar'.
  // Se clona bano con spread (Pitfall 3: inmutabilidad, nunca mutar estado.bano).
  const elegirModelo = (id) => {
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: id })
    if (!permiteBanoAmpliado(id) && estado.bano.tamano === 'ampliado') {
      dispatch({ type: ACCIONES.SET_CAMPO, campo: 'bano', valor: { ...estado.bano, tamano: 'estandar' } })
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-impacar-texto">Dimensiones</h2>
      <p className="mt-2 text-sm text-impacar-texto/70" id="label-modelo">Elija el modelo de su casilla</p>

      {/* Grid de 7 cards de modelo (DIM-01), data-driven desde MODELOS. Sin ícono (los íconos son
          solo de uso). El badge "Sugerido" es independiente del estado seleccionado (Pitfall 4).
          Grupo etiquetado (role=group + aria-labelledby), Pattern 3 (d). */}
      <div role="group" aria-labelledby="label-modelo" className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODELOS.map((m) => {
          const seleccionado = estado.modeloId === m.id
          // El badge marca la card sugerida según ocupantes; se protege con && para tolerar
          // un ocupantes adulterado de localStorage (acceso por clave inexistente → undefined).
          const esSugerido = m.id === SUGERENCIA_OCUPANTES[estado.ocupantes]
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={seleccionado}
              onClick={() => elegirModelo(m.id)}
              className={[
                'min-h-[44px] rounded p-4 text-left transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
                seleccionado
                  ? 'border border-impacar-campo bg-impacar-campo/10'
                  : 'border border-impacar-texto/10 bg-white/40 hover:border-impacar-campo/40 hover:bg-impacar-campo/5',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={[
                    'text-sm font-semibold',
                    seleccionado ? 'text-impacar-campo' : 'text-impacar-texto',
                  ].join(' ')}
                >
                  {m.nombre}
                </span>
                {esSugerido && (
                  <span className="text-xs font-semibold text-impacar-campo bg-impacar-campo/10 rounded-full px-2 py-0.5">
                    Sugerido
                  </span>
                )}
              </div>
              <span className="mt-1 block text-xs text-impacar-texto/70">{metadatosCard(m)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
