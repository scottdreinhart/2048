import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/app/ThemeContext'
import { SoundProvider } from '@/app/SoundContext'
import { ErrorBoundary } from '@/ui/atoms/ErrorBoundary'
import App from '@/ui/organisms/App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
