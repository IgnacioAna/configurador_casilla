import { useState } from 'react'
import { linkWhatsApp } from '../../utils/exportWhatsApp.js'
import { generarPDF } from '../../utils/exportPDF.js'

// AccionesExport (S6 — EXPORT-01/02). Dos botones:
//  - WhatsApp = <a href={linkWhatsApp(estado)} target="_blank" rel="noopener noreferrer"> (primario,
//    relleno verde impacar-campo — NO el verde de marca WhatsApp #25D366; UI-SPEC locked). T-06-07:
//    rel="noopener noreferrer" mitiga reverse tabnabbing.
//  - PDF = <button> outline que dispara generarPDF; queda disabled mientras genera (T-06-09: sin
//    doble-click). El nodo SVG vivo se resuelve en el momento del click vía getSvgNode() (el ref
//    se resuelve tras el montaje, no en el render).
// Debajo, link global "Volver a editar" (estilo del "Volver a empezar" del wizard).
// Glyphs SVG inline (patrón IconoUso de PasoUso.jsx; sin librería de iconos).

function IconoWhatsApp() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.6 8.6 0 0 1-4-1L3 20l1-5.5a8.6 8.6 0 0 1-1-4A8.38 8.38 0 0 1 11.5 2 8.38 8.38 0 0 1 21 11.5Z" />
      <path d="M8.5 8.5c0 3.5 3.5 7 7 7 .6 0 1.2-.4 1.2-1l-.2-1.4-2-.6-.9.9c-1-.5-2-1.5-2.5-2.5l.9-.9-.6-2-1.4-.2c-.6 0-1 .6-1 1.2Z" />
    </svg>
  )
}

function IconoDescarga() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

export default function AccionesExport({ estado, getSvgNode, onVolverEditar }) {
  const [generando, setGenerando] = useState(false)

  const onDescargar = async () => {
    setGenerando(true)
    try {
      await generarPDF(getSvgNode?.(), estado)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={linkWhatsApp(estado)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded bg-impacar-campo px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-impacar-campo/90 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40"
        >
          <IconoWhatsApp />
          Enviar por WhatsApp
        </a>
        <button
          type="button"
          disabled={generando}
          onClick={onDescargar}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-impacar-campo px-5 py-2 text-sm font-semibold text-impacar-campo transition-colors hover:bg-impacar-campo/5 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconoDescarga />
          {generando ? 'Generando…' : 'Descargar PDF'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onVolverEditar}
          className="min-h-[44px] text-sm font-medium text-impacar-texto/60 underline-offset-2 transition-colors hover:text-impacar-cobre hover:underline focus:outline-none focus:ring-2 focus:ring-impacar-cobre/30"
        >
          Volver a editar
        </button>
      </div>
    </div>
  )
}
