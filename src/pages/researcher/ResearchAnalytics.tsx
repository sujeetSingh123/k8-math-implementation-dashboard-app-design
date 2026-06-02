import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Database, BookOpen, CheckCircle, MessageSquare } from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { TimePeriodSelector, type TimePeriod } from '../../components/ui/TimePeriodSelector'
import { LogDetailModal } from '../shared/LogDetailModal'
import { toast } from '../../store/useToastStore'
import { users, schools, schoolFidelityTrends } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import { getTimeBuckets, inBucket } from '../../utils/timePeriod'
import type { ImplementationLog } from '../../types'

const roleColor = roleColors.researcher

const dsaiiNotes: Record<string, string> = {
  'Leadership Support (Determinant)': 'Principal walkthrough frequency correlates strongly with fidelity (r=0.61). Schools with bi-weekly walkthroughs show 18% higher log completion rates.',
  'Coaching Access (Strategy)': 'Coaching contact hours are the strongest predictor of fidelity growth. Schools averaging ≥4 hrs/month show consistent upward trajectories.',
  'Adaptation Rate': '67% of teachers document at least one adaptation per month. FRAME-IS records show 72% are fidelity-consistent, indicating quality adaptations.',
  'Implementation Fidelity': 'Adherence (78%) and Dosage (81%) are highest-performing dimensions. Confidence (64%) is the most common coaching focus area.',
  'Student Outcome Trend': 'Preliminary data shows 12% improvement in math benchmark scores at high-fidelity schools. Full outcome data available in Q4 final report.',
}

const schoolNotes: Record<string, string> = {
  SCH01: 'Strongest implementation school. Math coach Rachel Stone embedded 3 days/week. MTSS team well-established with clear data protocols.',
  SCH02: 'Steady upward progress. Principal James Patel is supportive of research goals. Coaching contact increased in recent months with positive results.',
}

interface ProgressBarProps { label: string; value: number; onClick?: () => void }

function ProgressBar({ label, value, onClick }: ProgressBarProps) {
  return (
    <div className={`space-y-1 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-700 truncate">{label}</span>
        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: roleColor }} />
      </div>
    </div>
  )
}

const dsaii = [
  { label: 'Leadership Support (Determinant)', value: 72 },
  { label: 'Coaching Access (Strategy)', value: 85 },
  { label: 'Adaptation Rate', value: 67 },
  { label: 'Implementation Fidelity', value: 78 },
  { label: 'Student Outcome Trend', value: 54 },
]

type SchoolRow = { schoolId: string; school: string; teachers: string; logRate: string; avgFidelity: string; adaptations: number; pctConsistent: string; dataCompleteness: string }

export function ResearchAnalytics() {
  const { implementationLogs, fidelityChecks, adaptations } = useAppStore()
  const [schoolModal, setSchoolModal] = useState<SchoolRow | null>(null)
  const [selectedLog, setSelectedLog] = useState<ImplementationLog | null>(null)
  const [period, setPeriod] = useState<TimePeriod>('year')

  const teacherById = Object.fromEntries(users.filter(u => u.role === 'teacher').map(u => [u.id, u.name]))

  const schoolRows: SchoolRow[] = schools.map(s => {
    const schoolTeachers = users.filter(u => u.schoolId === s.id && u.role === 'teacher')
    const logs = implementationLogs.filter(l => schoolTeachers.some(t => t.id === l.teacherId))
    const checks = fidelityChecks.filter(c => schoolTeachers.some(t => t.id === c.teacherId))
    const schoolAdapts = adaptations.filter(a => schoolTeachers.some(t => t.id === a.teacherId))

    const logRate = logs.length > 0
      ? `${Math.round(logs.filter(l => l.lessonCompletion !== 'not_completed').length / logs.length * 100)}%`
      : '—'
    const avgFidelity = checks.length > 0
      ? (checks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length).toFixed(1)
      : '—'
    const consistent = schoolAdapts.filter(a => a.fidelityType === 'consistent').length
    const pctConsistent = schoolAdapts.length > 0
      ? `${Math.round(consistent / schoolAdapts.length * 100)}%`
      : '—'
    const completeness = logs.length > 0
      ? Math.min(100, Math.round((logs.length / (schoolTeachers.length * 10)) * 100))
      : 0

    return {
      schoolId: s.id,
      school: s.name,
      teachers: schoolTeachers.map(t => t.name).join(', '),
      logRate,
      avgFidelity,
      adaptations: schoolAdapts.length,
      pctConsistent,
      dataCompleteness: `${completeness}%`,
    }
  })

  const totalLogs = implementationLogs.length
  const totalAdaptations = adaptations.length
  const avgCompleteness = schoolRows.length > 0
    ? Math.round(schoolRows.reduce((s, r) => s + parseInt(r.dataCompleteness), 0) / schoolRows.length)
    : 0

  const buckets = getTimeBuckets(period)
  const trendData = period === 'year'
    ? (schoolFidelityTrends['SCH01'] ?? []).map(m => ({ month: m.month, adherence: m.adherence }))
    : buckets.map(b => {
        const checks = fidelityChecks.filter(c => inBucket(c.date, b))
        const avg = checks.length > 0
          ? parseFloat((checks.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length).toFixed(1))
          : null
        return { month: b.label, adherence: avg }
      })

  const schoolColumns = [
    { key: 'school', header: 'School', render: (row: SchoolRow) => <span className="font-medium text-gray-800">{row.school}</span> },
    { key: 'logRate', header: 'Log Rate' },
    { key: 'avgFidelity', header: 'Fidelity' },
    { key: 'adaptations', header: 'Adapt.', render: (row: SchoolRow) => String(row.adaptations) },
    { key: 'pctConsistent', header: '% Consistent', className: 'hidden sm:table-cell' },
    { key: 'dataCompleteness', header: 'Completeness', render: (row: SchoolRow) => {
      const val = parseInt(row.dataCompleteness)
      return <Badge color={val >= 90 ? 'green' : val >= 70 ? 'amber' : 'red'}>{row.dataCompleteness}</Badge>
    }},
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Schools in Study" value={String(schools.length)} sub="Active schools" icon={<Database size={18} />} iconColor={roleColor} />
        <StatCard label="Log Entries" value={String(totalLogs)} sub="All schools" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Adaptations" value={String(totalAdaptations)} sub="FRAME-IS records" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Completeness" value={`${avgCompleteness}%`} sub="All measures" icon={<CheckCircle size={18} />} iconColor={roleColor} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Longitudinal Fidelity Trajectories</h3>
            <TimePeriodSelector value={period} onChange={setPeriod} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} width={25} />
              <Tooltip />
              <Line type="monotone" dataKey="adherence" name="Avg Adherence" stroke={roleColor} strokeWidth={2.5} dot={{ r: 3, fill: roleColor }} activeDot={{ r: 5, cursor: 'pointer' }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">DSAII Pathway Indicators</h3>
            <button onClick={() => toast.info('DSAII = Drivers, Strategies, Adaptations, Implementation, and Impact — click any bar for details.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">What's this?</button>
          </div>
          <div className="space-y-4">
            {dsaii.map(d => (
              <ProgressBar key={d.label} label={d.label} value={d.value} onClick={() => toast.info(dsaiiNotes[d.label] ?? d.label)} />
            ))}
          </div>
        </Card>
      </div>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">School Comparison</h2>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => toast.info('Generating school comparison report…')}>Export</Button>
        </div>
        <Table
          columns={schoolColumns as Parameters<typeof Table>[0]['columns']}
          data={schoolRows as unknown as Record<string, unknown>[]}
          emptyMessage="No school data available."
          onRowClick={row => setSchoolModal(row as unknown as SchoolRow)}
        />
      </Card>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare size={14} style={{ color: roleColor }} />
          <h2 className="text-sm font-semibold text-gray-800">Recent Implementation Logs</h2>
        </div>
        {implementationLogs.slice(0, 6).map(log => (
          <button key={log.id} onClick={() => setSelectedLog(log)} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{teacherById[log.teacherId] ?? log.teacherId} · {log.date} · {log.instructionalRoutine}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Badge color={log.adaptationOccurred ? 'purple' : 'blue'}>{log.tier}</Badge>
              <Badge color={log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'}>{log.lessonCompletion.replace('_', ' ')}</Badge>
            </div>
          </button>
        ))}
      </Card>
      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {schoolModal && (
        <Modal open onClose={() => setSchoolModal(null)} title={`${schoolModal.school} — Detail`} size="lg">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span>Log Rate: <strong>{schoolModal.logRate}</strong></span>
              <span>Avg Fidelity: <strong>{schoolModal.avgFidelity}</strong></span>
              <span>Adaptations: <strong>{schoolModal.adaptations}</strong></span>
              <span>% Consistent: <strong>{schoolModal.pctConsistent}</strong></span>
              <span>Data Completeness: <strong>{schoolModal.dataCompleteness}</strong></span>
            </div>
            {schoolModal.teachers && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Teachers</p>
                <p className="text-sm text-gray-700">{schoolModal.teachers}</p>
              </div>
            )}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">School Notes</p>
              <p className="text-sm text-gray-600">{schoolNotes[schoolModal.schoolId] ?? 'No notes available.'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Fidelity Trend</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={(schoolFidelityTrends[schoolModal.schoolId] ?? []).slice(-3)}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="adherence" name="Adherence" fill={roleColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button roleColor={roleColor} onClick={() => { toast.success(`Exporting full dataset for ${schoolModal.school}…`); setSchoolModal(null) }}>Export School Data</Button>
              <Button variant="secondary" roleColor={roleColor} onClick={() => { toast.info(`Generating report for ${schoolModal.school}…`); setSchoolModal(null) }}>Generate Report</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setSchoolModal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
