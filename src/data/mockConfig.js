// Configs mock del prop `config` que consumen FloorPlan (Plan 02) y la demo (Plan 03).
// En Fase 2 el wizard todavía no existe: estas configs simulan su salida.
//
// FORMA DEL PROP `config` (contrato que las fases del wizard deberán producir):
//
//   {
//     modeloId: 'N4',          // referencia a MODELOS[].id; el largo total se deriva del modelo
//     largo: 6.6,              // largo total en metros (coherente con el modelo; explícito para el plano)
//     bano:       { tamano: 'estandar' },                       // 'estandar' | 'ampliado'
//     dormitorio: { camas: [{ tipo: 'C' }, { tipo: 'S' }] },    // tipo: 'C' cucheta | 'S' simple | 'M' matrimonial
//     cocina:     { horno: false, heladera: null },
//     estar:      { mesa: false },
//   }
//
// El largo NUNCA se inventa: se deriva de MODELOS para mantener coherencia con el modelo real.

import { MODELOS } from './models.js'

// Largo real de un modelo por id (fuente de verdad: MODELOS, sin literales).
function largoDeModelo(modeloId) {
  const modelo = MODELOS.find((m) => m.id === modeloId)
  if (!modelo) throw new Error(`Modelo desconocido: ${modeloId}`)
  return modelo.largo
}

// Genera la lista de camas base según camasBase del modelo.
// Criterio mock: para N4 (4 camas) usamos 2 cuchetas (C) + 2 simples (S) repartidas en las dos paredes;
// para N1 (2 camas) usamos 2 simples (S). Modelos personalizables (camasBase null) quedan con [].
function camasBase(modeloId) {
  const modelo = MODELOS.find((m) => m.id === modeloId)
  const n = modelo?.camasBase
  if (!n) return []
  if (n >= 4) return [{ tipo: 'C' }, { tipo: 'C' }, { tipo: 'S' }, { tipo: 'S' }]
  if (n === 3) return [{ tipo: 'C' }, { tipo: 'S' }, { tipo: 'S' }]
  return [{ tipo: 'S' }, { tipo: 'S' }]
}

function crearConfigMock(modeloId, overrides = {}) {
  return {
    modeloId,
    largo: largoDeModelo(modeloId),
    bano: { tamano: 'estandar' },
    dormitorio: { camas: camasBase(modeloId) },
    cocina: { horno: false, heladera: null },
    estar: { mesa: false },
    ...overrides,
  }
}

// Config principal de la fase: N4 (6.60m, 4 camas).
export const CONFIG_MOCK_N4 = crearConfigMock('N4')

// Config N1 (4.50m, 2 camas) para que la demo del Plan 03 cicle entre modelos.
export const CONFIG_MOCK_N1 = crearConfigMock('N1')

// Lista de configs para ciclar en la demo (al menos N1 y N4).
export const CONFIGS_MOCK = [CONFIG_MOCK_N1, CONFIG_MOCK_N4]
