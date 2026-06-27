---
status: complete
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
source: [05-HUMAN-UAT.md, 05-VERIFICATION.md, 05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md]
started: 2026-06-27T23:10:00Z
updated: 2026-06-27T23:30:00Z
verification_method: automated_ui (dev server :5173, viewport mobile 375x812, preview tools)
---

## Current Test

[testing complete]

## Tests

### 1. DORM-03 — El plano dibuja las camas C/S/M en tiempo real
expected: Al agregar camas con los steppers en el Paso 4, el plano cenital dibuja rectángulos marrón con etiqueta C/S/M en la zona Dormitorio; matrimonial topea en 1.
result: pass
evidence: |
  Verificado a 375px. Agregadas cucheta (C) + matrimonial (M); el SVG del plano renderiza grupos
  "Cucheta marinera" (label C) y "Cama matrimonial" (label M) en la zona Dormitorio (screenshot).
  `dormitorio.camas` = [{tipo:'C'},{tipo:'M'}]. Tope matrimonial confirmado: 2 clics en "Agregar
  matrimonial" → contador queda en 1 (D-02). Sin advertencia de capacidad (C+M entran en N3).

### 2. PRECIO-01 (visual) — Barra de precio ausente en Pasos 1-3, presente desde Paso 4
expected: Sin barra en Pasos 1-3; desde el Paso 4 aparece con Neto / IVA 21% / Total c/IVA en formato argentino.
result: pass
evidence: |
  Pasos 1, 2 y 3: barra ausente (verificado por ausencia de "Presupuesto estimado"/"Total c/IVA").
  Paso 4: barra presente con 3 líneas — Neto $37.181.710 / IVA 21% $7.808.159 / Total c/IVA
  $44.989.869 (suma exacta; Total en verde campo, mayor jerarquía). Formato argentino correcto.

### 3. COCINA-04 — Plano refleja cocina/estar y exclusividad de heladera, precio en vivo
expected: Marcar "Mesa de caño" dibuja la mesa en el estar; elegir 220V y luego 12V cambia la heladera (no acumula); el total sube por cada accesorio.
result: pass
evidence: |
  "Mesa de caño" → el SVG agrega el grupo "Mesa" en la zona estar; extras=["mesa-cano"]; neto
  37.181.710 → 37.399.710 (+$218.000), total → $45.253.649. Heladera: elegir "220V A++" suma
  $2.055.790 (=$1.699.000 +IVA); luego "12V c/pantalla" REEMPLAZA a la 220V (extras=["mesa-cano",
  "heladera-12v"], una sola heladera, radio 12V=checked); total ajusta a $47.298.549. Exclusividad
  y actualización en vivo confirmadas (screenshot Paso 5).

### 4. Persistencia F5
expected: Configurar selecciones en el Paso 5 y recargar (F5) retoma el mismo paso con todo intacto.
result: pass
evidence: |
  Estado pre-reload: pasoActual 4 (Paso 5), N3, camas [C,M], extras [mesa-cano, heladera-12v].
  Tras window.location.reload(): retomó el Paso 5, Mesa marcada, total $47.298.549 idéntico,
  estado persistido intacto (usePersistedConfig restaura desde localStorage impacar_config_v1).

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0

## Gaps

[none — todos los ítems de verificación visual pasaron]

## Notas adicionales (confirmaciones colaterales en vivo)

- Cajonera bajo cama (gap fix 05-06 / EXTRAS-01) seleccionable en el Paso 4 con caption "$322.000 + IVA" (WR-01).
- App arranca sin errores de consola (smoke test); el wizard carga desde la landing ("Comenzar").
- esEstadoValido (CR-01) tolera y restaura el estado persistido sin crashear.
