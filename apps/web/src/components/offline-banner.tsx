import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="flex items-center gap-2 bg-ink px-4 py-2 text-sm text-paper" role="status">
      <WifiOff size={16} />
      Sem conexão. Você pode consultar o que já estava aberto. Agendamentos não são confirmados offline.
    </div>
  )
}
