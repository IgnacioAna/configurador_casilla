// Tests del motor de precios — presupuesto en vivo (node:test). PRECIO-01.
// Ejecutar: node --test src/utils/motorPrecios.test.js
// Codifica Pitfall 3: una sola fuente de suma = estado.extras[]. Nunca estado.cocina/estar.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcularPresupuesto } from './motorPrecios.js'
import { EXTRAS } from '../data/extras.js'

const N4_NETO = 38971845

test('N4 sin extras → neto 38.971.845, iva 21%, total 121%', () => {
  const r = calcularPresupuesto({ modeloId: 'N4', extras: [] })
  assert.equal(r.neto, N4_NETO)
  assert.equal(r.iva, N4_NETO * 0.21)
  assert.equal(r.total, N4_NETO * 1.21)
})

test('N4 + los 17 extras reales → neto 55.977.868, total 67.733.220', () => {
  const todosLosIds = EXTRAS.map((e) => e.id) // sin hardcodear 17 strings
  const r = calcularPresupuesto({ modeloId: 'N4', extras: todosLosIds })
  assert.equal(r.neto, 55977868)
  assert.equal(Math.round(r.total), 67733220)
})

test('una sola fuente: estado.cocina.horno NO suma (solo extras[] suma)', () => {
  const r = calcularPresupuesto({ modeloId: 'N4', extras: [], cocina: { horno: true } })
  assert.equal(r.neto, N4_NETO) // cocina.horno ignorado
})

test("agregar 'cocina-horno' a extras[] sube el neto exactamente 585.800", () => {
  const sin = calcularPresupuesto({ modeloId: 'N4', extras: [] })
  const con = calcularPresupuesto({ modeloId: 'N4', extras: ['cocina-horno'] })
  assert.equal(con.neto - sin.neto, 585800)
})

test('estado adulterado: modeloId inexistente → neto 0 (no crashea)', () => {
  const r = calcularPresupuesto({ modeloId: 'XX', extras: [] })
  assert.equal(r.neto, 0)
  assert.equal(r.iva, 0)
  assert.equal(r.total, 0)
})

test('estado adulterado: extras no-array → se ignora, suma 0 (solo modelo)', () => {
  const r = calcularPresupuesto({ modeloId: 'N1', extras: 'no-array' })
  assert.equal(r.neto, 29108976)
})

test('estado null → { neto: 0, iva: 0, total: 0 } (no crashea)', () => {
  const r = calcularPresupuesto(null)
  assert.equal(r.neto, 0)
  assert.equal(r.iva, 0)
  assert.equal(r.total, 0)
})

test('ids inexistentes en extras[] se ignoran (no rompen la suma)', () => {
  const r = calcularPresupuesto({ modeloId: 'N1', extras: ['cocina-horno', 'no-existe-zzz'] })
  assert.equal(r.neto, 29108976 + 585800) // solo el id real suma
})
