// Tests de exportWhatsApp — armado del mensaje y del deep-link wa.me (node:test, ESM-native,
// sin dependencias extra). EXPORT-01. Ejecutar: node --test src/utils/exportWhatsApp.test.js
// Cubre: contenido del mensaje (modelo/total/nota/recordatorio PDF), gate anti-voseo (trato de
// usted, patrón Fase 3), total formateado vía formatPrecio, degradación (estado null / extras
// no-array), y linkWhatsApp (número desde CONTACTO, encoding %0A, longitud < ~2000 con todos
// los extras — Pitfall 6).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mensajeWhatsApp, linkWhatsApp } from './exportWhatsApp.js'
import { detallePresupuesto } from './motorPrecios.js'
import { formatPrecio } from './formato.js'
import { CONTACTO } from '../data/contacto.js'
import { EXTRAS } from '../data/extras.js'

const ESTADO = {
  modeloId: 'N4',
  uso: 'ganadero',
  ocupantes: 4,
  bano: { tamano: 'ampliado' },
  dormitorio: { camas: [{ tipo: 'C' }, { tipo: 'M' }] },
  extras: ['cocina-horno', 'heladera-220', 'calefactor-4000'],
}

// --- mensajeWhatsApp: contenido ---

test('mensajeWhatsApp incluye el modelo, el total formateado, la nota orientativa y el recordatorio del PDF', () => {
  const msg = mensajeWhatsApp(ESTADO)
  assert.ok(msg.includes('N4'), 'debe incluir el nombre del modelo')
  const totalEsperado = formatPrecio(detallePresupuesto(ESTADO).total)
  assert.ok(msg.includes(totalEsperado), `debe incluir el total formateado ${totalEsperado}`)
  assert.ok(msg.includes('Presupuesto orientativo, sujeto a confirmación.'), 'debe incluir la nota orientativa')
  assert.ok(
    msg.includes('Le envío aparte el PDF con el plano y el detalle.'),
    'debe terminar recordando el PDF (D-10)',
  )
})

test('mensajeWhatsApp: gate anti-voseo — el copy está en trato de usted (patrón Fase 3)', () => {
  const msg = mensajeWhatsApp(ESTADO)
  const voseo = ['tenés', 'querés', 'podés', 'elegí', 'mirá', 'enviá', 'fijate', 'vos', 'tené ', 'hacé', 'mandá']
  for (const token of voseo) {
    assert.ok(!msg.toLowerCase().includes(token.toLowerCase()), `el mensaje NO debe contener voseo: "${token}"`)
  }
})

test('mensajeWhatsApp: el total proviene de detallePresupuesto + formatPrecio (no número crudo ni $NaN)', () => {
  const msg = mensajeWhatsApp(ESTADO)
  const { total } = detallePresupuesto(ESTADO)
  assert.ok(msg.includes(formatPrecio(total)), 'el total debe estar formateado con formatPrecio')
  assert.ok(!msg.includes(String(total)), 'el número crudo NO debe aparecer sin formato')
  assert.ok(!msg.includes('$NaN'), 'nunca $NaN')
})

// --- mensajeWhatsApp: degradación (estado adulterado / vacío) ---

test('mensajeWhatsApp(null) no crashea: modelo legible y total $0 (sin $NaN)', () => {
  const msg = mensajeWhatsApp(null)
  assert.ok(typeof msg === 'string' && msg.length > 0)
  assert.ok(msg.includes('Modelo no disponible'), 'modelo cae a algo legible')
  assert.ok(msg.includes('$0'), 'total cae a $0')
  assert.ok(!msg.includes('$NaN'), 'nunca $NaN')
})

test('mensajeWhatsApp con extras no-array no crashea', () => {
  const msg = mensajeWhatsApp({ modeloId: 'N4', extras: 'no-array' })
  assert.ok(typeof msg === 'string' && msg.length > 0)
  assert.ok(!msg.includes('$NaN'))
})

// --- mensajeWhatsApp con { pdfAdjunto: true }: el PDF viaja adjunto (Web Share API) ---

test('mensajeWhatsApp({ pdfAdjunto: true }) NO incluye la línea del PDF aparte', () => {
  const msg = mensajeWhatsApp(ESTADO, { pdfAdjunto: true })
  assert.ok(
    !msg.includes('Le envío aparte el PDF'),
    'con el PDF adjunto NO debe recordar el envío aparte',
  )
})

test('mensajeWhatsApp({ pdfAdjunto: true }) mantiene modelo, total formateado y nota orientativa', () => {
  const msg = mensajeWhatsApp(ESTADO, { pdfAdjunto: true })
  assert.ok(msg.includes('N4'), 'debe incluir el nombre del modelo')
  const totalEsperado = formatPrecio(detallePresupuesto(ESTADO).total)
  assert.ok(msg.includes(totalEsperado), `debe incluir el total formateado ${totalEsperado}`)
  assert.ok(msg.includes('Presupuesto orientativo, sujeto a confirmación.'), 'debe incluir la nota orientativa')
})

test('mensajeWhatsApp(null, { pdfAdjunto: true }) no crashea y no contiene $NaN', () => {
  const msg = mensajeWhatsApp(null, { pdfAdjunto: true })
  assert.ok(typeof msg === 'string' && msg.length > 0)
  assert.ok(!msg.includes('$NaN'), 'nunca $NaN')
})

test('mensajeWhatsApp({ pdfAdjunto: true }): gate anti-voseo — trato de usted', () => {
  const msg = mensajeWhatsApp(ESTADO, { pdfAdjunto: true })
  const voseo = ['tenés', 'querés', 'podés', 'elegí', 'mirá', 'enviá', 'fijate', 'vos', 'tené ', 'hacé', 'mandá']
  for (const token of voseo) {
    assert.ok(!msg.toLowerCase().includes(token.toLowerCase()), `el mensaje NO debe contener voseo: "${token}"`)
  }
})

// --- linkWhatsApp: número, encoding, longitud ---

test('linkWhatsApp empieza con wa.me + el número de CONTACTO (nunca literal)', () => {
  const link = linkWhatsApp(ESTADO)
  assert.ok(link.startsWith(`https://wa.me/${CONTACTO.whatsapp}?text=`), 'número desde CONTACTO')
  assert.ok(link.startsWith('https://wa.me/5492954555113?text='), 'número activo de pruebas')
})

test('linkWhatsApp: el text está URL-encoded — contiene %0A y no tiene saltos ni espacios crudos', () => {
  const link = linkWhatsApp(ESTADO)
  const text = link.split('?text=')[1]
  assert.ok(text.includes('%0A'), 'los \\n deben quedar codificados como %0A')
  assert.ok(!text.includes('\n'), 'no debe haber saltos de línea crudos en la URL')
  assert.ok(!text.includes(' '), 'no debe haber espacios sin codificar en la URL')
})

test('linkWhatsApp con TODOS los extras reales queda por debajo de ~2000 chars (Pitfall 6)', () => {
  const todosLosIds = EXTRAS.map((e) => e.id) // sin hardcodear
  const estado = { ...ESTADO, extras: todosLosIds }
  assert.ok(linkWhatsApp(estado).length < 2000, `link.length = ${linkWhatsApp(estado).length}`)
})
