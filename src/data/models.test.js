// Tests de los datos de modelos (node:test). Ejecutar: node --test src/data/models.test.js
// Codifica USO-03: SUGERENCIA_OCUPANTES mapea cada ocupante a un id existente de MODELOS.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MODELOS, SUGERENCIA_OCUPANTES } from './models.js'

test('SUGERENCIA_OCUPANTES: cada valor es un id existente en MODELOS', () => {
  const ids = new Set(MODELOS.map((m) => m.id))
  for (const [ocupantes, id] of Object.entries(SUGERENCIA_OCUPANTES)) {
    assert.ok(ids.has(id), `ocupantes ${ocupantes} → ${id} debe existir en MODELOS`)
  }
})

test('SUGERENCIA_OCUPANTES: cubre las 6 opciones de ocupantes (2/3/4/5/6/8)', () => {
  const claves = Object.keys(SUGERENCIA_OCUPANTES).map(Number).sort((a, b) => a - b)
  assert.deepEqual(claves, [2, 3, 4, 5, 6, 8])
})
