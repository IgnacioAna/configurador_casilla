// src/data/contacto.js — fuente única de contacto (wa.me + PDF). CONTEXT D-08/D-13.
// La consumen el link wa.me (exportWhatsApp.js, EXPORT-01) y el contacto del PDF (exportPDF.js, D-13).
// Números de WhatsApp (wa.me: SOLO dígitos, código país (54) + 9, sin '+' ni espacios):
//   - PRUEBAS / DEMO (Ignacio): 5492954555113 — DEFAULT, así la demo NUNCA le llega a la fábrica.
//   - PRODUCCIÓN (Impacar, General Pico): 5492302468754 — se activa en el go-live.
// Swap a producción SIN tocar este archivo: definir VITE_WA_NUMBER en `.env.production`
//   (VITE_WA_NUMBER=5492302468754) y, opcionalmente, VITE_WA_DISPLAY para el texto legible del PDF.
//   Sin variable de entorno, el valor por defecto sigue siendo el número de pruebas (ver .env.example).
const WA_NUMERO_PRUEBAS = '5492954555113' // DEFAULT activo en demo (CONTEXT D-08)
const WA_DISPLAY_PRUEBAS = '+54 9 2954 55-5113'

export const CONTACTO = {
  // wa.me: SOLO dígitos, código país (54) + 9, sin '+' ni espacios.
  whatsapp: import.meta.env?.VITE_WA_NUMBER ?? WA_NUMERO_PRUEBAS,
  whatsappDisplay: import.meta.env?.VITE_WA_DISPLAY ?? WA_DISPLAY_PRUEBAS, // para mostrar legible en el PDF
  web: 'industriaimpacar.com',
  instagram: '@industriasimpacar',
  ciudad: 'General Pico, La Pampa',
}
