---
phase: 06-resumen-y-exportacion
fixed_at: 2026-06-28T00:00:00Z
review_path: .planning/phases/06-resumen-y-exportaci-n/06-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Fase 06: Informe de Corrección de Revisión de Código

**Corregido:** 2026-06-28
**Revisión origen:** `.planning/phases/06-resumen-y-exportaci-n/06-REVIEW.md`
**Iteración:** 1

**Resumen:**
- Hallazgos en alcance (Critical + Warning): 6 (CR-01, WR-01, WR-02, WR-03, WR-04, WR-05)
- Corregidos: 6
- Omitidos: 0

**Validación global:** `npm test` → 100 pasan / 0 fallan (baseline 98 + 2 tests nuevos).
`npm run build` → exitoso. Ambos verdes tras cada corrección.

## Issues Corregidos

### CR-01: Número de WhatsApp de producción sin mecanismo de swap

**Archivos modificados:** `src/data/contacto.js`, `.env.example` (nuevo)
**Commit:** d580a62
**Fix aplicado:** `CONTACTO.whatsapp` ahora lee `import.meta.env?.VITE_WA_NUMBER` con
fallback al número de PRUEBAS (`5492954555113`), y `whatsappDisplay` lee
`VITE_WA_DISPLAY` con su fallback. Se respetó CONTEXT D-08: el número de pruebas sigue
siendo el valor ACTIVO por defecto para que la demo nunca le llegue a la fábrica; el
comportamiento de la demo es idéntico cuando no hay variable de entorno. El swap a
producción se hace definiendo `VITE_WA_NUMBER=5492302468754` en `.env.production` sin
tocar el código. Ambos números quedan documentados en comentarios y el nuevo
`.env.example` documenta la variable. El acceso con optional chaining (`?.`) mantiene
verde el test de `node:test`, donde `import.meta.env` es `undefined`.

### WR-01: `banco-despensero` omitido de la sección "Cocina"

**Archivos modificados:** `src/utils/resumenCampos.js`, `src/utils/resumenCampos.test.js`
**Commit:** ca07f8c
**Fix aplicado:** `partesCocina` ahora se construye recorriendo TODOS los accesorios de
`categoria === 'cocina'` de `EXTRAS` filtrados por `extras.includes(e.id)`, de modo que
`banco-despensero` (y cualquier futuro accesorio de cocina) aparece en el resumen y el
PDF. Test nuevo: "banco-despensero se refleja en cocina cuando está seleccionado".

### WR-02: `nombreExtra(id)` podía devolver `undefined` e inyectar `"undefined"` en el texto

**Archivos modificados:** `src/utils/resumenCampos.js`, `src/utils/resumenCampos.test.js`
**Commit:** ca07f8c (mismo fix que WR-01)
**Fix aplicado:** Al construir `partesCocina` iterando sobre `EXTRAS` (la fuente de
verdad) en vez de hardcodear ids y llamar a `nombreExtra`, solo entran ids válidos:
un id desconocido en `extras[]` (p.ej. de un localStorage viejo) nunca produce
`undefined` en el texto. Se reforzó con `.filter(Boolean)`. Se eliminó la función
`nombreExtra` que devolvía `undefined`. Test nuevo: "id de cocina desconocido NO
inyecta 'undefined' en el texto".

### WR-03: PDF sin protección contra desbordamiento de página

**Archivos modificados:** `src/utils/exportPDF.js`
**Commit:** 56c6f64
**Fix aplicado:** Se agregó el helper `avanzarSiNecesario(doc, cursorY)` que, si la
próxima línea cruzaría el umbral `LIMITE_PIE` (278 mm, por debajo del pie en 285 mm y
su línea divisoria en 279 mm), llama a `doc.addPage()` y reinicia el cursor en el margen
superior. Se aplica antes de escribir la nota orientativa y cada fila de la
configuración (los puntos que crecen con muchos extras). Una configuración típica sigue
quedando en una sola página.

### WR-04: Error de `generarPDF` silenciado

**Archivos modificados:** `src/components/resumen/AccionesExport.jsx`
**Commit:** c8b7bc1
**Fix aplicado:** El `try/finally` de `onDescargar` ahora tiene un `catch` que loguea el
error (`console.error`) y setea un nuevo estado `errorPDF`, renderizado como un
`<p role="alert">` sobrio (texto rojo, acorde a la identidad) debajo de los botones. El
`finally` sigue reseteando `generando`. Se limpia `errorPDF` al reintentar.

### WR-05: Categoría fuera de `GRUPOS` invisible en el desglose

**Archivos modificados:** `src/components/resumen/PresupuestoDesglosado.jsx`
**Commit:** cce4c89
**Fix aplicado:** Se agregó un grupo catch-all "Otros" (predicado `sinGrupo`) que
renderiza cualquier ítem distinto de `modelo` cuya `categoria`/`subgrupo` no caiga en
ningún grupo de `GRUPOS`. Garantiza que el desglose visual siempre reconcilie con el
total (que `calcularPresupuesto` sí cuenta), defendiendo contra futuras ampliaciones del
catálogo. Mínimo y defensivo; no afecta el caso actual (el grupo solo se renderiza si
hay ítems huérfanos).

## Issues Omitidos

Ninguno. Los 6 hallazgos en alcance se corrigieron.

## Notas

- **Hallazgos Info (IN-01..IN-04):** fuera de alcance (`fix_scope: critical_warning`). No
  se tocaron. Quedan documentados en `06-REVIEW.md` para una eventual iteración con
  `fix_scope: all`.
- **Verificación:** cada corrección se validó con el test pertinente (`node --test`) y/o
  `npm run build` para los cambios browser-only (React / PDF). Suite completa final:
  100 pasan / 0 fallan; build exitoso.

---

_Corregido: 2026-06-28_
_Corrector: Claude (gsd-code-fixer)_
_Iteración: 1_
