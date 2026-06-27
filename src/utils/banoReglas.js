// Reglas de habilitación del baño (BANO-02). Helper PURO y testeable sin DOM.
// El umbral se deriva del REQUIREMENT (N3 = 6,10 m); NO se hardcodea una lista de ids de modelo
// (gate anti-hardcodeo de fases previas). Fuente de verdad del largo: src/data/models.js.
import { MODELOS } from '../data/models.js'

// Largo mínimo (m) que habilita "baño ampliado": N3=6,1. Constante nombrada, no lista de ids.
export const LARGO_MIN_BANO_AMPLIADO = 6.1

export function permiteBanoAmpliado(modeloId) {
  const modelo = MODELOS.find((m) => m.id === modeloId)
  return (modelo?.largo ?? 0) >= LARGO_MIN_BANO_AMPLIADO // N1/N2 → false; N3+ → true; id inválido → false
}
