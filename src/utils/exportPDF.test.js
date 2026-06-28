// Tests de la parte PURA de exportPDF — nombreArchivoPDF (node:test, sin deps extra). EXPORT-02.
// Ejecutar: node --test src/utils/exportPDF.test.js
// generarPDF (browser-side, jsPDF + svg2pdf.js) se valida MANUAL en el dev server (Plan 06-03):
// no se testea aca porque necesita DOM/descarga reales.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nombreArchivoPDF } from './exportPDF.js'

test('nombreArchivoPDF: con modelo → presupuesto-impacar-<modeloId>.pdf', () => {
  assert.equal(nombreArchivoPDF({ modeloId: 'N4' }), 'presupuesto-impacar-N4.pdf')
  assert.equal(nombreArchivoPDF({ modeloId: 'N7' }), 'presupuesto-impacar-N7.pdf')
})

test('nombreArchivoPDF: sin modelo → presupuesto-impacar-sin-modelo.pdf', () => {
  assert.equal(nombreArchivoPDF({}), 'presupuesto-impacar-sin-modelo.pdf')
})

test('nombreArchivoPDF(null) → presupuesto-impacar-sin-modelo.pdf (no crashea)', () => {
  assert.equal(nombreArchivoPDF(null), 'presupuesto-impacar-sin-modelo.pdf')
})
