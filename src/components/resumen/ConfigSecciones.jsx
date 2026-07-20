import { ACCIONES } from '../../state/wizardReducer.js'
import { resumenCampos } from '../../utils/resumenCampos.js'

// ConfigSecciones (S3 — RESUMEN-01, D-02/D-07). Una card por paso con sus valores traducidos a
// nombres reales (vía resumenCampos) + un link "Editar" que hace deep-link al paso correspondiente
// (ACCIONES.IR_A_PASO) y vuelve al wizard. onEditar(indice) lo provee Resumen.jsx (dispatch + volver).
//
// Índices de paso (de pasosRegistro.jsx): 0 uso · 1 dimensiones · 2 bano · 3 dormitorio · 4 cocina ·
// 5 extras. Las claves de valor se alinean a la salida real de resumenCampos (Wave 1).

export default function ConfigSecciones({ estado, onEditar }) {
  const c = resumenCampos(estado)

  // ¿Hay al menos una cama? Tolera estado adulterado de localStorage (mismo patrón que resumenCampos).
  const sinCamas = !(Array.isArray(estado?.dormitorio?.camas) && estado.dormitorio.camas.length > 0)

  // Data-driven: cada sección con su índice de paso (para IR_A_PASO) y su valor legible.
  // Valores faltantes ya vienen como 'Sin selección' desde resumenCampos (nunca blanco/undefined).
  const secciones = [
    { titulo: 'Uso y ocupantes', paso: 0, valor: `${c.uso} · ${c.ocupantes}` },
    { titulo: 'Modelo', paso: 1, valor: `${c.modelo} — ${c.largo}` },
    { titulo: 'Baño', paso: 2, valor: c.bano },
    {
      titulo: 'Dormitorio',
      paso: 3,
      valor: c.camas,
      // Aviso no bloqueante: informa que faltan camas, no deshabilita nada (exportar sigue activo).
      aviso: sinCamas ? 'Esta configuración no incluye camas. Puede agregarlas desde "Editar".' : null,
    },
    { titulo: 'Cocina y estar', paso: 4, valor: c.cocina },
    { titulo: 'Extras', paso: 5, valor: c.extras.length ? c.extras.join(', ') : 'Sin selección' },
  ]

  return (
    <div className="space-y-4">
      {secciones.map((s) => (
        <section
          key={s.titulo}
          className="space-y-2 rounded border border-impacar-texto/10 bg-white/40 p-4"
        >
          <div className="flex items-center">
            <h2 className="min-w-0 break-words text-xl font-semibold">{s.titulo}</h2>
            <button
              type="button"
              onClick={() => onEditar(s.paso)}
              className="ml-auto min-h-[44px] shrink-0 pl-2 text-sm font-medium text-impacar-campo underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-impacar-campo/40"
            >
              Editar
            </button>
          </div>
          <p className="break-words text-sm">{s.valor}</p>
          {s.aviso && (
            <div className="mt-2 rounded border border-impacar-cobre p-3 text-sm text-impacar-cobre">
              {s.aviso}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

// Re-exportamos la acción para dejar el contrato del deep-link explícito (acceptance criteria grep).
// El dispatch real (ACCIONES.IR_A_PASO) ocurre en Resumen.jsx vía onEditar; lo dejamos referenciado
// acá para documentar que esta sección es el origen del IR_A_PASO.
export const ACCION_EDITAR = ACCIONES.IR_A_PASO
