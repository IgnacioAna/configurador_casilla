---
phase: 4
slug: 04-pasos-1-3-uso-dimensiones-ba-o
status: verified
threats_total: 10
threats_open: 0
threats_closed: 10
asvs_level: 1
created: 2026-06-27
---

# Fase 4 — Seguridad: Pasos 1-3 (Uso / Dimensiones / Baño)

> Contrato de seguridad por fase: registro de amenazas, riesgos aceptados y auditoría.

---

## Fronteras de confianza

| Frontera | Descripción | Datos que cruzan |
|----------|-------------|------------------|
| localStorage → app | El estado restaurado bajo la clave `impacar_config_v1` es entrada NO confiable. El usuario puede editarlo en DevTools. | `modeloId`, `bano.tamano`, `ocupantes`, `extras` (pueden estar adulterados). |

La frontera se reforzó en el fix CR-01 (commit `ab59f3f`): `esEstadoValido` en
`src/hooks/usePersistedConfig.js` exige ahora que `bano` sea un objeto no nulo y que `extras`
sea un array. Un estado parcial o adulterado se descarta y se cae a `estadoInicial` antes de que
ningún componente lo consuma.

---

## Registro de amenazas

| ID | Categoría | Componente | Disposición | Mitigación implementada | Estado |
|----|-----------|------------|-------------|-------------------------|--------|
| T-04-01 | Tampering | `permiteBanoAmpliado(modeloId)` con modeloId adulterado | mitigate | `banoReglas.js:10-11`: `MODELOS.find((m) => m.id === modeloId)` + `(modelo?.largo ?? 0) >= LARGO_MIN_BANO_AMPLIADO`. Id inexistente → `find` retorna `undefined` → `0 >= 6.1` → `false`. Nunca crashea. | CLOSED |
| T-04-02 | DoS | `calcularLayout` con `bano` ausente o `tamano` inválido | mitigate | `floorplanLayout.js:70-71`: `config?.bano?.tamano === 'ampliado'` con encadenamiento opcional. Todo valor que no sea `'ampliado'` cae a `RATIO_BANO_ESTANDAR`. La guarda `{ valido: false }` (líneas 59-65) se conserva intacta para largo imposible. | CLOSED |
| T-04-03 | Tampering / XSS | Inyección de XSS vía valores del estado en componentes | accept | Ver Riesgos Aceptados — AR-04-01. | CLOSED |
| T-04-04 | Tampering | `PasoDimensiones` resaltando un `modeloId` adulterado | mitigate | `PasoDimensiones.jsx:36`: `const seleccionado = estado.modeloId === m.id` itera sobre la lista real `MODELOS`. Un id desconocido nunca coincide con ningún `m.id`; ninguna card se resalta. `esSugerido` (línea 39) usa acceso por clave que devuelve `undefined` para claves inexistentes. | CLOSED |
| T-04-05 | Tampering | `SUGERENCIA_OCUPANTES[estado.ocupantes]` con ocupantes adulterado | mitigate | `PasoUso.jsx:92-93`: `const sugerido = SUGERENCIA_OCUPANTES[n]; if (sugerido) dispatch(...)`. Guardia antes del dispatch. `PasoUso.jsx:163`: `estado.ocupantes && SUGERENCIA_OCUPANTES[estado.ocupantes] && (...)` antes de renderizar el panel de sugerencia. `PasoDimensiones.jsx:39`: comparación con `undefined` resulta en `false`, sin crash. | CLOSED |
| T-04-06 | Info / XSS | Render de copys y metadatos en PasoUso/PasoDimensiones | accept | Ver Riesgos Aceptados — AR-04-02. | CLOSED |
| T-04-07 | Tampering | `PasoBano` habilitando "Ampliado" con `modeloId` adulterado | mitigate | `PasoBano.jsx:27`: `const ampliadoHabilitado = permiteBanoAmpliado(estado.modeloId)`. `PasoBano.jsx:88`: `disabled={!ampliadoHabilitado}`. Id adulterado → helper devuelve `false` → botón queda `disabled` por defecto. | CLOSED |
| T-04-08 | Tampering | `estado.extras` con ids de extra inexistentes | mitigate | `PasoBano.jsx:15`: `EXTRAS.filter((e) => e.categoria === 'bano')` produce lista controlada. El bucle de render itera solo sobre esa lista. `PasoBano.jsx:45`: `.includes(e.id)` corre para ids controlados únicamente; un id basura en `extras[]` no genera UI, solo afecta un booleano inocuo. | CLOSED |
| T-04-09 | DoS | `bano.tamano` con valor inválido propagado al plano | mitigate | `floorplanLayout.js:70-71`: igualdad estricta `=== 'ampliado'`. Cualquier otro valor (`undefined`, `null`, cadena arbitraria) cae a ratio estándar, sin romper la suma ni la guarda `valido: false`. | CLOSED |
| T-04-10 | Info / XSS | Render de nombres de equipamiento y copys en PasoBano | accept | Ver Riesgos Aceptados — AR-04-03. | CLOSED |

---

## Riesgos aceptados

| ID de riesgo | Amenaza ref. | Justificación | Aceptado por | Fecha |
|--------------|-------------|---------------|--------------|-------|
| AR-04-01 | T-04-03 | El layout produce solo números e ids controlados. Los textos renderizados en PasoUso/PasoDimensiones provienen de constantes locales (`USOS`, `OCUPANTES`) o de `/data` controlado (`MODELOS`, `SUGERENCIA_OCUPANTES`). React escapa el contenido de texto por defecto. No existe ningún uso de `dangerouslySetInnerHTML` en ningún archivo de la fase. Sin vía de inyección. | Auditor (agente GSD) | 2026-06-27 |
| AR-04-02 | T-04-06 | Mismo fundamento que AR-04-01: todos los copys y metadatos de PasoUso y PasoDimensiones son literales hardcodeados o derivados de `/data`; React escapa por defecto. Sin `dangerouslySetInnerHTML`. | Auditor (agente GSD) | 2026-06-27 |
| AR-04-03 | T-04-10 | Los nombres de equipamiento (`e.nombre`) provienen de `src/data/extras.js`, archivo bajo control de versiones. React escapa el contenido. Sin `dangerouslySetInnerHTML` en PasoBano. | Auditor (agente GSD) | 2026-06-27 |

---

## Notas de auditoría

### CR-01: Refuerzo de la frontera de confianza (fix incluido en la fase)

Durante la revisión de código de esta fase se detectó que un estado parcial en localStorage
(por ejemplo `{ pasoActual: 2, modeloId: 'N4' }` sin `bano` ni `extras`) pasaba la validación
anterior de `esEstadoValido` y causaba pantalla blanca al intentar leer `estado.bano.tamano` en
`PasoBano` y `estado.extras.includes()` en el toggle de equipamiento.

El fix (commit `ab59f3f`) endureció `esEstadoValido` en `src/hooks/usePersistedConfig.js:25-35`
para exigir adicionalmente:

- `valor.bano !== null && typeof valor.bano === 'object'`
- `Array.isArray(valor.extras)`

Esto concentra toda la defensa contra estado adulterado/incompleto en un único punto de entrada
(la frontera de confianza de localStorage), en lugar de dispersar guardias en cada componente.

Tests de regresión: `src/hooks/usePersistedConfig.test.js` — 6 casos cubriendo el estado inicial
válido, un estado restaurado completo válido, y los tres escenarios de crash (sin bano/extras,
bano nulo, extras no-array), más los casos de validación básica preexistentes.

### Flags sin registro de amenaza (SUMMARY.md)

Los tres archivos SUMMARY de esta fase no contienen una sección `## Threat Flags` con superficie
de ataque nueva sin mapeo. La única observación de seguridad registrada por el executor es el
CR-01 descrito arriba, que queda cubierto por la familia T-04-01 / T-04-02 / T-04-07 / T-04-09.
No se identificaron flags sin registro.

---

## Historial de auditoría

| Fecha | Total amenazas | Cerradas | Abiertas | Ejecutado por |
|-------|---------------|----------|----------|---------------|
| 2026-06-27 | 10 | 10 | 0 | Auditor de seguridad GSD (Claude Sonnet 4.6) |

---

## Firma

- [x] Todas las amenazas tienen disposición (mitigate / accept / transfer)
- [x] Riesgos aceptados documentados en el Registro de riesgos aceptados
- [x] `threats_open: 0` confirmado
- [x] `status: verified` establecido en el frontmatter

**Aprobación:** verified 2026-06-27
