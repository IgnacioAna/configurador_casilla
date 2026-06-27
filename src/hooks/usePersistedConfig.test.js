// Tests de la validación del estado persistido (node:test).
// Ejecutar: node --test src/hooks/usePersistedConfig.test.js
// Codifica la mitigación CR-01 / T-04-01 / T-04-09: un estado restaurado incompleto o adulterado
// debe RECHAZARSE (se descarta y se cae a estadoInicial), nunca propagarse a los componentes.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { esEstadoValido } from './usePersistedConfig.js'
import { estadoInicial, TOTAL_PASOS } from '../state/wizardReducer.js'

test('esEstadoValido: acepta el estadoInicial completo', () => {
  assert.equal(esEstadoValido(estadoInicial), true)
})

test('esEstadoValido: acepta un estado completo restaurado (con bano y extras)', () => {
  const restaurado = { ...estadoInicial, pasoActual: 2, modeloId: 'N3', bano: { tamano: 'ampliado' }, extras: ['inodoro-septica'] }
  assert.equal(esEstadoValido(restaurado), true)
})

test('CR-01: rechaza estado parcial sin bano ni extras (causaba pantalla blanca en PasoBano)', () => {
  assert.equal(esEstadoValido({ pasoActual: 2, modeloId: 'N4' }), false)
})

test('CR-01: rechaza bano null (estado.bano.tamano crasheaba)', () => {
  assert.equal(esEstadoValido({ pasoActual: 0, modeloId: 'N4', bano: null, extras: [] }), false)
})

test('CR-01: rechaza extras que no es array (estado.extras.includes crasheaba)', () => {
  assert.equal(esEstadoValido({ pasoActual: 0, modeloId: 'N4', bano: { tamano: 'estandar' }, extras: 'x' }), false)
})

test('CR-01 (code review 05): rechaza pasoActual fuera de rango / no entero (PASOS[idx] undefined → pantalla blanca)', () => {
  const base = { modeloId: 'N4', bano: { tamano: 'estandar' }, extras: [] }
  assert.equal(esEstadoValido({ ...base, pasoActual: 99 }), false)            // fuera de rango (alto)
  assert.equal(esEstadoValido({ ...base, pasoActual: TOTAL_PASOS }), false)   // un paso más allá del último índice
  assert.equal(esEstadoValido({ ...base, pasoActual: -1 }), false)            // negativo
  assert.equal(esEstadoValido({ ...base, pasoActual: 1.5 }), false)           // no entero
  assert.equal(esEstadoValido({ ...base, pasoActual: 0 }), true)              // límite inferior válido
  assert.equal(esEstadoValido({ ...base, pasoActual: TOTAL_PASOS - 1 }), true) // límite superior válido
})

test('esEstadoValido: sigue rechazando los casos previos (null, no-objeto, sin pasoActual/modeloId)', () => {
  assert.equal(esEstadoValido(null), false)
  assert.equal(esEstadoValido('cadena'), false)
  assert.equal(esEstadoValido({ modeloId: 'N4', bano: {}, extras: [] }), false) // falta pasoActual
  assert.equal(esEstadoValido({ pasoActual: 0, bano: {}, extras: [] }), false) // falta modeloId
})
