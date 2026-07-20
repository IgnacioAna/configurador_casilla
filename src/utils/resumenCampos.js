// resumenCampos(estado) — traduce el estado del wizard a labels legibles para la pantalla de
// resumen (Plan 06-03) y el cuerpo del mensaje WhatsApp (Plan 06-02). Funcion PURA, sin React/DOM.
// RESUMEN-01. Anti-hardcodeo: lee de /data (MODELOS.find, EXTRAS.filter); los conjuntos de UI
// (USOS, TIPOS) se duplican abajo porque no estan exportados desde los pasos (ver comentario).
//
// Shape de salida (claves estables):
//   {
//     uso:       string legible | 'Sin selección'
//     ocupantes: number/string  | 'Sin selección'
//     modelo:    'Nx'           | 'Modelo no disponible'
//     largo:     'X,Y m'        | 'Sin selección'
//     bano:      'Estándar' | 'Ampliado' | 'Sin selección'
//     camas:     texto legible  | 'Sin camas seleccionadas'
//     cocina:    texto legible (horno/heladera/mesa) | 'Sin accesorios de cocina'
//     extras:    Array<string>  (nombres de confort/energia; [] = el consumidor muestra 'Sin selección')
//   }
//
// Degradacion elegante (UI-SPEC + Pitfall 7): campo faltante/null → 'Sin selección', NUNCA undefined
// / '' / 'null'. Tolera estado adulterado de localStorage (Array.isArray + optional chaining), patron
// de configDesdeEstado (wizardReducer) y calcularPresupuesto.
import { MODELOS } from '../data/models.js'
import { EXTRAS } from '../data/extras.js'

// Conjunto de UI duplicado de PasoUso.jsx (no esta exportado) — mantener sincronizado.
const USOS = [
  { id: 'contratista', label: 'Contratista rural' },
  { id: 'ganadero', label: 'Ganadero' },
  { id: 'agricola', label: 'Agrícola' },
  { id: 'vivienda', label: 'Vivienda' },
  { id: 'otro', label: 'Otro' },
]

// Conjunto de UI duplicado de PasoDormitorio.jsx (no esta exportado) — mantener sincronizado.
const TIPOS = [
  { tipo: 'C', label: 'Cucheta marinera (C)', singular: 'cucheta' },
  { tipo: 'S', label: 'Cama simple (S)', singular: 'cama simple' },
  { tipo: 'M', label: 'Matrimonial (M)', singular: 'matrimonial' },
]

const SIN_SELECCION = 'Sin selección'
// Fallbacks específicos: dormitorio y cocina son zonas fijas de la casilla; lo que falta son las
// camas/accesorios, no el ambiente. 'Sin selección' se leería como error del sistema en el presupuesto.
const SIN_CAMAS = 'Sin camas seleccionadas'
const SIN_ACCESORIOS_COCINA = 'Sin accesorios de cocina'

export function resumenCampos(estado) {
  const modelo = MODELOS.find((m) => m.id === estado?.modeloId)
  const extras = Array.isArray(estado?.extras) ? estado.extras : []
  const camas = Array.isArray(estado?.dormitorio?.camas) ? estado.dormitorio.camas : []

  // Uso (de USOS, anti-hardcodeo) → label, o 'Sin selección'.
  const uso = USOS.find((u) => u.id === estado?.uso)?.label ?? SIN_SELECCION

  // Modelo + largo (de MODELOS). Modelo ausente → 'Modelo no disponible' y largo 'Sin selección'.
  const modeloLabel = modelo?.nombre ?? 'Modelo no disponible'
  const largo = modelo ? `${String(modelo.largo).replace('.', ',')} m` : SIN_SELECCION

  // Ocupantes: arranca null en estadoInicial → 'Sin selección'.
  const ocupantes = estado?.ocupantes ?? SIN_SELECCION

  // Baño: 'estandar' | 'ampliado' → labels verbatim de PasoBano, o 'Sin selección'.
  const bano =
    estado?.bano?.tamano === 'ampliado'
      ? 'Ampliado'
      : estado?.bano?.tamano === 'estandar'
        ? 'Estándar'
        : SIN_SELECCION

  // Camas: contar por tipo (mismo helper que PasoDormitorio) y armar texto con los tipos presentes.
  const partesCamas = TIPOS
    .map((t) => ({ ...t, n: camas.filter((c) => c?.tipo === t.tipo).length }))
    .filter((t) => t.n > 0)
    .map((t) => `${t.n} ${t.singular}${t.n > 1 ? 's' : ''}`)
  const camasTexto = partesCamas.length > 0 ? partesCamas.join(', ') : SIN_CAMAS

  // Cocina/estar: derivar de extras[] (misma fuente que configDesdeEstado) traduciendo a nombres
  // reales de TODOS los accesorios categoria 'cocina' de EXTRAS (anti-hardcodeo: incluye horno,
  // heladeras, mesa-cano y banco-despensero — WR-01). Recorrer EXTRAS en su orden de catálogo y
  // filtrar por extras.includes garantiza que solo entren ids válidos: un id desconocido en extras[]
  // (p.ej. localStorage de una versión vieja) nunca produce 'undefined' en el texto (WR-02).
  const partesCocina = EXTRAS
    .filter((e) => e.categoria === 'cocina' && extras.includes(e.id))
    .map((e) => e.nombre)
    .filter(Boolean)
  const cocina = partesCocina.length > 0 ? partesCocina.join(', ') : SIN_ACCESORIOS_COCINA

  // Extras de confort/energia (categoria 'extras') → nombres reales (anti-hardcodeo).
  const extrasNombres = EXTRAS
    .filter((e) => e.categoria === 'extras' && extras.includes(e.id))
    .map((e) => e.nombre)

  return {
    uso,
    ocupantes,
    modelo: modeloLabel,
    largo,
    bano,
    camas: camasTexto,
    cocina,
    extras: extrasNombres,
  }
}
