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
import { estadoInicial, wizardReducer, ACCIONES } from '../state/wizardReducer.js'

// Key EXACTA del almacenamiento (constante única, sin variaciones).
export const STORAGE_KEY = 'impacar_config_v1'

// Valida que el estado restaurado tenga la forma mínima esperada del wizard.
// Mitiga T-03-01: si está adulterado/corrupto, se descarta y se vuelve a estadoInicial.
function esEstadoValido(valor) {
  return (
    valor !== null &&
    typeof valor === 'object' &&
    typeof valor.pasoActual === 'number' &&
    typeof valor.modeloId === 'string'
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
