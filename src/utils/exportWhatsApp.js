// exportWhatsApp — arma el mensaje pre-llenado y el deep-link wa.me del resumen (EXPORT-01).
// Funciones PURAS, sin React/DOM (el botón del resumen es un simple <a href={linkWhatsApp(estado)}>).
// Compone sobre detallePresupuesto (única fuente del total) y resumenCampos (labels legibles,
// tolerante a estado adulterado). El número SIEMPRE viene de CONTACTO.whatsapp (D-08), NUNCA literal
// acá — el link lo lleva adentro, así el cliente no necesita conocerlo. El texto va 100% en trato de
// usted (gate anti-voseo) y termina recordando el PDF (D-10: wa.me no adjunta archivos; el PDF se
// descarga en paralelo para que el cliente lo adjunte a mano). El mensaje es autosuficiente para
// cotizar: trae la config completa. encodeURIComponent sobre TODO el text (V5 output encoding;
// \n→%0A, & y acentos/ñ codificados — T-06-04). Conciso, sin desglose ítem-por-ítem con precios
// (el detalle completo va en el PDF, Pitfall 6 / límite ~2000 URL).
import { CONTACTO } from '../data/contacto.js'
import { detallePresupuesto } from './motorPrecios.js'
import { formatPrecio } from './formato.js'
import { resumenCampos } from './resumenCampos.js'

export function mensajeWhatsApp(estado) {
  const { total } = detallePresupuesto(estado) // única fuente del total (no re-sumar)
  const c = resumenCampos(estado) // labels legibles, 'Sin selección'/'Modelo no disponible' si falta
  return [
    'Hola, le comparto la configuración de mi casilla Impacar:',
    '',
    `Modelo: ${c.modelo}${c.largo && c.largo !== 'Sin selección' ? ` (${c.largo})` : ''}`,
    `Uso: ${c.uso} · Ocupantes: ${c.ocupantes}`,
    `Baño: ${c.bano}`,
    `Dormitorio: ${c.camas}`,
    `Cocina: ${c.cocina}`,
    c.extras.length ? `Extras: ${c.extras.join(', ')}` : 'Extras: Sin selección',
    '',
    `Total c/IVA: ${formatPrecio(total)}`,
    'Presupuesto orientativo, sujeto a confirmación.',
    '',
    'Le envío aparte el PDF con el plano y el detalle.', // D-10: wa.me no adjunta archivos
  ].join('\n')
}

export function linkWhatsApp(estado) {
  // Número desde la constante (D-08); todo el text codificado (\n→%0A, &, acentos, ñ) — V5 / T-06-04.
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(estado))}`
}
