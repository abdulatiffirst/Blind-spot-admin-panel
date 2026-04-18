import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import { agentLog } from './debug/instrument.js'

// // #region agent log
// window.addEventListener('error', (event) => {
//   agentLog({
//     runId: 'run1',
//     hypothesisId: 'H5',
//     location: 'src/main.jsx:7',
//     message: 'window error captured',
//     data: { message: event.message || 'unknown' },
//   })
// })
// window.addEventListener('unhandledrejection', (event) => {
//   agentLog({
//     runId: 'run1',
//     hypothesisId: 'H5',
//     location: 'src/main.jsx:16',
//     message: 'unhandledrejection captured',
//     data: { reason: String(event.reason || 'unknown') },
//   })
// })
// // #endregion

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
