import { useState } from 'react'
import { Building2, TrendingUp, GraduationCap, CheckSquare, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { TimePeriodSelector, type TimePeriod } from '../../components/ui/TimePeriodSelector'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import { getTimeBuckets, inBucket } from '../../utils/timePeriod'

const roleColor = roleColors.admin

type SchoolRow = {
  school: string
  teachers: number
  logRate: string
  avgFidelity: string
  adaptations: number
  mtssStatus: 'Sustaining' | 'Implementing' | 'Needs Support'
}

const allSchoolData: SchoolRow[] = [
  { school: 'Lincoln Elementary', teachers: 12, logRate: '78%', avgFidelity: '3.9', adaptations: 18, mtssStatus: 'Sustaining' },
  { school: 'Washington Elementary', teachers: 9, logRate: '71%', avgFidelity: '3.7', adaptations: 14, mtssStatus: 'Implementing' },
  { school: 'Jefferson Elementary', teachers: 8, logRate: '65%', avgFidelity: '3.2', adaptations: 22, mtssStatus: 'Needs Support' },
]

const schoolIdToRow: Record<string, SchoolRow> = {
  SCH01: allSchoolData[0],
  SCH02: allSchoolData[1],
}

const schoolDetail: Record<string, { trend: { month: string; fidelity: number }[]; notes: string }> = {
  'Lincoln Elementary': {
    trend: [{ month: 'Mar', fidelity: 3.7 }, { month: 'Apr', fidelity: 3.8 }, { month: 'May', fidelity: 3.9 }],
    notes: 'Strong coaching support in place. Math coach visits bi-weekly. MTSS team meets monthly.',
  },
  'Washington Elementary': {
    trend: [{ month: 'Mar', fidelity: 3.4 }, { month: 'Apr', fidelity: 3.6 }, { month: 'May', fidelity: 3.7 }],
    notes: 'Making steady progress. Principal requested additional coaching hours for Tier 2 implementation.',
  },
  'Jefferson Elementary': {
    trend: [{ month: 'Mar', fidelity: 2.9 }, { month: 'Apr', fidelity: 3.0 }, { month: 'May', fidelity: 3.2 }],
    notes: 'Needs support. Staffing instability has impacted fidelity. Priority for Q4 coaching visits.',
  },
}

const statusColors: Record<string, 'green' | 'blue' | 'amber'> = {
  Sustaining: 'green', Implementing: 'blue', 'Needs Support': 'amber',
}

export function SchoolOverview() {
  const { currentUser, schools, implementationLogs } = useAppStore()
  const [period, setPeriod] = useState<TimePeriod>('week')
  const mySchool = schools.find(s => s.id === currentUser.schoolId)
  const schoolData = mySchool ? [schoolIdToRow[mySchool.id] ?? allSchoolData[0]] : allSchoolData.slice(0, 1)
  const mySchoolLogs = implementationLogs.filter(l => l.schoolId === (mySchool?.id ?? ''))
  const computedLogRate = mySchoolLogs.length > 0
    ? `${Math.round(mySchoolLogs.filter(l => l.lessonCompletion !== 'not_completed').length / mySchoolLogs.length * 100)}%`
    : schoolData[0]?.logRate ?? '—'
  const buckets = getTimeBuckets(period)
  const weeklySchoolLogs = buckets.map(b => ({
    week: b.label,
    Logs: mySchoolLogs.filter(l => inBucket(l.date, b)).length,
  }))
  const [selected, setSelected] = useState<SchoolRow | null>(null)

  const columns = [
    { key: 'school', header: 'School', render: (row: SchoolRow) => (
      <span className="font-medium text-gray-800">{row.school}</span>
    )},
    { key: 'teachers', header: 'Teachers', className: 'hidden sm:table-cell', render: (row: SchoolRow) => String(row.teachers) },
    { key: 'logRate', header: 'Log Rate', className: 'hidden sm:table-cell' },
    { key: 'avgFidelity', header: 'Fidelity' },
    { key: 'adaptations', header: 'Adapt.', className: 'hidden md:table-cell', render: (row: SchoolRow) => String(row.adaptations) },
    { key: 'mtssStatus', header: 'MTSS Status',
      render: (row: SchoolRow) => <Badge color={statusColors[row.mtssStatus]}>{row.mtssStatus}</Badge> },
    { key: 'action', header: '',
      render: (row: SchoolRow) => (
        <button onClick={e => { e.stopPropagation(); setSelected(row) }} className="text-xs text-amber-600 hover:text-amber-800 cursor-pointer flex items-center gap-0.5">
          Details<ChevronRight size={11} />
        </button>
      )},
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="cursor-pointer" onClick={() => toast.info(`${mySchool?.name ?? 'Your school'} — active for 2025–26.`)}>
          <StatCard label="School" value={mySchool?.name ?? '—'} sub={mySchool?.id ?? ''} icon={<Building2 size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info(`Log rate: ${computedLogRate} (${mySchoolLogs.length} total logs)`)}>
          <StatCard label="Log Rate" value={computedLogRate} sub={`${mySchoolLogs.length} total logs`} icon={<TrendingUp size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info('87% of staff attended at least one PD session this year.')}>
          <StatCard label="Training" value="87%" sub="Participation rate" icon={<GraduationCap size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info(`Average fidelity: ${schoolData[0]?.avgFidelity ?? '—'} / 5.0`)}>
          <StatCard label="Avg Fidelity" value={schoolData[0]?.avgFidelity ?? '—'} sub="School average" icon={<CheckSquare size={18} />} iconColor={roleColor} />
        </div>
      </div>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">School Summary — {mySchool?.name ?? 'Your School'}</h2>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => toast.info('Generating district report PDF…')}>
            Export Report
          </Button>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={schoolData as unknown as Record<string, unknown>[]}
          emptyMessage="No schools found."
          emptyIcon={<Building2 size={24} />}
          onRowClick={row => setSelected(row as unknown as SchoolRow)}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Log Submission Activity</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{mySchool?.name ?? 'School-wide'}</span>
            <TimePeriodSelector value={period} onChange={setPeriod} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklySchoolLogs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
            <Tooltip />
            <Bar dataKey="Logs" fill={roleColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.school} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color={statusColors[selected.mtssStatus]}>{selected.mtssStatus}</Badge>
              <span className="text-xs text-gray-500">{selected.teachers} teachers</span>
              <span className="text-xs text-gray-500">Log rate: {selected.logRate}</span>
              <span className="text-xs text-gray-500">Avg fidelity: {selected.avgFidelity}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">Principal Notes</p>
              <p className="text-sm text-gray-600">{schoolDetail[selected.school]?.notes}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Fidelity Trend (Last 3 Months)</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={schoolDetail[selected.school]?.trend ?? []}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="fidelity" fill={roleColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button roleColor={roleColor} onClick={() => { toast.success('Site visit scheduled!'); setSelected(null) }}>Schedule Site Visit</Button>
              <Button variant="secondary" roleColor={roleColor} onClick={() => { toast.info('Generating school report…'); setSelected(null) }}>Export Report</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
