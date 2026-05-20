import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ClipboardList, CheckSquare, BookOpen, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.teacher

export function TeacherDashboard() {
  const { currentUser, implementationLogs, fidelityChecks, adaptations, coachingCycles, notifications } = useAppStore()
  const navigate = useNavigate()

  const myLogs = implementationLogs.filter(l => l.teacherId === currentUser.id)
  const myChecks = fidelityChecks.filter(f => f.teacherId === currentUser.id)
  const myAdaptations = adaptations.filter(a => a.teacherId === currentUser.id)
  const myCycle = coachingCycles.find(c => c.teacherId === currentUser.id)
  const unreadMessages = notifications.filter(n => n.userId === currentUser.id && !n.readAt && n.type === 'coaching_followup').length

  const logCompletionRate = myLogs.length > 0
    ? Math.round((myLogs.filter(l => l.lessonCompletion === 'fully').length / myLogs.length) * 100) : 0
  const avgFidelity = myChecks.length > 0
    ? (myChecks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / myChecks.length).toFixed(1)
    : '—'
  const thisMonthAdaptations = myAdaptations.filter(a => {
    const d = new Date(a.date); const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const trendData = myChecks.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).reverse()
    .map((c, i) => ({ week: `Wk ${i + 1}`, Adherence: c.adherence, Dosage: c.dosage, Quality: c.quality, Responsiveness: c.responsiveness, Confidence: c.confidence }))

  const reasonCounts: Record<string, number> = {}
  myAdaptations.forEach(a => a.reasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1 }))
  const reasonData = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, count }))

  const handleLogClick = () => { toast.info(`${myLogs.length} total logs — ${logCompletionRate}% fully completed.`); navigate('/teacher/log') }
  const handleFidelityClick = () => { toast.info('Fidelity self-check due — tap to complete.'); navigate('/teacher/fidelity') }
  const handleAdaptClick = () => { toast.info(`${thisMonthAdaptations} adaptations this month.`); navigate('/teacher/adaptations') }
  const handleCoachClick = () => {
    if (unreadMessages > 0) toast.info(`You have ${unreadMessages} unread coaching message${unreadMessages > 1 ? 's' : ''}.`)
    navigate('/teacher/coaching')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="cursor-pointer" onClick={handleLogClick}><StatCard label="Log Completion" value={`${logCompletionRate}%`} sub={`${myLogs.length} total`} icon={<ClipboardList size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleFidelityClick}><StatCard label="Avg Fidelity" value={avgFidelity} sub="All dimensions" icon={<CheckSquare size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleAdaptClick}><StatCard label="Adaptations" value={thisMonthAdaptations} sub="This month" icon={<BookOpen size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleCoachClick}><StatCard label="Messages" value={myCycle?.messages.length ?? 0} sub={unreadMessages > 0 ? `${unreadMessages} unread` : 'All read'} icon={<MessageSquare size={18} />} iconColor={roleColor} /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Fidelity Trend (Last 4 Weeks)</h3>
            <button onClick={() => navigate('/teacher/fidelity')} className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">Complete check →</button>
          </div>
          {trendData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm mb-2">No fidelity data yet.</p>
              <button onClick={() => navigate('/teacher/fidelity')} className="text-xs text-emerald-500 cursor-pointer underline">Complete your first check</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} width={20} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Adaptation Reasons</h3>
            <button onClick={() => navigate('/teacher/adaptations')} className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">View all →</button>
          </div>
          {reasonData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm mb-2">No adaptations documented yet.</p>
              <button onClick={() => navigate('/teacher/adaptations')} className="text-xs text-emerald-500 cursor-pointer underline">Document one now</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={reasonData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
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
