// Tests del reducer central del wizard (node:test, ESM-native, sin dependencias extra).
// Ejecutar: node --test src/state/wizardReducer.test.js
// Codifica el <behavior> del plan 03-01 (navegación acotada, RESET, configDesdeEstado deriva el largo).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  estadoInicial,
  wizardReducer,
  ACCIONES,
  configDesdeEstado,
  TOTAL_PASOS,
} from './wizardReducer.js'
import { MODELOS } from '../data/models.js'

test('estadoInicial: forma esperada con modeloId N4 y pasoActual 0', () => {
  assert.equal(estadoInicial.pasoActual, 0)
  assert.equal(estadoInicial.modeloId, 'N4')
  assert.equal(estadoInicial.uso, null)
  assert.equal(estadoInicial.ocupantes, null)
  assert.deepEqual(estadoInicial.bano, { tamano: 'estandar' })
  assert.deepEqual(estadoInicial.dormitorio, { camas: [] })
  assert.deepEqual(estadoInicial.cocina, { horno: false, heladera: null })
  assert.deepEqual(estadoInicial.estar, { mesa: false })
  assert.deepEqual(estadoInicial.extras, [])
})

test('TOTAL_PASOS: 6 pasos', () => {
  assert.equal(TOTAL_PASOS, 6)
})

test('SET_CAMPO: actualiza un campo por clave de forma inmutable', () => {
  const siguiente = wizardReducer(estadoInicial, {
    type: ACCIONES.SET_CAMPO,
    campo: 'modeloId',
    valor: 'N1',
  })
  assert.equal(siguiente.modeloId, 'N1')
  assert.equal(estadoInicial.modeloId, 'N4', 'el estado original no se muta')
  assert.notEqual(siguiente, estadoInicial)
})

test('SIGUIENTE: avanza pasoActual sin pasar de TOTAL_PASOS - 1', () => {
  let estado = estadoInicial
  for (let i = 0; i < 10; i += 1) {
    estado = wizardReducer(estado, { type: ACCIONES.SIGUIENTE })
  }
  assert.equal(estado.pasoActual, TOTAL_PASOS - 1, 'no pasa de 5')
})

test('ANTERIOR: retrocede pasoActual sin bajar de 0', () => {
  let estado = estadoInicial
  for (let i = 0; i < 10; i += 1) {
    estado = wizardReducer(estado, { type: ACCIONES.ANTERIOR })
  }
  assert.equal(estado.pasoActual, 0, 'no baja de 0')
})

test('IR_A_PASO: acota el valor recibido al rango [0, TOTAL_PASOS - 1]', () => {
  assert.equal(
    wizardReducer(estadoInicial, { type: ACCIONES.IR_A_PASO, paso: 3 }).pasoActual,
    3,
  )
  assert.equal(
    wizardReducer(estadoInicial, { type: ACCIONES.IR_A_PASO, paso: 99 }).pasoActual,
    TOTAL_PASOS - 1,
  )
  assert.equal(
    wizardReducer(estadoInicial, { type: ACCIONES.IR_A_PASO, paso: -5 }).pasoActual,
    0,
  )
})

test('RESET: vuelve a estadoInicial sin compartir referencias anidadas', () => {
  // Mutamos un estado avanzado y luego reseteamos.
  let estado = wizardReducer(estadoInicial, { type: ACCIONES.SIGUIENTE })
  estado = wizardReducer(estado, { type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: 'N7' })
  const reseteado = wizardReducer(estado, { type: ACCIONES.RESET })

  assert.equal(reseteado.pasoActual, 0)
  assert.equal(reseteado.modeloId, 'N4')
  assert.deepEqual(reseteado.dormitorio, estadoInicial.dormitorio)
  // Copia fresca: no comparte referencia con estadoInicial (no contamina el original).
  assert.notEqual(reseteado.dormitorio, estadoInicial.dormitorio)
  assert.notEqual(reseteado.cocina, estadoInicial.cocina)
})

test('configDesdeEstado: produce el shape exacto que consume FloorPlan', () => {
  const config = configDesdeEstado(estadoInicial)
  assert.deepEqual(Object.keys(config).sort(), [
    'bano',
    'cocina',
    'dormitorio',
    'estar',
    'largo',
    'modeloId',
  ])
  assert.equal(config.modeloId, 'N4')
  assert.equal(config.bano.tamano, 'estandar')
  // No incluye campos que el plano no lee.
  assert.equal(config.pasoActual, undefined)
  assert.equal(config.extras, undefined)
})

test('configDesdeEstado: el largo se deriva de MODELOS por modeloId (N4 -> 6.6)', () => {
  const config = configDesdeEstado(estadoInicial)
  const largoEsperado = MODELOS.find((m) => m.id === 'N4').largo
  assert.equal(config.largo, largoEsperado)
  assert.equal(config.largo, 6.6)
})

test('configDesdeEstado: derivación dinámica del largo al cambiar de modelo (N1 -> 4.5)', () => {
  const estadoN1 = wizardReducer(estadoInicial, {
    type: ACCIONES.SET_CAMPO,
    campo: 'modeloId',
    valor: 'N1',
  })
  const config = configDesdeEstado(estadoN1)
  assert.equal(config.largo, MODELOS.find((m) => m.id === 'N1').largo)
  assert.equal(config.largo, 4.5)
})
