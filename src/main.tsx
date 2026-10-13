import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production pages are prerendered (all copy is real HTML from the first byte); dev renders client-side.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
