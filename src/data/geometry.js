// Geometría real de las casillas Impacar (Lista 108). Todas las medidas en metros.
export const GEOMETRIA = {
  anchoExterior: 2.6, // ancho exterior fijo (transporte vial)
  anchoInterior: 2.52, // ancho interior útil
  anchoCama: 0.8, // ancho estándar de cama
  largoCama: 2.0, // largo de cama (corre sobre el eje del largo)
  pasilloCentral: 0.92, // 0.80 + 0.92 + 0.80 = 2.52 (2 camas + pasillo)
  zonaBaulera: 0.6, // baulera fija en un extremo
  zonaCocina: 0.6, // cocina fija en el otro extremo
}

export const IVA = 0.21 // 21%

// Lista de precios vigente (netos hardcodeados en models.js/extras.js). Fuente única del sello:
// resumen, PDF y WhatsApp leen de acá para evitar que un documento viejo circule sin fecha.
export const LISTA_PRECIOS = { nombre: 'Lista 108', vigencia: 'Febrero 2026' }
