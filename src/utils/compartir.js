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
//  - Sin soporte → FALLBACK fiel al flujo original: pestaña wa.me con el texto CON el recordatorio
//    del PDF + descarga del PDF (generarPDF). window.open con 'noopener,noreferrer' (T-06-07 /
//    T-Q2-01: anti reverse-tabnabbing).
//
// ORDEN CRÍTICO en el fallback (verificado en browser): window.open DEBE ejecutarse ANTES del
// await de la generación del PDF. La "transient user activation" del click se consume durante el
// trabajo async (construir el doc jsPDF puede tardar), y un window.open posterior al await vuelve
// null (popup bloqueado → wa.me nunca se abre). Por eso el soporte se detecta con un File dummy
// BARATO (sin construir el PDF), se abre wa.me sincrónicamente dentro del gesto, y recién después
// se genera la descarga.
import { construirDocPDF, generarPDF, nombreArchivoPDF } from './exportPDF.js'
import { mensajeWhatsApp, linkWhatsApp } from './exportWhatsApp.js'

export async function compartirPorWhatsApp({ svgNode, estado }) {
  const nombre = nombreArchivoPDF(estado)
  // Detección con un File dummy del MISMO type/nombre (canShare valida tipo, no contenido):
  // evita construir el PDF completo solo para descubrir que no hay soporte.
  const dummy = new File([''], nombre, { type: 'application/pdf' })
  const soportaShare = typeof navigator !== 'undefined' && navigator.canShare?.({ files: [dummy] })

  if (!soportaShare) {
    // FALLBACK: wa.me PRIMERO (sincrónico, dentro del gesto del click — anti popup-block),
    // después la descarga del PDF con el flujo ya existente.
    window.open(linkWhatsApp(estado), '_blank', 'noopener,noreferrer') // T-06-07: anti reverse-tabnabbing
    await generarPDF(svgNode, estado) // reusa el flujo de descarga
    return 'fallback'
  }

  const doc = await construirDocPDF(svgNode, estado)
  const blob = doc.output('blob')
  const file = new File([blob], nombre, { type: 'application/pdf' })
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
