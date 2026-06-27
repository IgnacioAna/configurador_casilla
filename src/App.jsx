import { useState } from 'react'
import Landing from './components/Landing.jsx'
import ConfiguratorWizard from './components/ConfiguratorWizard.jsx'
import { STORAGE_KEY } from './hooks/usePersistedConfig.js'

// Ruteo de estado de una sola página (SPA): landing → wizard, sin cambiar la URL.
// El plano se integra dentro del wizard en el Plan 03 (PLANO-03).

// Si ya hay una configuración guardada, retomamos directo en el wizard (SHELL-03:
// al recargar, el usuario retoma donde quedó). Si no, arranca en la landing.
function vistaInicial() {
  try {
    return localStorage.getItem(STORAGE_KEY) ? 'wizard' : 'landing'
  } catch {
    return 'landing'
  }
}

export default function App() {
  const [vista, setVista] = useState(vistaInicial)

  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      {vista === 'landing' ? (
        <Landing onComenzar={() => setVista('wizard')} />
      ) : (
        <ConfiguratorWizard onVolverInicio={() => setVista('landing')} />
      )}
    </div>
  )
}
