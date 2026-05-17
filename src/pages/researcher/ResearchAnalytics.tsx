import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Shield, Database, BookOpen, CheckCircle } from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { monthlyFidelityTrend } from '../../data/mockData'

const roleColor = '#8B5CF6'

interface ProgressBarProps {
  label: string
  value: number
}

function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value}%</span>
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

type SiteRow = {
  site: string
  logRate: string
  avgFidelity: string
  adaptations: number
  pctConsistent: string
  dataCompleteness: string
}

const siteData: SiteRow[] = [
  { site: 'Site A', logRate: '78%', avgFidelity: '3.9', adaptations: 18, pctConsistent: '72%', dataCompleteness: '91%' },
  { site: 'Site B', logRate: '71%', avgFidelity: '3.7', adaptations: 14, pctConsistent: '68%', dataCompleteness: '85%' },
  { site: 'Site C', logRate: '65%', avgFidelity: '3.2', adaptations: 22, pctConsistent: '45%', dataCompleteness: '74%' },
]

const siteColumns = [
  { key: 'site', header: 'Site', render: (row: SiteRow) => <span className="font-medium text-gray-800">{row.site}</span> },
  { key: 'logRate', header: 'Log Rate' },
  { key: 'avgFidelity', header: 'Avg Fidelity' },
  { key: 'adaptations', header: 'Adaptations', render: (row: SiteRow) => String(row.adaptations) },
  { key: 'pctConsistent', header: '% Consistent' },
  {
    key: 'dataCompleteness',
    header: 'Data Completeness',
    render: (row: SiteRow) => {
      const val = parseInt(row.dataCompleteness)
      return <Badge color={val >= 90 ? 'green' : val >= 80 ? 'amber' : 'red'}>{row.dataCompleteness}</Badge>
    },
  },
]

export function ResearchAnalytics() {
  const trendData = monthlyFidelityTrend.map(m => ({
    month: m.month,
    adherence: m.adherence,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-800">
        <Shield size={16} className="flex-shrink-0" />
        <p className="text-sm">All data on this view is de-identified. No individual teachers or students are identifiable.</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Sites in Study" value="3" sub="Active research sites" icon={<Database size={18} />} iconColor={roleColor} />
        <StatCard label="Total Log Entries" value="60" sub="Across all sites" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Adaptations Documented" value="25" sub="FRAME-IS records" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Data Completeness" value="82%" sub="Across all measures" icon={<CheckCircle size={18} />} iconColor={roleColor} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Longitudinal Fidelity Trajectories (Sep–May)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="adherence" name="Avg Adherence" stroke={roleColor} strokeWidth={2.5} dot={{ r: 4, fill: roleColor }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">DSAII Pathway Indicators</h3>
          <div className="space-y-4">
            {dsaii.map(d => <ProgressBar key={d.label} label={d.label} value={d.value} />)}
          </div>
        </Card>
      </div>
      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Cross-Site Comparison (Anonymized)</h2>
        </div>
        <Table
          columns={siteColumns as Parameters<typeof Table>[0]['columns']}
          data={siteData as unknown as Record<string, unknown>[]}
          emptyMessage="No site data available."
        />
      </Card>
    </div>
  )
}
