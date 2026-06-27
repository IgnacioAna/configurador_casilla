// Tests del motor de validación de capacidad de camas (node:test). DORM-02.
// Ejecutar: node --test src/utils/validacionCamas.test.js
// Codifica Pitfall 1: la capacidad sale de camasBase (catálogo), NO de la zona del plano.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { capacidadFootprints, footprintsDeCamas, camasEntran } from './validacionCamas.js'

test('capacidadFootprints: usa camasBase del catálogo (no la zona del plano)', () => {
  assert.equal(capacidadFootprints('N1'), 2)
  assert.equal(capacidadFootprints('N2'), 2)
  assert.equal(capacidadFootprints('N3'), 3)
  assert.equal(capacidadFootprints('N4'), 4)
})

test('capacidadFootprints: N5/N6/N7 personalizable → Infinity (sin tope)', () => {
  assert.equal(capacidadFootprints('N5'), Infinity)
  assert.equal(capacidadFootprints('N6'), Infinity)
  assert.equal(capacidadFootprints('N7'), Infinity)
})

test('capacidadFootprints: id adulterado/inexistente → 0 (no entra nada, sin crashear)', () => {
  assert.equal(capacidadFootprints('XX'), 0)
  assert.equal(capacidadFootprints(undefined), 0)
  assert.equal(capacidadFootprints(null), 0)
})

test('footprintsDeCamas: simple/cucheta = 1 footprint; matrimonial = 2', () => {
  assert.equal(footprintsDeCamas([{ tipo: 'S' }, { tipo: 'S' }]), 2)
  assert.equal(footprintsDeCamas([{ tipo: 'M' }]), 2)
  assert.equal(footprintsDeCamas([{ tipo: 'C' }, { tipo: 'M' }]), 3) // C=1 + M=2
})

test('footprintsDeCamas: tolera input adulterado (no-array → 0; sin tipo → cuenta 1)', () => {
  assert.equal(footprintsDeCamas(null), 0)
  assert.equal(footprintsDeCamas('texto'), 0)
  assert.equal(footprintsDeCamas(undefined), 0)
  assert.equal(footprintsDeCamas([{}]), 1) // elemento sin tipo → 1 (optional chaining)
})

test('camasEntran: límite exacto en N4 (4 footprints entra, 5 no)', () => {
  const cuatroSimples = [{ tipo: 'S' }, { tipo: 'S' }, { tipo: 'S' }, { tipo: 'S' }]
  const cincoSimples = [...cuatroSimples, { tipo: 'S' }]
  assert.equal(camasEntran('N4', cuatroSimples), true)
  assert.equal(camasEntran('N4', cincoSimples), false)
})

test('camasEntran: 2 matrimoniales en N4 = 4 footprints === 4 → true (límite con M=2)', () => {
  assert.equal(camasEntran('N4', [{ tipo: 'M' }, { tipo: 'M' }]), true) // 4 footprints === cap 4
  assert.equal(camasEntran('N4', [{ tipo: 'M' }, { tipo: 'M' }, { tipo: 'S' }]), false) // 5 > 4
})

test('camasEntran: N7 personalizable → Infinity, siempre entra (20 simples)', () => {
  const veinteSimples = Array.from({ length: 20 }, () => ({ tipo: 'S' }))
  assert.equal(camasEntran('N7', veinteSimples), true)
})

test('camasEntran: id adulterado → no entra nada (capacidad 0)', () => {
  assert.equal(camasEntran('XX', [{ tipo: 'S' }]), false)
  assert.equal(camasEntran('N4', 'no-array'), true) // 0 footprints <= 4 → true (no crashea)
})
