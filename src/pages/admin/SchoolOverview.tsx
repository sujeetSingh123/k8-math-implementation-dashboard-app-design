import { useState } from 'react'
import { Building2, TrendingUp, GraduationCap, CheckSquare, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'

const roleColor = '#F59E0B'

type SchoolRow = {
  school: string
  teachers: number
  logRate: string
  avgFidelity: string
  adaptations: number
  mtssStatus: 'Sustaining' | 'Implementing' | 'Needs Support'
}

const schoolData: SchoolRow[] = [
  { school: 'Lincoln Elementary', teachers: 12, logRate: '78%', avgFidelity: '3.9', adaptations: 18, mtssStatus: 'Sustaining' },
  { school: 'Washington Elementary', teachers: 9, logRate: '71%', avgFidelity: '3.7', adaptations: 14, mtssStatus: 'Implementing' },
  { school: 'Jefferson Elementary', teachers: 8, logRate: '65%', avgFidelity: '3.2', adaptations: 22, mtssStatus: 'Needs Support' },
]

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
        <div className="cursor-pointer" onClick={() => toast.info('3 schools active in District 1 for 2025–26.')}>
          <StatCard label="Schools" value="3" sub="All in District 1" icon={<Building2 size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info('District log rate is up 3% vs. last month.')}>
          <StatCard label="District Log Rate" value="74%" sub="+3% from last month" icon={<TrendingUp size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info('87% of staff attended at least one PD session this year.')}>
          <StatCard label="Training Participation" value="87%" sub="Across all schools" icon={<GraduationCap size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info('District average fidelity is 3.8 / 5.0 across all dimensions.')}>
          <StatCard label="Avg Fidelity" value="3.8" sub="District-wide" icon={<CheckSquare size={18} />} iconColor={roleColor} />
        </div>
      </div>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">School Summary</h2>
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
