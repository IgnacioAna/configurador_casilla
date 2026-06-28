import { FINANCIACION } from '../../data/financiacion.js'

// BloqueFinanciacion (S5 — RESUMEN-03, D-06). Lista las 3 opciones de FINANCIACION (.map directo,
// anti-hardcodeo): nombre + detalle. Solo texto, sin montos (la fábrica los confirma).

export default function BloqueFinanciacion() {
  return (
    <div className="rounded border border-impacar-texto/10 bg-white/40 p-4">
      <h2 className="text-xl font-semibold">Opciones de financiación</h2>
      <ul className="mt-3 space-y-3">
        {FINANCIACION.map((o) => (
          <li key={o.id}>
            <p className="break-words text-sm font-semibold">{o.nombre}</p>
            <p className="break-words text-sm text-impacar-texto/70">{o.detalle}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
