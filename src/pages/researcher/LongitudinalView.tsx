import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { monthlyFidelityTrend, schoolFidelityTrends, schools } from '../../data/mockData'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.researcher

const dims = ['adherence', 'dosage', 'quality', 'responsiveness', 'confidence'] as const
type Dim = typeof dims[number]

const dimColors: Record<Dim, string> = {
  adherence: '#8B5CF6',
  dosage: '#3B82F6',
  quality: '#10B981',
  responsiveness: '#F59E0B',
  confidence: '#EF4444',
}

const schoolMeta: Record<string, { name: string; color: string }> = {
  SCH01: { name: 'Lincoln K-8', color: '#3B82F6' },
  SCH02: { name: 'Washington Middle', color: '#F59E0B' },
}

type TrendRow = { adherence: number; dosage: number; quality: number; responsiveness: number; confidence: number }

function composite(row: TrendRow) {
  return +(dims.reduce((s, d) => s + row[d], 0) / dims.length).toFixed(2)
}

// Composite trajectory: District + each school
const compositeTrend = monthlyFidelityTrend.map((m, i) => ({
  month: m.month,
  District: composite(m),
  ...Object.fromEntries(
    Object.entries(schoolFidelityTrends).map(([id, trend]) => [schoolMeta[id].name, composite(trend[i])])
  ),
}))

// Current (May) per-dimension per school for grouped bar
const dimensionBreakdown = dims.map(d => ({
  dim: d.charAt(0).toUpperCase() + d.slice(1),
  ...Object.fromEntries(
    Object.entries(schoolFidelityTrends).map(([id, trend]) => [schoolMeta[id].name, trend[8][d]])
  ),
}))

// Summary stats
const districtFirst = composite(monthlyFidelityTrend[0])
const districtLast = composite(monthlyFidelityTrend[8])
const growth = +(districtLast - districtFirst).toFixed(2)

const schoolKeys = Object.keys(schoolFidelityTrends)

export function LongitudinalView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <TrendingUp size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Longitudinal Fidelity Trajectories</h2>
          <p className="text-sm text-gray-500">All components aggregated · Sep – May · {schools.length} schools</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="District Composite" value={districtLast.toFixed(2)} unit="/5" color={roleColor} />
        {schoolKeys.map(id => (
          <StatCard
            key={id}
            label={schoolMeta[id].name}
            value={composite(schoolFidelityTrends[id][8]).toFixed(2)}
            unit="/5"
            color={schoolMeta[id].color}
          />
        ))}
        <StatCard label="Growth (Sep → May)" value={`+${growth}`} unit="pts" color="#10B981" />
      </div>

      {/* Composite aggregate trajectory */}
      <Card title="Composite Fidelity Trajectory — All Schools">
        <p className="text-xs text-gray-400 mb-3">Aggregate of all 5 components (adherence, dosage, quality, responsiveness, confidence)</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={compositeTrend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="District" stroke={roleColor} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
            {schoolKeys.map(id => (
              <Line key={id} type="monotone" dataKey={schoolMeta[id].name} stroke={schoolMeta[id].color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Component breakdown + school metrics side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Per-dimension grouped bar chart */}
        <Card title="Component Breakdown by School (May)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={dimensionBreakdown} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {schoolKeys.map(id => (
                <Bar key={id} dataKey={schoolMeta[id].name} fill={schoolMeta[id].color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* School metrics table */}
        <Card title="School Metrics Snapshot">
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
                {schoolKeys.map(id => {
                  const first = schoolFidelityTrends[id][0]
                  const last = schoolFidelityTrends[id][8]
                  const comp = composite(last)
                  const g = +(composite(last) - composite(first)).toFixed(2)
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: schoolMeta[id].color }} />
                          {schoolMeta[id].name}
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: comp >= 4 ? '#10B981' : comp >= 3.5 ? '#F59E0B' : '#EF4444' }}>
                          {comp.toFixed(2)}
                        </span>
                      </td>
                      {dims.map(d => (
                        <td key={d} className="py-2.5 text-center text-xs text-gray-600 hidden md:table-cell">
                          <span className="font-medium" style={{ color: dimColors[d] }}>{last[d].toFixed(1)}</span>
                        </td>
                      ))}
                      <td className="py-2.5 text-center text-xs font-semibold text-emerald-600">+{g}</td>
                    </tr>
                  )
                })}
                {/* District row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2.5 text-gray-700 pl-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: roleColor }} />
                      District Avg
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: districtLast >= 4 ? '#10B981' : districtLast >= 3.5 ? '#F59E0B' : '#EF4444' }}>
                      {districtLast.toFixed(2)}
                    </span>
                  </td>
                  {dims.map(d => (
                    <td key={d} className="py-2.5 text-center text-xs text-gray-600 hidden md:table-cell">
                      {monthlyFidelityTrend[8][d].toFixed(1)}
                    </td>
                  ))}
                  <td className="py-2.5 text-center text-xs font-semibold text-emerald-600">+{growth}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
