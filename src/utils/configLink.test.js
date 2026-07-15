// Tests de configLink — round-trip y frontera de confianza (token = input no confiable).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { codificarConfig, decodificarConfig, enlaceConfigApp } from './configLink.js'

const ESTADO = {
  pasoActual: 5,
  uso: 'vivienda',
  ocupantes: 4,
  modeloId: 'N3',
  bano: { tamano: 'estandar' },
  dormitorio: { camas: [{ tipo: 'C' }, { tipo: 'S' }, { tipo: 'S' }] },
  extras: ['inodoro-septica', 'calefactor-4000', 'split-3200'],
}

test('codificar → decodificar preserva los campos de negocio (round-trip)', () => {
  const token = codificarConfig(ESTADO)
  const vuelta = decodificarConfig(token)
  assert.equal(vuelta.modeloId, 'N3')
  assert.equal(vuelta.uso, 'vivienda')
  assert.equal(vuelta.ocupantes, 4)
  assert.equal(vuelta.bano.tamano, 'estandar')
  assert.deepEqual(
    vuelta.dormitorio.camas.map((c) => c.tipo),
    ['C', 'S', 'S'],
  )
  assert.deepEqual(vuelta.extras.sort(), [...ESTADO.extras].sort())
})

test('el token es compacto (< 40 chars para una config típica)', () => {
  const token = codificarConfig(ESTADO)
  assert.ok(token.length < 40, `token demasiado largo: ${token.length} — "${token}"`)
  assert.ok(token.startsWith('1-N3-'), `formato inesperado: "${token}"`)
})

test('baño ampliado y sin extras se codifican y decodifican bien', () => {
  const est = { ...ESTADO, bano: { tamano: 'ampliado' }, extras: [] }
  const vuelta = decodificarConfig(codificarConfig(est))
  assert.equal(vuelta.bano.tamano, 'ampliado')
  assert.deepEqual(vuelta.extras, [])
})

test('dormitorio sin camas → camas vacío (token con segmento vacío, 7 campos)', () => {
  const est = { ...ESTADO, dormitorio: { camas: [] } }
  const token = codificarConfig(est)
  assert.equal(token.split('-').length, 7)
  assert.deepEqual(decodificarConfig(token).dormitorio.camas, [])
})

test('todos los extras seleccionados hacen round-trip exacto', () => {
  const todos = [
    'inodoro-septica', 'vanitory-espejo', 'cajonera-bajo-cama', 'cocina-horno',
    'heladera-220', 'heladera-12v', 'mesa-cano', 'banco-despensero',
    'calefactor-4000', 'caldera-12v', 'split-3200', 'panel-solar-160',
    'sistema-solar-220', 'tv-32-directv', 'estereo-pioneer', 'cortinas-blackout', 'toldo',
  ]
  const est = { ...ESTADO, extras: todos }
  const vuelta = decodificarConfig(codificarConfig(est))
  assert.deepEqual(vuelta.extras.sort(), [...todos].sort())
})

// --- Frontera de confianza: tokens inválidos NUNCA producen estado (devuelven null) ---

test('decodificarConfig rechaza tokens inválidos', () => {
  assert.equal(decodificarConfig(null), null)
  assert.equal(decodificarConfig(''), null)
  assert.equal(decodificarConfig('basura'), null)
  assert.equal(decodificarConfig('1-N3-v-4-e-CSS'), null) // 6 campos, faltan
  assert.equal(decodificarConfig('9-N3-v-4-e-CSS-0'), null) // versión desconocida
  assert.equal(decodificarConfig('1-X9-v-4-e-CSS-0'), null) // modelo inexistente
})

test('decodificarConfig descarta valores desconocidos sin crashear', () => {
  // uso desconocido → null; ocupantes no numérico → null; baño raro → estandar; camas basura → []
  const vuelta = decodificarConfig('1-N4-z-abc-q-XYZ-0')
  assert.equal(vuelta.modeloId, 'N4')
  assert.equal(vuelta.uso, null)
  assert.equal(vuelta.ocupantes, null)
  assert.equal(vuelta.bano.tamano, 'estandar')
  assert.deepEqual(vuelta.dormitorio.camas, [])
  assert.deepEqual(vuelta.extras, [])
})

test('bits de más en el bitmask no inventan extras fuera del catálogo', () => {
  // 'zzz' base36 = 46655 → muchos bits, pero solo hay 17 extras: nunca más de 17 ids.
  const vuelta = decodificarConfig('1-N4-v-4-e-CSS-zzz')
  assert.ok(vuelta.extras.length <= 17)
  assert.ok(vuelta.extras.every((id) => typeof id === 'string'))
})

test('enlaceConfigApp arma una URL con el token (ruta relativa en node)', () => {
  const url = enlaceConfigApp(ESTADO)
  assert.ok(url.includes('/?c=1-N3-'), `URL inesperada: "${url}"`)
})
