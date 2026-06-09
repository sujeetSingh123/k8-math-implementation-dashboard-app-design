import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList, BookOpen, MessageSquare, Library,
  LayoutDashboard, Users, Inbox, TrendingUp, Building2, Activity, BarChart2,
  Download, X, Shield, LogOut, BarChart, GitBranch, CalendarDays, DollarSign, Award, Globe,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { roleColors, roleLabels } from '../../constants/roles'
import { usePermissions } from '../../hooks/usePermissions'
import type { Role } from '../../types'

type NavItem = { label: string; path: string; icon: React.ReactNode; badge?: string; permission?: string }
type NavSection = { section: string; items: NavItem[] }

function getNav(role: Role, unreadCounts: Record<string, number>): NavSection[] {
  const feedbackBadge = unreadCounts.feedback > 0 ? String(unreadCounts.feedback) : undefined
  const msgBadge = unreadCounts.messages > 0 ? String(unreadCounts.messages) : undefined
  const msgItem: NavItem = { label: 'Messages', path: '/messages', icon: <MessageSquare size={16} />, badge: msgBadge }

  if (role === 'teacher' || role === 'paraprofessional') {
    return [
      {
        section: 'My Work',
        items: [
          { label: 'Daily Log', path: '/teacher/log', icon: <ClipboardList size={16} />, permission: 'p_edit_logs' },
          { label: 'Past Logs', path: '/teacher/logs', icon: <BookOpen size={16} />, permission: 'p_edit_logs' },
          { label: 'Student Data', path: '/teacher/student-data', icon: <BarChart size={16} />, permission: 'p_view_student_data' },
        ],
      },
      {
        section: 'Resources',
        items: [
          { label: 'Coaching', path: '/teacher/coaching', icon: <BookOpen size={16} />, badge: unreadCounts.coaching > 0 ? String(unreadCounts.coaching) : undefined, permission: 'p_respond_coaching' },
          { label: 'Impl. Learning Labs', path: '/teacher/labs', icon: <CalendarDays size={16} /> },
          { label: 'Resource Library', path: '/teacher/library', icon: <Library size={16} /> },
        ],
      },
      {
        section: 'Insights',
        items: [
          { label: 'My Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard size={16} />, permission: 'p_view_reports' },
          { label: 'My Incentives', path: '/teacher/incentives', icon: <Award size={16} />, permission: 'p_view_reports' },
        ],
      },
      { section: 'Communication', items: [msgItem] },
    ]
  }
  if (role === 'coach') {
    return [
      {
        section: 'Caseload',
        items: [
          { label: 'My Teachers', path: '/coach/caseload', icon: <Users size={16} />, permission: 'p_view_users' },
          { label: 'Feedback Queue', path: '/coach/feedback', icon: <Inbox size={16} />, badge: feedbackBadge, permission: 'p_respond_coaching' },
          { label: 'Student Data', path: '/coach/student-data', icon: <BarChart size={16} />, permission: 'p_view_student_data' },
        ],
      },
      {
        section: 'Resources',
        items: [
          { label: 'Resource Library', path: '/coach/library', icon: <Library size={16} /> },
          { label: 'Impl. Learning Labs', path: '/coach/labs', icon: <CalendarDays size={16} /> },
        ],
      },
      {
        section: 'Insights',
        items: [
          { label: 'Coach Dashboard', path: '/coach/dashboard', icon: <LayoutDashboard size={16} />, permission: 'p_view_reports' },
          { label: 'Fidelity Trends', path: '/coach/fidelity-trends', icon: <TrendingUp size={16} />, permission: 'p_view_fidelity' },
          { label: 'Incentives', path: '/coach/incentives', icon: <Award size={16} />, permission: 'p_view_reports' },
        ],
      },
      { section: 'Communication', items: [msgItem] },
    ]
  }
  if (role === 'admin') {
    return [
      {
        section: 'Overview',
        items: [
          { label: 'School Overview', path: '/admin/overview', icon: <Building2 size={16} />, permission: 'p_view_reports' },
          { label: 'MTSS Monitoring', path: '/admin/mtss', icon: <Activity size={16} />, permission: 'p_view_fidelity' },
          { label: 'Fidelity Trends', path: '/admin/fidelity-trends', icon: <TrendingUp size={16} />, permission: 'p_view_fidelity' },
          { label: 'Student Data', path: '/admin/student-data', icon: <BarChart size={16} />, permission: 'p_view_student_data' },
        ],
      },
      {
        section: 'Management',
        items: [
          { label: 'Organization', path: '/admin/organization', icon: <Users size={16} />, permission: 'p_view_users' },
          { label: 'Roles & Permissions', path: '/admin/roles', icon: <Shield size={16} />, permission: 'p_assign_roles' },
          { label: 'Impl. Learning Labs', path: '/admin/pd-planning', icon: <CalendarDays size={16} />, permission: 'p_manage_org' },
        ],
      },
      {
        section: 'Resources',
        items: [
          { label: 'Resource Library', path: '/admin/library', icon: <Library size={16} /> },
          { label: 'Manage Resources', path: '/admin/resources', icon: <Library size={16} />, permission: 'p_manage_org' },
        ],
      },
      {
        section: 'Incentives',
        items: [
          { label: 'My Incentives', path: '/admin/incentives', icon: <Award size={16} />, permission: 'p_view_reports' },
        ],
      },
      { section: 'Communication', items: [msgItem] },
    ]
  }
  if (role === 'super_admin') {
    return [
      {
        section: 'District',
        items: [
          { label: 'Overview', path: '/super-admin/dashboard', icon: <Globe size={16} /> },
          { label: 'Schools', path: '/super-admin/schools', icon: <Building2 size={16} /> },
          { label: 'Users', path: '/super-admin/users', icon: <Users size={16} /> },
        ],
      },
      {
        section: 'Resources',
        items: [
          { label: 'Impl. Learning Labs', path: '/super-admin/labs', icon: <CalendarDays size={16} /> },
        ],
      },
      { section: 'Communication', items: [msgItem] },
    ]
  }
  return [
    {
      section: 'Analytics',
      items: [
        { label: 'Research Analytics', path: '/researcher/analytics', icon: <BarChart2 size={16} />, permission: 'p_view_logs' },
        { label: 'Longitudinal View', path: '/researcher/longitudinal', icon: <TrendingUp size={16} />, permission: 'p_view_student_data' },
        { label: 'Log Aggregation', path: '/researcher/log-aggregation', icon: <Activity size={16} />, permission: 'p_view_logs' },
        { label: 'Fidelity Trends', path: '/researcher/fidelity-trends', icon: <TrendingUp size={16} />, permission: 'p_view_fidelity' },
        { label: 'DSAII Pathway', path: '/researcher/dsaii', icon: <GitBranch size={16} />, permission: 'p_view_reports' },
        { label: 'Impl. Learning Labs', path: '/researcher/labs', icon: <CalendarDays size={16} /> },
      ],
    },
    {
      section: 'Data',
      items: [
        { label: 'Student Data', path: '/researcher/student-data', icon: <BarChart size={16} />, permission: 'p_view_student_data' },
        { label: 'Data Browser', path: '/researcher/data-browser', icon: <Users size={16} />, permission: 'p_view_logs' },
        { label: 'Export Data', path: '/researcher/export', icon: <Download size={16} />, permission: 'p_export_data' },
        { label: 'Resource Library', path: '/researcher/library', icon: <Library size={16} /> },
        { label: 'Manage Resources', path: '/admin/resources', icon: <Library size={16} /> },
      ],
    },
    {
      section: 'Budget',
      items: [
        { label: 'Budget & Incentives', path: '/researcher/budget', icon: <DollarSign size={16} />, permission: 'p_view_reports' },
      ],
    },
    { section: 'Communication', items: [msgItem] },
  ]
}

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { currentRole, currentUser, logout, notifications, feedbackItems, conversations } = useAppStore()
  const navigate = useNavigate()
  const has = usePermissions()
  const roleColor = roleColors[currentRole]
  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.readAt).length

  const coachingUnread = notifications.filter(
    (n) => n.userId === currentUser.id && !n.readAt && n.type === 'coaching_followup',
  ).length

  const pendingFeedback = feedbackItems.filter(
    (f) => !f.resolved && f.coachId === currentUser.id,
  ).length

  const messageUnread = conversations
    .filter((c) => c.participantIds.includes(currentUser.id))
    .reduce((total, c) => total + c.messages.filter((m) => m.senderId !== currentUser.id && !m.readAt).length, 0)

  const rawNav = getNav(currentRole, { coaching: coachingUnread, feedback: pendingFeedback, messages: messageUnread })
  const nav = rawNav
    .map(section => ({ ...section, items: section.items.filter(item => !item.permission || has(item.permission)) }))
    .filter(section => section.items.length > 0)

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
        <div className="flex items-center gap-2 mb-2">
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
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 tracking-wide">
            {currentUser.id}
          </span>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 tracking-wide">
            {currentUser.schoolId}
          </span>
          {currentUser.coachId && (
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 tracking-wide">
              {currentUser.coachId}
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
