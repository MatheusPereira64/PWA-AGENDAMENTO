import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Settings } from 'luxon'
import { App } from './App'
import './index.css'

Settings.defaultWeekSettings = { firstDay: 1, minimalDays: 4, weekend: [6, 7] }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
