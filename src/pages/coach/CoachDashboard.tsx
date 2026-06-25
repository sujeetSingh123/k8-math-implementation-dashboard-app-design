import { useState, useMemo } from 'react'
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
  if (avg >= 80) return '#10B981'
  if (avg >= 60) return '#F59E0B'
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
    const logRate = logs.length ? Math.round(logs.filter(l => l.lessonCompletion !== 'not_completed').length / logs.length * 100) : 0
    const rawFidelity = checks.length ? checks.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness) / 4, 0) / checks.length : 0
    const avgFidelity = Math.round(rawFidelity * 20)
    const adaptedLogs = logs.filter(l => l.adaptationOccurred)
    return { id: t.id, name: t.name.split(' ')[0], fullName: t.name, logRate, avgFidelity, planned: adaptedLogs.filter(l => l.anticipatesAdaptation).length, reactive: adaptedLogs.filter(l => l.unexpectedEvent !== 'none').length }
  })

  const onTrack = teacherStats.filter(t => t.avgFidelity >= 80).length
  const avgLogRate = teacherStats.length > 0 ? Math.round(teacherStats.reduce((s, t) => s + t.logRate, 0) / teacherStats.length) : 0
  const fidelityConcerns = teacherStats.filter(t => t.avgFidelity < 60).length

  const reasonCounts: Record<string, number> = {}
  implementationLogs.filter(l => myTeachers.some(t => t.id === l.teacherId)).forEach(l => l.unplannedAdaptCauses?.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1 }))
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const TEACHER_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']
  const buckets = getTimeBuckets(period)

  const weeklyTeacherLogs = buckets.map(b => {
    const row: Record<string, number | string> = { week: b.label }
    myTeachers.forEach(t => { row[t.name.split(' ')[0]] = implementationLogs.filter(l => l.teacherId === t.id && inBucket(l.date, b)).length })
    return row
  })

  const studentScoreByTeacher = useMemo(() => {
    return myTeachers.map(t => {
      const records = studentDataRecords.filter(r => r.teacherId === t.id)
      const avgScore = records.length
        ? +(records.reduce((s, r) => s + r.currentAvg, 0) / records.length).toFixed(1)
        : 0
      return { name: t.name.split(' ')[0], avgScore, fullName: t.name }
    })
  }, [studentDataRecords, myTeachers])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Showing data by period</p>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/coach/caseload')}>
          <StatCard label="Teachers On Track" value={`${onTrack}/${myTeachers.length}`} sub="Fidelity ≥ 80%" icon={<Users size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => toast.info(`Average log rate across caseload: ${avgLogRate}%`)}>
          <StatCard label="Avg Log Rate" value={`${avgLogRate}%`} sub="Across caseload" icon={<TrendingUp size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/coach/feedback')}>
          <StatCard label="Response Rate" value="85%" sub="Last 30 days" icon={<MessageSquare size={18} />} iconColor={roleColor} />
        </div>
        <div className="cursor-pointer" onClick={() => { if (fidelityConcerns > 0) navigate('/coach/caseload'); else toast.success('No fidelity concerns right now!') }}>
          <StatCard label="Fidelity Concerns" value={fidelityConcerns} sub="Below 60%" icon={<AlertTriangle size={18} />} iconColor="#EF4444" />
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
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={(v) => typeof v === 'number' ? `${v}%` : v} />
              <Bar dataKey="avgFidelity" radius={[0, 4, 4, 0]} cursor="pointer"
                onClick={(data) => navigate(`/coach/teacher/${data.payload.id}`)}>
                {teacherStats.map((entry, i) => <Cell key={i} fill={getBarColor(entry.avgFidelity)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Planned vs Reactive Adaptations</h3>
            <button onClick={() => toast.info('Green = pre-planned adaptations, amber = reactive to unexpected events.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">What's this?</button>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={teacherStats}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="planned" name="Planned" stackId="a" fill="#10B981" />
              <Bar dataKey="reactive" name="Reactive" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
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
              <p className="text-xs font-medium text-gray-700 truncate">{teacherById[log.teacherId] ?? log.teacherId} · {log.date} · {log.mathSkill ?? '—'}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge color={log.adaptationOccurred ? 'purple' : 'blue'}>{log.tier}</Badge>
              <Badge color={log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'}>{log.lessonCompletion.replace('_', ' ')}</Badge>
              <ChevronRight size={13} className="text-gray-300 ml-1" />
            </div>
          </button>
        ))}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Student Score Data by Teacher</h3>
          <button onClick={() => navigate('/coach/student-data')} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer">View all →</button>
        </div>
        {!studentScoreByTeacher.length || studentScoreByTeacher.every(t => t.avgScore === 0) ? (
          <p className="text-sm text-gray-400 text-center py-8">No student score data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={studentScoreByTeacher} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip formatter={(v, _n, p) => [typeof v === 'number' ? v.toFixed(1) : v, p.payload.fullName]} />
              <Bar dataKey="avgScore" name="Avg Score" fill={roleColor} radius={[4, 4, 0, 0]}
                onClick={(data) => navigate(`/coach/teacher/${data.payload.id}`)} cursor="pointer">
                {studentScoreByTeacher.map((_entry, i) => <Cell key={i} fill={TEACHER_COLORS[i % TEACHER_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
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
