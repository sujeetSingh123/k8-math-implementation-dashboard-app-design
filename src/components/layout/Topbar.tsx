import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, ChevronDown, LogOut, Settings } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { NotificationPanel } from '../ui/NotificationPanel'
import { roleColors, roleLabels } from '../../constants/roles'

interface TopbarProps {
  title: string
  onMenuClick: () => void
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { currentRole, currentUser, notifications, logout } = useAppStore()
  const navigate = useNavigate()
  const roleColor = roleColors[currentRole]
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.readAt).length

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 relative">
      <div className="flex items-center gap-3 min-w-0">
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
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(v => !v); setShowUserMenu(false) }}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Bell size={18} />
          </button>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center pointer-events-none"
              style={{ backgroundColor: roleColor }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(v => !v); setShowNotifications(false) }}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <div
              className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center"
              style={{ backgroundColor: roleColor }}
            >
              {currentUser.initials}
            </div>
            <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-11 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{roleLabels[currentRole]}</p>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Settings size={14} className="text-gray-400" />Account Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut size={14} />Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
