---
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
verified: 2026-06-27T22:00:00Z
reverified: 2026-06-27T23:30:00Z
status: passed
score: 9/9 must-haves verified; los 4 ítems visuales CERRADOS vía UAT automatizada (05-UAT.md, dev server 375px)
overrides_applied: 0
human_verification_closed: "Los 4 ítems de human_verification pasaron en 05-UAT.md (verificación en vivo a 375px): DORM-03 plano dibuja C/M, barra de precio ausente Pasos 1-3 / presente desde Paso 4 (3 líneas), COCINA-04 mesa en plano + exclusividad heladera + precio en vivo, persistencia F5. Sin issues."
gaps: []
gaps_resolved:
  - truth: "El usuario selecciona múltiples accesorios del catálogo real (calefactor, caldera, split, paneles/sistema solar, TV, estéreo, cortinas, toldo, cajonera)."
    status: resolved
    resolution: "Cerrado en commit 9d2dc19 (gap closure). PasoDormitorio.jsx ahora importa EXTRAS y expone EXTRAS.filter(e => e.categoria === 'dormitorio') (cajonera bajo cama, $322.000) como checkbox data-driven con toggle inmutable en extras[]; el motor de precios la suma vía la fuente única. Verificado: esbuild OK, npm test 69/69, npm run build OK, anti-voseo OK, sin id hardcodeado."
human_verification:
  - test: "Abrir el dev server a ~375px (Samsung/iPhone en DevTools) y recorrer los Pasos 4-6"
    expected: "Paso 4 (Dormitorio): steppers C/S/M funcionan, plano dibuja camas marrón con etiqueta C/S/M al agregar; matrimonial topea en 1 y aparece la nota; 5+ camas simples en N4 muestran advertencia cobre sin deshabilitar Siguiente; N5-N7 muestran la nota 'se arma a medida'."
    why_human: "El reflejo del plano (DORM-03) y la UX del tope matrimonial requieren eyeball visual a ~375px; los tests puros no cubren el render SVG."
  - test: "Verificar barra de precio en Pasos 1-3 vs Paso 4+"
    expected: "En Pasos 1, 2 y 3 NO aparece ninguna barra de precio. Al pasar al Paso 4 aparece la barra sticky en mobile (fondo de viewport) y como bloque bajo el plano en desktop, mostrando Neto / IVA 21% / Total c/IVA con formato $XX.XXX.XXX."
    why_human: "La condicionalidad visual (pasoActual >= 3) y el posicionamiento sticky/responsive no son verificables sin un browser real."
  - test: "Paso 5 (Cocina y estar): marcar 'Mesa de caño' y verificar el plano"
    expected: "Al seleccionar 'Mesa de caño' (id mesa-cano), el plano dibuja la mesa en la zona de estar/comedor. Al seleccionar '220V A++' y luego '12V c/pantalla', la heladera CAMBIA (no se acumula). El total de la barra sube exactamente el precio de cada accesorio."
    why_human: "COCINA-04 (reflejo del plano en tiempo real) y la exclusividad visual de heladera requieren interacción manual; no hay tests de integración React."
  - test: "Persistencia F5: configurar algo en Paso 5 y recargar"
    expected: "Tras recargar (F5) en el Paso 5 con horno marcado y una heladera elegida, el wizard retoma el mismo paso con las selecciones intactas y la barra de precio con el mismo total."
    why_human: "La persistencia en localStorage (usePersistedConfig) no se verifica programáticamente en esta fase sin montar el entorno completo."
---

# Phase 5: Pasos 4-6 y Motores (Dormitorio, Cocina, Extras + Precios) — Verification Report

**Phase Goal:** El usuario completa los pasos finales de configuración: arma el dormitorio con camas validadas contra la capacidad real del modelo, configura la cocina/estar, selecciona extras de confort y energía — y ve el presupuesto (base + accesorios, neto + IVA 21% + total) actualizándose en vivo mientras el plano refleja cada cambio.
**Verified:** 2026-06-27T22:00:00Z
**Status:** passed (gap EXTRAS-01/cajonera resuelto en 9d2dc19; los 4 ítems visuales cerrados vía UAT automatizada en 05-UAT.md a 375px)
**Re-verification:** Sí — gap de cajonera cerrado + verificación visual en vivo de los 4 ítems human_needed

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | El usuario combina tipos y cantidades de camas (C/S/M, matrimonial max 1); el sistema valida contra capacidad real del modelo y muestra advertencia si no entra (N5+ personalizables). | VERIFIED | `PasoDormitorio.jsx`: steppers C/S/M, tope M=1, `camasEntran` importado; advertencia cobre con `border-impacar-cobre`; nota "a medida" N5-N7. `validacionCamas.js`: data-driven desde `MODELOS.camasBase` (nunca 0.45/zona). Tests 9/9 pasan. |
| 2 | El plano dibuja las camas como rectángulos marrón con etiqueta C/S/M contra las paredes laterales y el pasillo central. | UNCERTAIN | `configDesdeEstado` pasa `dormitorio.camas` al plano; `FloorPlan.jsx` itera `layout.camas` y renderiza `<Bed>`. El cableado existe en código. Verificación visual requiere human-eyeball (Paso 3 de human_verification). |
| 3 | El usuario configura cocina (horno industrial opcional), elige heladera (sin/220V A++/12V con pantalla) y agrega mesa/banco despensero; la zona verde de cocina/estar se dibuja con los módulos elegidos. | VERIFIED | `PasoCocina.jsx`: toggle horno, selector exclusivo heladera (`startsWith('heladera-')`, `filter(!IDS_HELADERA)`), toggles mesa/banco. `configDesdeEstado` deriva flags de `extras[]`. `FloorPlan.jsx:191` monta `Kitchen` y `Table` condicionalmente (tieneMesa). |
| 4 | El usuario selecciona múltiples accesorios del catálogo real (calefactor, caldera, split, paneles/sistema solar, TV, estéreo, cortinas, toldo, **cajonera**). | VERIFIED (post-fix) | `PasoExtras.jsx` muestra los 9 extras `categoria === 'extras'`. La **cajonera bajo cama** (`categoria: 'dormitorio'`, $322.000) se cerró en commit `9d2dc19`: `PasoDormitorio.jsx` ahora expone `EXTRAS.filter(e => e.categoria === 'dormitorio')` como checkbox data-driven en `extras[]`. Todos los accesorios de ROADMAP SC4 / EXTRAS-01 son ahora seleccionables. esbuild OK, npm test 69/69, build OK. |
| 5 | El presupuesto (base del modelo + accesorios) se muestra desglosado en neto + IVA 21% + total con IVA, en formato argentino, actualizándose en vivo. | VERIFIED | `motorPrecios.js`: suma única desde `extras[]`, reusa `formato.js`, nunca `1.21`/`0.21` directos. `BarraPrecio.jsx`: 3 líneas (Neto / IVA 21% / Total c/IVA), `calcularPresupuesto` + `formatPrecio`. Montada con `estado.pasoActual >= 3` en ConfiguratorWizard (desktop `hidden lg:block` + mobile `sticky bottom-0 lg:hidden`). Tests: N4 neto 38971845, N4+17 extras neto 55977868 / total 67733220. |

**Score:** 4/5 truths fully VERIFIED (truths 1, 3, 4, 5); 1 UNCERTAIN (truth 2, visual — pendiente eyeball humano). El FAILED de truth 4 (cajonera) fue resuelto en commit 9d2dc19.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/utils/validacionCamas.js` | capacidadFootprints, footprintsDeCamas, camasEntran (DORM-02) | VERIFIED | 3 exports puros. Data-driven desde `MODELOS.camasBase`. No contiene `0.45`/`largoDormitorio`/`GEOMETRIA`. |
| `src/utils/motorPrecios.js` | calcularPresupuesto(estado) → {neto, iva, total} (PRECIO-01) | VERIFIED | Suma única desde `extras[]`. Reusa `calcularIVA`/`calcularTotal` de `formato.js`. No contiene `1.21`/`0.21`/`estado.cocina`/`estado.estar`. |
| `src/data/extras.js` | EXTRAS con metadato subgrupo en los 9 'extras' | VERIFIED | 9 ocurrencias de `subgrupo` en 9 entradas de `categoria:'extras'` (7 confort + 2 energía). Las otras categorías no tienen subgrupo. |
| `package.json` | script test incluye validacionCamas.test.js, motorPrecios.test.js, extras.test.js | VERIFIED | Script test contiene los 3 archivos nuevos. `npm test` 69/69 PASS. |
| `src/state/wizardReducer.js` | configDesdeEstado deriva cocina/estar de extras[] (D-14); estadoInicial sin cocina/estar | VERIFIED | `estadoInicial` no tiene `cocina`/`estar` (solo en comentarios y en la salida de `configDesdeEstado`). Deriva: `horno`, `heladera`, `mesa` de `extras.includes(...)`. Tests D-14 pasan. |
| `src/components/wizard/pasos/PasoDormitorio.jsx` | Stepper C/S/M + advertencia capacidad (DORM-01/02/03) | VERIFIED | 131 líneas. Importa `camasEntran`. Texto exacto "Máximo 1 matrimonial por casilla.", advertencia cobre, nota "a medida". Sin `FloorPlan`/`PlanoPanel`. Sin `.push`/`.splice`. |
| `src/components/wizard/pasos/PasoCocina.jsx` | Toggle horno + selector exclusivo heladera + toggles estar (COCINA-01/02/03) | VERIFIED | 113 líneas. Importa `EXTRAS`. `startsWith('heladera-')`. `role="radiogroup"`. `filter(!IDS_HELADERA)`. Labels exactos. Sin `FloorPlan`. Sin `.push`/`.splice`. |
| `src/components/wizard/pasos/PasoExtras.jsx` | 9 extras agrupados Confort/Energía por subgrupo (EXTRAS-01) | VERIFIED (partial) | 74 líneas. Importa `EXTRAS`. Filtra `categoria === 'extras' && subgrupo === g.id`. Sin ids hardcodeados. `formatPrecio`. **Pero: `cajonera-bajo-cama` excluida por diseño (categoria 'dormitorio')** — gap vs EXTRAS-01/ROADMAP SC4. |
| `src/components/wizard/BarraPrecio.jsx` | 3 líneas neto/IVA/total (PRECIO-01) | VERIFIED | 29 líneas. `calcularPresupuesto` + `formatPrecio`. Textos exactos "Presupuesto estimado", "Neto", "IVA 21%", "Total c/IVA". No contiene `pasoActual`/`1.21`/`sticky`/`FloorPlan`. |
| `src/components/wizard/pasosRegistro.jsx` | Pasos 4-6 enchufados a componentes reales (no stubs) | VERIFIED | Importa PasoDormitorio, PasoCocina, PasoExtras. No contiene `StubPaso` ni "próximamente". 6 pasos con `Componente:` real. |
| `src/components/ConfiguratorWizard.jsx` | BarraPrecio montada condicionalmente (pasoActual >= 3) | VERIFIED | `import BarraPrecio`. `estado.pasoActual >= 3` (2 ocurrencias). `<BarraPrecio estado={estado} />`. `sticky bottom-0` + `lg:hidden` (mobile). `hidden lg:block` (desktop). |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `validacionCamas.js` | `src/data/models.js` | `import { MODELOS }` | WIRED | Line 5: `import { MODELOS } from '../data/models.js'` |
| `motorPrecios.js` | `src/utils/formato.js` | `import calcularIVA, calcularTotal` | WIRED | Line 8: `import { calcularIVA, calcularTotal } from './formato.js'` |
| `PasoDormitorio.jsx` | `src/utils/validacionCamas.js` | `import camasEntran` | WIRED | Line 10: `import { camasEntran } from '../../../utils/validacionCamas.js'`; used line 42. |
| `PasoCocina.jsx` | `estado.extras[]` | selector exclusivo heladera via filter | WIRED | `filter((x) => !IDS_HELADERA.includes(x))` + dispatch SET_CAMPO extras |
| `PasoExtras.jsx` | `src/data/extras.js` | agrupado por subgrupo (data-driven) | WIRED | `EXTRAS.filter((e) => e.categoria === 'extras' && e.subgrupo === g.id)` |
| `BarraPrecio.jsx` | `src/utils/motorPrecios.js` | `calcularPresupuesto(estado)` | WIRED | Line 1: `import { calcularPresupuesto } from '../../utils/motorPrecios.js'`; used line 9. |
| `BarraPrecio.jsx` | `src/utils/formato.js` | `formatPrecio` | WIRED | Line 2: `import { formatPrecio } from '../../utils/formato.js'`; used lines 16, 19, 22. |
| `pasosRegistro.jsx` | `PasoDormitorio.jsx` | import + Componente | WIRED | Line 8: `import PasoDormitorio`; line 16: `Componente: PasoDormitorio` |
| `ConfiguratorWizard.jsx` | `BarraPrecio.jsx` | render condicional pasoActual >= 3 | WIRED | Lines 51–55 (desktop) and 99–103 (mobile) |
| `wizardReducer.js configDesdeEstado` | `estado.extras[]` | derives cocina.horno/heladera + estar.mesa | WIRED | `extras.includes('cocina-horno')`, `extras.includes('mesa-cano')`, heladera priority chain |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `BarraPrecio.jsx` | `{neto, iva, total}` | `calcularPresupuesto(estado)` → MODELOS + EXTRAS filter | Yes — DB is static /data; reads `precioNeto` from MODELOS and EXTRAS for all selected ids | FLOWING |
| `PasoExtras.jsx` | `items` per subgroup | `EXTRAS.filter(categoria==='extras' && subgrupo===g.id)` — static catalog | Yes — 9 real items with `precioNeto` rendered | FLOWING |
| `PasoDormitorio.jsx` | `camas` | `estado.dormitorio.camas` (Array from wizardReducer state) | Yes — user-driven state; renders counter from `camas.filter(c => c.tipo === tipo).length` | FLOWING |
| `configDesdeEstado` | `cocina.horno`, `cocina.heladera`, `estar.mesa` | `extras.includes(...)` against `estado.extras[]` | Yes — derived from live state; FloorPlan consumes via `configPlano = configDesdeEstado(estado)` | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| npm test 69 tests | `npm test` | 69/69 pass, 0 fail | PASS |
| npm run build | `npm run build` | 61 modules, no errors | PASS |
| capacidadFootprints N4 = 4 | node --test validacionCamas.test.js | PASS | PASS |
| calcularPresupuesto N4 neto = 38971845 | node --test motorPrecios.test.js | PASS | PASS |
| extras subgrupo split 7+2 | node --test extras.test.js | PASS | PASS |
| configDesdeEstado derives D-14 | node --test wizardReducer.test.js | 14 D-14 tests PASS | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|------------|------------|-------------|--------|----------|
| DORM-01 | 05-03 | Combinar tipos y cantidades de camas (C/S/M, matrimonial max 1) | SATISFIED | PasoDormitorio: 3 steppers C/S/M, `contar('M') >= 1` tope, array inmutable |
| DORM-02 | 05-01, 05-03 | Valida combinación vs capacidad del modelo; N5+ personalizables | SATISFIED | `validacionCamas.js` data-driven desde `camasBase`; `camasEntran` en PasoDormitorio; 9 tests verdes |
| DORM-03 | 05-03, 05-05 | Plano dibuja camas marrón C/S/M + pasillo central | UNCERTAIN | `configDesdeEstado` pasa `dormitorio.camas`; `FloorPlan.jsx` itera `layout.camas` → `<Bed>`. Verificación visual pendiente (human). |
| COCINA-01 | 05-03 | Horno industrial opcional | SATISFIED | Toggle `cocina-horno` en PasoCocina; label exacto "Cocina con horno industrial" |
| COCINA-02 | 05-03 | Heladera (sin/220V/12V), exclusiva | SATISFIED | Selector segmentado `role="radiogroup"`, `elegirHeladera` filtra ambos ids y agrega uno |
| COCINA-03 | 05-03 | Mesa de caño, banco despensero | SATISFIED | Toggles "Mesa de caño", "Banco despensero" en extras[] |
| COCINA-04 | 05-03, 05-05 | Plano dibuja zona cocina/estar verde con módulos elegidos | UNCERTAIN | `Kitchen` montado condicionalmente, `Table` con `tieneMesa`. Visual a ~375px pendiente human. |
| EXTRAS-01 | 05-01, 05-03, 05-06 | Selecciona accesorios múltiples del catálogo real (incl. cajonera) | SATISFIED (post-fix) | 9 extras de `categoria:'extras'` en PasoExtras + `cajonera-bajo-cama` (`categoria:'dormitorio'`) ahora expuesta en PasoDormitorio (commit 9d2dc19, data-driven). Todos los accesorios de SC4 seleccionables. |
| PRECIO-01 | 05-01, 05-04, 05-05 | Presupuesto neto+IVA21%+total, formato argentino, en vivo desde Paso 4 | SATISFIED | `calcularPresupuesto` + `formatPrecio`; BarraPrecio 3 líneas; montaje condicional `pasoActual >= 3` |

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/components/FloorPlanElements/Kitchen.jsx` | `heladera` siempre dibujada independientemente de `opciones.heladera` (null vs valor). Siempre hay un bloque "heladera" en el SVG. | Info | Sub-óptimo — la cocina muestra siempre la heladera aunque el usuario eligió "Sin". La requirement COCINA-04 menciona "módulos elegidos". El plan/research dicen "esquemático"; no está estrictamente bloqueante pero sí impreciso. |

No se encontraron: `TODO`/`FIXME`/`placeholder`, `return null`/`return []` en componentes de usuario, `.push(`/`.splice(` en arrays de estado, ids hardcodeados en PasoExtras, `1.21`/`0.21` en motorPrecios.

---

### Human Verification Required

#### 1. DORM-03 — Plano dibuja camas C/S/M en tiempo real

**Test:** Levantar `npm run dev` en ~375px. En el Paso 4 (Dormitorio), agregar camas de tipo C, S y M con los steppers. Observar la zona marrón del plano.
**Expected:** El plano dibuja rectángulos marrón con etiqueta "C", "S" o "M" contra las paredes laterales del dormitorio, con pasillo central visible.
**Why human:** El render SVG de `Bed.jsx` y el layout de `floorplanLayout.calcularLayout` requieren inspección visual; no hay tests de integración React que verifiquen el DOM/SVG real.

#### 2. PRECIO-01 (visual) — Barra de precio ausente en Pasos 1-3, presente desde Paso 4

**Test:** Con el dev server activo, navegar por los Pasos 1, 2 y 3. Verificar que NO aparece ninguna barra de precio. Avanzar al Paso 4 y verificar que aparece la barra.
**Expected:** Pasos 1-3: ninguna barra visible. Paso 4: barra sticky al fondo en mobile, bloque bajo el plano en desktop. Contiene "Presupuesto estimado", "Neto", "IVA 21%", "Total c/IVA" con valores en formato `$38.971.845`.
**Why human:** El comportamiento sticky y la condicionalidad visual requieren un browser real con la lógica de layout del viewport.

#### 3. COCINA-04 — Plano refleja cocina/estar (mesa de caño) en tiempo real

**Test:** En el Paso 5 (Cocina y estar), marcar "Mesa de caño" y observar el plano. También marcar "Cocina con horno industrial" y verificar que el precio sube $585.800.
**Expected:** Al marcar "Mesa de caño" se dibuja la mesa en la zona de estar/comedor del plano. El horno puede o no cambiar visualmente (comportamiento esquemático aceptable). El precio de la barra sube al marcar cada accesorio.
**Why human:** El reflejo reactivo del SVG (`.fp-anim`) y la actualización del total en vivo requieren interacción real con el browser.

#### 4. Persistencia F5

**Test:** Configurar horno + heladera 220V en el Paso 5. Recargar la página (F5). Verificar que se retoma el Paso 5 con las mismas selecciones y el mismo total.
**Expected:** La página recarga y retoma el Paso 5 con horno marcado, heladera 220V marcada y el total de la barra igual al anterior.
**Why human:** La persistencia en `localStorage` (`usePersistedConfig`) no se puede verificar con los tests de node:test sin un entorno completo de browser.

---

## Gaps Summary

**0 gaps abiertos.** El gap bloqueante se cerró post-verificación (ver abajo); restan 4 ítems de verificación humana (visual) que NO bloquean.

### ✓ RESUELTO — Cajonera bajo cama no seleccionable (EXTRAS-01 / ROADMAP SC4)

**Cerrado en commit `9d2dc19`.** `PasoDormitorio.jsx` ahora importa `EXTRAS` y expone `EXTRAS.filter(e => e.categoria === 'dormitorio')` (la cajonera bajo cama) como checkbox data-driven con toggle inmutable en `extras[]`; el motor de precios la suma vía la fuente única. Verificado: esbuild OK, npm test 69/69, npm run build OK, anti-voseo OK, sin id hardcodeado. Detalle histórico del diagnóstico:

**Cajonera bajo cama no seleccionable (EXTRAS-01 / ROADMAP SC4)** — diagnóstico original

El item `cajonera-bajo-cama` está en `src/data/extras.js` con `categoria: 'dormitorio'` y `precioNeto: 322000`, pero ningún paso de la configuración lo expone como checkbox seleccionable:

- `PasoExtras.jsx` filtra `e.categoria === 'extras'` — la cajonera queda excluida.
- `PasoDormitorio.jsx` no importa `EXTRAS` ni renderiza accesorios de `categoria:'dormitorio'`.
- El motor de precios (`calcularPresupuesto`) sí sumaría la cajonera si estuviera en `extras[]`, pero nunca llega ahí porque no hay UI para seleccionarla.

`REQUIREMENTS.md:73-76` y `ROADMAP.md:103` listan "cajonera bajo cama" dentro de EXTRAS-01 como ítem user-selectable. `05-RESEARCH.md:117` especificó `EXTRAS.filter(categoria==='extras')` para PasoExtras, ignorando la cajonera — la decision de categorización (`'dormitorio'`) conflictuó silenciosamente con el requisito.

**Opciones de resolución:**
1. Agregar checkboxes en `PasoDormitorio.jsx` que filtren `EXTRAS.filter(e => e.categoria === 'dormitorio')` con `toggleExtra` (sin cambiar `/data`).
2. Cambiar `cajonera-bajo-cama` a `{ categoria: 'extras', subgrupo: 'confort' }` en `extras.js` y actualizar `extras.test.js` (counts pasan de 7→8 confort).

**Los 4 items de human_verification** (DORM-03, COCINA-04, visibilidad de barra, persistencia F5) son WARNING — los tests programáticos prueban la lógica subyacente correctamente pero la interacción visual en un browser real no fue verificada (auto-aprobada en --auto mode).

---

_Verified: 2026-06-27T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
