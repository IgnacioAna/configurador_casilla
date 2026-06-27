// FloorPlan: plano en planta SVG cenital de la casilla (UI-SPEC, contrato de render).
// Recibe `config` (forma en data/mockConfig.js), llama a calcularLayout (Plan 01) y dibuja
// un <svg> escalable con paredes, las 5 zonas con color, y maneja los estados Empty / Error / Normal.
//
// Jerarquía de capas (UI-SPEC "Jerarquía visual y accesibilidad"):
//   (1) paredes exteriores -> (2) rellenos de zona -> (3) modulos y etiquetas -> (4) cotas en cobre.
import { calcularLayout, M_A_U } from '../utils/floorplanLayout.js'

// Metros con coma decimal y sufijo " m" (UI-SPEC "Copywriting Contract": "2,60 m").
function metros(n, decimales = 2) {
  return `${n.toFixed(decimales).replace('.', ',')} m`
}

// --- Estados no-Normal: bloques HTML centrados en el area del plano (copys EXACTOS del UI-SPEC). ---
function EstadoEmpty() {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center p-md text-center">
      <p className="text-lg font-semibold text-impacar-texto">Sin configuración</p>
      <p className="mt-1 text-sm text-impacar-texto/70">
        Elegí un modelo para ver el plano de tu casilla.
      </p>
    </div>
  )
}

function EstadoError() {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center p-md text-center">
      <p className="text-sm text-impacar-texto/80">
        No se pudo dibujar el plano. Revisá el modelo seleccionado e intentá de nuevo.
      </p>
    </div>
  )
}

export default function FloorPlan({ config }) {
  // Estado Empty: config nula/incompleta (T-02-04).
  if (!config) return <EstadoEmpty />

  const layout = calcularLayout(config)

  // Estado Error: geometría inválida (T-02-04).
  if (!layout || layout.valido === false) return <EstadoError />

  const { zonas, anchoU, totalU, pad } = layout
  const titulo = `Plano en planta de la casilla modelo ${config.modeloId}, ${metros(
    totalU / M_A_U,
  )} × ${metros(anchoU / M_A_U)}`

  return (
    <svg
      viewBox={layout.viewBox}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      role="img"
      aria-label={titulo}
      fontFamily="Inter, system-ui, sans-serif"
    >
      <title>{titulo}</title>
      <rect x="0" y="0" width={totalU + pad * 2} height={anchoU + pad * 2} fill="#F5F5F0" />

      {/* Contenido del dibujo desplazado por el padding de cotas (UI-SPEC: 12u por lado). */}
      <g transform={`translate(${pad}, ${pad})`}>
        {/* (2) Rellenos de zona + divisores + etiquetas. */}
        <g>
          {zonas.map((z) => (
            <rect key={z.id} x={z.x} y={0} width={z.anchoU} height={anchoU} fill={z.fill} />
          ))}
          {/* Divisores finos entre zonas (líneas internas, no sobre el borde exterior). */}
          {zonas.slice(1).map((z) => (
            <line
              key={`div-${z.id}`}
              x1={z.x}
              y1={0}
              x2={z.x}
              y2={anchoU}
              stroke="#1A1A1A"
              strokeOpacity="0.55"
              strokeWidth="1"
            />
          ))}
          {/* Etiquetas de zona (12u semibold uppercase, texto oscuro). */}
          {zonas.map((z) => (
            <text
              key={`lbl-${z.id}`}
              x={z.x + z.anchoU / 2}
              y={anchoU / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="600"
              letterSpacing="0.5"
              fill="#1A1A1A"
              style={{ textTransform: 'uppercase' }}
            >
              {z.etiqueta}
            </text>
          ))}
        </g>

        {/* (1) Pared exterior: el trazo más grueso, anclaje visual del perímetro. */}
        <rect
          x="0"
          y="0"
          width={totalU}
          height={anchoU}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="3"
        />

        {/* HOOKS Task 3: módulos (Bathroom/Kitchen/Table), camas, puerta, ventanas y cotas en cobre. */}
      </g>
    </svg>
  )
}
