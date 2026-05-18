import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/teacher/log': 'Daily Implementation Log',
  '/teacher/fidelity': 'Fidelity Self-Check',
  '/teacher/adaptations': 'Adaptation Documentation',
  '/teacher/coaching': 'Coaching Thread',
  '/teacher/library': 'Resource Library',
  '/teacher/training': 'My Training History',
  '/teacher/dashboard': 'My Dashboard',
  '/coach/caseload': 'Teacher Caseload',
  '/coach/feedback': 'Feedback Queue',
  '/coach/dashboard': 'Coach Dashboard',
  '/admin/overview': 'School Overview',
  '/admin/mtss': 'MTSS Monitoring',
  '/admin/roles': 'Roles & Permissions',
  '/admin/organization': 'Organization',
  '/researcher/analytics': 'Research Analytics',
  '/researcher/export': 'Data Export',
}

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'MathImpl'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slides in when open */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
