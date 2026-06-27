// Registro de los 6 pasos del wizard (SHELL-02). El contenido real de cada paso reemplaza el campo
// `Componente` de su entrada SIN tocar la cáscara del wizard (este registro es el contrato de enchufe).
// Phase 4 enchufa los Pasos 1-3 (uso/dimensiones/baño); Phase 5 enchufa los Pasos 4-6
// (dormitorio/cocina/extras). Ya no quedan stubs: los 6 pasos apuntan a su componente real.
import PasoUso from './pasos/PasoUso.jsx'
import PasoDimensiones from './pasos/PasoDimensiones.jsx'
import PasoBano from './pasos/PasoBano.jsx'
import PasoDormitorio from './pasos/PasoDormitorio.jsx'
import PasoCocina from './pasos/PasoCocina.jsx'
import PasoExtras from './pasos/PasoExtras.jsx'

export const PASOS = [
  { id: 'uso', titulo: 'Uso y ocupantes', Componente: PasoUso },
  { id: 'dimensiones', titulo: 'Dimensiones', Componente: PasoDimensiones },
  { id: 'bano', titulo: 'Baño', Componente: PasoBano },
  { id: 'dormitorio', titulo: 'Dormitorio', Componente: PasoDormitorio },
  { id: 'cocina', titulo: 'Cocina y estar', Componente: PasoCocina },
  { id: 'extras', titulo: 'Extras', Componente: PasoExtras },
]
