import { IVA } from '../data/geometry.js'

// Formato argentino: "$" adelante, punto de miles, sin decimales. Ej: 29108976 -> "$29.108.976".
// Usa toLocaleString('es-AR') (punto de miles en Node con ICU y navegadores modernos), con
// fallback de agrupamiento manual por si el entorno no tuviera ICU completo.
export function formatPrecio(n) {
  const entero = Math.round(Number(n) || 0)
  let agrupado = entero.toLocaleString('es-AR')
  // Fallback: si el entorno no agrupó con puntos (sin ICU), agrupar a mano.
  if (Math.abs(entero) >= 1000 && !agrupado.includes('.')) {
    agrupado = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  return '$' + agrupado
}

export function calcularIVA(neto) {
  return (Number(neto) || 0) * IVA
}

export function calcularTotal(neto) {
  return (Number(neto) || 0) * (1 + IVA)
}
