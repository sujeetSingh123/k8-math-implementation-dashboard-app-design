import { useState } from 'react'
import { MessageSquare, Eye, Flag, Users, ChevronRight, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import type { ImplementationLog, User } from '../../types'
import { LogDetailView } from './LogDetailView'
import { TeacherDetailModal } from './TeacherDetailModal'

const roleColor = roleColors.coach

function getStatus(avgFidelity: number): { label: string; color: 'green' | 'amber' | 'red' } {
  if (avgFidelity >= 4.0) return { label: 'On Track', color: 'green' }
  if (avgFidelity >= 3.0) return { label: 'Needs Support', color: 'amber' }
  return { label: 'At Risk', color: 'red' }
}

export function TeacherCaseload() {
  const { currentUser, implementationLogs, fidelityChecks, adaptations, coachingCycles, flaggedTeachers, toggleFlag } = useAppStore()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [logsModal, setLogsModal] = useState<{ name: string; logs: ImplementationLog[] } | null>(null)
  const [selectedLog, setSelectedLog] = useState<ImplementationLog | null>(null)
  const [detailTeacher, setDetailTeacher] = useState<User | null>(null)

  const myTeachers = users.filter(u => u.role === 'teacher' && u.coachId === currentUser.id)

  const teacherData = myTeachers.map(t => {
    const logs = implementationLogs.filter(l => l.teacherId === t.id)
    const checks = fidelityChecks.filter(f => f.teacherId === t.id)
    const logRate = logs.length > 0 ? Math.round((logs.filter(l => l.lessonCompletion === 'fully').length / logs.length) * 100) : 0
    const avgFidelity = checks.length > 0
      ? checks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length : 0
    const adaptCount = adaptations.filter(a => a.teacherId === t.id).length
    const cycle = coachingCycles.find(c => c.teacherId === t.id)
    const lastMsg = cycle?.messages.slice(-1)[0]
    const status = getStatus(avgFidelity)
    const miniChart = [
      { dim: 'Adh', score: checks.reduce((s, c) => s + c.adherence, 0) / Math.max(checks.length, 1) },
      { dim: 'Dos', score: checks.reduce((s, c) => s + c.dosage, 0) / Math.max(checks.length, 1) },
      { dim: 'Qual', score: checks.reduce((s, c) => s + c.quality, 0) / Math.max(checks.length, 1) },
      { dim: 'Resp', score: checks.reduce((s, c) => s + c.responsiveness, 0) / Math.max(checks.length, 1) },
      { dim: 'Conf', score: checks.reduce((s, c) => s + c.confidence, 0) / Math.max(checks.length, 1) },
    ]
    return { teacher: t, logs, logRate, avgFidelity: avgFidelity.toFixed(1), adaptCount, lastMsg, status, miniChart }
  })

  const pendingCount = teacherData.filter(d => d.status.label !== 'On Track').length

  const handleMessage = (name: string) => {
    toast.success(`Opening coaching thread with ${name}…`)
    navigate('/coach/feedback')
  }

  const handleFlag = (id: string, name: string) => {
    const wasFlagged = flaggedTeachers.includes(id)
    toggleFlag(id)
    if (wasFlagged) toast.info(`Flag removed for ${name}.`)
    else toast.warning(`${name} flagged for follow-up.`)
  }

  const handleViewLogs = (name: string, logs: ImplementationLog[]) => {
    setLogsModal({ name, logs: logs.slice(0, 8) })
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
          {pendingCount} teacher{pendingCount > 1 ? 's' : ''} need support or are at risk — review below.
        </div>
      )}
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Teacher Caseload</h2>
        </div>
        {myTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400"><Users size={24} className="mb-2" /><p className="text-sm">No teachers assigned.</p></div>
        ) : (
          <div>
            {teacherData.map(d => (
              <div key={d.teacher.id}>
                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === d.teacher.id ? null : d.teacher.id)}>
                  {/* Mobile */}
                  <div className="flex items-center justify-between gap-3 mb-2 sm:hidden">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: flaggedTeachers.includes(d.teacher.id) ? '#EF4444' : roleColor }}>
                        {d.teacher.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.teacher.name}</p>
                        <p className="text-xs text-gray-400">{d.teacher.schoolId}</p>
                      </div>
                    </div>
                    <Badge color={d.status.color}>{d.status.label}</Badge>
                  </div>
                  <div className="flex gap-3 text-center sm:hidden">
                    <div className="flex-1"><p className="text-sm font-semibold text-gray-700">{d.logRate}%</p><p className="text-xs text-gray-400">Logs</p></div>
                    <div className="flex-1"><p className="text-sm font-semibold text-gray-700">{d.avgFidelity}</p><p className="text-xs text-gray-400">Fidelity</p></div>
                    <div className="flex-1"><p className="text-sm font-semibold text-gray-700">{d.adaptCount}</p><p className="text-xs text-gray-400">Adapt.</p></div>
                    <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleMessage(d.teacher.name)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 cursor-pointer"><MessageSquare size={14} /></button>
                      <button onClick={() => handleViewLogs(d.teacher.name, d.logs)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><Eye size={14} /></button>
                      <button onClick={() => setDetailTeacher(d.teacher)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer"><Info size={14} /></button>
                      <button onClick={() => handleFlag(d.teacher.id, d.teacher.name)} className={`p-1.5 rounded-lg cursor-pointer ${flaggedTeachers.includes(d.teacher.id) ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}`}><Flag size={14} /></button>
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: flaggedTeachers.includes(d.teacher.id) ? '#EF4444' : roleColor }}>
                      {d.teacher.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{d.teacher.name} {flaggedTeachers.includes(d.teacher.id) && <span className="text-xs text-red-500 ml-1">● Flagged</span>}</p>
                      <p className="text-xs text-gray-400">{d.teacher.schoolId}</p>
                    </div>
                    <div className="text-center w-16"><p className="text-sm font-semibold text-gray-700">{d.logRate}%</p><p className="text-xs text-gray-400">Log Rate</p></div>
                    <div className="text-center w-16"><p className="text-sm font-semibold text-gray-700">{d.avgFidelity}</p><p className="text-xs text-gray-400">Fidelity</p></div>
                    <div className="text-center w-20"><p className="text-sm font-semibold text-gray-700">{d.adaptCount}</p><p className="text-xs text-gray-400">Adaptations</p></div>
                    <div className="w-24 hidden lg:block">
                      <p className="text-xs text-gray-500">{d.lastMsg ? new Date(d.lastMsg.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'No contact'}</p>
                    </div>
                    <Badge color={d.status.color}>{d.status.label}</Badge>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleMessage(d.teacher.name)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" title="Message"><MessageSquare size={14} /></button>
                      <button onClick={() => handleViewLogs(d.teacher.name, d.logs)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer transition-colors" title="View Logs"><Eye size={14} /></button>
                      <button onClick={() => setDetailTeacher(d.teacher)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" title="Details"><Info size={14} /></button>
                      <button onClick={() => handleFlag(d.teacher.id, d.teacher.name)} className={`p-1.5 rounded-lg cursor-pointer transition-colors ${flaggedTeachers.includes(d.teacher.id) ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}`} title="Flag"><Flag size={14} /></button>
                    </div>
                  </div>
                </div>
                {expandedId === d.teacher.id && (
                  <div className="px-4 sm:px-5 py-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Avg Fidelity by Dimension</p>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={d.miniChart} barSize={18}>
                        <XAxis dataKey="dim" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} width={20} />
                        <Tooltip />
                        <Bar dataKey="score" fill={roleColor} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button size="sm" roleColor={roleColor} onClick={() => handleMessage(d.teacher.name)}><MessageSquare size={12}/>Message</Button>
                      <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => handleViewLogs(d.teacher.name, d.logs)}><Eye size={12}/>View Logs</Button>
                      <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => setDetailTeacher(d.teacher)}><Info size={12}/>Details</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {detailTeacher && (
        <TeacherDetailModal teacher={detailTeacher} onClose={() => setDetailTeacher(null)} />
      )}

      {logsModal && (
        <Modal open onClose={() => { setLogsModal(null); setSelectedLog(null) }}
          title={selectedLog ? `${logsModal.name} — Log Detail` : `${logsModal.name} — Recent Logs`} size="lg">
          {selectedLog ? (
            <LogDetailView
              log={selectedLog}
              adaptation={adaptations.find(a => a.logId === selectedLog.id)}
              fidelityCheck={fidelityChecks.find(f => f.logId === selectedLog.id)}
              onBack={() => setSelectedLog(null)}
            />
          ) : (
            <div className="space-y-2">
              {logsModal.logs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No logs found.</p>
              ) : logsModal.logs.map(log => (
                <button key={log.id} onClick={() => setSelectedLog(log)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-gray-700">{log.date}</p>
                      <Badge color={log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'}>
                        {log.lessonCompletion.replace('_', ' ')}
                      </Badge>
                      {log.adaptationOccurred && <Badge color="blue">Adaptation</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{log.instructionalRoutine} · {log.ebpComponent} · {log.durationMinutes}min</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
              <div className="pt-2">
                <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => { toast.info('Full log export coming soon.'); setLogsModal(null) }}>
                  Export Logs
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
