// Tests del motor de precios — presupuesto en vivo (node:test). PRECIO-01.
// Ejecutar: node --test src/utils/motorPrecios.test.js
// Codifica Pitfall 3: una sola fuente de suma = estado.extras[]. Nunca estado.cocina/estar.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcularPresupuesto, detallePresupuesto } from './motorPrecios.js'
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

// --- detallePresupuesto (RESUMEN-02) — desglose item-por-item compuesto sobre calcularPresupuesto ---

test('detallePresupuesto: item base del modelo con label "Casilla N4 — 6,6 m" + paridad de totales', () => {
  const estado = { modeloId: 'N4', extras: [] }
  const d = detallePresupuesto(estado)
  assert.deepEqual(d.items[0], {
    id: 'N4',
    label: 'Casilla N4 — 6,6 m', // largo con coma decimal (6.6 → "6,6 m")
    precioNeto: N4_NETO,
    categoria: 'modelo',
  })
  // Paridad byte a byte con la unica fuente de la suma
  const base = calcularPresupuesto(estado)
  assert.equal(d.neto, base.neto)
  assert.equal(d.iva, base.iva)
  assert.equal(d.total, base.total)
})

test('detallePresupuesto: los accesorios aparecen en el ORDEN de EXTRAS con todos sus metadatos', () => {
  // 'calefactor-4000' viene antes que… no: en EXTRAS, inodoro-septica precede a calefactor-4000.
  const d = detallePresupuesto({ modeloId: 'N4', extras: ['calefactor-4000', 'inodoro-septica'] })
  const accesorios = d.items.slice(1) // saltar el item base
  // Orden = orden de EXTRAS, no el de seleccion: inodoro-septica (idx 0) antes que calefactor-4000.
  const inodoro = EXTRAS.find((e) => e.id === 'inodoro-septica')
  const calefactor = EXTRAS.find((e) => e.id === 'calefactor-4000')
  assert.deepEqual(accesorios[0], {
    id: inodoro.id,
    label: inodoro.nombre,
    precioNeto: inodoro.precioNeto,
    categoria: inodoro.categoria,
    subgrupo: inodoro.subgrupo, // undefined para categoria 'bano'
  })
  assert.deepEqual(accesorios[1], {
    id: calefactor.id,
    label: calefactor.nombre,
    precioNeto: calefactor.precioNeto,
    categoria: calefactor.categoria, // 'extras'
    subgrupo: calefactor.subgrupo, // 'confort'
  })
})

test('detallePresupuesto: los items son agrupables por categoria/subgrupo', () => {
  // Un id por cada grupo que pide la UI: bano, dormitorio, cocina, extras+confort, extras+energia.
  const seleccion = ['inodoro-septica', 'cajonera-bajo-cama', 'cocina-horno', 'calefactor-4000', 'panel-solar-160']
  const d = detallePresupuesto({ modeloId: 'N4', extras: seleccion })
  const items = d.items
  assert.ok(items.some((i) => i.categoria === 'bano'))
  assert.ok(items.some((i) => i.categoria === 'dormitorio'))
  assert.ok(items.some((i) => i.categoria === 'cocina'))
  assert.ok(items.some((i) => i.categoria === 'extras' && i.subgrupo === 'confort'))
  assert.ok(items.some((i) => i.categoria === 'extras' && i.subgrupo === 'energia'))
})

test('detallePresupuesto: N4 + los 17 extras reales → neto 55.977.868, total 67.733.220 (paridad total)', () => {
  const todosLosIds = EXTRAS.map((e) => e.id) // sin hardcodear 17 strings
  const estado = { modeloId: 'N4', extras: todosLosIds }
  const d = detallePresupuesto(estado)
  assert.equal(d.neto, 55977868)
  assert.equal(Math.round(d.total), 67733220)
  assert.equal(d.total, calcularPresupuesto(estado).total) // misma fuente, sin divergencia
  assert.equal(d.items.length, 1 + todosLosIds.length) // base + cada extra
})

test('detallePresupuesto: estado adulterado (modeloId inexistente) → "Modelo no disponible", neto 0, sin $NaN', () => {
  const d = detallePresupuesto({ modeloId: 'XX', extras: [] })
  assert.deepEqual(d.items[0], { id: 'sin-modelo', label: 'Modelo no disponible', precioNeto: 0, categoria: 'modelo' })
  assert.equal(d.neto, 0)
  assert.equal(d.iva, 0)
  assert.equal(d.total, 0)
  assert.ok(!Number.isNaN(d.neto) && !Number.isNaN(d.total))
})

test('detallePresupuesto: extras no-array → solo item base (no crashea)', () => {
  const d = detallePresupuesto({ modeloId: 'N4', extras: 'no-array' })
  assert.equal(d.items.length, 1) // solo el item base
  assert.equal(d.items[0].id, 'N4')
  assert.equal(d.neto, N4_NETO)
})

test('detallePresupuesto(null) → item base "Modelo no disponible" + neto/iva/total 0 (no crashea)', () => {
  const d = detallePresupuesto(null)
  assert.equal(d.items[0].label, 'Modelo no disponible')
  assert.equal(d.neto, 0)
  assert.equal(d.iva, 0)
  assert.equal(d.total, 0)
})
