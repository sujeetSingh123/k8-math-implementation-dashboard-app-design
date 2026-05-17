import { NavLink } from 'react-router-dom'
import {
  BookOpen, CheckSquare, ClipboardList, MessageSquare, Library, GraduationCap,
  LayoutDashboard, Users, Inbox, TrendingUp, Building2, Activity, BarChart2,
  Download, ChevronDown,
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
  admin: 'Admin',
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

export function Sidebar() {
  const { currentRole, currentUser, setRole, notifications } = useAppStore()
  const roleColor = roleColors[currentRole]
  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.readAt).length

  const coachingUnread = notifications.filter(
    (n) => n.userId === currentUser.id && !n.readAt && n.type === 'coaching_followup',
  ).length

  const nav = getNav(currentRole, { coaching: coachingUnread })

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: roleColor }}>
            M
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">MathImpl</p>
            <p className="text-xs text-gray-400 leading-tight">K–8 Research Dashboard</p>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="px-3 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1.5 px-2">Current Role</p>
        <div className="relative">
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer pr-8"
            style={{ color: roleColor }}
          >
            <option value="teacher">Teacher</option>
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
            <option value="researcher">Researcher</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="mt-2 px-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
            {currentUser.initials[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{roleLabels[currentRole]}</p>
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
                className={({ isActive }) =>
                  `flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'bg-opacity-10 font-medium'
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
    </aside>
  )
}
