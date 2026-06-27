// Tests del helper de formato (node:test, ESM-native, sin dependencias extra).
// Ejecutar: node --test src/utils/formato.test.js
// Codifica el <behavior> del plan 01-02 (formato argentino + IVA).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatPrecio, calcularIVA, calcularTotal } from './formato.js'

test('formatPrecio: formato argentino con $ y punto de miles', () => {
  assert.equal(formatPrecio(29108976), '$29.108.976')
  assert.equal(formatPrecio(172098), '$172.098')
})

test('formatPrecio: cero sin decimales', () => {
  assert.equal(formatPrecio(0), '$0')
})

test('calcularIVA: neto * 0.21', () => {
  assert.equal(calcularIVA(100), 21)
})

test('calcularTotal: neto * 1.21', () => {
  assert.equal(calcularTotal(100), 121)
  assert.equal(calcularTotal(29108976), 35221860.96)
})
