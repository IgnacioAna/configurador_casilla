// compartir — envío por WhatsApp con el PDF ADJUNTO vía Web Share API, con fallback (EXPORT-01/02).
// Browser-side (navigator/File/window) → validación manual en dev server / UAT, sin test unitario.
//
// Detección de soporte: `navigator.canShare?.({ files: [file] })` es el gate CORRECTO — algunos
// navegadores exponen navigator.share sin soportar archivos, por lo que chequear solo `share` daría
// falsos positivos. Además, la Web Share API con `files` SOLO funciona en contexto seguro
// (HTTPS/localhost) y en navegadores soportados (Chrome/Edge Android, Safari iOS/macOS; Firefox
// desktop NO). La hoja de compartir del sistema NO puede pre-seleccionar WhatsApp (limitación de la
// API): el usuario elige la app en la hoja.
//
// Caminos (retorno 'shared' | 'cancelled' | 'fallback'):
//  - Con soporte → share sheet con el PDF adjunto + texto SIN la línea "Le envío aparte el PDF".
//  - Cancelación del usuario (AbortError) → 'cancelled', silencio (NO es un error).
//  - Sin soporte → FALLBACK fiel al flujo original: descarga del PDF (generarPDF) + pestaña wa.me
//    con el texto CON el recordatorio del PDF. window.open con 'noopener,noreferrer' (T-06-07 /
//    T-Q2-01: anti reverse-tabnabbing). Nota: el fallback re-construye el doc (dos llamadas a
//    construirDocPDF) — aceptable para mantener generarPDF como caja negra.
import { construirDocPDF, generarPDF, nombreArchivoPDF } from './exportPDF.js'
import { mensajeWhatsApp, linkWhatsApp } from './exportWhatsApp.js'

export async function compartirPorWhatsApp({ svgNode, estado }) {
  const doc = await construirDocPDF(svgNode, estado)
  const blob = doc.output('blob')
  const file = new File([blob], nombreArchivoPDF(estado), { type: 'application/pdf' })

  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        text: mensajeWhatsApp(estado, { pdfAdjunto: true }),
        title: 'Presupuesto Impacar',
      })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled' // cancelación del usuario: NO es error, silencio
      throw err // otros errores suben al componente para el feedback sobrio
    }
  }

  // FALLBACK: sin Web Share con archivos → descarga del PDF + wa.me con el texto (línea del PDF incluida).
  await generarPDF(svgNode, estado) // reusa el flujo de descarga
  window.open(linkWhatsApp(estado), '_blank', 'noopener,noreferrer') // T-06-07: anti reverse-tabnabbing
  return 'fallback'
}
