import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './config/fontAwesome'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'

// Prevent Font Awesome from dynamically adding its CSS
config.autoAddCss = false

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)