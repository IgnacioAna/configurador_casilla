// Motor de precios — presupuesto en vivo (PRECIO-01). Función PURA, sin React, sin DOM.
// Neto = precioNeto del modelo + suma de precioNeto de los extras seleccionados. UNA sola fuente
// de la suma: estado.extras[] (Pitfall 3 / D-13 / D-14). NUNCA leer las ramas de cocina ni estar
// del estado: las opciones de cocina/estar viven como ids dentro de extras[]. El IVA NO se recrea
// aquí: se reusa formato.js (que toma la alícuota de data/geometry.js) — vive en un solo lugar.
import { MODELOS } from '../data/models.js'
import { EXTRAS } from '../data/extras.js'
import { calcularIVA, calcularTotal } from './formato.js'

export function calcularPresupuesto(estado) {
  const modelo = MODELOS.find((m) => m.id === estado?.modeloId)
  const base = modelo?.precioNeto ?? 0 // modeloId inválido/ausente → base 0 (no crashea)
  const ids = Array.isArray(estado?.extras) ? estado.extras : [] // no-array → suma 0
  const sumaExtras = EXTRAS
    .filter((e) => ids.includes(e.id)) // ids inexistentes se ignoran
    .reduce((acc, e) => acc + e.precioNeto, 0)
  const neto = base + sumaExtras
  return { neto, iva: calcularIVA(neto), total: calcularTotal(neto) }
}

// Desglose item-por-item para la pantalla de resumen (RESUMEN-02, D-05). COMPONE sobre
// calcularPresupuesto: arma los items para mostrar (base + accesorios con su categoria/subgrupo
// para agrupar, D-04) pero NO re-suma — neto/iva/total se delegan a calcularPresupuesto, que es la
// UNICA fuente de la suma. Re-sumar aca divergiria del total de BarraPrecio por redondeo (Pitfall).
// El largo se muestra con coma decimal (6.6 → "6,6 m") igual que FloorPlan. Estado adulterado
// (modeloId inexistente/ausente, extras no-array, null): item base "Modelo no disponible" + totales
// 0, sin $NaN ni crash (degradacion elegante, patron de calcularPresupuesto).
export function detallePresupuesto(estado) {
  const modelo = MODELOS.find((m) => m.id === estado?.modeloId)
  const ids = Array.isArray(estado?.extras) ? estado.extras : []
  const itemBase = modelo
    ? { id: modelo.id, label: `Casilla ${modelo.nombre} — ${String(modelo.largo).replace('.', ',')} m`, precioNeto: modelo.precioNeto, categoria: 'modelo' }
    : { id: 'sin-modelo', label: 'Modelo no disponible', precioNeto: 0, categoria: 'modelo' }
  const itemsExtras = EXTRAS
    .filter((e) => ids.includes(e.id)) // conserva el ORDEN de EXTRAS, ignora ids inexistentes
    .map((e) => ({ id: e.id, label: e.nombre, precioNeto: e.precioNeto, categoria: e.categoria, subgrupo: e.subgrupo }))
  const { neto, iva, total } = calcularPresupuesto(estado) // ÚNICA fuente de la suma — NO re-sumar
  return { items: [itemBase, ...itemsExtras], neto, iva, total }
}
