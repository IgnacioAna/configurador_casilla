// src/data/contacto.js — fuente única de contacto (wa.me + PDF). CONTEXT D-08/D-13.
// La consumen el link wa.me (exportWhatsApp.js, EXPORT-01) y el contacto del PDF (exportPDF.js, D-13).
export const CONTACTO = {
  // wa.me: SOLO dígitos, código país (54) + 9, sin '+' ni espacios.
  whatsapp: '5492954555113', // ACTIVO (pruebas, Ignacio). PRODUCCIÓN antes del go-live: 5492302468754 (Impacar)
  whatsappDisplay: '+54 9 2954 55-5113', // para mostrar legible en el PDF
  web: 'industriaimpacar.com',
  instagram: '@industriasimpacar',
  ciudad: 'General Pico, La Pampa',
}
