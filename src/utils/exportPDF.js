// exportPDF — utilidades de exportacion a PDF. EXPORT-02.
//
// Este modulo tiene DOS partes:
//  1) nombreArchivoPDF(estado): PARTE PURA (sin DOM) — el nombre del archivo descargado. Testeable
//     con node:test. presupuesto-impacar-<modeloId>.pdf, o ...-sin-modelo.pdf cuando no hay modelo.
//  2) generarPDF(svgNode, estado): browser-side, se implementa en el Plan 06-03 (jsPDF + svg2pdf.js).
//     Toma el nodo SVG vivo del plano del resumen y lo embebe como VECTOR en una pagina A4 (D-11/D-12).
//     No vive aca todavia porque necesita DOM/descarga reales (validacion manual en el dev server).

// Parte pura — testeable. El modeloId es un id de catalogo publico (N1-N7), sin PII (T-06-03 accept).
export function nombreArchivoPDF(estado) {
  return `presupuesto-impacar-${estado?.modeloId ?? 'sin-modelo'}.pdf`
}
