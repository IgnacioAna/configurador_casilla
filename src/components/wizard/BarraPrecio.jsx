import { calcularPresupuesto } from '../../utils/motorPrecios.js'
import { formatPrecio } from '../../utils/formato.js'

// Barra/chip de presupuesto en vivo (PRECIO-01, D-11). Presentacional puro: recibe { estado },
// calcula y formatea. NO decide su propia visibilidad (eso lo monta el contenedor según el paso)
// ni conoce el plano/navegación. Las 3 líneas: Neto / IVA 21% / Total c/IVA en formato argentino.
// El motor (calcularPresupuesto) tolera estado adulterado → nunca crashea ni muestra $NaN.
export default function BarraPrecio({ estado }) {
  const { neto, iva, total } = calcularPresupuesto(estado)
  return (
    <div className="rounded border border-impacar-texto/10 bg-impacar-fondo p-4">
      <p className="text-xs text-impacar-texto/70">Presupuesto estimado</p>
      <dl className="mt-2 space-y-1">
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
    </div>
  )
}
