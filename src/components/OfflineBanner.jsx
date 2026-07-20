import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const [justCameBack, setJustCameBack] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
      setJustCameBack(true)
      setTimeout(() => setJustCameBack(false), 3000)
    }
    function handleOffline() {
      setOnline(false)
      setJustCameBack(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online && !justCameBack) return null

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 py-1.5 font-mono text-[11px] tracking-widest uppercase transition-all ${
        online
          ? 'bg-go text-white'
          : 'bg-caution text-asphalt'
      }`}
    >
      {online ? (
        <>✓ Savienojums atjaunots · sinhronizē…</>
      ) : (
        <>⚠ Bezsaistes režīms · dati tiks saglabāti</>
      )}
    </div>
  )
}
