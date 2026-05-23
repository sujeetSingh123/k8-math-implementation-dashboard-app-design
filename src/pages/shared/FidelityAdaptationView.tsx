import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'

type Period = 'week' | 'month' | 'year'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

function periodStart(period: Period): string {
  const d = new Date()
  if (period === 'week') d.setDate(d.getDate() - 7)
  else if (period === 'month') d.setDate(d.getDate() - 30)
  else d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().split('T')[0]
}

function getBucket(date: string, period: Period): string {
  if (period === 'week') return date
  if (period === 'month') {
    const d = new Date(date + 'T12:00:00')
    const day = d.getDay() || 7
    d.setDate(d.getDate() - day + 1)
    return d.toISOString().split('T')[0]
  }
  return date.slice(0, 7)
}

function bucketLabel(bucket: string, period: Period): string {
  if (period === 'week') return new Date(bucket + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  if (period === 'month') return new Date(bucket + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return new Date(bucket + '-15T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function compScore(c: { adherence: number; dosage: number; quality: number; responsiveness: number; confidence: number }) {
  return (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5
}

export function FidelityAdaptationView() {
  const { currentUser, fidelityChecks, adaptations } = useAppStore()
  const [period, setPeriod] = useState<Period>('month')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all')

  const roleColor = roleColors[currentUser.role]
  const isTeacher = currentUser.role === 'teacher'

  const scopeTeachers = useMemo(() => {
    const all = users.filter(u => u.role === 'teacher')
    if (isTeacher) return all.filter(u => u.id === currentUser.id)
    if (currentUser.role === 'coach') return all.filter(u => u.coachId === currentUser.id)
    if (currentUser.role === 'admin') return all.filter(u => u.schoolId === currentUser.schoolId)
    return all
  }, [currentUser, isTeacher])

  const teacherIds = useMemo(() => {
    if (isTeacher) return [currentUser.id]
    return selectedTeacherId === 'all' ? scopeTeachers.map(t => t.id) : [selectedTeacherId]
  }, [isTeacher, selectedTeacherId, scopeTeachers, currentUser.id])

  const start = periodStart(period)

  const filteredChecks = useMemo(() =>
    fidelityChecks.filter(c => teacherIds.includes(c.teacherId) && c.date >= start),
    [fidelityChecks, teacherIds, start])

  const filteredAdaptations = useMemo(() =>
    adaptations.filter(a => teacherIds.includes(a.teacherId) && a.date >= start),
    [adaptations, teacherIds, start])

  const fidelityTimeline = useMemo(() => {
    const buckets: Record<string, number[]> = {}
    filteredChecks.forEach(c => {
      const key = getBucket(c.date, period)
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(compScore(c))
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => ({
        label: bucketLabel(key, period),
        fidelity: +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2),
      }))
  }, [filteredChecks, period])

  const adaptationTimeline = useMemo(() => {
    const buckets: Record<string, { consistent: number; inconsistent: number }> = {}
    filteredAdaptations.forEach(a => {
      const key = getBucket(a.date, period)
      if (!buckets[key]) buckets[key] = { consistent: 0, inconsistent: 0 }
      if (a.fidelityType === 'consistent') buckets[key].consistent++
      else buckets[key].inconsistent++
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({ label: bucketLabel(key, period), ...v, total: v.consistent + v.inconsistent }))
  }, [filteredAdaptations, period])

  const avgFidelity = filteredChecks.length
    ? +(filteredChecks.reduce((s, c) => s + compScore(c), 0) / filteredChecks.length).toFixed(2)
    : 0
  const consistentPct = filteredAdaptations.length
    ? Math.round(filteredAdaptations.filter(a => a.fidelityType === 'consistent').length / filteredAdaptations.length * 100)
    : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <TrendingUp size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Fidelity & Adaptations</h2>
          <p className="text-sm text-gray-500">
            {isTeacher ? 'Your implementation trends over time' : `${scopeTeachers.length} teacher${scopeTeachers.length !== 1 ? 's' : ''} in scope`}
          </p>
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
        {!isTeacher && (
          <div className="flex gap-1.5 flex-wrap">
            {(['all', ...scopeTeachers.map(t => t.id)] as string[]).map(id => (
              <button key={id} onClick={() => setSelectedTeacherId(id)}
                className="px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer transition-all"
                style={{
                  borderColor: selectedTeacherId === id ? roleColor : '#D1D5DB',
                  backgroundColor: selectedTeacherId === id ? roleColor : '#fff',
                  color: selectedTeacherId === id ? '#fff' : '#6B7280',
                }}>
                {id === 'all' ? 'All Teachers' : scopeTeachers.find(t => t.id === id)?.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Fidelity" value={String(avgFidelity)} unit="/5" color={roleColor} />
        <StatCard label="Fidelity Checks" value={String(filteredChecks.length)} color={roleColor} />
        <StatCard label="Adaptations" value={String(filteredAdaptations.length)} color={roleColor} />
        <StatCard label="Consistent" value={`${consistentPct}%`} sub="FRAME-IS" color="#10B981" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Composite Fidelity Trend">
          {fidelityTimeline.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No fidelity data in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={fidelityTimeline} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="fidelity" name="Avg Fidelity" stroke={roleColor} strokeWidth={2.5} dot={{ r: 3, fill: roleColor }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Adaptations Over Time">
          {adaptationTimeline.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No adaptations in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adaptationTimeline} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="consistent" name="Consistent" stackId="a" fill="#10B981" />
                <Bar dataKey="inconsistent" name="Inconsistent" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
