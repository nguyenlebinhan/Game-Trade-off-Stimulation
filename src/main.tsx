import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GameShell } from './ui/GameShell'
import './ui/styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><GameShell /></StrictMode>)
