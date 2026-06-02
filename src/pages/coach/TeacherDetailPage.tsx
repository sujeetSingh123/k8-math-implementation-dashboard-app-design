import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowLeft, ClipboardList, CheckSquare, BookOpen, MessageSquare, GraduationCap } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { TimePeriodSelector, type TimePeriod } from '../../components/ui/TimePeriodSelector'
import { TierBreakdown } from '../teacher/TierBreakdown'
import { roleColors } from '../../constants/roles'
import { getTimeBuckets, inBucket } from '../../utils/timePeriod'

const roleColor = roleColors.teacher

export function TeacherDetailPage() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const navigate = useNavigate()
  const { implementationLogs, fidelityChecks, adaptations, coachingCycles, pdSessions, trainingAttendances } = useAppStore()
  const [period, setPeriod] = useState<TimePeriod>('week')

  const teacher = users.find(u => u.id === teacherId)

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Teacher not found.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-blue-500 mt-2 cursor-pointer underline">Go back</button>
      </div>
    )
  }

  const myLogs = implementationLogs.filter(l => l.teacherId === teacher.id)
  const myChecks = fidelityChecks.filter(f => f.teacherId === teacher.id)
  const myAdaptations = adaptations.filter(a => a.teacherId === teacher.id)
  const myCycle = coachingCycles.find(c => c.teacherId === teacher.id)
  const myAttendances = trainingAttendances.filter(a => a.teacherId === teacher.id)
  const attendedCount = pdSessions.filter(s =>
    s.status === 'completed' && myAttendances.some(a => a.sessionTitle === s.title && !!a.checkedOutAt)
  ).length

  const logCompletionRate = myLogs.length > 0
    ? Math.round((myLogs.filter(l => l.lessonCompletion === 'fully').length / myLogs.length) * 100) : 0
  const avgFidelity = myChecks.length > 0
    ? (myChecks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / myChecks.length).toFixed(1)
    : '—'
  const thisMonthAdaptations = myAdaptations.filter(a => {
    const d = new Date(a.date); const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

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
    return {
      week: b.label,
      Fully: wkLogs.filter(l => l.lessonCompletion === 'fully').length,
      Partial: wkLogs.filter(l => l.lessonCompletion === 'partially').length,
      Missed: wkLogs.filter(l => l.lessonCompletion === 'not_completed').length,
    }
  })

  const coachingData = buckets.map(b => {
    const count = (myCycle?.messages ?? []).filter(m => m.senderId === myCycle?.coachId && inBucket(m.createdAt, b)).length
    return { week: b.label, Messages: count }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
          {teacher.initials}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{teacher.name}</h2>
          <p className="text-xs text-gray-400">{teacher.schoolId} · {teacher.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Log Completion" value={`${logCompletionRate}%`} sub={`${myLogs.length} total`} icon={<ClipboardList size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Fidelity" value={avgFidelity} sub="All dimensions" icon={<CheckSquare size={18} />} iconColor={roleColor} />
        <StatCard label="Adaptations" value={thisMonthAdaptations} sub="This month" icon={<BookOpen size={18} />} iconColor={roleColor} />
        <StatCard label="Messages" value={myCycle?.messages.length ?? 0} sub="In coaching thread" icon={<MessageSquare size={18} />} iconColor={roleColor} />
        <StatCard label="Training" value={`${attendedCount}/${pdSessions.length}`} sub="Sessions attended" icon={<GraduationCap size={18} />} iconColor={roleColor} />
      </div>

      <TierBreakdown logs={myLogs} checks={myChecks} adaptations={myAdaptations} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Fidelity Trend</h3>
          </div>
          {trendData.every(d => d.Adherence === null) ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <p className="text-sm">No fidelity data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} width={20} />
                <Tooltip />
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
          </div>
          {reasonData.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <p className="text-sm">No adaptations documented yet.</p>
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
