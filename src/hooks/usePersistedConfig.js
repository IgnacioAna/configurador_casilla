// Hook que envuelve useReducer con persistencia en localStorage. Restaura el estado del wizard
// al montar (SHELL-03: retoma donde quedó al recargar), lo guarda en cada cambio bajo la key
// EXACTA impacar_config_v1, y expone reiniciar() para "Volver a empezar" (SHELL-04: resetea el
// estado Y borra la key).
//
// Robustez (threat model 03-01):
//  - T-03-01 (Tampering): el JSON restaurado se valida (objeto con pasoActual y modeloId); si está
//    corrupto/adulterado o el parse falla, se descarta y se usa estadoInicial. No se confía
//    ciegamente en el contenido del almacenamiento.
//  - T-03-03 (DoS): setItem/getItem/removeItem van dentro de try/catch; si la cuota se excede o el
//    almacenamiento no está disponible (modo privado/SSR), la app sigue en memoria sin romper.
import { useEffect, useReducer } from 'react'
import { estadoInicial, wizardReducer, ACCIONES, TOTAL_PASOS } from '../state/wizardReducer.js'

// Key EXACTA del almacenamiento (constante única, sin variaciones).
export const STORAGE_KEY = 'impacar_config_v1'

// Valida que el estado restaurado tenga la forma mínima esperada del wizard.
// Mitiga T-03-01 / T-04-01 / T-04-09: si está adulterado/corrupto O incompleto (le faltan claves
// que los pasos consumen sin fallback), se descarta y se vuelve a estadoInicial. Verificar solo
// pasoActual+modeloId no alcanzaba: un estado parcial { pasoActual, modeloId } pasaba la validación
// y luego PasoBano/PasoDimensiones crasheaban al leer estado.bano.tamano / estado.extras.includes()
// (CR-01: pantalla blanca). Por eso también se exige bano (objeto) y extras (array): la frontera de
// confianza protege a TODOS los componentes en un solo lugar.
// CR-01 (code review 05): pasoActual además debe ser un entero EN RANGO [0, TOTAL_PASOS). Un
// pasoActual adulterado fuera de rango (p.ej. 99) pasaba la validación de "es number" y luego
// PASOS[99] === undefined hacía que ConfiguratorWizard tirara TypeError al leer Paso.Componente.
// WR-03 (code review 05): también se valida dormitorio (objeto con camas array). PasoDormitorio se
// defiende hoy con optional chaining (estado.dormitorio?.camas), pero la frontera de confianza
// promete proteger a TODOS los componentes en un solo lugar: un futuro consumidor que lea
// estado.dormitorio.camas sin fallback crasharía con estado adulterado. Se honra la garantía aquí.
export function esEstadoValido(valor) {
  return (
    valor !== null &&
    typeof valor === 'object' &&
    Number.isInteger(valor.pasoActual) &&
    valor.pasoActual >= 0 &&
    valor.pasoActual < TOTAL_PASOS &&
    typeof valor.modeloId === 'string' &&
    valor.bano !== null &&
    typeof valor.bano === 'object' &&
    Array.isArray(valor.extras) &&
    valor.dormitorio !== null &&
    typeof valor.dormitorio === 'object' &&
    Array.isArray(valor.dormitorio.camas)
  )
}

// Lazy initializer de useReducer: restaura el estado desde localStorage si hay una config válida
// guardada; en cualquier caso de error (parse, validación, storage no disponible) cae a estadoInicial.
function cargarEstado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (!guardado) return estadoInicial
    const parseado = JSON.parse(guardado)
    return esEstadoValido(parseado) ? parseado : estadoInicial
  } catch {
    // localStorage no disponible (modo privado/SSR) o JSON corrupto: arrancar limpio.
    return estadoInicial
  }
}

// Hook principal: { estado, dispatch, reiniciar }.
export function usePersistedConfig() {
  // Lazy init para restaurar al montar (SHELL-03). El doble montaje de StrictMode es inocuo:
  // cargarEstado es una lectura pura y el efecto de guardado es idempotente.
  const [estado, dispatch] = useReducer(wizardReducer, undefined, cargarEstado)

  // Guarda en cada cambio de estado bajo la key impacar_config_v1 (SHELL-03).
  // El setItem es idempotente (escribe el mismo JSON ante el mismo estado) -> seguro bajo StrictMode.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
    } catch {
      // Cuota excedida o storage no disponible (T-03-03): seguir en memoria sin romper.
    }
  }, [estado])

  // "Volver a empezar" (SHELL-04): borra la key y resetea al estado inicial.
  const reiniciar = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage no disponible: igual reseteamos el estado en memoria.
    }
    dispatch({ type: ACCIONES.RESET })
  }

  return { estado, dispatch, reiniciar }
}
