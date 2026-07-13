import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { startSyncListener } from './db/db.js'
import { ToastProvider } from './components/Toast.jsx'
import KeyboardShortcuts from './components/KeyboardShortcuts.jsx'

startSyncListener()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
        <KeyboardShortcuts />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
