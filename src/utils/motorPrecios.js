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
