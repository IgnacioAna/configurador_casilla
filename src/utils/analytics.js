// Helper de analytics (placeholder). En esta fase solo registra en consola con un timestamp ISO;
// es el punto de integración futuro con Google Analytics (UX-04). No tiene dependencias externas.

// Registra que un paso del wizard se completó. Lo invocan la cáscara/los pasos (Fases 3-5)
// al avanzar. El timestamp ISO permite correlacionar eventos sin un backend.
export function logPasoCompletado(numeroPaso, nombrePaso) {
  // Placeholder de Google Analytics (UX-04): a futuro este console.log se reemplaza por
  // un evento gtag/dataLayer manteniendo la misma firma.
  console.log('[analytics] paso completado', {
    paso: numeroPaso,
    nombre: nombrePaso,
    timestamp: new Date().toISOString(),
  })
}
