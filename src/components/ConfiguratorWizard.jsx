import { usePersistedConfig } from '../hooks/usePersistedConfig.js'
import { ACCIONES, TOTAL_PASOS } from '../state/wizardReducer.js'
import { logPasoCompletado } from '../utils/analytics.js'
import { PASOS } from './wizard/pasosRegistro.jsx'
import BarraProgreso from './wizard/BarraProgreso.jsx'

// Cáscara navegable del wizard (SHELL-02). Consume el estado/persistencia del Plan 01.
// Los pasos son stubs en la Fase 3; las Fases 4-5 reemplazan PASOS[].Componente.
export default function ConfiguratorWizard({ onVolverInicio }) {
  const { estado, dispatch, reiniciar } = usePersistedConfig()
  const Paso = PASOS[estado.pasoActual]
  const esPrimero = estado.pasoActual === 0
  const esUltimo = estado.pasoActual === TOTAL_PASOS - 1

  const siguiente = () => {
    // UX-04: registramos el paso que se completa al avanzar (console.log + timestamp).
    logPasoCompletado(estado.pasoActual + 1, PASOS[estado.pasoActual].titulo)
    dispatch({ type: ACCIONES.SIGUIENTE })
  }
  const anterior = () => dispatch({ type: ACCIONES.ANTERIOR })

  // "Volver a empezar": resetea el estado y borra localStorage (Plan 01). Queda en el wizard
  // (vuelve al Paso 1). onVolverInicio se reserva para el ruteo a la landing si se necesita.
  const volverAEmpezar = () => {
    reiniciar()
  }

  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      <header className="bg-impacar-campo px-6 py-4 text-white">
        <h1 className="text-2xl font-bold tracking-wide">IMPACAR</h1>
        <p className="text-sm opacity-90">Configurador de casillas rurales</p>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <BarraProgreso pasoActual={estado.pasoActual} total={TOTAL_PASOS} />

        {/* Paso actual (stub en Fase 3; el contenido real llega en Fases 4-5). */}
        <section className="rounded border border-impacar-texto/10 bg-white/40 p-4">
          <Paso.Componente estado={estado} dispatch={dispatch} />
        </section>

        {/* PLANO: integrado en Plan 03 (PLANO-03) */}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={anterior}
            disabled={esPrimero}
            className="min-h-[44px] rounded border border-impacar-campo px-5 py-2 text-sm font-semibold text-impacar-campo transition-colors hover:bg-impacar-campo/5 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={siguiente}
            disabled={esUltimo}
            className="min-h-[44px] rounded bg-impacar-campo px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-impacar-campo/90 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>

        <div className="mt-8 border-t border-impacar-texto/10 pt-4 text-center">
          <button
            type="button"
            onClick={volverAEmpezar}
            className="min-h-[44px] text-sm font-medium text-impacar-texto/60 underline-offset-2 transition-colors hover:text-impacar-cobre hover:underline focus:outline-none focus:ring-2 focus:ring-impacar-cobre/30"
          >
            Volver a empezar
          </button>
        </div>
      </main>
    </div>
  )
}
