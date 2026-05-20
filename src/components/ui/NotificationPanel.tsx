import { useEffect, useRef } from 'react'
import { Bell, CheckCheck, AlertCircle, MessageSquare, GraduationCap, ClipboardList, X, UploadCloud, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Notification } from '../../types'

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  missing_log: <ClipboardList size={14} className="text-amber-500" />,
  fidelity_due: <AlertCircle size={14} className="text-blue-500" />,
  coaching_followup: <MessageSquare size={14} className="text-emerald-500" />,
  training_deadline: <GraduationCap size={14} className="text-purple-500" />,
  student_data_due: <UploadCloud size={14} className="text-teal-500" />,
  adaptation_incomplete: <AlertTriangle size={14} className="text-orange-500" />,
}

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { currentUser, notifications, markNotificationRead } = useAppStore()
  const ref = useRef<HTMLDivElement>(null)

  const myNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const unread = myNotifications.filter(n => !n.readAt)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  const markAllRead = () => {
    unread.forEach(n => markNotificationRead(n.id))
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Notifications</span>
          {unread.length > 0 && (
            <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">{unread.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer flex items-center gap-1">
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {myNotifications.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          myNotifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.readAt ? 'bg-blue-50/40' : ''}`}
            >
              <div className="mt-0.5 flex-shrink-0">{typeIcons[n.type]}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${n.readAt ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
              </div>
              {!n.readAt && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
