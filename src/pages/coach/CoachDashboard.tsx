import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { Users, TrendingUp, MessageSquare, AlertTriangle, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { TimePeriodSelector, type TimePeriod } from '../../components/ui/TimePeriodSelector'
import { Badge } from '../../components/ui/Badge'
import { LogDetailView } from './LogDetailView'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { getTimeBuckets, inBucket } from '../../utils/timePeriod'

const roleColor = roleColors.coach

function getBarColor(avg: number): string {
  if (avg >= 4.0) return '#10B981'
  if (avg >= 3.0) return '#F59E0B'
  return '#EF4444'
}

export function CoachDashboard() {
  const { currentUser, implementationLogs, fidelityChecks, adaptations, studentDataRecords } = useAppStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<TimePeriod>('week')
  const [selectedLog, setSelectedLog] = useState<typeof implementationLogs[0] | null>(null)

  const myTeachers = users.filter(u => u.role === 'teacher' && u.coachId === currentUser.id)
  const teacherById = Object.fromEntries(myTeachers.map(t => [t.id, t.name]))
  const recentLogs = implementationLogs
    .filter(l => myTeachers.some(t => t.id === l.teacherId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  const teacherStats = myTeachers.map(t => {
    const logs = implementationLogs.filter(l => l.teacherId === t.id)
    const checks = fidelityChecks.filter(f => f.teacherId === t.id)
    const logRate = logs.length > 0 ? Math.round((logs.filter(l => l.lessonCompletion !== 'not_completed').length / logs.length) * 100) : 0
    const avgFidelity = checks.length > 0
      ? checks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length : 0
    const myAdapts = adaptations.filter(a => a.teacherId === t.id)
    return {
      id: t.id, name: t.name.split(' ')[0], fullName: t.name,
      logRate, avgFidelity: parseFloat(avgFidelity.toFixed(1)),
      consistent: myAdapts.filter(a => a.fidelityType === 'consistent').length,
      inconsistent: myAdapts.filter(a => a.fidelityType === 'inconsistent').length,
    }
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

  const TEACHER_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']
  const buckets = getTimeBuckets(period)

  const weeklyTeacherLogs = buckets.map(b => {
    const row: Record<string, number | string> = { week: b.label }
    myTeachers.forEach(t => {
      row[t.name.split(' ')[0]] = implementationLogs.filter(l => l.teacherId === t.id && inBucket(l.date, b)).length
    })
    return row
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Showing data by period</p>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/coach/caseload')}>
          <StatCard label="Teachers On Track" value={`${onTrack}/${myTeachers.length}`} sub="Fidelity ≥ 4.0" icon={<Users size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info(`Average log rate across caseload: ${avgLogRate}%`)}>
          <StatCard label="Avg Log Rate" value={`${avgLogRate}%`} sub="Across caseload" icon={<TrendingUp size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/coach/feedback')}>
          <StatCard label="Response Rate" value="85%" sub="Last 30 days" icon={<MessageSquare size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => { if (fidelityConcerns > 0) navigate('/coach/caseload'); else toast.success('No fidelity concerns right now!') }}>
          <StatCard label="Fidelity Concerns" value={fidelityConcerns} sub="Below 3.0" icon={<AlertTriangle size={18} />} iconColor="#EF4444" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Avg Fidelity by Teacher</h3>
            <button onClick={() => navigate('/coach/caseload')} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer">View caseload →</button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={teacherStats} layout="vertical">
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(1) : v} />
              <Bar dataKey="avgFidelity" radius={[0, 4, 4, 0]} cursor="pointer"
                onClick={(data) => navigate(`/coach/teacher/${data.payload.id}`)}>
                {teacherStats.map((entry, i) => <Cell key={i} fill={getBarColor(entry.avgFidelity)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Consistent vs Inconsistent</h3>
            <button onClick={() => toast.info('Green = fidelity-consistent adaptations, amber = inconsistent.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">What's this?</button>
          </div>
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
              <div key={reason} onClick={() => toast.info(`"${reason}" appears ${count} times across your caseload.`)}
                className="flex justify-between text-xs text-gray-600 mb-1.5 cursor-pointer hover:text-gray-900 group">
                <span className="group-hover:text-blue-600 transition-colors">{reason}</span>
                <span className="font-medium text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Log Submissions by Period (Caseload)</h3>
          <button onClick={() => navigate('/coach/caseload')} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer">View caseload →</button>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyTeacherLogs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
            <Tooltip />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            {myTeachers.map((t, i) => (
              <Line key={t.id} type="monotone" dataKey={t.name.split(' ')[0]} stroke={TEACHER_COLORS[i % TEACHER_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} style={{ color: roleColor }} />
            <h3 className="text-sm font-semibold text-gray-800">Recent Implementation Logs</h3>
          </div>
          <button onClick={() => navigate('/coach/caseload')} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer">View all →</button>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No logs from your caseload yet.</p>
        ) : recentLogs.map(log => (
          <button key={log.id} onClick={() => setSelectedLog(log)}
            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{teacherById[log.teacherId] ?? log.teacherId} · {log.date} · {log.instructionalRoutine}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge color={log.adaptationOccurred ? 'purple' : 'blue'}>{log.tier}</Badge>
              <Badge color={log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'}>{log.lessonCompletion.replace('_', ' ')}</Badge>
              <ChevronRight size={13} className="text-gray-300 ml-1" />
            </div>
          </button>
        ))}
      </Card>

      {selectedLog && (
        <Modal open onClose={() => setSelectedLog(null)} title="Log Detail" size="lg">
          <LogDetailView
            log={selectedLog}
            adaptation={adaptations.find(a => a.logId === selectedLog.id)}
            fidelityCheck={fidelityChecks.find(f => f.logId === selectedLog.id)}
            studentDataRecords={studentDataRecords.filter(r => r.logId === selectedLog.id)}
            onBack={() => setSelectedLog(null)}
          />
        </Modal>
      )}
    </div>
  )
}
