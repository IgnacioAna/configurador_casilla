// exportWhatsApp — arma el mensaje pre-llenado y el deep-link wa.me del resumen (EXPORT-01).
// Funciones PURAS, sin React/DOM (el botón del resumen es un simple <a href={linkWhatsApp(estado)}>).
// Compone sobre detallePresupuesto (única fuente del total) y resumenCampos (labels legibles,
// tolerante a estado adulterado). El número SIEMPRE viene de CONTACTO.whatsapp (D-08), NUNCA literal
// acá — el link lo lleva adentro, así el cliente no necesita conocerlo. El texto va 100% en trato de
// usted (gate anti-voseo) y termina con un ENLACE que abre el configurador con la casilla del
// cliente ya cargada (plano vivo + presupuesto) — reemplaza al "PDF que se pierde": la magia visual
// se conserva porque el asesor abre el link y ve la config viva, no un archivo muerto ni texto
// plano. El enlace lo arma enlaceConfigApp (configLink.js) con la config embebida en la URL.
// encodeURIComponent sobre TODO el text (V5 output encoding; \n→%0A, & y acentos/ñ codificados —
// T-06-04). Conciso, sin desglose ítem-por-ítem con precios (el detalle vive en el enlace / PDF,
// Pitfall 6 / límite ~2000 URL).
import { CONTACTO } from '../data/contacto.js'
import { detallePresupuesto } from './motorPrecios.js'
import { formatPrecio } from './formato.js'
import { resumenCampos } from './resumenCampos.js'
import { enlaceConfigApp } from './configLink.js'
import { LISTA_PRECIOS } from '../data/geometry.js'

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
    `Precios ${LISTA_PRECIOS.nombre} · ${LISTA_PRECIOS.vigencia}.`,
    '',
    'Vea el plano en planta y el detalle completo acá:',
    enlaceConfigApp(estado), // link que abre el configurador con esta casilla ya cargada
  ].join('\n')
}

export function linkWhatsApp(estado) {
  // Número desde la constante (D-08); todo el text codificado (\n→%0A, &, acentos, ñ) — V5 / T-06-04.
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(estado))}`
}
