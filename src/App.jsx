import { ThemeProvider } from 'styled-components'
import GlobalStyles from './styles/GlobalStyles'
import { theme } from './styles/theme'
import AppRouter from './router'
import { AuthProvider } from './hooks/useAuth'
// import { agentLog } from './debug/instrument.js'

function App() {
  

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
