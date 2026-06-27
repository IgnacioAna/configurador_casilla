// Reducer central del wizard (useReducer). Única fuente de verdad del estado de configuración
// MÁS el estado de navegación (pasoActual). No renderiza UI: entrega el contrato que consumen
// el hook de persistencia (usePersistedConfig) y los planes 02/03 de esta fase.
//
// configDesdeEstado(estado) proyecta este estado a la forma `config` EXACTA que consume
// FloorPlan (ver src/components/FloorPlan.jsx + src/data/mockConfig.js). El `largo` NUNCA se
// hardcodea: se deriva de MODELOS por modeloId (fuente de verdad: src/data/models.js).
import { MODELOS } from '../data/models.js'

// Total de pasos del wizard (uso/ocupantes, dimensiones, baño, dormitorio, cocina/estar, extras).
// pasoActual se acota siempre a [0, TOTAL_PASOS - 1].
export const TOTAL_PASOS = 6

// Estado inicial del wizard: campos de configuración + estado de navegación.
//
// NOTA: los pasos 1-6 llenan estos campos (uso, ocupantes, camas, equipamiento, extras) en las
// Fases 4-5. En esta fase solo se inicializan a valores neutros. modeloId arranca en 'N4' a
// propósito: garantiza que el plano renderice un croquis válido desde el arranque (largo 6.6m
// derivado de MODELOS) aunque ningún paso haya llenado nada todavía.
export const estadoInicial = {
  // --- Navegación ---
  pasoActual: 0,
  // --- Configuración (la llenan los pasos 1-6 en Fases 4-5) ---
  uso: null,
  ocupantes: null,
  modeloId: 'N4',
  bano: { tamano: 'estandar' }, // 'estandar' | 'ampliado'
  dormitorio: { camas: [] }, // Array<{ tipo: 'C' | 'S' | 'M' }>
  cocina: { horno: false, heladera: null }, // heladera: null | string
  estar: { mesa: false },
  extras: [], // Array<string> (ids de accesorios; los carga el Paso 6)
}

// Tipos de acción del reducer. Strings explícitos para evitar typos silenciosos.
export const ACCIONES = {
  SET_CAMPO: 'SET_CAMPO', // { campo, valor } — actualiza un campo de config por clave
  SIGUIENTE: 'SIGUIENTE', // avanza pasoActual (acotado a TOTAL_PASOS - 1)
  ANTERIOR: 'ANTERIOR', // retrocede pasoActual (acotado a 0)
  IR_A_PASO: 'IR_A_PASO', // { paso } — salta a un paso (acotado al rango)
  RESET: 'RESET', // vuelve a estadoInicial (para "Volver a empezar")
}

// Acota un número de paso al rango válido [0, TOTAL_PASOS - 1].
function acotarPaso(paso) {
  return Math.max(0, Math.min(paso, TOTAL_PASOS - 1))
}

// Devuelve una copia fresca de estadoInicial con los objetos anidados clonados, para que un
// RESET no comparta referencias mutables con el estadoInicial exportado (evita contaminación).
function copiaEstadoInicial() {
  return {
    ...estadoInicial,
    bano: { ...estadoInicial.bano },
    dormitorio: { ...estadoInicial.dormitorio, camas: [...estadoInicial.dormitorio.camas] },
    cocina: { ...estadoInicial.cocina },
    estar: { ...estadoInicial.estar },
    extras: [...estadoInicial.extras],
  }
}

// Reducer puro: dado un estado y una acción, devuelve el nuevo estado (sin mutar el anterior).
export function wizardReducer(estado, accion) {
  switch (accion.type) {
    case ACCIONES.SET_CAMPO:
      return { ...estado, [accion.campo]: accion.valor }
    case ACCIONES.SIGUIENTE:
      return { ...estado, pasoActual: acotarPaso(estado.pasoActual + 1) }
    case ACCIONES.ANTERIOR:
      return { ...estado, pasoActual: acotarPaso(estado.pasoActual - 1) }
    case ACCIONES.IR_A_PASO:
      return { ...estado, pasoActual: acotarPaso(accion.paso) }
    case ACCIONES.RESET:
      return copiaEstadoInicial()
    default:
      return estado
  }
}

// Proyecta el estado del wizard a la forma `config` EXACTA que consume FloorPlan.
// El largo se deriva de MODELOS por modeloId (nunca se inventa); si el modelo no existe,
// largo queda undefined y el plano cae a su estado Error (degradación elegante).
// NO se incluyen pasoActual ni extras: el plano no los lee.
export function configDesdeEstado(estado) {
  const largo = MODELOS.find((m) => m.id === estado.modeloId)?.largo
  return {
    modeloId: estado.modeloId,
    largo,
    bano: estado.bano,
    dormitorio: estado.dormitorio,
    cocina: estado.cocina,
    estar: estado.estar,
  }
}
