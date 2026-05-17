import { Bell, Menu } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Role } from '../../types'

const roleColors: Record<Role, string> = {
  teacher: '#10B981',
  coach: '#3B82F6',
  admin: '#F59E0B',
  researcher: '#8B5CF6',
}

interface TopbarProps {
  title: string
  onMenuClick: () => void
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { currentRole, currentUser, notifications } = useAppStore()
  const roleColor = roleColors[currentRole]
  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.readAt).length

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{title}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <div className="relative">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <Bell size={18} />
          </button>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: roleColor }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <div
          className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center"
          style={{ backgroundColor: roleColor }}
        >
          {currentUser.initials}
        </div>
      </div>
    </header>
  )
}
