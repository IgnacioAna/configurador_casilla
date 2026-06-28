// Helper PURO de layout del plano en planta. Traduce un `config` (forma en data/mockConfig.js)
// a coordenadas en unidades de viewBox, leyendo TODA la geometría real de data/geometry.js.
// No hardcodea medidas: el render (Plan 02) y la transición (Plan 03) consumen estas salidas.
//
// Sistema de coordenadas (UI-SPEC, "Sistema de coordenadas SVG"):
//   - factor único 100 unidades de viewBox = 1 metro (uniforme en X e Y, sin distorsión)
//   - el largo va en X (horizontal); el ancho 2.60m exterior va en Y (vertical)
//   - origen arriba-izquierda (convención SVG)
//   - estructura fija de zonas a lo largo de X: baulera | baño | dormitorio | estar | cocina
import { GEOMETRIA } from '../data/geometry.js'

// 100 unidades de viewBox = 1 metro (factor único; ver UI-SPEC "Escala metros→unidades").
export const M_A_U = 100

// Padding lateral del viewBox reservado para las líneas de cota (línea + ticks + texto fontSize 10).
// 26u por lado: con 12u el texto rotado de la cota izquierda y las cotas superiores se salían del
// viewBox y el <svg> los recortaba (overflow hidden). 26u deja margen para todas las cotas.
export const PAD = 26

// Reparto del largo restante (lo que sobra tras baulera + cocina fijas) entre los 3 ambientes
// centrales. Documentado como constantes nombradas (no medidas físicas, son ratios de reparto).
// El baño SIEMPRE va entre baulera y dormitorio (orden inmutable, no elegible).
// El ratio del baño depende de config.bano.tamano (BANO-03): 'ampliado' agranda la zona baño.
const RATIO_BANO_ESTANDAR = 0.22
const RATIO_BANO_AMPLIADO = 0.3 // ≈ UI-SPEC; verificado por test: N3 ampliado deja zonas centrales > 0
const RATIO_DORMITORIO = 0.45
// El ratio del estar deja de ser constante fija: el estar absorbe el residuo (suma exacta).

// Mínimo plausible (en metros) para que los 3 ambientes centrales tengan ancho positivo.
const MINIMO_CENTRAL = 0.4

// Tokens de relleno por zona (UI-SPEC "Rellenos de zona").
const FILL = {
  baulera: '#ECECE4',
  bano: '#BFE3EE',
  dormitorio: '#C9A66B',
  estar: '#ECECE4',
  cocina: '#A7C796',
}

const ETIQUETA = {
  baulera: 'BAULERA',
  bano: 'BAÑO',
  dormitorio: 'DORMITORIO',
  estar: 'ESTAR',
  cocina: 'COCINA',
}

// Espesor de pared por lado = (exterior - interior) / 2 (en metros). De ahí sale el borde interior.
function espesorPared() {
  return (GEOMETRIA.anchoExterior - GEOMETRIA.anchoInterior) / 2
}

/**
 * Calcula el layout del plano a partir del config.
 * @param {object} config — forma documentada en data/mockConfig.js
 * @returns {{ valido: boolean, zonas?, camas?, viewBox?, totalU?, anchoU?, pad? }}
 */
export function calcularLayout(config) {
  // --- Validación (T-02-01): nunca devolver zonas de ancho negativo. ---
  if (!config || typeof config.largo !== 'number' || !Number.isFinite(config.largo)) {
    return { valido: false }
  }
  const minimoTotal = GEOMETRIA.zonaBaulera + GEOMETRIA.zonaCocina + MINIMO_CENTRAL
  if (config.largo < minimoTotal) {
    return { valido: false }
  }

  // --- Reparto del largo (en metros) a lo largo de X. ---
  // El optional chaining es OBLIGATORIO (T-04-02): si bano falta o tamano no es 'ampliado',
  // cae a estándar (default seguro, tolera estado parcial/adulterado de localStorage).
  const ratioBano =
    config?.bano?.tamano === 'ampliado' ? RATIO_BANO_AMPLIADO : RATIO_BANO_ESTANDAR
  const restante = config.largo - GEOMETRIA.zonaBaulera - GEOMETRIA.zonaCocina
  const largoBano = restante * ratioBano
  const largoDormitorio = restante * RATIO_DORMITORIO
  // El estar absorbe el redondeo para que la suma cierre exacta contra config.largo.
  const largoEstar = restante - largoBano - largoDormitorio
  // Invariante de producción (WR-01): el estar nunca puede ser <= 0. El guard de `minimoTotal`
  // valida el largo bruto, pero no protege contra un futuro cambio de ratios cuya suma supere 1
  // (lo que volvería negativo/degenerado al estar silenciosamente). Codificamos el invariante
  // post-cálculo: si los ratios rompen el reparto, devolvemos inválido en lugar de zonas negativas.
  if (largoEstar <= 0) {
    return { valido: false }
  }

  // Orden fijo e inmutable (UI-SPEC). El baño SIEMPRE entre baulera y dormitorio.
  const orden = [
    { id: 'baulera', largoM: GEOMETRIA.zonaBaulera },
    { id: 'bano', largoM: largoBano },
    { id: 'dormitorio', largoM: largoDormitorio },
    { id: 'estar', largoM: largoEstar },
    { id: 'cocina', largoM: GEOMETRIA.zonaCocina },
  ]

  // --- Construir zonas en unidades de viewBox, con x acumulado desde el origen del dibujo. ---
  // El padding de cotas (PAD) se aplica en el render vía un <g transform> / viewBox negativo,
  // no en estas coordenadas: así zonas y camas comparten el mismo origen (0,0) del interior.
  const zonas = []
  let cursorX = 0
  for (const z of orden) {
    const anchoU = z.largoM * M_A_U
    zonas.push({
      id: z.id,
      etiqueta: ETIQUETA[z.id],
      x: cursorX,
      anchoU,
      largoM: z.largoM,
      fill: FILL[z.id],
    })
    cursorX += anchoU
  }

  // --- Camas del dormitorio: 2 filas contra cada pared larga + pasillo central. ---
  const zonaDormitorio = zonas.find((z) => z.id === 'dormitorio')
  const bordeInteriorSuperior = espesorPared() * M_A_U // y del interior útil arriba (desde el origen)
  const altoCama = GEOMETRIA.anchoCama * M_A_U
  const largoCamaU = GEOMETRIA.largoCama * M_A_U
  const yFilaSuperior = bordeInteriorSuperior
  const yFilaInferior = bordeInteriorSuperior + altoCama + GEOMETRIA.pasilloCentral * M_A_U
  const xCamas = zonaDormitorio.x // las camas corren desde el inicio de la zona dormitorio

  const camasConfig = Array.isArray(config?.dormitorio?.camas) ? config.dormitorio.camas : []
  const camas = camasConfig.map((cama, i) => ({
    x: xCamas,
    // Alternar fila superior / inferior según índice par/impar.
    y: i % 2 === 0 ? yFilaSuperior : yFilaInferior,
    w: largoCamaU,
    h: altoCama,
    tipo: cama.tipo,
  }))

  // --- viewBox: dibujo (totalU x anchoU) + padding de cotas a cada lado (UI-SPEC). ---
  const totalU = config.largo * M_A_U
  const anchoU = GEOMETRIA.anchoExterior * M_A_U
  const viewBox = `0 0 ${totalU + PAD * 2} ${anchoU + PAD * 2}`

  return { valido: true, zonas, camas, viewBox, totalU, anchoU, pad: PAD }
}
