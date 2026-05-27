import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, BarChart2, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { roleColors } from '../../constants/roles'
import { StudentDataUploadModal } from './StudentDataUploadModal'

const roleColor = roleColors.teacher

const tierBadge: Record<string, 'blue' | 'green' | 'purple' | 'red'> = {
  'Tier 1': 'green', 'Tier 2': 'blue', 'Tier 3': 'purple', 'SPED': 'red',
}

const statusColor = (s?: string) =>
  s === 'Verified' ? 'green' : s === 'Submitted' ? 'blue' : 'amber'

export function StudentData() {
  const { currentUser, studentDataRecords } = useAppStore()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [tierFilter, setTierFilter] = useState<string>('all')

  const myRecords = useMemo(() =>
    studentDataRecords
      .filter(r => r.teacherId === currentUser.id)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [studentDataRecords, currentUser.id]
  )

  const filtered = tierFilter === 'all' ? myRecords : myRecords.filter(r => r.instructionalSetting === tierFilter)

  const latest = filtered.length > 0 ? filtered[filtered.length - 1] : null
  const prev = filtered.length > 1 ? filtered[filtered.length - 2] : null
  const trend = latest && prev ? latest.currentAvg - prev.currentAvg : null
  const avgGrowth = myRecords.length > 0 ? +(myRecords.reduce((s, r) => s + (r.growth ?? 0), 0) / myRecords.length).toFixed(1) : 0
  const goalsMet = myRecords.filter(r => r.metGoal).length

  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {}
    filtered.forEach(r => {
      const label = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!byDate[label]) byDate[label] = { date: label as unknown as number }
      byDate[label][r.instructionalSetting] = r.currentAvg
    })
    return Object.values(byDate)
  }, [filtered])

  const recent = [...myRecords].reverse().slice(0, 12)

  const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'SPED'] as const
  const tierLineColors: Record<string, string> = { 'Tier 1': '#10B981', 'Tier 2': '#3B82F6', 'Tier 3': '#8B5CF6', 'SPED': '#EF4444' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">Student Data</h1>
        <Button roleColor={roleColor} size="sm" onClick={() => setUploadOpen(true)}>
          <Plus size={14} />Upload Data
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Current Avg %" value={latest ? `${latest.currentAvg}%` : '—'}
          sub={latest ? latest.instructionalSetting : 'No data yet'}
          icon={<BarChart2 size={18} />} iconColor={roleColor} />
        <StatCard label="Trend" value={trend !== null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : '—'}
          sub="vs previous entry"
          icon={trend !== null && trend >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          iconColor={trend !== null && trend >= 0 ? '#10B981' : '#EF4444'} />
        <StatCard label="Avg Growth" value={`+${avgGrowth}%`} sub="from baseline" iconColor={roleColor} />
        <StatCard label="Goals Met" value={String(goalsMet)} sub={`of ${myRecords.length} records`}
          icon={<CheckCircle size={18} />} iconColor="#10B981" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(['all', ...tiers] as string[]).map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${tierFilter !== t ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'text-white'}`}
            style={tierFilter === t ? { backgroundColor: roleColor } : {}}>
            {t === 'all' ? 'All Tiers' : t}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Current Avg % Over Time</h2>
        </div>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BarChart2 size={28} className="mb-2" />
            <p className="text-sm">No data yet. Upload your first record.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              {tiers.map(t => (
                <Line key={t} type="monotone" dataKey={t} stroke={tierLineColors[t]}
                  strokeWidth={2} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Records</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-gray-400 font-semibold uppercase">Date / Wk</th>
                  <th className="text-left px-3 py-2 text-gray-400 font-semibold uppercase hidden sm:table-cell">Measure</th>
                  <th className="text-center px-3 py-2 text-gray-400 font-semibold uppercase">Tier</th>
                  <th className="text-right px-3 py-2 text-gray-400 font-semibold uppercase">Baseline</th>
                  <th className="text-right px-3 py-2 text-gray-400 font-semibold uppercase">Current</th>
                  <th className="text-right px-3 py-2 text-gray-400 font-semibold uppercase hidden sm:table-cell">Growth</th>
                  <th className="text-center px-3 py-2 text-gray-400 font-semibold uppercase hidden md:table-cell">Goal</th>
                  <th className="text-center px-3 py-2 text-gray-400 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <p className="text-gray-800 font-medium">{r.date}</p>
                      {r.week && <p className="text-gray-400">Wk {r.week}{r.grade ? ` · Gr ${r.grade}` : ''}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell max-w-[160px] truncate">{r.measureType}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge color={tierBadge[r.instructionalSetting] ?? 'blue'}>{r.instructionalSetting}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-500">{r.baselineAvg != null ? `${r.baselineAvg}%` : '—'}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-gray-800">{r.currentAvg}%</td>
                    <td className="px-3 py-2.5 text-right hidden sm:table-cell">
                      {r.growth != null
                        ? <span className={r.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}>{r.growth >= 0 ? '+' : ''}{r.growth}%</span>
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center hidden md:table-cell">
                      {r.goalPct != null && (
                        <span className="flex items-center justify-center gap-1">
                          {r.metGoal
                            ? <CheckCircle size={12} className="text-emerald-500" />
                            : <AlertCircle size={12} className="text-amber-400" />}
                          {r.goalPct}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {r.uploadStatus && <Badge color={statusColor(r.uploadStatus)}>{r.uploadStatus}</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {uploadOpen && <StudentDataUploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  )
}
