import { type ReactNode } from 'react'
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
  '/researcher/analytics': 'Research Analytics',
  '/researcher/export': 'Data Export',
}

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'MathImpl'

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
