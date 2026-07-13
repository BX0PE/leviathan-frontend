import { createContext, useCallback, useContext, useState } from 'react'

/* ─── Context ─────────────────────────────────────────────── */
const ToastCtx = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback(({ type = 'info', message, action }) => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, type, message, action }])
    // Auto-dismiss only success/info — errors stay until closed
    if (type !== 'error') {
      setTimeout(() => dismiss(id), 3500)
    }
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ add, dismiss }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}

/* ─── Toast Stack UI ─────────────────────────────────────── */
const STYLES = {
  success: { bar: 'bg-go',      icon: '✓', text: 'text-go' },
  error:   { bar: 'bg-danger',  icon: '✕', text: 'text-danger' },
  info:    { bar: 'bg-rebar',   icon: '↻', text: 'text-rebar' },
}

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 sm:w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const s = STYLES[toast.type] || STYLES.info
  return (
    <div className="bg-asphalt border border-white/10 flex items-stretch shadow-lg">
      {/* Left color bar */}
      <div className={`w-[3px] shrink-0 ${s.bar}`} />

      {/* Content */}
      <div className="flex items-center gap-3 px-3 py-3 flex-1 min-w-0">
        <span className={`font-mono text-sm font-bold shrink-0 ${s.text}`}>{s.icon}</span>
        <p className="font-mono text-[12px] text-white/80 tracking-wide leading-snug flex-1 truncate">
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="font-mono text-[11px] text-brand tracking-widest uppercase underline underline-offset-2 shrink-0"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={() => onDismiss(toast.id)}
          className="font-mono text-white/30 hover:text-white/70 text-sm shrink-0 ml-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
