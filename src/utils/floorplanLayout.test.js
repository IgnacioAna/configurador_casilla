// Tests del helper de layout del plano (node:test, ESM-native, sin dependencias extra).
// Ejecutar: node --test src/utils/floorplanLayout.test.js
// Codifica el <behavior> del plan 02-01 (contrato de layout: zonas + camas + viewBox).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcularLayout, M_A_U } from './floorplanLayout.js'
import { CONFIG_MOCK_N4, CONFIG_MOCK_N1 } from '../data/mockConfig.js'
import { GEOMETRIA } from '../data/geometry.js'

const TOL = 1e-9

test('M_A_U: factor único 100 unidades de viewBox por metro', () => {
  assert.equal(M_A_U, 100)
})

test('calcularLayout(N4): config válida devuelve la forma esperada', () => {
  const layout = calcularLayout(CONFIG_MOCK_N4)
  assert.equal(layout.valido, true)
  assert.ok(Array.isArray(layout.zonas), 'zonas debe ser array')
  assert.ok(Array.isArray(layout.camas), 'camas debe ser array')
  assert.equal(typeof layout.viewBox, 'string')
  assert.equal(typeof layout.totalU, 'number')
  assert.equal(typeof layout.anchoU, 'number')
})

test('zonas: hay exactamente 5 en orden fijo por x ascendente', () => {
  const { zonas } = calcularLayout(CONFIG_MOCK_N4)
  assert.equal(zonas.length, 5)
  const ordenadas = [...zonas].sort((a, b) => a.x - b.x)
  assert.deepEqual(
    ordenadas.map((z) => z.id),
    ['baulera', 'bano', 'dormitorio', 'estar', 'cocina'],
  )
})

test('zonas: baulera y cocina miden la geometría real (no hardcodeada)', () => {
  const { zonas } = calcularLayout(CONFIG_MOCK_N4)
  const baulera = zonas.find((z) => z.id === 'baulera')
  const cocina = zonas.find((z) => z.id === 'cocina')
  assert.equal(baulera.largoM, GEOMETRIA.zonaBaulera)
  assert.equal(cocina.largoM, GEOMETRIA.zonaCocina)
  // Ancho en unidades de viewBox derivado de M_A_U (no del literal 60).
  assert.ok(Math.abs(baulera.anchoU - GEOMETRIA.zonaBaulera * M_A_U) < TOL)
})

test('zonas: la suma de largoM === config.largo', () => {
  const { zonas } = calcularLayout(CONFIG_MOCK_N4)
  const suma = zonas.reduce((acc, z) => acc + z.largoM, 0)
  assert.ok(Math.abs(suma - CONFIG_MOCK_N4.largo) < TOL, `suma=${suma}`)
})

test('zonas: no se solapan (x[i] + anchoU[i] === x[i+1])', () => {
  const { zonas } = calcularLayout(CONFIG_MOCK_N4)
  const ordenadas = [...zonas].sort((a, b) => a.x - b.x)
  for (let i = 0; i < ordenadas.length - 1; i++) {
    const finActual = ordenadas[i].x + ordenadas[i].anchoU
    assert.ok(
      Math.abs(finActual - ordenadas[i + 1].x) < 1e-6,
      `gap/solape entre ${ordenadas[i].id} y ${ordenadas[i + 1].id}`,
    )
  }
})

test('camas: 2 filas, pasillo central y alto leídos de GEOMETRIA', () => {
  const { camas } = calcularLayout(CONFIG_MOCK_N4)
  assert.ok(camas.length >= 2, 'debe haber al menos 2 camas')

  const altoCama = GEOMETRIA.anchoCama * M_A_U
  for (const cama of camas) {
    assert.ok(Math.abs(cama.h - altoCama) < TOL, `alto cama = anchoCama*M_A_U`)
  }

  // Dos filas distintas: la superior arranca en el borde interior superior,
  // la inferior termina en el borde interior inferior, con pasillo entre medio.
  const ys = [...new Set(camas.map((c) => c.y))].sort((a, b) => a - b)
  assert.equal(ys.length, 2, 'debe haber exactamente 2 filas (y distintos)')

  const yFilaSuperior = ys[0]
  const yFilaInferior = ys[1]
  // Hueco entre el fin de la fila superior y el inicio de la inferior === pasillo.
  const hueco = yFilaInferior - (yFilaSuperior + altoCama)
  assert.ok(
    Math.abs(hueco - GEOMETRIA.pasilloCentral * M_A_U) < TOL,
    `hueco entre filas = pasilloCentral*M_A_U (got ${hueco})`,
  )

  // Borde interior superior = espesor de pared = (exterior-interior)/2 * M_A_U.
  const bordeInteriorSuperior = ((GEOMETRIA.anchoExterior - GEOMETRIA.anchoInterior) / 2) * M_A_U
  assert.ok(
    Math.abs(yFilaSuperior - bordeInteriorSuperior) < TOL,
    `fila superior arranca en el borde interior superior`,
  )
  // Borde interior inferior = la fila inferior termina ahí.
  const bordeInteriorInferior = bordeInteriorSuperior + GEOMETRIA.anchoInterior * M_A_U
  assert.ok(
    Math.abs(yFilaInferior + altoCama - bordeInteriorInferior) < TOL,
    `fila inferior termina en el borde interior inferior`,
  )
})

test('config inválida (largo imposible) devuelve { valido: false } sin anchos negativos', () => {
  const layout = calcularLayout({ ...CONFIG_MOCK_N4, largo: 1.0 })
  assert.equal(layout.valido, false)
  if (Array.isArray(layout.zonas)) {
    for (const z of layout.zonas) {
      assert.ok(z.anchoU >= 0, 'ninguna zona con ancho negativo')
    }
  }
})

// --- T-02-02: suma de control geométrica (el layout de camas cierra contra el interior real). ---
test('checksum geométrico: anchoCama*2 + pasilloCentral === anchoInterior', () => {
  assert.ok(
    Math.abs(GEOMETRIA.anchoCama * 2 + GEOMETRIA.pasilloCentral - GEOMETRIA.anchoInterior) < TOL,
    `0.80×2 + 0.92 debe === 2.52 (interior útil)`,
  )
})

// --- Transición de config (prepara PLANO-02 del Plan 03): el layout reacciona al modelo. ---
test('transición N1↔N4: totalU distintos y ambos válidos', () => {
  const n1 = calcularLayout(CONFIG_MOCK_N1)
  const n4 = calcularLayout(CONFIG_MOCK_N4)
  assert.equal(n1.valido, true)
  assert.equal(n4.valido, true)
  assert.ok(Math.abs(n1.totalU - CONFIG_MOCK_N1.largo * M_A_U) < TOL)
  assert.ok(Math.abs(n4.totalU - CONFIG_MOCK_N4.largo * M_A_U) < TOL)
  assert.notEqual(n1.totalU, n4.totalU, 'distinto modelo → distinto largo total')
  // Mismas zonas en mismo orden (estructura determinística), distinto reparto.
  assert.deepEqual(
    n1.zonas.map((z) => z.id),
    n4.zonas.map((z) => z.id),
  )
})
