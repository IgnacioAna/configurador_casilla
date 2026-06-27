// Tests de las reglas de baño (node:test, ESM-native, sin dependencias extra).
// Ejecutar: node --test src/utils/banoReglas.test.js
// Codifica BANO-02: el umbral de "baño ampliado" se deriva del largo del modelo (data-driven),
// no de una lista de ids hardcodeada, y tolera ids adulterados sin crashear.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { permiteBanoAmpliado, LARGO_MIN_BANO_AMPLIADO } from './banoReglas.js'

test('permiteBanoAmpliado: N1 y N2 (largo < 6.1) → false', () => {
  assert.equal(permiteBanoAmpliado('N1'), false)
  assert.equal(permiteBanoAmpliado('N2'), false)
})

test('permiteBanoAmpliado: N3..N7 (largo >= 6.1) → true', () => {
  for (const id of ['N3', 'N4', 'N5', 'N6', 'N7']) {
    assert.equal(permiteBanoAmpliado(id), true, `${id} debe permitir baño ampliado`)
  }
})

test('permiteBanoAmpliado: id inexistente (estado adulterado) → false sin crashear', () => {
  assert.equal(permiteBanoAmpliado('ZZ'), false)
})

test('LARGO_MIN_BANO_AMPLIADO: umbral data-driven === 6.1 (largo de N3)', () => {
  assert.equal(LARGO_MIN_BANO_AMPLIADO, 6.1)
})
