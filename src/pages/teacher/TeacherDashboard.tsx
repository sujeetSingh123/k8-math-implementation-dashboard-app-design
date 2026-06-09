import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ClipboardList, CheckSquare, BookOpen, MessageSquare, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { TimePeriodSelector, type TimePeriod } from '../../components/ui/TimePeriodSelector'
import { TierBreakdown } from './TierBreakdown'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { getTimeBuckets, inBucket } from '../../utils/timePeriod'

const roleColor = roleColors.teacher

export function TeacherDashboard() {
  const { currentUser, implementationLogs, fidelityChecks, adaptations, coachingCycles, notifications, pdSessions, trainingAttendances } = useAppStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<TimePeriod>('week')

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

  const mySessions = pdSessions
  const myAttendances = trainingAttendances.filter(a => a.teacherId === currentUser.id)
  const attendedCount = mySessions.filter(s =>
    s.status === 'completed' && myAttendances.some(a => a.sessionTitle === s.title && !!a.checkedOutAt)
  ).length

  const buckets = getTimeBuckets(period)

  const trendData = buckets.map(b => {
    const checks = myChecks.filter(c => inBucket(c.date, b))
    if (checks.length === 0) return { week: b.label, Adherence: null, Dosage: null, Quality: null, Responsiveness: null, Confidence: null }
    const avg = (key: keyof typeof checks[0]) => parseFloat((checks.reduce((s, c) => s + (c[key] as number), 0) / checks.length).toFixed(1))
    return { week: b.label, Adherence: avg('adherence'), Dosage: avg('dosage'), Quality: avg('quality'), Responsiveness: avg('responsiveness'), Confidence: avg('confidence') }
  })

  const reasonCounts: Record<string, number> = {}
  myAdaptations.forEach(a => a.reasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1 }))
  const reasonData = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, count }))

  const weeklyLogData = buckets.map(b => {
    const wkLogs = myLogs.filter(l => inBucket(l.date, b))
    return { week: b.label, Fully: wkLogs.filter(l => l.lessonCompletion === 'fully').length, Partial: wkLogs.filter(l => l.lessonCompletion === 'partially').length, Missed: wkLogs.filter(l => l.lessonCompletion === 'not_completed').length }
  })

  const coachingData = buckets.map(b => {
    const count = (myCycle?.messages ?? []).filter(m => m.senderId === myCycle?.coachId && inBucket(m.createdAt, b)).length
    return { week: b.label, Messages: count }
  })

  const handleLogClick = () => { toast.info(`${myLogs.length} total logs — ${logCompletionRate}% fully completed.`); navigate('/teacher/log') }
  const handleFidelityClick = () => { toast.info('Fidelity self-check due — tap to complete.'); navigate('/teacher/fidelity') }
  const handleAdaptClick = () => { toast.info(`${thisMonthAdaptations} adaptations this month.`); navigate('/teacher/adaptations') }
  const handleCoachClick = () => {
    if (unreadMessages > 0) toast.info(`You have ${unreadMessages} unread coaching message${unreadMessages > 1 ? 's' : ''}.`)
    navigate('/teacher/coaching')
  }
  const handleTrainingClick = () => { toast.info(`${attendedCount} of ${mySessions.length} training sessions attended.`); navigate('/teacher/training') }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Showing data by period</p>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="cursor-pointer" onClick={handleLogClick}><StatCard label="Log Completion" value={`${logCompletionRate}%`} sub={`${myLogs.length} total`} icon={<ClipboardList size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleFidelityClick}><StatCard label="Avg Fidelity" value={avgFidelity} sub="All dimensions" icon={<CheckSquare size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleAdaptClick}><StatCard label="Adaptations" value={thisMonthAdaptations} sub="This month" icon={<BookOpen size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleCoachClick}><StatCard label="Messages" value={myCycle?.messages.length ?? 0} sub={unreadMessages > 0 ? `${unreadMessages} unread` : 'All read'} icon={<MessageSquare size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={handleTrainingClick}><StatCard label="Training" value={`${attendedCount}/${mySessions.length}`} sub="Sessions attended" icon={<GraduationCap size={18} />} iconColor={roleColor} /></div>
      </div>
      <TierBreakdown logs={myLogs} checks={myChecks} adaptations={myAdaptations} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Fidelity Trend</h3>
            <button onClick={() => navigate('/teacher/fidelity')} className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">Complete check →</button>
          </div>
          {trendData.every(d => d.Adherence === null) ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm mb-2">No fidelity data yet.</p>
              <button onClick={() => navigate('/teacher/fidelity')} className="text-xs text-emerald-500 cursor-pointer underline">Complete your first check</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} width={36} tickFormatter={v => `${Math.round(v * 20)}%`} />
                <Tooltip formatter={(v) => typeof v === 'number' ? `${Math.round(v * 20)}%` : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Adherence" stroke="#10B981" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Dosage" stroke="#3B82F6" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Quality" stroke="#F59E0B" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Responsiveness" stroke="#8B5CF6" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="Confidence" stroke="#EF4444" strokeWidth={2} dot={false} connectNulls />
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
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Coaching Activity</h3>
          <button onClick={() => navigate('/teacher/coaching')} className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">Open thread →</button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={coachingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
            <Tooltip />
            <Bar dataKey="Messages" fill={roleColors.coach} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Log Activity</h3>
          <button onClick={() => navigate('/teacher/logs')} className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">View all →</button>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyLogData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
            <Tooltip />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Fully" stackId="a" fill="#10B981" />
            <Bar dataKey="Partial" stackId="a" fill="#F59E0B" />
            <Bar dataKey="Missed" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
