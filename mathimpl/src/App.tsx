import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DailyLog } from './pages/teacher/DailyLog'
import { FidelityCheck } from './pages/teacher/FidelityCheck'
import { AdaptationForm } from './pages/teacher/AdaptationForm'
import { CoachingThread } from './pages/teacher/CoachingThread'
import { ResourceLibrary } from './pages/teacher/ResourceLibrary'
import { TrainingHistory } from './pages/teacher/TrainingHistory'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'
import { TeacherCaseload } from './pages/coach/TeacherCaseload'
import { FeedbackQueue } from './pages/coach/FeedbackQueue'
import { CoachDashboard } from './pages/coach/CoachDashboard'
import { SchoolOverview } from './pages/admin/SchoolOverview'
import { MTSSMonitoring } from './pages/admin/MTSSMonitoring'
import { ResearchAnalytics } from './pages/researcher/ResearchAnalytics'
import { DataExport } from './pages/researcher/DataExport'
import { useAppStore } from './store/useAppStore'

function DefaultRedirect() {
  const role = useAppStore((s) => s.currentRole)
  const defaults: Record<string, string> = {
    teacher: '/teacher/dashboard',
    coach: '/coach/dashboard',
    admin: '/admin/overview',
    researcher: '/researcher/analytics',
  }
  return <Navigate to={defaults[role] ?? '/teacher/dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="/teacher/log" element={<DailyLog />} />
          <Route path="/teacher/fidelity" element={<FidelityCheck />} />
          <Route path="/teacher/adaptations" element={<AdaptationForm />} />
          <Route path="/teacher/coaching" element={<CoachingThread />} />
          <Route path="/teacher/library" element={<ResourceLibrary />} />
          <Route path="/teacher/training" element={<TrainingHistory />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/coach/caseload" element={<TeacherCaseload />} />
          <Route path="/coach/feedback" element={<FeedbackQueue />} />
          <Route path="/coach/dashboard" element={<CoachDashboard />} />
          <Route path="/admin/overview" element={<SchoolOverview />} />
          <Route path="/admin/mtss" element={<MTSSMonitoring />} />
          <Route path="/researcher/analytics" element={<ResearchAnalytics />} />
          <Route path="/researcher/export" element={<DataExport />} />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
