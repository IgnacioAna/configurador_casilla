import { useRef } from 'react'
import FloorPlan from './FloorPlan.jsx'
import { ACCIONES, configDesdeEstado } from '../state/wizardReducer.js'
import ConfigSecciones from './resumen/ConfigSecciones.jsx'
import PresupuestoDesglosado from './resumen/PresupuestoDesglosado.jsx'
import BloqueFinanciacion from './resumen/BloqueFinanciacion.jsx'
import AccionesExport from './resumen/AccionesExport.jsx'

// Resumen (S1-S2 — la pantalla de cierre del configurador). Recibe { estado, dispatch, onVolverEditar }
// (estado compartido vía usePersistedConfig izado a App, D-01). Full-width, una columna, sin barra de
// progreso ni plano sticky. Compone: título → subtítulo → S2 plano → S3 secciones → S4 presupuesto →
// S5 financiación → S6 acciones. El plano (FloorPlan) se monta una vez y su <svg> alimenta tanto la
// pantalla como el PDF (mismo nodo vivo vía planoRef).
//
// Empty state (degradación, UI-SPEC): modeloId arranca en 'N4' por defecto (estadoInicial), así que el
// disparador real del empty es uso/ocupantes null — usamos esa condición para no ocultar un resumen con
// modelo default cuando el usuario ya eligió uso/ocupantes.

function EmptyState({ onVolverEditar }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h2 className="text-2xl font-semibold">Todavía no hay una configuración completa</h2>
      <p className="mt-3 text-base text-impacar-texto/70">
        Vuelva al configurador para elegir su modelo y opciones, y vea acá el resumen y el presupuesto.
      </p>
      <div className="mt-8">
        <button
          type="button"
          onClick={onVolverEditar}
          className="min-h-[44px] rounded bg-impacar-campo px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-impacar-campo/90 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40"
        >
          Volver a editar
        </button>
      </div>
    </main>
  )
}

export default function Resumen({ estado, dispatch, onVolverEditar }) {
  const planoRef = useRef(null)

  // Empty: el usuario llegó sin completar uso/ocupantes (arrancan null en estadoInicial). modeloId
  // tiene default 'N4', por eso NO se incluye en la condición (no ocultar un resumen con modelo default).
  const incompleto = estado?.uso == null || estado?.ocupantes == null

  // Header band reusado del wizard (chrome del configurador).
  const Header = (
    <header className="bg-impacar-campo px-6 py-4 text-white">
      <h1 className="text-2xl font-bold tracking-wide">IMPACAR</h1>
      <p className="text-sm opacity-90">Configurador de casillas rurales</p>
    </header>
  )

  if (incompleto) {
    return (
      <>
        {Header}
        <EmptyState onVolverEditar={onVolverEditar} />
      </>
    )
  }

  // Deep-link de "Editar" por sección: salta al paso y vuelve al wizard (D-02). El estado sigue vivo.
  const onEditar = (indice) => {
    dispatch({ type: ACCIONES.IR_A_PASO, paso: indice })
    onVolverEditar()
  }

  // El nodo SVG vivo del plano para el PDF se resuelve en el click (tras el montaje del ref).
  const getSvgNode = () => planoRef.current?.querySelector('svg') ?? null

  return (
    <>
      {Header}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold leading-tight">Su casilla, lista para enviar</h1>
        <p className="mt-4 text-base text-impacar-texto/70">
          Revise su configuración y el presupuesto estimado. Envíelo por WhatsApp o descárguelo en PDF.
        </p>

        {/* S2 — plano final (mismo nodo que alimenta el PDF vía planoRef). */}
        <div
          ref={planoRef}
          className="mt-8 rounded border border-impacar-texto/10 bg-white/40 p-4"
        >
          <FloorPlan config={configDesdeEstado(estado)} />
        </div>

        {/* S3 — secciones de configuración con "Editar" por sección. */}
        <div className="mt-8">
          <ConfigSecciones estado={estado} onEditar={onEditar} />
        </div>

        {/* S4 — presupuesto desglosado. */}
        <div className="mt-8">
          <PresupuestoDesglosado estado={estado} />
        </div>

        {/* S5 — opciones de financiación. */}
        <div className="mt-8">
          <BloqueFinanciacion />
        </div>

        {/* S6 — acciones de exportación + volver a editar. */}
        <div className="mt-8">
          <AccionesExport
            estado={estado}
            getSvgNode={getSvgNode}
            onVolverEditar={onVolverEditar}
          />
        </div>
      </main>
    </>
  )
}
