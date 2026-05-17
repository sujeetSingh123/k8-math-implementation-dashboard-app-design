import { Building2, TrendingUp, GraduationCap, CheckSquare } from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'

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

const statusColors: Record<string, 'green' | 'blue' | 'amber'> = {
  Sustaining: 'green',
  Implementing: 'blue',
  'Needs Support': 'amber',
}

const columns = [
  { key: 'school', header: 'School' },
  { key: 'teachers', header: 'Teachers', className: 'hidden sm:table-cell', render: (row: SchoolRow) => String(row.teachers) },
  { key: 'logRate', header: 'Log Rate', className: 'hidden sm:table-cell' },
  { key: 'avgFidelity', header: 'Fidelity' },
  { key: 'adaptations', header: 'Adaptations', className: 'hidden md:table-cell', render: (row: SchoolRow) => String(row.adaptations) },
  {
    key: 'mtssStatus',
    header: 'MTSS Status',
    render: (row: SchoolRow) => (
      <Badge color={statusColors[row.mtssStatus]}>{row.mtssStatus}</Badge>
    ),
  },
]

export function SchoolOverview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Schools" value="3" sub="All in District 1" icon={<Building2 size={18} />} iconColor={roleColor} />
        <StatCard label="District Log Rate" value="74%" sub="+3% from last month" icon={<TrendingUp size={18} />} iconColor={roleColor} />
        <StatCard label="Training Participation" value="87%" sub="Across all schools" icon={<GraduationCap size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Fidelity" value="3.8" sub="District-wide" icon={<CheckSquare size={18} />} iconColor={roleColor} />
      </div>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">School Summary</h2>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={schoolData as unknown as Record<string, unknown>[]}
          emptyMessage="No schools found."
          emptyIcon={<Building2 size={24} />}
        />
      </Card>
    </div>
  )
}
