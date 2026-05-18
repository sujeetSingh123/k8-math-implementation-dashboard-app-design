import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen, CheckSquare, ClipboardList, MessageSquare, Library, GraduationCap,
  LayoutDashboard, Users, Inbox, TrendingUp, Building2, Activity, BarChart2,
  Download, X, Shield, LogOut,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Role } from '../../types'

const roleColors: Record<Role, string> = {
  teacher: '#10B981',
  coach: '#3B82F6',
  admin: '#F59E0B',
  researcher: '#8B5CF6',
}

const roleLabels: Record<Role, string> = {
  teacher: 'Teacher',
  coach: 'Coach',
  admin: 'Administrator',
  researcher: 'Researcher',
}

type NavItem = { label: string; path: string; icon: React.ReactNode; badge?: string }
type NavSection = { section: string; items: NavItem[] }

function getNav(role: Role, unreadCounts: Record<string, number>): NavSection[] {
  if (role === 'teacher') {
    return [
      {
        section: 'My Work',
        items: [
          { label: 'Daily Log', path: '/teacher/log', icon: <ClipboardList size={16} /> },
          { label: 'Fidelity Check', path: '/teacher/fidelity', icon: <CheckSquare size={16} /> },
          { label: 'Adaptations', path: '/teacher/adaptations', icon: <BookOpen size={16} /> },
          { label: 'Coaching', path: '/teacher/coaching', icon: <MessageSquare size={16} />, badge: unreadCounts.coaching > 0 ? String(unreadCounts.coaching) : undefined },
        ],
      },
      {
        section: 'Resources',
        items: [
          { label: 'Resource Library', path: '/teacher/library', icon: <Library size={16} /> },
          { label: 'My Training', path: '/teacher/training', icon: <GraduationCap size={16} /> },
        ],
      },
      {
        section: 'Insights',
        items: [
          { label: 'My Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard size={16} /> },
        ],
      },
    ]
  }
  if (role === 'coach') {
    return [
      {
        section: 'Caseload',
        items: [
          { label: 'My Teachers', path: '/coach/caseload', icon: <Users size={16} /> },
          { label: 'Feedback Queue', path: '/coach/feedback', icon: <Inbox size={16} />, badge: '3' },
        ],
      },
      {
        section: 'Insights',
        items: [
          { label: 'Coach Dashboard', path: '/coach/dashboard', icon: <LayoutDashboard size={16} /> },
        ],
      },
    ]
  }
  if (role === 'admin') {
    return [
      {
        section: 'Overview',
        items: [
          { label: 'School Overview', path: '/admin/overview', icon: <Building2 size={16} /> },
          { label: 'MTSS Monitoring', path: '/admin/mtss', icon: <Activity size={16} /> },
        ],
      },
      {
        section: 'Management',
        items: [
          { label: 'Organization', path: '/admin/organization', icon: <Users size={16} /> },
          { label: 'Roles & Permissions', path: '/admin/roles', icon: <Shield size={16} /> },
        ],
      },
    ]
  }
  return [
    {
      section: 'Analytics',
      items: [
        { label: 'Research Analytics', path: '/researcher/analytics', icon: <BarChart2 size={16} /> },
        { label: 'Longitudinal View', path: '/researcher/analytics', icon: <TrendingUp size={16} /> },
      ],
    },
    {
      section: 'Data',
      items: [
        { label: 'Export Data', path: '/researcher/export', icon: <Download size={16} /> },
      ],
    },
  ]
}

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { currentRole, currentUser, logout, notifications } = useAppStore()
  const navigate = useNavigate()
  const roleColor = roleColors[currentRole]
  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.readAt).length

  const coachingUnread = notifications.filter(
    (n) => n.userId === currentUser.id && !n.readAt && n.type === 'coaching_followup',
  ).length

  const nav = getNav(currentRole, { coaching: coachingUnread })

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: roleColor }}>
            M
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">MathImpl</p>
            <p className="text-xs text-gray-400 leading-tight">K–8 Research Dashboard</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Current User */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
            {currentUser.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
            <p className="text-xs" style={{ color: roleColor }}>{roleLabels[currentRole]}</p>
          </div>
          {unreadCount > 0 && (
            <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: roleColor }}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {nav.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
              {section.section}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.path + item.label}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: `${roleColor}15`, color: roleColor, borderLeft: `3px solid ${roleColor}`, paddingLeft: '5px' }
                    : {}
                }
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: roleColor }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
