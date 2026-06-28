// FloorPlan: plano en planta SVG cenital de la casilla (UI-SPEC, contrato de render).
// Recibe `config` (forma en data/mockConfig.js), llama a calcularLayout (Plan 01) y dibuja
// un <svg> escalable con paredes, las 5 zonas con color, equipamiento, puerta, ventanas y cotas.
// Maneja los estados Empty / Error / Normal.
//
// Jerarquía de capas (UI-SPEC "Jerarquía visual y accesibilidad"):
//   (1) paredes exteriores -> (2) rellenos de zona -> (3) modulos y etiquetas -> (4) cotas en cobre.
import { calcularLayout, M_A_U } from '../utils/floorplanLayout.js'
import { GEOMETRIA } from '../data/geometry.js'
import Bed from './FloorPlanElements/Bed.jsx'
import Door from './FloorPlanElements/Door.jsx'
import Window from './FloorPlanElements/Window.jsx'
import Bathroom from './FloorPlanElements/Bathroom.jsx'
import Kitchen from './FloorPlanElements/Kitchen.jsx'
import Table from './FloorPlanElements/Table.jsx'

const COBRE = '#8B6914' // accent: capa de medición (UI-SPEC "Color").

// Metros con coma decimal y sufijo " m" (UI-SPEC "Copywriting Contract": "2,60 m").
function metros(n, decimales = 2) {
  return `${n.toFixed(decimales).replace('.', ',')} m`
}

// --- Estados no-Normal: bloques HTML centrados en el area del plano (copys EXACTOS del UI-SPEC). ---
function EstadoEmpty() {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center p-4 text-center">
      <p className="text-lg font-semibold text-impacar-texto">Sin configuración</p>
      <p className="mt-1 text-sm text-impacar-texto/70">
        Elegí un modelo para ver el plano de tu casilla.
      </p>
    </div>
  )
}

function EstadoError() {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center p-4 text-center">
      <p className="text-sm text-impacar-texto/80">
        No se pudo dibujar el plano. Revisá el modelo seleccionado e intentá de nuevo.
      </p>
    </div>
  )
}

// --- Cota horizontal (línea + ticks + número centrado), en cobre (UI-SPEC "Acotaciones"). ---
function CotaH({ x1, x2, y, label }) {
  const cx = (x1 + x2) / 2
  return (
    <g className="fp-anim" stroke={COBRE} strokeWidth="0.75" fill="none">
      <line className="fp-anim" x1={x1} y1={y} x2={x2} y2={y} />
      <line className="fp-anim" x1={x1} y1={y - 3} x2={x1} y2={y + 3} />
      <line className="fp-anim" x1={x2} y1={y - 3} x2={x2} y2={y + 3} />
      <text
        className="fp-anim"
        x={cx}
        y={y - 3}
        textAnchor="middle"
        fontSize="10"
        fontWeight="400"
        fill={COBRE}
        stroke="none"
      >
        {label}
      </text>
    </g>
  )
}

// --- Cota vertical (línea + ticks + número rotado), en cobre. ---
function CotaV({ x, y1, y2, label }) {
  const cy = (y1 + y2) / 2
  return (
    <g className="fp-anim" stroke={COBRE} strokeWidth="0.75" fill="none">
      <line className="fp-anim" x1={x} y1={y1} x2={x} y2={y2} />
      <line className="fp-anim" x1={x - 3} y1={y1} x2={x + 3} y2={y1} />
      <line className="fp-anim" x1={x - 3} y1={y2} x2={x + 3} y2={y2} />
      <text
        className="fp-anim"
        x={x - 3}
        y={cy}
        textAnchor="middle"
        fontSize="10"
        fontWeight="400"
        fill={COBRE}
        stroke="none"
        transform={`rotate(-90 ${x - 3} ${cy})`}
      >
        {label}
      </text>
    </g>
  )
}

export default function FloorPlan({ config }) {
  // Estado Empty: config nula/incompleta (T-02-04).
  if (!config) return <EstadoEmpty />

  const layout = calcularLayout(config)

  // Estado Error: geometría inválida (T-02-04).
  if (!layout || layout.valido === false) return <EstadoError />

  const { zonas, anchoU, totalU, pad } = layout

  // Geometría derivada (sin hardcodeo): espesor de pared -> banda interior útil en Y.
  const espesorU = ((GEOMETRIA.anchoExterior - GEOMETRIA.anchoInterior) / 2) * M_A_U // 4u
  const yInterior = espesorU
  const hInterior = anchoU - espesorU * 2

  const zonaBano = zonas.find((z) => z.id === 'bano')
  const zonaCocina = zonas.find((z) => z.id === 'cocina')
  const zonaEstar = zonas.find((z) => z.id === 'estar')
  const zonaDorm = zonas.find((z) => z.id === 'dormitorio')

  // Helper: rect interior de una zona (respeta el espesor de pared en X e Y).
  const rectInterior = (z) => ({
    x: z.x + espesorU,
    y: yInterior,
    w: z.anchoU - espesorU * 2,
    h: hInterior,
  })

  const tieneMesa = Boolean(config.estar?.mesa)
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
            <rect
              key={z.id}
              className="fp-anim"
              x={z.x}
              y={0}
              width={z.anchoU}
              height={anchoU}
              fill={z.fill}
            />
          ))}
          {zonas.slice(1).map((z) => (
            <line
              key={`div-${z.id}`}
              className="fp-anim"
              x1={z.x}
              y1={0}
              x2={z.x}
              y2={anchoU}
              stroke="#1A1A1A"
              strokeOpacity="0.55"
              strokeWidth="1"
            />
          ))}
          {zonas.map((z) => (
            <text
              key={`lbl-${z.id}`}
              className="fp-anim"
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

        {/* (3) Módulos de equipamiento dentro de su zona. */}
        <g>
          {zonaBano && <Bathroom {...rectInterior(zonaBano)} />}
          {zonaCocina && <Kitchen {...rectInterior(zonaCocina)} opciones={config.cocina} />}
          {tieneMesa && zonaEstar && (() => {
            const r = rectInterior(zonaEstar)
            const mw = r.w * 0.5
            const mh = r.h * 0.4
            return (
              <Table
                x={r.x + (r.w - mw) / 2}
                y={r.y + (r.h - mh) / 2}
                w={mw}
                h={mh}
                rebatible={Boolean(config.estar?.rebatible)}
              />
            )
          })()}

          {/* Camas C/S/M ya posicionadas por el layout (2 filas + pasillo central). */}
          {layout.camas.map((c, i) => (
            <Bed key={`cama-${i}`} x={c.x} y={c.y} w={c.w} h={c.h} tipo={c.tipo} />
          ))}
        </g>

        {/* Puerta sobre la pared larga inferior, en la zona de estar/comedor (UI-SPEC). */}
        {zonaEstar && (
          <Door
            x={zonaEstar.x + zonaEstar.anchoU * 0.4}
            y={anchoU}
            length={Math.min(80, zonaEstar.anchoU * 0.5)}
            side="bottom"
          />
        )}

        {/* Ventanas: una en dormitorio (pared superior) y una en cocina (pared superior). */}
        {zonaDorm && (
          <Window
            x={zonaDorm.x + zonaDorm.anchoU / 2 - 30}
            y={0}
            length={60}
            side="top"
          />
        )}
        {zonaCocina && (
          <Window
            x={zonaCocina.x + zonaCocina.anchoU / 2 - 18}
            y={0}
            length={36}
            side="top"
          />
        )}

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

        {/* (4) Capa de cotas en cobre, en el padding reservado. */}
        <g>
          {/* (1) Largo total: cota abajo del dibujo. */}
          <CotaH x1={0} x2={totalU} y={anchoU + pad * 0.45} label={metros(totalU / M_A_U)} />
          {/* (2) Ancho total: cota vertical a la izquierda. */}
          <CotaV x={-pad * 0.3} y1={0} y2={anchoU} label={metros(anchoU / M_A_U)} />
          {/* (3) Largo por zona (cotas segmentadas arriba): baulera/dormitorio/cocina. */}
          {['baulera', 'dormitorio', 'cocina'].map((id) => {
            const z = zonas.find((zz) => zz.id === id)
            if (!z) return null
            return (
              <CotaH
                key={`cota-${id}`}
                x1={z.x}
                x2={z.x + z.anchoU}
                y={-pad * 0.3}
                label={metros(z.largoM)}
              />
            )
          })}
        </g>
      </g>
    </svg>
  )
}
