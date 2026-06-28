// Tests de resumenCampos — traduccion estado→labels legibles (node:test, sin deps extra). RESUMEN-01.
// Ejecutar: node --test src/utils/resumenCampos.test.js
// Codifica: ids→nombres reales (uso, modelo+largo, baño, camas C/S/M, cocina/heladera/mesa, extras)
// + degradacion a 'Sin selección' (nunca undefined/''/'null') + tolerancia a estado adulterado.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resumenCampos } from './resumenCampos.js'

test('resumenCampos: estado completo → traduce todos los ids a nombres legibles', () => {
  const estado = {
    modeloId: 'N4',
    uso: 'ganadero',
    ocupantes: 4,
    bano: { tamano: 'ampliado' },
    dormitorio: { camas: [{ tipo: 'C' }, { tipo: 'C' }, { tipo: 'M' }] },
    extras: ['cocina-horno', 'heladera-220', 'mesa-cano', 'calefactor-4000'],
  }
  const c = resumenCampos(estado)
  assert.equal(c.modelo, 'N4')
  assert.equal(c.largo, '6,6 m') // coma decimal
  assert.equal(c.uso, 'Ganadero')
  assert.equal(String(c.ocupantes), '4')
  assert.equal(c.bano, 'Ampliado')
  // camas: 2 cuchetas + 1 matrimonial (texto legible, ambos tipos presentes con su cantidad)
  assert.match(c.camas, /2/)
  assert.match(c.camas, /cucheta/i)
  assert.match(c.camas, /1/)
  assert.match(c.camas, /matrimonial/i)
  // cocina menciona horno + heladera 220V (nombres reales de EXTRAS)
  assert.match(c.cocina, /horno/i)
  assert.match(c.cocina, /220/)
  // extras de confort/energia = array con nombres reales (incluye el calefactor)
  assert.ok(Array.isArray(c.extras))
  assert.ok(c.extras.some((n) => /Calefactor 4000/i.test(n)))
})

test('resumenCampos: la mesa se refleja cuando mesa-cano esta en extras', () => {
  const c = resumenCampos({ modeloId: 'N4', extras: ['mesa-cano'] })
  assert.match(c.cocina, /mesa/i)
})

test('resumenCampos: heladera 12V se traduce a su nombre real cuando esta seleccionada', () => {
  const c = resumenCampos({ modeloId: 'N4', extras: ['heladera-12v'] })
  assert.match(c.cocina, /12V/i)
})

test('resumenCampos: estado vacio → cada campo "Sin selección" / "Modelo no disponible", NUNCA undefined', () => {
  const c = resumenCampos({ uso: null, ocupantes: null, modeloId: 'XX', dormitorio: { camas: [] }, extras: [] })
  assert.equal(c.modelo, 'Modelo no disponible')
  assert.equal(c.largo, 'Sin selección')
  assert.equal(c.uso, 'Sin selección')
  assert.equal(c.ocupantes, 'Sin selección')
  assert.equal(c.bano, 'Sin selección')
  assert.equal(c.camas, 'Sin selección')
  assert.equal(c.cocina, 'Sin selección')
  assert.deepEqual(c.extras, [])
  // Ningun valor primitivo undefined / '' / 'null' / 'undefined'
  for (const [clave, valor] of Object.entries(c)) {
    if (Array.isArray(valor)) continue
    assert.notEqual(valor, undefined, `campo ${clave} no debe ser undefined`)
    assert.notEqual(valor, '', `campo ${clave} no debe ser ''`)
    assert.notEqual(String(valor), 'null', `campo ${clave} no debe ser 'null'`)
    assert.notEqual(String(valor), 'undefined', `campo ${clave} no debe ser 'undefined'`)
  }
})

test('resumenCampos: bano estandar → "Estándar"', () => {
  const c = resumenCampos({ modeloId: 'N4', bano: { tamano: 'estandar' }, extras: [] })
  assert.equal(c.bano, 'Estándar')
})

test('resumenCampos(null) no crashea y degrada a "Sin selección"', () => {
  const c = resumenCampos(null)
  assert.equal(c.modelo, 'Modelo no disponible')
  assert.equal(c.uso, 'Sin selección')
  assert.equal(c.camas, 'Sin selección')
  assert.deepEqual(c.extras, [])
})

test('resumenCampos: extras no-array → no crashea, extras = [] y cocina "Sin selección"', () => {
  const c = resumenCampos({ modeloId: 'N4', extras: 'no-array' })
  assert.deepEqual(c.extras, [])
  assert.equal(c.cocina, 'Sin selección')
})

test('resumenCampos: camas no-array (estado adulterado) → "Sin selección" (no crashea)', () => {
  const c = resumenCampos({ modeloId: 'N4', dormitorio: { camas: 'no-array' }, extras: [] })
  assert.equal(c.camas, 'Sin selección')
})

test('resumenCampos: no contiene valores undefined en ningun campo (estado parcial)', () => {
  const c = resumenCampos({ modeloId: 'N1' })
  for (const valor of Object.values(c)) {
    if (Array.isArray(valor)) continue
    assert.notEqual(valor, undefined)
  }
})
