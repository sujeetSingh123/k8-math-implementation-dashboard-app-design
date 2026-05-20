import { GraduationCap, Clock, Calendar, ChevronRight, BookOpen, LogIn, LogOut, MapPin, User } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { useState } from 'react'
import { roleColors } from '../../constants/roles'
import type { TrainingSession, TrainingAttendance } from '../../types'

const roleColor = roleColors.teacher

const typeBadgeColors: Record<string, 'blue' | 'purple' | 'green'> = {
  training: 'blue', coaching: 'purple', lab: 'green',
}


function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function hoursLogged(checkedInAt: string, checkedOutAt?: string): string {
  if (!checkedOutAt) return 'In progress'
  const mins = Math.round((new Date(checkedOutAt).getTime() - new Date(checkedInAt).getTime()) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function TrainingHistory() {
  const { currentUser, pdSessions, trainingAttendances, checkInTraining, checkOutTraining } = useAppStore()
  const [selected, setSelected] = useState<TrainingSession | null>(null)

  const myAttendances = trainingAttendances.filter(a => a.teacherId === currentUser.id)
  const activeCheckIn = myAttendances.find(a => !a.checkedOutAt)

  const sessions: TrainingSession[] = pdSessions.map(pd => ({
    id: pd.id,
    title: pd.title,
    type: pd.type,
    date: pd.scheduledDate,
    durationHours: pd.durationHours,
    attended: pd.status === 'completed' && myAttendances.some(a => a.sessionTitle === pd.title && !!a.checkedOutAt),
    description: pd.description,
    facilitator: pd.facilitator,
    location: pd.location,
  }))

  const attended = sessions.filter(s => s.attended)
  const hoursTotal = attended.reduce((sum, s) => sum + s.durationHours, 0)
  const nextSession = sessions.filter(s => new Date(s.date) > new Date()).sort((a, b) => a.date.localeCompare(b.date))[0]
  const upcomingSessions = sessions.filter(s => new Date(s.date) >= new Date())

  const handleCheckIn = (session: TrainingSession) => {
    const entry: TrainingAttendance = {
      id: `ta-${Date.now()}`,
      teacherId: currentUser.id,
      sessionTitle: session.title,
      type: session.type,
      checkedInAt: new Date().toISOString(),
    }
    checkInTraining(entry)
    toast.success(`Checked in to "${session.title}"`)
  }

  const handleCheckOut = (id: string) => {
    checkOutTraining(id)
    toast.success('Checked out. Time logged!')
  }

  const columns = [
    { key: 'date', header: 'Date', className: 'whitespace-nowrap' },
    { key: 'title', header: 'Session Name' },
    { key: 'type', header: 'Type', className: 'hidden sm:table-cell',
      render: (row: TrainingSession) => <Badge color={typeBadgeColors[row.type] ?? 'gray'}>{row.type}</Badge> },
    { key: 'durationHours', header: 'Duration', className: 'hidden md:table-cell',
      render: (row: TrainingSession) => `${row.durationHours}h` },
    { key: 'attended', header: 'Status',
      render: (row: TrainingSession) => <Badge color={row.attended ? 'green' : 'red'}>{row.attended ? 'Attended' : 'Missed'}</Badge> },
    { key: 'action', header: '',
      render: (row: TrainingSession) => (
        <button onClick={e => { e.stopPropagation(); setSelected(row) }} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer flex items-center gap-0.5">
          Details<ChevronRight size={11} />
        </button>
      )},
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => toast.info('Attendance tracked across all PD sessions this year.')}>
          <StatCard label="Sessions Attended" value={`${attended.length}/${sessions.length}`}
            sub={`${Math.round((attended.length / Math.max(sessions.length, 1)) * 100)}% attendance rate`}
            icon={<GraduationCap size={18} />} iconColor={roleColor} />
        </div>
        <div onClick={() => toast.info(`${hoursTotal} hours of professional development logged.`)}>
          <StatCard label="Hours Logged" value={hoursTotal.toFixed(1)} sub="Professional development hours" icon={<Clock size={18} />} iconColor={roleColor} />
        </div>
        <div onClick={() => nextSession && setSelected(nextSession)}>
          <StatCard label="Next Session"
            value={nextSession ? new Date(nextSession.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'None'}
            sub={nextSession?.title ?? 'No upcoming sessions'}
            icon={<Calendar size={18} />} iconColor={roleColor} />
        </div>
      </div>

      {/* Check-In Section */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Check In / Check Out</h2>
        {activeCheckIn ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-emerald-800">{activeCheckIn.sessionTitle}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Checked in at {formatTime(activeCheckIn.checkedInAt)}</p>
            </div>
            <Button size="sm" roleColor={roleColor} onClick={() => handleCheckOut(activeCheckIn.id)}>
              <LogOut size={13} />Check Out
            </Button>
          </div>
        ) : upcomingSessions.length > 0 ? (
          <div className="space-y-2">
            {upcomingSessions.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.date} · {s.durationHours}h · <Badge color={typeBadgeColors[s.type] ?? 'gray'}>{s.type}</Badge></p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(s)} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer">
                    View Details
                  </button>
                  <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => handleCheckIn(s)}>
                    <LogIn size={13} />Check In
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No upcoming sessions to check in to.</p>
        )}
      </Card>

      {/* Recent Attendance */}
      {myAttendances.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Recent Attendance</h2>
          <div className="space-y-2">
            {myAttendances.slice().reverse().slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-800 text-xs">{a.sessionTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(a.checkedInAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {formatTime(a.checkedInAt)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.checkedOutAt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {hoursLogged(a.checkedInAt, a.checkedOutAt)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Training Sessions</h2>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => toast.info('Training calendar sync coming soon.')}>
            <Calendar size={13} />Sync Calendar
          </Button>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={sessions as unknown as Record<string, unknown>[]}
          emptyMessage="No training sessions found."
          emptyIcon={<GraduationCap size={24} />}
          onRowClick={(row) => setSelected(row as unknown as TrainingSession)}
        />
      </Card>

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.title}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color={typeBadgeColors[selected.type] ?? 'gray'}>{selected.type}</Badge>
              {new Date(selected.date) > new Date()
                ? <Badge color="blue">Upcoming</Badge>
                : <Badge color={selected.attended ? 'green' : 'red'}>{selected.attended ? 'Attended' : 'Missed'}</Badge>
              }
              <span className="text-xs text-gray-400">{selected.date} · {selected.durationHours}h</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selected.description ?? 'Session details not available.'}
                </p>
              </div>
              {(selected.facilitator || selected.location) && (
                <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-200">
                  {selected.facilitator && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><User size={12} />{selected.facilitator}</span>
                  )}
                  {selected.location && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={12} />{selected.location}</span>
                  )}
                </div>
              )}
            </div>
            {new Date(selected.date) <= new Date() && !selected.attended && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium">You missed this session. Contact your coach to schedule a make-up.</p>
              </div>
            )}
            <div className="flex gap-2">
              {selected.attended ? (
                <Button roleColor={roleColor} onClick={() => { toast.success('Certificate downloaded!'); setSelected(null) }}>
                  <GraduationCap size={14} />Download Certificate
                </Button>
              ) : new Date(selected.date) <= new Date() ? (
                <Button roleColor={roleColor} onClick={() => { toast.info('Make-up request sent to your coach.'); setSelected(null) }}>
                  Request Make-Up
                </Button>
              ) : null}
              <Button variant="ghost" roleColor={roleColor} onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
