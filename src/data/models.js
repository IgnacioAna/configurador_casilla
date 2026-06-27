// Modelos reales de las casillas Impacar (Lista 108 — Febrero 2026).
// Precios NETOS exactos (sin separadores, como Number). + IVA 21% en el presupuesto.
// Ancho exterior fijo 2.60m (transporte vial); ver data/geometry.js.
// N5/N6/N7: camas "opcionales" (personalizables), por eso camasBase: null y personalizable: true.
export const MODELOS = [
  { id: 'N1', nombre: 'N1', largo: 4.5, camasBase: 2, precioNeto: 29108976, ocupantesIdeal: 2, personalizable: false },
  { id: 'N2', nombre: 'N2', largo: 5.2, camasBase: 2, precioNeto: 34150926, ocupantesIdeal: 3, personalizable: false },
  { id: 'N3', nombre: 'N3', largo: 6.1, camasBase: 3, precioNeto: 37181710, ocupantesIdeal: 4, personalizable: false },
  { id: 'N4', nombre: 'N4', largo: 6.6, camasBase: 4, precioNeto: 38971845, ocupantesIdeal: 4, personalizable: false },
  { id: 'N5', nombre: 'N5', largo: 7.6, camasBase: null, precioNeto: 40937114, ocupantesIdeal: 6, personalizable: true },
  { id: 'N6', nombre: 'N6', largo: 8.6, camasBase: null, precioNeto: 42048149, ocupantesIdeal: 6, personalizable: true },
  { id: 'N7', nombre: 'N7', largo: 9.6, camasBase: null, precioNeto: 46180786, ocupantesIdeal: 8, personalizable: true },
]

// Sugerencia automática de modelo según cantidad de ocupantes (editable en el Paso 2).
// Criterio: el modelo cuyo ocupantesIdeal cubre la cantidad pedida con el menor largo.
// 2→N1, 3→N2, 4→N3, 5→N5, 6→N5, 8→N7 (N4 disponible como alternativa de 4 camas).
export const SUGERENCIA_OCUPANTES = {
  2: 'N1',
  3: 'N2',
  4: 'N3',
  5: 'N5',
  6: 'N5',
  8: 'N7',
}
