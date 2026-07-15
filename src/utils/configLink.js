// configLink — codifica/decodifica la configuración del wizard en un token compacto para la URL
// (?c=...). Es lo que reemplaza al "PDF que se pierde": en vez de un archivo muerto o un texto
// plano, el mensaje de WhatsApp lleva un ENLACE que abre el configurador con la casilla del cliente
// ya cargada — plano en planta vivo + presupuesto. Sin backend: la config viaja DENTRO del link.
//
// Formato v1 — 7 campos separados por '-' (ningún campo contiene '-'):
//   1-<modelo>-<uso>-<ocupantes>-<bano>-<camas>-<extrasMask>
//   ej: 1-N3-v-4-e-CSS-4b1
//   · version   : '1' fijo. Si el catálogo cambia de forma incompatible se bumpea y los tokens
//                 viejos se descartan (decodificarConfig → null → arranque limpio).
//   · modelo    : id de MODELOS (N1..N7).
//   · uso       : 1 letra (USO_COD); '' si no hay.
//   · ocupantes : entero; '' si null.
//   · bano      : 'e' estandar | 'a' ampliado.
//   · camas     : secuencia de letras C/S/M en orden (ej "CSS"); '' si no hay.
//   · extrasMask: bitmask en base36 de los ÍNDICES seleccionados de EXTRAS. Compacto pero RÍGIDO al
//                 ORDEN de EXTRAS — reordenar o insertar en EXTRAS es un cambio incompatible que
//                 EXIGE bumpear VERSION (si no, tokens viejos decodifican los extras equivocados →
//                 precio equivocado). Los links son efímeros (cliente → asesor, mismo día), así que
//                 el versionado alcanza como frontera.
//
// DECODIFICAR ES FRONTERA DE CONFIANZA: el token viene de una URL pública (input NO confiable, igual
// que el localStorage adulterado de T-03-01). Cada valor se valida contra el catálogo; lo desconocido
// se descarta en silencio. El resultado se mergea sobre estadoInicial (todas las claves presentes) y
// el hook lo vuelve a pasar por esEstadoValido antes de confiar en él.
import { EXTRAS } from '../data/extras.js'
import { MODELOS } from '../data/models.js'
import { estadoInicial, TOTAL_PASOS } from '../state/wizardReducer.js'

const VERSION = '1'
const USO_COD = { contratista: 'c', ganadero: 'g', agricola: 'a', vivienda: 'v', otro: 'o' }
const USO_DECOD = Object.fromEntries(Object.entries(USO_COD).map(([k, v]) => [v, k]))
const BANO_COD = { estandar: 'e', ampliado: 'a' }
const BANO_DECOD = { e: 'estandar', a: 'ampliado' }
const TIPOS_CAMA = new Set(['C', 'S', 'M'])
const MODELO_IDS = new Set(MODELOS.map((m) => m.id))

// codificarConfig(estado): estado → token compacto. Tolerante a estado parcial/adulterado (usa
// defaults seguros); NUNCA lanza.
export function codificarConfig(estado) {
  const modelo = MODELO_IDS.has(estado?.modeloId) ? estado.modeloId : ''
  const uso = USO_COD[estado?.uso] ?? ''
  const ocupantes = Number.isInteger(estado?.ocupantes) ? String(estado.ocupantes) : ''
  const bano = BANO_COD[estado?.bano?.tamano] ?? 'e'
  const camas = Array.isArray(estado?.dormitorio?.camas)
    ? estado.dormitorio.camas
        .map((c) => c?.tipo)
        .filter((t) => TIPOS_CAMA.has(t))
        .join('')
    : ''
  const seleccionados = Array.isArray(estado?.extras) ? estado.extras : []
  let mask = 0
  EXTRAS.forEach((e, i) => {
    if (seleccionados.includes(e.id)) mask |= 1 << i
  })
  return [VERSION, modelo, uso, ocupantes, bano, camas, mask.toString(36)].join('-')
}

// decodificarConfig(token): token → estado COMPLETO (mergeado sobre estadoInicial) o null si el
// token es inválido/incompatible. pasoActual se fija al último paso: así el estado es válido para el
// wizard si el asesor toca "Editar", y App lo abre directo en el resumen.
export function decodificarConfig(token) {
  if (typeof token !== 'string' || token.length === 0) return null
  const partes = token.split('-')
  if (partes.length !== 7) return null
  const [version, modelo, usoCod, ocupCod, banoCod, camasCod, maskCod] = partes
  if (version !== VERSION) return null
  if (!MODELO_IDS.has(modelo)) return null // el modelo es la clave mínima (deriva largo, precio, plano)

  const uso = USO_DECOD[usoCod] ?? null
  const ocupantes = /^\d+$/.test(ocupCod) ? Number(ocupCod) : null
  const tamano = BANO_DECOD[banoCod] ?? 'estandar'
  const camas = [...camasCod].filter((t) => TIPOS_CAMA.has(t)).map((tipo) => ({ tipo }))
  const mask = /^[0-9a-z]+$/.test(maskCod) ? parseInt(maskCod, 36) : 0
  if (!Number.isFinite(mask)) return null
  const extras = EXTRAS.filter((_, i) => (mask & (1 << i)) !== 0).map((e) => e.id)

  return {
    ...estadoInicial,
    pasoActual: TOTAL_PASOS - 1,
    uso,
    ocupantes,
    modeloId: modelo,
    bano: { tamano },
    dormitorio: { camas },
    extras,
  }
}

// enlaceConfigApp(estado): URL absoluta al configurador con la config embebida. En el navegador usa
// el origin real del deploy (sin hardcodear el dominio de Vercel); en node (tests) cae a ruta
// relativa. Es lo que se pega en el mensaje de WhatsApp.
export function enlaceConfigApp(estado) {
  const origen =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''
  return `${origen}/?c=${codificarConfig(estado)}`
}
