// Motor de validación de capacidad de camas (DORM-02). Helpers PUROS, sin React, sin DOM.
// FUENTE DE VERDAD de la capacidad = camasBase del catálogo (src/data/models.js), NO la zona
// fraccionada del plano (Pitfall 1): camasBase YA codifica la geometría real (2 footprints por
// fila contra cada pared larga: 0.80 + 0.92 + 0.80 = 2.52m). N5/N6/N7 (personalizable) → sin tope.
import { MODELOS } from '../data/models.js'

// Capacidad de footprints del modelo. Data-driven desde camasBase / personalizable.
export function capacidadFootprints(modeloId) {
  const m = MODELOS.find((x) => x.id === modeloId)
  if (!m) return 0 // id adulterado/inexistente → no entra nada (seguro frente a estado tampered)
  if (m.personalizable) return Infinity // N5/N6/N7 "a medida": sin tope
  return m.camasBase ?? 0
}

// Footprints que ocupa una combinación. Matrimonial (M) = 2; cucheta (C) / simple (S) = 1.
export function footprintsDeCamas(camas) {
  const lista = Array.isArray(camas) ? camas : [] // input no-array → 0 footprints (no crashea)
  return lista.reduce((n, c) => n + (c?.tipo === 'M' ? 2 : 1), 0)
}

// ¿Entra la combinación en el modelo? (DORM-02). Usado por la advertencia sin bloqueo (D-03).
export function camasEntran(modeloId, camas) {
  return footprintsDeCamas(camas) <= capacidadFootprints(modeloId)
}
