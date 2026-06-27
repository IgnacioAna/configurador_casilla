// Tests del catálogo de extras (node:test). D-08: split confort/energía data-driven.
// Ejecutar: node --test src/data/extras.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXTRAS } from './extras.js'

test("cada extra categoria:'extras' tiene subgrupo válido (confort|energia)", () => {
  const extras = EXTRAS.filter((e) => e.categoria === 'extras')
  for (const e of extras) {
    assert.ok(['confort', 'energia'].includes(e.subgrupo), `${e.id} debe tener subgrupo confort|energia`)
  }
})

test('split 7 confort + 2 energia', () => {
  const extras = EXTRAS.filter((e) => e.categoria === 'extras')
  assert.equal(extras.filter((e) => e.subgrupo === 'confort').length, 7)
  assert.equal(extras.filter((e) => e.subgrupo === 'energia').length, 2)
})

test('energia = panel-solar-160 + sistema-solar-220', () => {
  const energia = EXTRAS.filter((e) => e.subgrupo === 'energia').map((e) => e.id).sort()
  assert.deepEqual(energia, ['panel-solar-160', 'sistema-solar-220'])
})

test("las categorias bano/dormitorio/cocina NO llevan subgrupo (split solo para 'extras')", () => {
  const otros = EXTRAS.filter((e) => e.categoria !== 'extras')
  for (const e of otros) {
    assert.equal(e.subgrupo, undefined, `${e.id} (${e.categoria}) no debe tener subgrupo`)
  }
})
