import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { monthlyFidelityTrend, teacherFidelityTrends, users } from '../../data/mockData'

const roleColor = '#8B5CF6'

const dimensionColors: Record<string, string> = {
  adherence: '#8B5CF6',
  dosage: '#3B82F6',
  quality: '#10B981',
  responsiveness: '#F59E0B',
  confidence: '#EF4444',
}

const teacherIds = ['t1', 't2', 't3', 't4', 't5']
const teacherColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

function avg(vals: number[]) {
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

const growthByDimension = (() => {
  const first = monthlyFidelityTrend[0]
  const last = monthlyFidelityTrend[monthlyFidelityTrend.length - 1]
  return Object.keys(dimensionColors).map((dim) => ({
    dimension: dim.charAt(0).toUpperCase() + dim.slice(1),
    growth: +((last[dim as keyof typeof last] as number) - (first[dim as keyof typeof first] as number)).toFixed(2),
    current: +(last[dim as keyof typeof last] as number).toFixed(2),
  }))
})()

const perTeacherLatest = teacherIds.map((tid, i) => {
  const trend = teacherFidelityTrends[tid] ?? monthlyFidelityTrend
  const last = trend[trend.length - 1]
  const teacher = users.find((u) => u.id === tid)
  const avgScore = avg([last.adherence, last.dosage, last.quality, last.responsiveness, last.confidence])
  return {
    name: teacher?.name.split(' ')[0] ?? tid,
    avg: +avgScore.toFixed(2),
    color: teacherColors[i],
  }
})

const perTeacherTrend = monthlyFidelityTrend.map((m, idx) => {
  const point: Record<string, number | string> = { month: m.month }
  teacherIds.forEach((tid) => {
    const trend = teacherFidelityTrends[tid] ?? monthlyFidelityTrend
    const row = trend[idx]
    const teacher = users.find((u) => u.id === tid)
    const key = teacher?.name.split(' ')[0] ?? tid
    point[key] = +avg([row.adherence, row.dosage, row.quality, row.responsiveness, row.confidence]).toFixed(2)
  })
  return point
})

const teacherNames = teacherIds.map((tid) => {
  const t = users.find((u) => u.id === tid)
  return t?.name.split(' ')[0] ?? tid
})

const firstAvg = avg([
  monthlyFidelityTrend[0].adherence,
  monthlyFidelityTrend[0].dosage,
  monthlyFidelityTrend[0].quality,
  monthlyFidelityTrend[0].responsiveness,
  monthlyFidelityTrend[0].confidence,
])
const lastAvg = avg([
  monthlyFidelityTrend[monthlyFidelityTrend.length - 1].adherence,
  monthlyFidelityTrend[monthlyFidelityTrend.length - 1].dosage,
  monthlyFidelityTrend[monthlyFidelityTrend.length - 1].quality,
  monthlyFidelityTrend[monthlyFidelityTrend.length - 1].responsiveness,
  monthlyFidelityTrend[monthlyFidelityTrend.length - 1].confidence,
])

export function LongitudinalView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <TrendingUp size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Longitudinal View</h2>
          <p className="text-sm text-gray-500">9-month implementation fidelity trajectory — Sep through May</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Sep Baseline Avg" value={firstAvg.toFixed(2)} unit="/5" color={roleColor} />
        <StatCard label="May Current Avg" value={lastAvg.toFixed(2)} unit="/5" color={roleColor} />
        <StatCard label="Overall Growth" value={`+${(lastAvg - firstAvg).toFixed(2)}`} unit="pts" color="#10B981" />
        <StatCard label="Months Tracked" value={String(monthlyFidelityTrend.length)} unit="mo" color={roleColor} />
      </div>

      {/* District-wide trend */}
      <Card title="District-Wide Fidelity Trend (All Dimensions)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyFidelityTrend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''}
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(dimensionColors).map(([dim, color]) => (
              <Line
                key={dim}
                type="monotone"
                dataKey={dim}
                name={dim.charAt(0).toUpperCase() + dim.slice(1)}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Per-teacher trend + dimension growth side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Per-teacher overall avg trend */}
        <Card title="Average Fidelity by Teacher Over Time">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={perTeacherTrend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {teacherNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={teacherColors[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Growth per dimension bar chart */}
        <Card title="Growth by Dimension (Sep → May)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={growthByDimension} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => typeof v === 'number' ? `+${v.toFixed(2)} pts` : ''}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="growth" name="Growth (pts)" fill={roleColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* May snapshot table */}
      <Card title="May Snapshot — Current Fidelity by Teacher">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Overall</th>
                {Object.keys(dimensionColors).map((d) => (
                  <th key={d} className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">
                    {d.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {perTeacherLatest.map((t, i) => {
                const tid = teacherIds[i]
                const trend = teacherFidelityTrends[tid] ?? monthlyFidelityTrend
                const last = trend[trend.length - 1]
                return (
                  <tr key={t.name} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800 flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.name[0]}
                      </div>
                      {t.name}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: t.avg >= 4 ? '#10B981' : t.avg >= 3.5 ? '#F59E0B' : '#EF4444' }}
                      >
                        {t.avg}
                      </span>
                    </td>
                    {Object.keys(dimensionColors).map((dim) => (
                      <td key={dim} className="py-2.5 text-center text-gray-600 hidden md:table-cell">
                        {(last[dim as keyof typeof last] as number).toFixed(1)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
