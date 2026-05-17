import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Users, TrendingUp, MessageSquare, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { users } from '../../data/mockData'

const roleColor = '#3B82F6'

function getBarColor(avg: number): string {
  if (avg >= 4.0) return '#10B981'
  if (avg >= 3.0) return '#F59E0B'
  return '#EF4444'
}

export function CoachDashboard() {
  const { currentUser, implementationLogs, fidelityChecks, adaptations } = useAppStore()

  const myTeachers = users.filter(u => u.role === 'teacher' && u.coachId === currentUser.id)

  const teacherStats = myTeachers.map(t => {
    const logs = implementationLogs.filter(l => l.teacherId === t.id)
    const checks = fidelityChecks.filter(f => f.teacherId === t.id)
    const logRate = logs.length > 0 ? Math.round((logs.filter(l => l.lessonCompletion !== 'not_completed').length / logs.length) * 100) : 0
    const avgFidelity = checks.length > 0
      ? checks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length
      : 0
    const myAdapts = adaptations.filter(a => a.teacherId === t.id)
    const consistent = myAdapts.filter(a => a.fidelityType === 'consistent').length
    const inconsistent = myAdapts.filter(a => a.fidelityType === 'inconsistent').length
    return { name: t.name.split(' ')[0], logRate, avgFidelity: parseFloat(avgFidelity.toFixed(1)), consistent, inconsistent }
  })

  const onTrack = teacherStats.filter(t => t.avgFidelity >= 4.0).length
  const avgLogRate = teacherStats.length > 0 ? Math.round(teacherStats.reduce((s, t) => s + t.logRate, 0) / teacherStats.length) : 0
  const fidelityConcerns = teacherStats.filter(t => t.avgFidelity < 3.0).length

  const reasonCounts: Record<string, number> = {}
  myTeachers.forEach(t => {
    adaptations.filter(a => a.teacherId === t.id).forEach(a => {
      a.reasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1 })
    })
  })
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Teachers On Track" value={`${onTrack}/${myTeachers.length}`} sub="Fidelity ≥ 4.0" icon={<Users size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Log Rate" value={`${avgLogRate}%`} sub="Across caseload" icon={<TrendingUp size={18} />} iconColor={roleColor} />
        <StatCard label="Response Rate" value="85%" sub="Last 30 days" icon={<MessageSquare size={18} />} iconColor={roleColor} />
        <StatCard label="Fidelity Concerns" value={fidelityConcerns} sub="Below 3.0" icon={<AlertTriangle size={18} />} iconColor="#EF4444" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Avg Fidelity by Teacher</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={teacherStats} layout="vertical">
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(1) : v} />
              <Bar dataKey="avgFidelity" radius={[0, 4, 4, 0]}>
                {teacherStats.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.avgFidelity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Adaptations: Consistent vs Inconsistent</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={teacherStats}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="consistent" name="Consistent" stackId="a" fill="#10B981" />
              <Bar dataKey="inconsistent" name="Inconsistent" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Top Adaptation Reasons</p>
            {topReasons.map(([reason, count]) => (
              <div key={reason} className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="truncate pr-2">{reason}</span>
                <span className="font-medium text-gray-800 flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
