---
status: partial
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
source: [05-VERIFICATION.md]
started: 2026-06-27T22:40:00Z
updated: 2026-06-27T22:40:00Z
---

## Current Test

[awaiting human testing — levantar `npm run dev` y recorrer los Pasos 4-6 a ~375px]

## Tests

### 1. DORM-03 — El plano dibuja las camas C/S/M en tiempo real
expected: En el Paso 4 (Dormitorio), al agregar camas C/S/M con los steppers, el plano dibuja rectángulos marrón con etiqueta "C"/"S"/"M" contra las paredes laterales del dormitorio, con pasillo central visible. Matrimonial topea en 1 (aparece la nota); 5+ simples en N4 muestran advertencia cobre sin deshabilitar Siguiente; N5-N7 muestran "se arma a medida".
result: [pending]

### 2. PRECIO-01 (visual) — Barra de precio ausente en Pasos 1-3, presente desde Paso 4
expected: En Pasos 1, 2 y 3 NO aparece ninguna barra de precio. Al pasar al Paso 4 aparece la barra sticky al fondo en mobile y como bloque bajo el plano en desktop, con "Presupuesto estimado", "Neto", "IVA 21%", "Total c/IVA" en formato `$38.971.845`.
result: [pending]

### 3. COCINA-04 — El plano refleja cocina/estar (mesa de caño) en tiempo real
expected: En el Paso 5, marcar "Mesa de caño" dibuja la mesa en la zona de estar/comedor del plano. Elegir "220V A++" y luego "12V c/pantalla" CAMBIA la heladera (no se acumula). El total de la barra sube exactamente el precio de cada accesorio marcado. (Nota: Kitchen.jsx dibuja siempre la heladera aunque se elija "Sin" — imprecisión esquemática pre-existente de Fase 2, no bloqueante; revisar si molesta.)
result: [pending]

### 4. Persistencia F5
expected: Configurar horno + heladera 220V en el Paso 5 y recargar (F5). El wizard retoma el Paso 5 con las mismas selecciones y el mismo total en la barra.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
