// exportPDF — utilidades de exportacion a PDF. EXPORT-02.
//
// Este modulo tiene DOS partes:
//  1) nombreArchivoPDF(estado): PARTE PURA (sin DOM) — el nombre del archivo descargado. Testeable
//     con node:test. presupuesto-impacar-<modeloId>.pdf, o ...-sin-modelo.pdf cuando no hay modelo.
//  2) generarPDF(svgNode, estado): browser-side (jsPDF + svg2pdf.js). Toma el nodo SVG vivo del plano
//     del resumen y lo embebe como VECTOR en una pagina A4 (D-11/D-12). Validacion manual en dev server.
import { detallePresupuesto } from './motorPrecios.js'
import { formatPrecio } from './formato.js'
import { resumenCampos } from './resumenCampos.js'
import { CONTACTO } from '../data/contacto.js'

// Parte pura — testeable. El modeloId es un id de catalogo publico (N1-N7), sin PII (T-06-03 accept).
export function nombreArchivoPDF(estado) {
  return `presupuesto-impacar-${estado?.modeloId ?? 'sin-modelo'}.pdf`
}

// Guarda anti-desbordamiento (WR-03): el pie está anclado en ~285 mm; con muchos extras de nombre
// largo el cursor de texto puede pasarlo y jsPDF escribiría fuera de la hoja (texto encimado/cortado).
// Si la próxima línea cruzaría LIMITE_PIE, abre página nueva y reinicia el cursor en el margen
// superior. Caso típico (config corta) → no agrega página: se mantiene en una sola hoja.
const LIMITE_PIE = 278 // mm — margen de seguridad por debajo del pie (285) y su línea divisoria (279)
function avanzarSiNecesario(doc, cursorY, margenSuperior = 20) {
  if (cursorY >= LIMITE_PIE) {
    doc.addPage()
    return margenSuperior
  }
  return cursorY
}

// generarPDF(svgNode, estado): genera y descarga el PDF del resumen (EXPORT-02, D-11/D-12/D-13).
// Browser-side: usa jsPDF + svg2pdf.js para embeber el plano como VECTOR (no html2canvas), 1 pagina A4.
// Reglas (RESEARCH Pitfalls 1-4):
//  - import dinámico de jspdf/svg2pdf → la dep pesada NO infla el bundle inicial del wizard.
//  - `await doc.svg(...)` ANTES de doc.save (doc.svg es async; guardar antes → PDF sin plano).
//  - svgNode = nodo DOM vivo (no string); el alto del plano se deriva del viewBox real (no deforma).
//  - svgNode null (plano no montado) → se salta el bloque del plano sin crashear (T-06-09).
//  - Helvetica (default jsPDF) — Inter NO se registra (Pitfall 4, decisión sobria/industrial).
//  - Todas las cifras vía formatPrecio; contacto desde CONTACTO (D-13).
export async function generarPDF(svgNode, estado) {
  const { jsPDF } = await import('jspdf') // import dinámico: dep pesada fuera del bundle inicial
  await import('svg2pdf.js') // side-effect: parchea doc.svg

  const doc = new jsPDF('p', 'mm', 'a4') // A4 vertical, mm (210 × 297)
  const M = 15 // margen mm
  const anchoUtil = 210 - M * 2 // 180 mm
  const COBRE = '#8B6914'

  // 1) Logo IMPACAR (texto bold placeholder, D-12) + bajada.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(45, 80, 22) // impacar-campo #2D5016
  doc.text('IMPACAR', M, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(26, 26, 26) // impacar-texto #1A1A1A
  doc.text('Configurador de casillas rurales', M, 26)

  // 2) Plano VECTORIAL: derivar el alto del viewBox real para NO deformar (Pitfall 3). Degradación
  //    elegante si no hay nodo (T-06-09): se salta el plano sin crashear.
  let cursorY = 32
  if (svgNode) {
    const vb = svgNode.viewBox?.baseVal
    const planoAlto = vb && vb.width ? anchoUtil * (vb.height / vb.width) : anchoUtil * 0.3
    await doc.svg(svgNode, { x: M, y: cursorY, width: anchoUtil, height: planoAlto }) // AWAIT (Pitfall 1)
    cursorY += planoAlto + 8
  }

  // 3) Presupuesto (total + nota orientativa).
  const { total } = detallePresupuesto(estado)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Presupuesto estimado', M, cursorY)
  cursorY += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(45, 80, 22)
  doc.text(`Total c/IVA: ${formatPrecio(total)}`, M, cursorY)
  doc.setTextColor(26, 26, 26)
  cursorY += 6
  doc.setFontSize(9)
  for (const linea of doc.splitTextToSize(
    'Presupuesto orientativo, sujeto a confirmación del asesor comercial.',
    anchoUtil,
  )) {
    cursorY = avanzarSiNecesario(doc, cursorY) // WR-03
    doc.text(linea, M, cursorY)
    cursorY += 5
  }
  cursorY += 4

  // 4) Configuración condensada (labels legibles vía resumenCampos).
  const c = resumenCampos(estado)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Su configuración', M, cursorY)
  cursorY += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const filasConfig = [
    `Uso: ${c.uso} · Ocupantes: ${c.ocupantes}`,
    `Modelo: ${c.modelo}${c.largo && c.largo !== 'Sin selección' ? ` (${c.largo})` : ''}`,
    `Baño: ${c.bano}`,
    `Dormitorio: ${c.camas}`,
    `Cocina y estar: ${c.cocina}`,
    `Extras: ${c.extras.length ? c.extras.join(', ') : 'Sin selección'}`,
  ]
  for (const fila of filasConfig) {
    for (const linea of doc.splitTextToSize(fila, anchoUtil)) {
      cursorY = avanzarSiNecesario(doc, cursorY) // WR-03: salto de página antes de pisar el pie
      doc.text(linea, M, cursorY)
      cursorY += 5
    }
  }

  // 5) Contacto al pie (D-13): logo + WhatsApp + web + IG + ciudad, leídos de CONTACTO.
  const pieY = 285
  doc.setDrawColor(139, 105, 20) // cobre
  doc.setLineWidth(0.3)
  doc.line(M, pieY - 6, 210 - M, pieY - 6)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(45, 80, 22)
  doc.text('IMPACAR', M, pieY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(26, 26, 26)
  doc.text(
    `WhatsApp: ${CONTACTO.whatsappDisplay}  ·  ${CONTACTO.web}  ·  ${CONTACTO.instagram}  ·  ${CONTACTO.ciudad}`,
    M,
    pieY + 5,
  )

  doc.save(nombreArchivoPDF(estado)) // dispara la descarga real en el navegador
}
