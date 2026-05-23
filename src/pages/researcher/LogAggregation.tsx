import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Activity } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { schools } from '../../data/mockData'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.researcher

type Period = 'week' | 'month' | 'year'
type Category = 'routine' | 'ebp' | 'strategy' | 'tier' | 'completion' | 'school'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'routine', label: 'Routine' },
  { key: 'ebp', label: 'EBP' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'tier', label: 'Tier' },
  { key: 'completion', label: 'Completion' },
  { key: 'school', label: 'School' },
]

function periodStart(period: Period): string {
  const d = new Date()
  if (period === 'week') d.setDate(d.getDate() - 7)
  else if (period === 'month') d.setDate(d.getDate() - 30)
  else d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().split('T')[0]
}

export function LogAggregation() {
  const { implementationLogs } = useAppStore()
  const [period, setPeriod] = useState<Period>('month')
  const [category, setCategory] = useState<Category>('routine')

  const filtered = useMemo(() => {
    const start = periodStart(period)
    return implementationLogs.filter(l => l.date >= start)
  }, [implementationLogs, period])

  const timelineData = useMemo(() => {
    const today = new Date()

    if (period === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          count: implementationLogs.filter(l => l.date === dateStr).length,
        }
      })
    }

    if (period === 'month') {
      return Array.from({ length: 5 }, (_, i) => {
        const end = new Date(today)
        end.setDate(today.getDate() - i * 6)
        const start = new Date(end)
        start.setDate(end.getDate() - 5)
        const s = start.toISOString().split('T')[0]
        const e = end.toISOString().split('T')[0]
        return {
          label: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          count: implementationLogs.filter(l => l.date >= s && l.date <= e).length,
        }
      }).reverse()
    }

    // year: bucket by YYYY-MM
    const buckets: Record<string, number> = {}
    implementationLogs.forEach(l => {
      const key = l.date.slice(0, 7)
      buckets[key] = (buckets[key] || 0) + 1
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({
        label: new Date(key + '-15').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count,
      }))
  }, [implementationLogs, period])

  const categoryData = useMemo(() => {
    const schoolName = Object.fromEntries(schools.map(s => [s.id, s.name]))
    const counts: Record<string, number> = {}
    filtered.forEach(l => {
      let keys: string[] = []
      if (category === 'routine') keys = [l.instructionalRoutine]
      else if (category === 'ebp') keys = l.ebpComponent
      else if (category === 'strategy') keys = [l.implementationStrategy]
      else if (category === 'tier') keys = [l.tier]
      else if (category === 'completion') keys = [l.lessonCompletion.replace(/_/g, ' ')]
      else keys = [schoolName[l.schoolId] ?? l.schoolId]
      keys.forEach(k => { counts[k] = (counts[k] || 0) + 1 })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }))
  }, [filtered, category])

  const totalLogs = filtered.length
  const uniqueTeachers = new Set(filtered.map(l => l.teacherId)).size
  const avgDuration = totalLogs
    ? Math.round(filtered.reduce((s, l) => s + l.durationMinutes, 0) / totalLogs)
    : 0
  const completionRate = totalLogs
    ? Math.round(filtered.filter(l => l.lessonCompletion === 'fully').length / totalLogs * 100)
    : 0

  const catLabel = CATEGORIES.find(c => c.key === category)?.label ?? ''
  const timeLabel = period === 'week' ? 'Day' : period === 'month' ? 'Period' : 'Month'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Activity size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Log Aggregation</h2>
          <p className="text-sm text-gray-500">All implementation logs · All users · All schools</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
              style={period === p.key ? { backgroundColor: roleColor, color: '#fff' } : { color: '#6B7280' }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className="px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer transition-all"
              style={{
                borderColor: category === c.key ? roleColor : '#D1D5DB',
                backgroundColor: category === c.key ? roleColor : '#fff',
                color: category === c.key ? '#fff' : '#6B7280',
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Logs" value={String(totalLogs)} unit={period} color={roleColor} />
        <StatCard label="Unique Teachers" value={String(uniqueTeachers)} color={roleColor} />
        <StatCard label="Avg Duration" value={String(avgDuration)} unit="min" color={roleColor} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} sub="Fully completed" color="#10B981" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title={`Log Volume by ${timeLabel}`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timelineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" name="Logs" fill={roleColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={`Distribution by ${catLabel}`}>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No logs in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" name="Logs" fill={roleColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
