import { detallePresupuesto } from '../../utils/motorPrecios.js'
import { formatPrecio } from '../../utils/formato.js'

// PresupuestoDesglosado (S4 — RESUMEN-02, D-03/D-04/D-05). "BarraPrecio expandida": línea base del
// modelo + accesorios AGRUPADOS por categoría + las 3 líneas Neto/IVA/Total c/IVA con el markup
// VERBATIM de BarraPrecio + nota orientativa. Consume detallePresupuesto (única fuente del total —
// NO re-suma). Toda cifra vía formatPrecio (nunca $NaN; el motor devuelve 0 en estado adulterado).

// Grupos del desglose (RESEARCH Code Examples) — data-driven sobre categoria/subgrupo de EXTRAS.
// Orden y rótulos del UI-SPEC S4. Los grupos sin ítems NO se renderizan (omitir vacíos).
const GRUPOS = [
  { match: (i) => i.categoria === 'bano', titulo: 'Baño' },
  { match: (i) => i.categoria === 'dormitorio', titulo: 'Dormitorio' },
  { match: (i) => i.categoria === 'cocina', titulo: 'Cocina y estar' },
  { match: (i) => i.categoria === 'extras' && i.subgrupo === 'confort', titulo: 'Confort' },
  { match: (i) => i.categoria === 'extras' && i.subgrupo === 'energia', titulo: 'Energía' },
]

// Catch-all (WR-05): cualquier accesorio (≠ modelo) cuya categoria/subgrupo no caiga en GRUPOS
// se agrupa en "Otros", para que las líneas del desglose SIEMPRE reconcilien con el total
// (calcularPresupuesto cuenta el ítem aunque GRUPOS no lo contemple). Defiende contra futuras
// ampliaciones del catálogo (p.ej. una categoria nueva) sin desincronizar el desglose visual.
const sinGrupo = (i) => i.categoria !== 'modelo' && !GRUPOS.some((g) => g.match(i))

export default function PresupuestoDesglosado({ estado }) {
  const { items, neto, iva, total } = detallePresupuesto(estado)
  const base = items.find((i) => i.categoria === 'modelo')

  return (
    <div className="rounded border border-impacar-texto/10 bg-white/40 p-4">
      <h2 className="text-xl font-semibold">Presupuesto estimado</h2>

      <div className="mt-3 space-y-3">
        {/* Línea base del modelo. */}
        {base && (
          <div className="flex items-center justify-between">
            <span className="text-sm">{base.label}</span>
            <span className="text-sm">{formatPrecio(base.precioNeto)}</span>
          </div>
        )}

        {/* Accesorios agrupados por categoría (omitir grupos vacíos). */}
        {GRUPOS.map((g) => {
          const delGrupo = items.filter((i) => i.categoria !== 'modelo' && g.match(i))
          if (delGrupo.length === 0) return null
          return (
            <div key={g.titulo} className="space-y-1">
              <p className="text-xs font-semibold text-impacar-campo">{g.titulo}</p>
              {delGrupo.map((i) => (
                <div key={i.id} className="flex items-center justify-between pl-3">
                  <span className="text-sm">{i.label}</span>
                  <span className="text-sm">{formatPrecio(i.precioNeto)}</span>
                </div>
              ))}
            </div>
          )
        })}

        {/* Catch-all "Otros" (WR-05): ítems sin grupo, para que el desglose siempre cuadre con el total. */}
        {(() => {
          const otros = items.filter(sinGrupo)
          if (otros.length === 0) return null
          return (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-impacar-campo">Otros</p>
              {otros.map((i) => (
                <div key={i.id} className="flex items-center justify-between pl-3">
                  <span className="text-sm">{i.label}</span>
                  <span className="text-sm">{formatPrecio(i.precioNeto)}</span>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Divisor + las 3 líneas Neto / IVA 21% / Total c/IVA (markup VERBATIM de BarraPrecio). */}
      <dl className="mt-3 space-y-1 border-t border-impacar-texto/10 pt-3">
        <div className="flex items-center justify-between">
          <dt className="text-sm">Neto</dt>
          <dd className="text-sm">{formatPrecio(neto)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-impacar-texto/70">IVA 21%</dt>
          <dd className="text-sm text-impacar-texto/70">{formatPrecio(iva)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm font-semibold text-impacar-campo">Total c/IVA</dt>
          <dd className="text-sm font-semibold text-impacar-campo">{formatPrecio(total)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-xs text-impacar-texto/70">
        Presupuesto orientativo, sujeto a confirmación del asesor comercial.
      </p>
    </div>
  )
}
