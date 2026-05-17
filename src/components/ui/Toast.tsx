import { useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />,
  error: <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />,
  info: <Info size={16} className="text-blue-500 flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
}

const borderColors = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
  warning: 'border-amber-200 bg-amber-50',
}

function ToastItem({ id, message, type }: { id: string; message: string; type: keyof typeof icons }) {
  const remove = useToastStore(s => s.remove)

  useEffect(() => {
    const t = setTimeout(() => remove(id), 3500)
    return () => clearTimeout(t)
  }, [id, remove])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium text-gray-800 animate-slide-in ${borderColors[type]}`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={() => remove(id)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  )
}
