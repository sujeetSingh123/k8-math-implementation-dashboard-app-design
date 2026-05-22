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
import { MyLogs } from './pages/teacher/MyLogs'
import { StudentData } from './pages/teacher/StudentData'
import { TeacherCaseload } from './pages/coach/TeacherCaseload'
import { FeedbackQueue } from './pages/coach/FeedbackQueue'
import { CoachDashboard } from './pages/coach/CoachDashboard'
import { SchoolOverview } from './pages/admin/SchoolOverview'
import { MTSSMonitoring } from './pages/admin/MTSSMonitoring'
import { RolesPermissions } from './pages/admin/RolesPermissions'
import { Organization } from './pages/admin/Organization'
import { PDPlanning } from './pages/admin/PDPlanning'
import { ResourceManagement } from './pages/admin/ResourceManagement'
import { ResearchAnalytics } from './pages/researcher/ResearchAnalytics'
import { LongitudinalView } from './pages/researcher/LongitudinalView'
import { DataExport } from './pages/researcher/DataExport'
import { DSAIIPathway } from './pages/researcher/DSAIIPathway'
import { useAppStore } from './store/useAppStore'
import { PermissionGate } from './components/ui/PermissionGate'

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
        <Route path="/teacher/log" element={<ProtectedLayout><PermissionGate permissionId="p_edit_logs"><DailyLog /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/logs" element={<ProtectedLayout><PermissionGate permissionId="p_edit_logs"><MyLogs /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/fidelity" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityCheck /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/adaptations" element={<ProtectedLayout><PermissionGate permissionId="p_edit_logs"><AdaptationForm /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/coaching" element={<ProtectedLayout><PermissionGate permissionId="p_respond_coaching"><CoachingThread /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/teacher/training" element={<ProtectedLayout><TrainingHistory /></ProtectedLayout>} />
        <Route path="/teacher/dashboard" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><TeacherDashboard /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/student-data" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><StudentData /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/caseload" element={<ProtectedLayout><PermissionGate permissionId="p_view_users"><TeacherCaseload /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/feedback" element={<ProtectedLayout><PermissionGate permissionId="p_respond_coaching"><FeedbackQueue /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/dashboard" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><CoachDashboard /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/admin/overview" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><SchoolOverview /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/mtss" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><MTSSMonitoring /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/roles" element={<ProtectedLayout><PermissionGate permissionId="p_assign_roles"><RolesPermissions /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/organization" element={<ProtectedLayout><PermissionGate permissionId="p_view_users"><Organization /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/pd-planning" element={<ProtectedLayout><PermissionGate permissionId="p_manage_org"><PDPlanning /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/admin/resources" element={<ProtectedLayout><PermissionGate permissionId="p_manage_org"><ResourceManagement /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/analytics" element={<ProtectedLayout><PermissionGate permissionId="p_view_logs"><ResearchAnalytics /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/longitudinal" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><LongitudinalView /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/export" element={<ProtectedLayout><PermissionGate permissionId="p_export_data"><DataExport /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/dsaii" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><DSAIIPathway /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
