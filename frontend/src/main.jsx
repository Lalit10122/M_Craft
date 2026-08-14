import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')
  
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass' // Ignore requests not handled in MSW (like static assets)
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
