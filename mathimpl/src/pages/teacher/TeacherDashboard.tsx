import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ClipboardList, CheckSquare, BookOpen, MessageSquare } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'

const roleColor = '#10B981'

export function TeacherDashboard() {
  const { currentUser, implementationLogs, fidelityChecks, adaptations, coachingCycles, notifications } = useAppStore()

  const myLogs = implementationLogs.filter(l => l.teacherId === currentUser.id)
  const myChecks = fidelityChecks.filter(f => f.teacherId === currentUser.id)
  const myAdaptations = adaptations.filter(a => a.teacherId === currentUser.id)
  const myCycle = coachingCycles.find(c => c.teacherId === currentUser.id)
  const unreadMessages = notifications.filter(n => n.userId === currentUser.id && !n.readAt && n.type === 'coaching_followup').length

  const logCompletionRate = myLogs.length > 0
    ? Math.round((myLogs.filter(l => l.lessonCompletion === 'fully').length / myLogs.length) * 100)
    : 0

  const avgFidelity = myChecks.length > 0
    ? (myChecks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / myChecks.length).toFixed(1)
    : '—'

  const thisMonthAdaptations = myAdaptations.filter(a => {
    const d = new Date(a.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Last 4 fidelity checks for trend chart
  const trendData = myChecks
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)
    .reverse()
    .map((c, i) => ({
      week: `Wk ${i + 1}`,
      Adherence: c.adherence,
      Dosage: c.dosage,
      Quality: c.quality,
      Responsiveness: c.responsiveness,
      Confidence: c.confidence,
    }))

  // Adaptation reasons breakdown
  const reasonCounts: Record<string, number> = {}
  myAdaptations.forEach(a => a.reasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1 }))
  const reasonData = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, count }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Log Completion" value={`${logCompletionRate}%`} sub={`${myLogs.length} logs total`} icon={<ClipboardList size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Fidelity Score" value={avgFidelity} sub="Across all dimensions" icon={<CheckSquare size={18} />} iconColor={roleColor} />
        <StatCard label="Adaptations This Month" value={thisMonthAdaptations} sub="Documented adaptations" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Coaching Messages" value={myCycle?.messages.length ?? 0} sub={unreadMessages > 0 ? `${unreadMessages} unread` : 'All read'} icon={<MessageSquare size={18} />} iconColor={roleColor} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Fidelity Trend (Last 4 Weeks)</h3>
          {trendData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No fidelity data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Adherence" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Dosage" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Quality" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Responsiveness" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Confidence" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Adaptation Reasons Breakdown</h3>
          {reasonData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No adaptations documented yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reasonData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill={roleColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
