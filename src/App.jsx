import { useState } from 'react'
import Landing from './components/Landing.jsx'
import ConfiguratorWizard from './components/ConfiguratorWizard.jsx'
import Resumen from './components/Resumen.jsx'
import { usePersistedConfig, STORAGE_KEY } from './hooks/usePersistedConfig.js'

// Ruteo de estado de una sola página (SPA): landing → wizard → resumen, sin cambiar la URL.
//
// D-01 (Fase 6): el estado de configuración (usePersistedConfig) se IZA acá (lifting state up).
// Antes vivía dentro de ConfiguratorWizard; ahora App tiene la ÚNICA instancia del hook y pasa
// { estado, dispatch, reiniciar } por props al wizard y al resumen. Una sola fuente de verdad:
// así "Editar" desde el resumen (IR_A_PASO) muta el MISMO estado que lee el wizard, y navegar al
// resumen no resetea nada (D-02: el estado sigue vivo).

// Si ya hay una configuración guardada, retomamos directo en el wizard (SHELL-03:
// al recargar, el usuario retoma donde quedó). Si no, arranca en la landing.
// vistaInicial NO conoce 'resumen' a propósito: un F5 en el resumen cae al wizard con el estado
// intacto (el usuario retoma el configurador y vuelve a entrar al resumen desde el Paso 6).
function vistaInicial() {
  try {
    return localStorage.getItem(STORAGE_KEY) ? 'wizard' : 'landing'
  } catch {
    return 'landing'
  }
}

export default function App() {
  const [vista, setVista] = useState(vistaInicial)
  const { estado, dispatch, reiniciar } = usePersistedConfig()

  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      {vista === 'landing' && <Landing onComenzar={() => setVista('wizard')} />}
      {vista === 'wizard' && (
        <ConfiguratorWizard
          estado={estado}
          dispatch={dispatch}
          reiniciar={reiniciar}
          onVolverInicio={() => setVista('landing')}
          onVerResumen={() => setVista('resumen')}
        />
      )}
      {vista === 'resumen' && (
        <Resumen
          estado={estado}
          dispatch={dispatch}
          onVolverEditar={() => setVista('wizard')}
        />
      )}
    </div>
  )
}
