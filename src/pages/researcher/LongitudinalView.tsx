import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import {
  monthlyFidelityTrend, schoolFidelityTrends, dist2SchoolFidelityTrends,
  districtFidelityTrends, districts, schools,
} from '../../data/mockData'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.researcher

const dims = ['adherence', 'dosage', 'quality', 'responsiveness', 'confidence'] as const
type Dim = typeof dims[number]

const dimColors: Record<Dim, string> = {
  adherence: '#8B5CF6', dosage: '#3B82F6', quality: '#10B981',
  responsiveness: '#F59E0B', confidence: '#EF4444',
}

const schoolMeta: Record<string, { name: string; color: string }> = {
  SCH01: { name: 'Lincoln K-8', color: '#3B82F6' },
  SCH02: { name: 'Washington Middle', color: '#F59E0B' },
  SCH03: { name: 'Roosevelt Elementary', color: '#10B981' },
  SCH04: { name: 'Jefferson K-8', color: '#F59E0B' },
}

const districtMeta: Record<string, { name: string; color: string }> = {
  dist1: { name: 'Riverside USD', color: roleColor },
  dist2: { name: 'Lakeside SD', color: '#EC4899' },
}

type TrendRow = { adherence: number; dosage: number; quality: number; responsiveness: number; confidence: number }

function composite(row: TrendRow) {
  return +(dims.reduce((s, d) => s + row[d], 0) / dims.length).toFixed(2)
}

const allSchoolTrends = { ...schoolFidelityTrends, ...dist2SchoolFidelityTrends }

type DistrictFilter = 'all' | 'dist1' | 'dist2'

function getSchoolIds(filter: DistrictFilter): string[] {
  if (filter === 'dist1') return ['SCH01', 'SCH02']
  if (filter === 'dist2') return ['SCH03', 'SCH04']
  return ['SCH01', 'SCH02', 'SCH03', 'SCH04']
}

function buildCompositeTrend(filter: DistrictFilter) {
  const schoolIds = getSchoolIds(filter)
  return monthlyFidelityTrend.map((m, i) => {
    const row: Record<string, number | string> = { month: m.month }
    if (filter === 'all' || filter === 'dist1') row['Riverside USD'] = composite(districtFidelityTrends.dist1[i])
    if (filter === 'all' || filter === 'dist2') row['Lakeside SD'] = composite(districtFidelityTrends.dist2[i])
    schoolIds.forEach(id => { row[schoolMeta[id].name] = composite(allSchoolTrends[id][i]) })
    return row
  })
}

function buildDimensionBreakdown(schoolIds: string[]) {
  return dims.map(d => ({
    dim: d.charAt(0).toUpperCase() + d.slice(1),
    ...Object.fromEntries(schoolIds.map(id => [schoolMeta[id].name, allSchoolTrends[id][8][d]])),
  }))
}

// ── Sub-components ────────────────────────────────────────────────────────────

type CompositeTrendChartProps = { data: Record<string, number | string>[]; filter: DistrictFilter }

function CompositeTrendChart({ data, filter }: CompositeTrendChartProps) {
  const schoolIds = getSchoolIds(filter)
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis domain={[2, 5]} tick={{ fontSize: 12 }} tickFormatter={v => `${Math.round(v * 20)}%`} />
        <Tooltip formatter={(v) => typeof v === 'number' ? `${Math.round(v * 20)}%` : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {(filter === 'all' || filter === 'dist1') && (
          <Line type="monotone" dataKey="Riverside USD" stroke={districtMeta.dist1.color} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
        )}
        {(filter === 'all' || filter === 'dist2') && (
          <Line type="monotone" dataKey="Lakeside SD" stroke={districtMeta.dist2.color} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
        )}
        {schoolIds.map(id => (
          <Line key={id} type="monotone" dataKey={schoolMeta[id].name} stroke={schoolMeta[id].color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

type SchoolMetricsTableProps = { schoolIds: string[]; onSelect: (id: string) => void; districtLabel: string; districtLast: TrendRow; districtFirst: TrendRow }

function SchoolMetricsTable({ schoolIds, onSelect, districtLabel, districtLast, districtFirst }: SchoolMetricsTableProps) {
  const distComp = composite(districtLast)
  const distGrowth = +(composite(districtLast) - composite(districtFirst)).toFixed(2)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">School</th>
            <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Composite</th>
            {dims.map(d => (
              <th key={d} className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">
                {d.slice(0, 3).toUpperCase()}
              </th>
            ))}
            <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Growth</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {schoolIds.map(id => {
            const first = allSchoolTrends[id][0]
            const last = allSchoolTrends[id][8]
            const comp = composite(last)
            const g = +(composite(last) - composite(first)).toFixed(2)
            return (
              <tr key={id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(id)}>
                <td className="py-2.5 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: schoolMeta[id].color }} />
                    <span className="hover:underline">{schoolMeta[id].name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: comp >= 4 ? '#10B981' : comp >= 3.5 ? '#F59E0B' : '#EF4444' }}>
                    {Math.round(comp * 20)}%
                  </span>
                </td>
                {dims.map(d => (
                  <td key={d} className="py-2.5 text-center text-xs text-gray-600 hidden md:table-cell">
                    <span className="font-medium" style={{ color: dimColors[d] }}>{Math.round(last[d] * 20)}%</span>
                  </td>
                ))}
                <td className="py-2.5 text-center text-xs font-semibold text-emerald-600">+{g}</td>
              </tr>
            )
          })}
          <tr className="bg-gray-50 font-semibold">
            <td className="py-2.5 text-gray-700 pl-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: roleColor }} />
                {districtLabel}
              </div>
            </td>
            <td className="py-2.5 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: distComp >= 4 ? '#10B981' : distComp >= 3.5 ? '#F59E0B' : '#EF4444' }}>
                {Math.round(distComp * 20)}%
              </span>
            </td>
            {dims.map(d => (
              <td key={d} className="py-2.5 text-center text-xs text-gray-600 hidden md:table-cell">
                {Math.round(districtLast[d] * 20)}%
              </td>
            ))}
            <td className="py-2.5 text-center text-xs font-semibold text-emerald-600">+{distGrowth}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LongitudinalView() {
  const [districtFilter, setDistrictFilter] = useState<DistrictFilter>('all')
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)

  const schoolIds = getSchoolIds(districtFilter)
  const compositeTrend = buildCompositeTrend(districtFilter)
  const dimensionBreakdown = buildDimensionBreakdown(schoolIds)

  const distRef = districtFilter === 'dist2' ? districtFidelityTrends.dist2 : districtFidelityTrends.dist1
  const districtLabel = districtFilter === 'dist2' ? 'Lakeside SD Avg' : districtFilter === 'dist1' ? 'Riverside USD Avg' : 'Dist Avg'

  const selectedTrend = selectedSchoolId ? allSchoolTrends[selectedSchoolId] : null
  const schoolTrendChartData = selectedTrend
    ? monthlyFidelityTrend.map((m, i) => ({
        month: m.month,
        ...Object.fromEntries(dims.map(d => [d.charAt(0).toUpperCase() + d.slice(1), selectedTrend[i][d]])),
        Composite: composite(selectedTrend[i]),
      }))
    : []

  const tabOptions: { value: DistrictFilter; label: string }[] = [
    { value: 'all', label: 'All Districts' },
    { value: 'dist1', label: 'Riverside USD' },
    { value: 'dist2', label: 'Lakeside SD' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <TrendingUp size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Longitudinal Fidelity Trajectories</h2>
          <p className="text-sm text-gray-500">All components aggregated · Sep – May · {schools.length} schools · {districts.length} districts</p>
        </div>
      </div>

      {/* District tab selector */}
      <div className="flex gap-2 flex-wrap">
        {tabOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setDistrictFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              districtFilter === opt.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={districtFilter === opt.value ? { backgroundColor: roleColor } : undefined}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {schoolIds.map(id => (
          <StatCard
            key={id}
            label={schoolMeta[id].name}
            value={`${Math.round(composite(allSchoolTrends[id][8]) * 20)}%`}
            color={schoolMeta[id].color}
          />
        ))}
      </div>

      {/* Composite aggregate trajectory */}
      <Card title="Composite Fidelity Trajectory — All Schools">
        <p className="text-xs text-gray-400 mb-3">Dashed lines = district aggregates · Solid lines = individual schools</p>
        <CompositeTrendChart data={compositeTrend} filter={districtFilter} />
      </Card>

      {/* Component breakdown + school metrics side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Component Breakdown by School (May)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={dimensionBreakdown} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 12 }} tickFormatter={v => `${Math.round(v * 20)}%`} />
              <Tooltip formatter={(v) => typeof v === 'number' ? `${Math.round(v * 20)}%` : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {schoolIds.map(id => (
                <Bar key={id} dataKey={schoolMeta[id].name} fill={schoolMeta[id].color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="School Metrics Snapshot">
          <SchoolMetricsTable
            schoolIds={schoolIds}
            onSelect={setSelectedSchoolId}
            districtLabel={districtLabel}
            districtLast={distRef[8]}
            districtFirst={distRef[0]}
          />
        </Card>
      </div>

      {selectedSchoolId && selectedTrend && (
        <Modal open onClose={() => setSelectedSchoolId(null)} title={`${schoolMeta[selectedSchoolId].name} — Monthly Breakdown`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {dims.map(d => (
                <div key={d} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-400 capitalize">{d}</p>
                  <p className="text-base font-bold" style={{ color: dimColors[d] }}>{Math.round(selectedTrend[8][d] * 20)}%</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={schoolTrendChartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v * 20)}%`} />
                <Tooltip formatter={(v) => typeof v === 'number' ? `${Math.round(v * 20)}%` : ''} contentStyle={{ borderRadius: 12, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {dims.map(d => (
                  <Line key={d} type="monotone" dataKey={d.charAt(0).toUpperCase() + d.slice(1)} stroke={dimColors[d]} strokeWidth={1.5} dot={false} />
                ))}
                <Line type="monotone" dataKey="Composite" stroke={roleColor} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Modal>
      )}
    </div>
  )
}
