import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Database, BookOpen, CheckCircle, TrendingUp } from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { toast } from '../../store/useToastStore'
import { users, schools, schoolFidelityTrends } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'

const roleColor = roleColors.researcher

const schoolNotes: Record<string, string> = {
  SCH01: 'Strongest implementation school. Math coach Rachel Stone embedded 3 days/week. MTSS team well-established with clear data protocols.',
  SCH02: 'Steady upward progress. Principal James Patel is supportive of research goals. Coaching contact increased in recent months with positive results.',
}

function MiniBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: roleColor }} />
      </div>
    </div>
  )
}

type SchoolRow = {
  schoolId: string; name: string; teachers: string
  logRate: number | null; avgFidelity: number | null
  adaptations: number; pctConsistent: number | null
  completeness: number
}

export function ResearchAnalytics() {
  const { implementationLogs, fidelityChecks, adaptations } = useAppStore()
  const [schoolModal, setSchoolModal] = useState<SchoolRow | null>(null)

  const schoolRows: SchoolRow[] = schools.map(s => {
    const schoolTeachers = users.filter(u => u.schoolId === s.id && u.role === 'teacher')
    const logs = implementationLogs.filter(l => schoolTeachers.some(t => t.id === l.teacherId))
    const checks = fidelityChecks.filter(c => schoolTeachers.some(t => t.id === c.teacherId))
    const schoolAdapts = adaptations.filter(a => schoolTeachers.some(t => t.id === a.teacherId))
    const consistent = schoolAdapts.filter(a => a.fidelityType === 'consistent').length

    return {
      schoolId: s.id,
      name: s.name,
      teachers: schoolTeachers.map(t => t.name).join(', '),
      logRate: logs.length > 0 ? Math.round(logs.filter(l => l.lessonCompletion !== 'not_completed').length / logs.length * 100) : null,
      avgFidelity: checks.length > 0 ? parseFloat((checks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length).toFixed(1)) : null,
      adaptations: schoolAdapts.length,
      pctConsistent: schoolAdapts.length > 0 ? Math.round(consistent / schoolAdapts.length * 100) : null,
      completeness: logs.length > 0 ? Math.min(100, Math.round((logs.length / (schoolTeachers.length * 10)) * 100)) : 0,
    }
  })

  const totalLogs = implementationLogs.length
  const totalAdaptations = adaptations.length
  const avgCompleteness = schoolRows.length > 0 ? Math.round(schoolRows.reduce((s, r) => s + r.completeness, 0) / schoolRows.length) : 0
  const avgFidelityAll = schoolRows.filter(r => r.avgFidelity !== null)
  const globalAvgFidelity = avgFidelityAll.length > 0
    ? (avgFidelityAll.reduce((s, r) => s + r.avgFidelity!, 0) / avgFidelityAll.length).toFixed(1)
    : '—'

  const columns = [
    {
      key: 'name', header: 'School',
      render: (row: SchoolRow) => <span className="font-medium text-gray-800">{row.name}</span>,
    },
    {
      key: 'logRate', header: 'Log Rate',
      render: (row: SchoolRow) => (
        <div className="space-y-1 min-w-[80px]">
          <span className="text-sm font-semibold text-gray-700">{row.logRate !== null ? `${row.logRate}%` : '—'}</span>
          {row.logRate !== null && <MiniBar value={row.logRate} />}
        </div>
      ),
    },
    {
      key: 'avgFidelity', header: 'Avg Fidelity',
      render: (row: SchoolRow) => (
        <div className="space-y-1 min-w-[80px]">
          <span className="text-sm font-semibold text-gray-700">{row.avgFidelity !== null ? `${Math.round(row.avgFidelity * 20)}%` : '—'}</span>
          {row.avgFidelity !== null && <MiniBar value={Math.round(row.avgFidelity * 20)} />}
        </div>
      ),
    },
    {
      key: 'adaptations', header: 'Adaptations',
      render: (row: SchoolRow) => (
        <div>
          <span className="text-sm font-semibold text-gray-700">{row.adaptations}</span>
          {row.pctConsistent !== null && (
            <p className="text-xs text-gray-400">{row.pctConsistent}% consistent</p>
          )}
        </div>
      ),
    },
    {
      key: 'completeness', header: 'Data Completeness',
      render: (row: SchoolRow) => {
        const c = row.completeness
        return <Badge color={c >= 90 ? 'green' : c >= 70 ? 'amber' : 'red'}>{c}%</Badge>
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Schools in Study" value={String(schools.length)} sub="Active sites" icon={<Database size={18} />} iconColor={roleColor} />
        <StatCard label="Impl. Logs" value={String(totalLogs)} sub="All schools" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Fidelity" value={globalAvgFidelity !== '—' ? `${Math.round(Number(globalAvgFidelity) * 20)}%` : '—'} sub="All schools" icon={<TrendingUp size={18} />} iconColor={roleColor} />
        <StatCard label="Data Completeness" value={`${avgCompleteness}%`} sub="Across all measures" icon={<CheckCircle size={18} />} iconColor={roleColor} />
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">School Comparison</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click a row to view school details and fidelity breakdown</p>
          </div>
          <Button size="sm" variant="secondary" roleColor={roleColor}
            onClick={() => toast.info('Generating school comparison report…')}>
            Export
          </Button>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={schoolRows as unknown as Record<string, unknown>[]}
          emptyMessage="No school data available."
          onRowClick={row => setSchoolModal(row as unknown as SchoolRow)}
        />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Adaptations', value: totalAdaptations, sub: 'FRAME-IS records', color: '#F59E0B' },
          { label: 'FRAME-IS Consistent', value: `${adaptations.length > 0 ? Math.round(adaptations.filter(a => a.fidelityType === 'consistent').length / adaptations.length * 100) : 0}%`, sub: 'Fidelity-consistent adaptations', color: '#10B981' },
          { label: 'Teachers Logging', value: `${implementationLogs.length > 0 ? new Set(implementationLogs.map(l => l.teacherId)).size : 0}`, sub: 'Unique contributors', color: roleColor },
        ].map(item => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{item.label}</p>
            <p className="text-xs text-gray-400">{item.sub}</p>
          </div>
        ))}
      </div>

      {schoolModal && (
        <Modal open onClose={() => setSchoolModal(null)} title={`${schoolModal.name} — Detail`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: 'Log Rate', v: schoolModal.logRate !== null ? `${schoolModal.logRate}%` : '—' },
                { l: 'Avg Fidelity', v: schoolModal.avgFidelity !== null ? `${Math.round(schoolModal.avgFidelity * 20)}%` : '—' },
                { l: 'Adaptations', v: String(schoolModal.adaptations) },
                { l: 'Completeness', v: `${schoolModal.completeness}%` },
              ].map(({ l, v }) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{v}</p>
                  <p className="text-xs text-gray-400">{l}</p>
                </div>
              ))}
            </div>
            {schoolModal.teachers && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Teachers</p>
                <p className="text-sm text-gray-700">{schoolModal.teachers}</p>
              </div>
            )}
            {schoolNotes[schoolModal.schoolId] && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-purple-600 mb-1">Research Notes</p>
                <p className="text-sm text-gray-700">{schoolNotes[schoolModal.schoolId]}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Fidelity by Dimension — Last 3 Months</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={(schoolFidelityTrends[schoolModal.schoolId] ?? []).slice(-3)} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v * 20)}%`} />
                  <Tooltip formatter={(v) => typeof v === 'number' ? `${Math.round(v * 20)}%` : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="adherence" name="Adherence" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="dosage" name="Dosage" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="quality" name="Quality" fill="#10B981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="responsiveness" name="Responsiveness" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="confidence" name="Confidence" fill="#EF4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2">
              <Button roleColor={roleColor} onClick={() => { toast.success(`Exporting data for ${schoolModal.name}…`); setSchoolModal(null) }}>Export School Data</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setSchoolModal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
