// Registro de los 6 pasos del wizard (SHELL-02). El contenido real de cada paso reemplaza el campo
// `Componente` de su entrada SIN tocar la cáscara del wizard (este registro es el contrato de enchufe).
// Phase 4 enchufa los Pasos 1-3 reales (uso/dimensiones/baño); los Pasos 4-6 siguen como STUB
// ("próximamente") hasta Phase 5.
import PasoUso from './pasos/PasoUso.jsx'
import PasoDimensiones from './pasos/PasoDimensiones.jsx'
import PasoBano from './pasos/PasoBano.jsx'

// Stub reutilizable: muestra el número y el título del paso. Acepta props futuras
// (estado, dispatch) que en esta fase ignora.
function StubPaso({ numero, titulo }) {
  return (
    <div className="py-8 text-center">
      <h2 className="text-xl font-semibold text-impacar-texto">{titulo}</h2>
      <p className="mt-2 text-sm text-impacar-texto/70">
        Paso {numero} — este paso estará disponible próximamente.
      </p>
    </div>
  )
}

export const PASOS = [
  { id: 'uso', titulo: 'Uso y ocupantes', Componente: PasoUso },
  { id: 'dimensiones', titulo: 'Dimensiones', Componente: PasoDimensiones },
  { id: 'bano', titulo: 'Baño', Componente: PasoBano },
  { id: 'dormitorio', titulo: 'Dormitorio', Componente: (props) => <StubPaso numero={4} titulo="Dormitorio" {...props} /> },
  { id: 'cocina', titulo: 'Cocina y estar', Componente: (props) => <StubPaso numero={5} titulo="Cocina y estar" {...props} /> },
  { id: 'extras', titulo: 'Extras', Componente: (props) => <StubPaso numero={6} titulo="Extras" {...props} /> },
]
