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
import { StudentDataView } from './pages/shared/StudentDataView'
import { TeacherCaseload } from './pages/coach/TeacherCaseload'
import { TeacherDetailPage } from './pages/coach/TeacherDetailPage'
import { FeedbackQueue } from './pages/coach/FeedbackQueue'
import { CoachDashboard } from './pages/coach/CoachDashboard'
import { SchoolOverview } from './pages/admin/SchoolOverview'
import { MTSSMonitoring } from './pages/admin/MTSSMonitoring'
import { RolesPermissions } from './pages/admin/RolesPermissions'
import { Organization } from './pages/admin/Organization'
import { PDPlanning } from './pages/admin/PDPlanning'
import { TeacherLabs } from './pages/teacher/TeacherLabs'
import { ResourceManagement } from './pages/admin/ResourceManagement'
import { AdminIncentives } from './pages/admin/AdminIncentives'
import { ResearchAnalytics } from './pages/researcher/ResearchAnalytics'
import { LongitudinalView } from './pages/researcher/LongitudinalView'
import { LogAggregation } from './pages/researcher/LogAggregation'
import { DataExport } from './pages/researcher/DataExport'
import { DSAIIPathway } from './pages/researcher/DSAIIPathway'
import { BudgetView } from './pages/researcher/BudgetView'
import { DataBrowser } from './pages/researcher/DataBrowser'
import { DistrictComparison } from './pages/researcher/DistrictComparison'
import { MyIncentives } from './pages/teacher/MyIncentives'
import { CoachIncentives } from './pages/coach/CoachIncentives'
import { FidelityAdaptationView } from './pages/shared/FidelityAdaptationView'
import { MessagesPage } from './pages/shared/MessagesPage'
import { SuperAdminDashboard } from './pages/super_admin/SuperAdminDashboard'
import { SchoolManagement } from './pages/super_admin/SchoolManagement'
import { UserManagement } from './pages/super_admin/UserManagement'
import { DistrictAdminDashboard } from './pages/district_admin/DistrictAdminDashboard'
import { DistrictSchoolsView } from './pages/district_admin/DistrictSchoolsView'
import { useAppStore } from './store/useAppStore'
import { PermissionGate } from './components/ui/PermissionGate'

function DefaultRedirect() {
  const { isAuthenticated, currentRole } = useAppStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const defaults: Record<string, string> = {
    teacher: '/teacher/dashboard',
    paraprofessional: '/teacher/dashboard',
    coach: '/coach/dashboard',
    admin: '/admin/overview',
    district_admin: '/district-admin/dashboard',
    researcher: '/researcher/analytics',
    super_admin: '/super-admin/dashboard',
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
        <Route path="/teacher/planning" element={<Navigate to="/teacher/log" replace />} />
        <Route path="/teacher/log" element={<ProtectedLayout><PermissionGate permissionId="p_edit_logs"><DailyLog /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/logs" element={<ProtectedLayout><PermissionGate permissionId="p_edit_logs"><MyLogs /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/fidelity-trends" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityAdaptationView /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/fidelity" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityCheck /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/adaptations" element={<ProtectedLayout><PermissionGate permissionId="p_edit_logs"><AdaptationForm /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/coaching" element={<ProtectedLayout><PermissionGate permissionId="p_respond_coaching"><CoachingThread /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/teacher/training" element={<ProtectedLayout><TrainingHistory /></ProtectedLayout>} />
        <Route path="/teacher/dashboard" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><TeacherDashboard /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/student-data" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><StudentData /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/incentives" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><MyIncentives /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/student-data" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><StudentDataView /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/caseload" element={<ProtectedLayout><PermissionGate permissionId="p_view_users"><TeacherCaseload /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/teacher/:teacherId" element={<ProtectedLayout><PermissionGate permissionId="p_view_users"><TeacherDetailPage /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/feedback" element={<ProtectedLayout><PermissionGate permissionId="p_respond_coaching"><FeedbackQueue /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/dashboard" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><CoachDashboard /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/fidelity-trends" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityAdaptationView /></PermissionGate></ProtectedLayout>} />
        <Route path="/coach/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/coach/incentives" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><CoachIncentives /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/student-data" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><StudentDataView /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/overview" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><SchoolOverview /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/fidelity-trends" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityAdaptationView /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/mtss" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><MTSSMonitoring /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/roles" element={<ProtectedLayout><PermissionGate permissionId="p_assign_roles"><RolesPermissions /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/organization" element={<ProtectedLayout><PermissionGate permissionId="p_view_users"><Organization /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/pd-planning" element={<ProtectedLayout><PermissionGate permissionId="p_manage_org"><PDPlanning /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/admin/resources" element={<ProtectedLayout><PermissionGate permissionId="p_manage_org"><ResourceManagement /></PermissionGate></ProtectedLayout>} />
        <Route path="/admin/incentives" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><AdminIncentives /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/student-data" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><StudentDataView /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/analytics" element={<ProtectedLayout><PermissionGate permissionId="p_view_logs"><ResearchAnalytics /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/longitudinal" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><LongitudinalView /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/log-aggregation" element={<ProtectedLayout><PermissionGate permissionId="p_view_logs"><LogAggregation /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/fidelity-trends" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityAdaptationView /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/data-browser" element={<ProtectedLayout><PermissionGate permissionId="p_view_logs"><DataBrowser /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/teacher/:teacherId" element={<ProtectedLayout><PermissionGate permissionId="p_view_logs"><TeacherDetailPage /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/export" element={<ProtectedLayout><PermissionGate permissionId="p_export_data"><DataExport /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/dsaii" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><DSAIIPathway /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/researcher/budget" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><BudgetView /></PermissionGate></ProtectedLayout>} />
        <Route path="/researcher/districts" element={<ProtectedLayout><PermissionGate permissionId="p_view_logs"><DistrictComparison /></PermissionGate></ProtectedLayout>} />
        <Route path="/teacher/labs" element={<ProtectedLayout><TeacherLabs /></ProtectedLayout>} />
        <Route path="/coach/labs" element={<ProtectedLayout><PDPlanning /></ProtectedLayout>} />
        <Route path="/researcher/labs" element={<ProtectedLayout><PDPlanning /></ProtectedLayout>} />
        <Route path="/messages" element={<ProtectedLayout><MessagesPage /></ProtectedLayout>} />
        <Route path="/district-admin/dashboard" element={<ProtectedLayout><DistrictAdminDashboard /></ProtectedLayout>} />
        <Route path="/district-admin/schools" element={<ProtectedLayout><DistrictSchoolsView /></ProtectedLayout>} />
        <Route path="/district-admin/users" element={<ProtectedLayout><PermissionGate permissionId="p_view_users"><UserManagement /></PermissionGate></ProtectedLayout>} />
        <Route path="/district-admin/mtss" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><MTSSMonitoring /></PermissionGate></ProtectedLayout>} />
        <Route path="/district-admin/fidelity-trends" element={<ProtectedLayout><PermissionGate permissionId="p_view_fidelity"><FidelityAdaptationView /></PermissionGate></ProtectedLayout>} />
        <Route path="/district-admin/student-data" element={<ProtectedLayout><PermissionGate permissionId="p_view_student_data"><StudentDataView /></PermissionGate></ProtectedLayout>} />
        <Route path="/district-admin/incentives" element={<ProtectedLayout><PermissionGate permissionId="p_view_reports"><AdminIncentives /></PermissionGate></ProtectedLayout>} />
        <Route path="/district-admin/library" element={<ProtectedLayout><ResourceLibrary /></ProtectedLayout>} />
        <Route path="/district-admin/pd-planning" element={<ProtectedLayout><PermissionGate permissionId="p_manage_org"><PDPlanning /></PermissionGate></ProtectedLayout>} />
        <Route path="/super-admin/dashboard" element={<ProtectedLayout><SuperAdminDashboard /></ProtectedLayout>} />
        <Route path="/super-admin/schools" element={<ProtectedLayout><SchoolManagement /></ProtectedLayout>} />
        <Route path="/super-admin/users" element={<ProtectedLayout><UserManagement /></ProtectedLayout>} />
        <Route path="/super-admin/labs" element={<ProtectedLayout><PDPlanning /></ProtectedLayout>} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
