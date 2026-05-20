import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ToastContainer } from './components/ui/Toast'
import { LoginPage } from './pages/auth/LoginPage'
import { DailyLog } from './pages/teacher/DailyLog'
import { FidelityCheck } from './pages/teacher/FidelityCheck'
import { AdaptationForm } from './pages/teacher/AdaptationForm'
import { CoachingThread } from './pages/teacher/CoachingThread'
import { ResourceLibrary } from './pages/teacher/ResourceLibrary'
import { TrainingHistory } from './pages/teacher/TrainingHistory'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'
import { StudentData } from './pages/teacher/StudentData'
import { TeacherCaseload } from './pages/coach/TeacherCaseload'
import { FeedbackQueue } from './pages/coach/FeedbackQueue'
import { CoachDashboard } from './pages/coach/CoachDashboard'
import { SchoolOverview } from './pages/admin/SchoolOverview'
import { MTSSMonitoring } from './pages/admin/MTSSMonitoring'
import { RolesPermissions } from './pages/admin/RolesPermissions'
import { Organization } from './pages/admin/Organization'
import { PDPlanning } from './pages/admin/PDPlanning'
import { ResearchAnalytics } from './pages/researcher/ResearchAnalytics'
import { LongitudinalView } from './pages/researcher/LongitudinalView'
import { DataExport } from './pages/researcher/DataExport'
import { DSAIIPathway } from './pages/researcher/DSAIIPathway'
import { useAppStore } from './store/useAppStore'

function DefaultRedirect() {
  const { isAuthenticated, currentRole } = useAppStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const defaults: Record<string, string> = {
    teacher: '/teacher/dashboard',
    coach: '/coach/dashboard',
    admin: '/admin/overview',
    researcher: '/researcher/analytics',
  }
  return <Navigate to={defaults[currentRole] ?? '/teacher/dashboard'} replace />
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="/teacher/log" element={<ProtectedLayout><DailyLog /></ProtectedLayout>} />
        <Route path="/teacher/fidelity" element={<ProtectedLayout><FidelityCheck /></ProtectedLayout>} />
        <Route path="/teacher/adaptations" element={<ProtectedLayout><AdaptationForm /></ProtectedLayout>} />
        <Route path="/teacher/coaching" element={<ProtectedLayout><CoachingThread /></ProtectedLayout>} />
        <Route path="/teacher/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/teacher/training" element={<ProtectedLayout><TrainingHistory /></ProtectedLayout>} />
        <Route path="/teacher/dashboard" element={<ProtectedLayout><TeacherDashboard /></ProtectedLayout>} />
        <Route path="/teacher/student-data" element={<ProtectedLayout><StudentData /></ProtectedLayout>} />
        <Route path="/coach/caseload" element={<ProtectedLayout><TeacherCaseload /></ProtectedLayout>} />
        <Route path="/coach/feedback" element={<ProtectedLayout><FeedbackQueue /></ProtectedLayout>} />
        <Route path="/coach/dashboard" element={<ProtectedLayout><CoachDashboard /></ProtectedLayout>} />
        <Route path="/coach/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/admin/overview" element={<ProtectedLayout><SchoolOverview /></ProtectedLayout>} />
        <Route path="/admin/mtss" element={<ProtectedLayout><MTSSMonitoring /></ProtectedLayout>} />
        <Route path="/admin/roles" element={<ProtectedLayout><RolesPermissions /></ProtectedLayout>} />
        <Route path="/admin/organization" element={<ProtectedLayout><Organization /></ProtectedLayout>} />
        <Route path="/admin/pd-planning" element={<ProtectedLayout><PDPlanning /></ProtectedLayout>} />
        <Route path="/admin/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/researcher/analytics" element={<ProtectedLayout><ResearchAnalytics /></ProtectedLayout>} />
        <Route path="/researcher/longitudinal" element={<ProtectedLayout><LongitudinalView /></ProtectedLayout>} />
        <Route path="/researcher/export" element={<ProtectedLayout><DataExport /></ProtectedLayout>} />
        <Route path="/researcher/dsaii" element={<ProtectedLayout><DSAIIPathway /></ProtectedLayout>} />
        <Route path="/researcher/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
