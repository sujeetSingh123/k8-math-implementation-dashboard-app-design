import { useState, useMemo } from 'react'
import { Users, ClipboardList, BarChart2, Activity, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LogDetailModal } from '../shared/LogDetailModal'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { User, ImplementationLog } from '../../types'

const roleColor = roleColors.researcher

type DataTab = 'logs' | 'fidelity' | 'student_data'

function code(s: string) {
  return (
    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 ml-1.5">
      {s}
    </span>
  )
}

function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { implementationLogs, fidelityChecks, studentDataRecords, users, schools } = useAppStore()
  const [tab, setTab] = useState<DataTab>('logs')
  const [logModal, setLogModal] = useState<ImplementationLog | null>(null)

  const school = schools.find(s => s.id === user.schoolId)
  const coach = user.coachId ? users.find(u => u.id === user.coachId) : null

  const logs = useMemo(
    () => implementationLogs.filter(l => l.teacherId === user.id).sort((a, b) => b.date.localeCompare(a.date)),
    [implementationLogs, user.id],
  )
  const checks = useMemo(
    () => fidelityChecks.filter(c => c.teacherId === user.id).sort((a, b) => b.date.localeCompare(a.date)),
    [fidelityChecks, user.id],
  )
  const records = useMemo(
    () => studentDataRecords.filter(r => r.teacherId === user.id).sort((a, b) => b.date.localeCompare(a.date)),
    [studentDataRecords, user.id],
  )

  const tabs: { key: DataTab; label: string; count: number }[] = [
    { key: 'logs', label: 'Logs', count: logs.length },
    { key: 'fidelity', label: 'Fidelity', count: checks.length },
    { key: 'student_data', label: 'Student Data', count: records.length },
  ]

  return (
    <>
      <Modal open onClose={onClose} title={user.name} size="lg">
        <div className="space-y-4">
          {/* Identity */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="bg-gray-50 rounded-lg px-3 py-1.5">
              ID {code(user.id)}
            </span>
            <span className="bg-gray-50 rounded-lg px-3 py-1.5">
              School {code(user.schoolId)} <span className="ml-1 text-gray-400">{school?.name}</span>
            </span>
            {coach && (
              <span className="bg-gray-50 rounded-lg px-3 py-1.5">
                Coach {code(coach.id)} <span className="ml-1 text-gray-400">{coach.name}</span>
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  tab === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={tab === t.key ? { backgroundColor: roleColor } : {}}
              >
                {t.label}
                <span className={`text-[10px] font-bold px-1 rounded ${tab === t.key ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Logs */}
          {tab === 'logs' && (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {logs.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No logs yet.</p>}
              {logs.map(l => (
                <button key={l.id} onClick={() => setLogModal(l)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors text-left">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800">{l.date} · {l.instructionalRoutine}</p>
                    <p className="text-xs text-gray-400">{l.implementationStrategy} · {l.durationMinutes} min</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge color="blue">{l.tier}</Badge>
                    <Badge color={l.lessonCompletion === 'fully' ? 'green' : l.lessonCompletion === 'partially' ? 'amber' : 'red'}>
                      {l.lessonCompletion.replace('_', ' ')}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Fidelity */}
          {tab === 'fidelity' && (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {checks.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No fidelity checks yet.</p>}
              {checks.map(c => {
                const composite = +((c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5).toFixed(2)
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-800">{c.date}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>Adh {c.adherence}</span>
                      <span>Dos {c.dosage}</span>
                      <span>Qual {c.quality}</span>
                      <span>Resp {c.responsiveness}</span>
                      <span>Conf {c.confidence}</span>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: composite >= 4 ? '#10B981' : composite >= 3 ? '#F59E0B' : '#EF4444' }}>
                      {composite}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Student Data */}
          {tab === 'student_data' && (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {records.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No student data yet.</p>}
              {records.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{r.measureType}</p>
                    <p className="text-xs text-gray-400">{r.date} · Wk {r.week} · {r.mtssTier}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                    {r.baselineAvg != null && <span className="text-gray-400">Base {r.baselineAvg}%</span>}
                    <span className="font-bold text-gray-800">{r.currentAvg}%</span>
                    {r.growth != null && (
                      <span className={r.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {r.growth >= 0 ? '+' : ''}{r.growth}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      {logModal && <LogDetailModal log={logModal} onClose={() => setLogModal(null)} />}
    </>
  )
}

export function DataBrowser() {
  const { schools, users, implementationLogs, studentDataRecords, fidelityChecks } = useAppStore()
  const navigate = useNavigate()
  const [selectedSchool, setSelectedSchool] = useState(schools[0]?.id ?? '')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const schoolTeachers = useMemo(
    () => users.filter(u => u.schoolId === selectedSchool && u.role === 'teacher'),
    [users, selectedSchool],
  )
  const schoolCoaches = useMemo(
    () => users.filter(u => u.schoolId === selectedSchool && u.role === 'coach'),
    [users, selectedSchool],
  )

  const stats = (u: User) => ({
    logs: implementationLogs.filter(l => l.teacherId === u.id).length,
    checks: fidelityChecks.filter(c => c.teacherId === u.id).length,
    records: studentDataRecords.filter(r => r.teacherId === u.id).length,
  })

  function UserRow({ user }: { user: User }) {
    const s = stats(user)
    const coach = user.coachId ? users.find(u => u.id === user.coachId) : null
    const handleClick = () => user.role === 'teacher'
      ? navigate(`/researcher/teacher/${user.id}`)
      : setSelectedUser(user)
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left border-b border-gray-50 last:border-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: user.role === 'teacher' ? roleColors.teacher : roleColors.coach }}>
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">{user.name} {code(user.id)}</p>
            {coach && <p className="text-xs text-gray-400">Coach: {coach.name} {code(coach.id)}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
          <span><ClipboardList size={11} className="inline mr-0.5" />{s.logs}</span>
          <span><Activity size={11} className="inline mr-0.5" />{s.checks}</span>
          <span><BarChart2 size={11} className="inline mr-0.5" />{s.records}</span>
          <ChevronRight size={14} className="text-gray-300" />
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Users size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Data Browser</h2>
          <p className="text-sm text-gray-500">Browse all identifiable data by school, teacher, and coach</p>
        </div>
      </div>

      {/* School selector */}
      <div className="flex gap-2 flex-wrap">
        {schools.map(s => (
          <button key={s.id} onClick={() => setSelectedSchool(s.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              selectedSchool === s.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={selectedSchool === s.id ? { backgroundColor: roleColor } : {}}>
            {s.name} {code(s.id)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Teachers */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} style={{ color: roleColors.teacher }} />
            <span className="text-sm font-semibold text-gray-800">Teachers</span>
            <span className="text-xs text-gray-400 ml-auto">{schoolTeachers.length} staff</span>
          </div>
          {schoolTeachers.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">No teachers in this school.</p>
            : schoolTeachers.map(u => <UserRow key={u.id} user={u} />)
          }
        </Card>

        {/* Coaches */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} style={{ color: roleColors.coach }} />
            <span className="text-sm font-semibold text-gray-800">Coaches</span>
            <span className="text-xs text-gray-400 ml-auto">{schoolCoaches.length} staff</span>
          </div>
          {schoolCoaches.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">No coaches in this school.</p>
            : schoolCoaches.map(u => <UserRow key={u.id} user={u} />)
          }
        </Card>
      </div>

      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  )
}
