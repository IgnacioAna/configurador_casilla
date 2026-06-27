// Módulo de cocina: mesada + cocina (hornallas) + heladera como primitivas
// (UI-SPEC "Color" -> contorno de módulos #1A1A1A opacidad 0.7 ancho 1).
// Recibe el rect de la zona cocina YA en unidades de viewBox: x, y, w, h.
//   opciones (opcional): { horno, heladera } — en Fase 2 solo afina detalles del dibujo.
export default function Kitchen({ x, y, w, h, opciones = {} }) {
  const m = Math.min(5, w * 0.15, h * 0.1)
  const ix = x + m
  const iy = y + m
  const iw = w - m * 2
  const ih = h - m * 2
  // Mesada corre a lo largo del lado superior; cocina y heladera son cuadros sobre ella.
  const mesadaH = ih * 0.32
  const hornallaR = Math.min(iw, mesadaH) * 0.12

  return (
    <g stroke="#1A1A1A" strokeOpacity="0.7" strokeWidth="1" fill="none">
      <title>Cocina</title>
      {/* Mesada */}
      <rect x={ix} y={iy} width={iw} height={mesadaH} />
      {/* Hornallas (4 círculos) sobre la mesada */}
      <circle cx={ix + iw * 0.2} cy={iy + mesadaH * 0.35} r={hornallaR} />
      <circle cx={ix + iw * 0.4} cy={iy + mesadaH * 0.35} r={hornallaR} />
      <circle cx={ix + iw * 0.2} cy={iy + mesadaH * 0.7} r={hornallaR} />
      <circle cx={ix + iw * 0.4} cy={iy + mesadaH * 0.7} r={hornallaR} />
      {/* Bacha en la mesada */}
      <rect x={ix + iw * 0.62} y={iy + mesadaH * 0.2} width={iw * 0.28} height={mesadaH * 0.6} rx="1" />
      {/* Heladera (bloque alto contra el otro borde) */}
      <rect x={ix} y={iy + ih - ih * 0.42} width={iw * 0.34} height={ih * 0.42} />
      <line x1={ix + iw * 0.28} y1={iy + ih - ih * 0.42} x2={ix + iw * 0.28} y2={iy + ih} />
    </g>
  )
}
