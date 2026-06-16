import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarDays, Clock, Plus, MapPin, CheckCircle, XCircle, Users } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors, roleLabels } from '../../constants/roles'
import type { PDSession, Role } from '../../types'

const roleColor = roleColors.admin

const typeBadge: Record<PDSession['type'], 'blue' | 'purple' | 'green'> = {
  training: 'blue', coaching: 'purple', lab: 'green',
}

const AUDIENCE_ROLES: { role: Role; label: string }[] = [
  { role: 'teacher', label: 'Teacher' },
  { role: 'paraprofessional', label: 'Paraprofessional' },
  { role: 'coach', label: 'Coach' },
  { role: 'admin', label: 'Principal of School' },
  { role: 'district_admin', label: 'Superintendent' },
]

type FormData = {
  title: string
  type: PDSession['type']
  scheduledDate: string
  startTime: string
  durationHours: number
  facilitator: string
  location: string
}

function AttendanceModal({ session, onClose }: { session: PDSession; onClose: () => void }) {
  const { users, approveCheckIn } = useAppStore()
  const targetUsers = users.filter(u => session.targetAudience.includes(u.role))
  const pending = session.checkIns.filter(c => !c.approved)
  const approved = session.checkIns.filter(c => c.approved)
  const notCheckedIn = targetUsers.filter(u => !session.checkIns.some(c => c.userId === u.id))

  const userName = (id: string) => users.find(u => u.id === id)?.name ?? id
  const userRole = (id: string) => users.find(u => u.id === id)?.role

  return (
    <Modal open onClose={onClose} title={`Attendance — ${session.title}`} size="lg">
      <div className="space-y-5">
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Pending Approval ({pending.length})</p>
            <div className="space-y-1.5">
              {pending.map(c => (
                <div key={c.userId} className="flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{userName(c.userId)}</p>
                    <p className="text-xs text-gray-400">{userRole(c.userId) ? roleLabels[userRole(c.userId)!] : ''} · checked in {new Date(c.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => approveCheckIn(session.id, c.userId, true)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 cursor-pointer transition-colors">
                      <CheckCircle size={11} />Approve
                    </button>
                    <button onClick={() => approveCheckIn(session.id, c.userId, false)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 cursor-pointer transition-colors">
                      <XCircle size={11} />Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approved.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Attended ({approved.length})</p>
            <div className="space-y-1">
              {approved.map(c => (
                <div key={c.userId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
                  <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{userName(c.userId)}</span>
                  <span className="text-xs text-gray-400 ml-auto">{userRole(c.userId) ? roleLabels[userRole(c.userId)!] : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {notCheckedIn.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Did Not Attend ({notCheckedIn.length})</p>
            <div className="space-y-1">
              {notCheckedIn.map(u => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
                  <XCircle size={13} className="text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{u.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{roleLabels[u.role]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && approved.length === 0 && notCheckedIn.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No users in this audience yet.</p>
        )}
      </div>
    </Modal>
  )
}

function AddSessionModal({ onClose }: { onClose: () => void }) {
  const { addPDSession } = useAppStore()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: 'training', durationHours: 2 },
  })
  const [targetRoles, setTargetRoles] = useState<Role[]>([])
  const [rolesError, setRolesError] = useState(false)

  const toggleRole = (role: Role) =>
    setTargetRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])

  const onSubmit = (data: FormData) => {
    if (targetRoles.length === 0) { setRolesError(true); return }
    const session: PDSession = {
      id: `pd-${Date.now()}`,
      title: data.title, type: data.type,
      scheduledDate: data.scheduledDate, startTime: data.startTime,
      durationHours: Number(data.durationHours),
      targetAudience: targetRoles,
      facilitator: data.facilitator, location: data.location,
      status: 'upcoming', checkIns: [],
    }
    addPDSession(session)
    toast.success('Session scheduled!')
    onClose()
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300'
  const labelCls = 'text-xs font-medium text-gray-600 block mb-1'

  return (
    <Modal open onClose={onClose} title="Schedule Session" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Session Title</label>
          <input {...register('title', { required: true })} className={inputCls} placeholder="e.g. CRA Lab: Representational Phase" />
          {errors.title && <p className="text-xs text-red-500 mt-1">Title is required.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Type</label>
            <select {...register('type')} className={inputCls}>
              <option value="training">Training</option>
              <option value="lab">Lab</option>
              <option value="coaching">Coaching</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Facilitator</label>
            <input {...register('facilitator', { required: true })} className={inputCls} placeholder="e.g. Rachel Stone" />
            {errors.facilitator && <p className="text-xs text-red-500 mt-1">Required.</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" {...register('scheduledDate', { required: true })} className={inputCls} />
            {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">Required.</p>}
          </div>
          <div>
            <label className={labelCls}>Start Time</label>
            <input type="time" {...register('startTime', { required: true })} className={inputCls} />
            {errors.startTime && <p className="text-xs text-red-500 mt-1">Required.</p>}
          </div>
          <div>
            <label className={labelCls}>Duration (hours)</label>
            <input type="number" step={0.5} min={0.5} {...register('durationHours', { required: true })} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input {...register('location', { required: true })} className={inputCls} placeholder="e.g. Lincoln Elementary — Room 12" />
          {errors.location && <p className="text-xs text-red-500 mt-1">Required.</p>}
        </div>
        <div>
          <label className={labelCls}>Target Audience</label>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
            {AUDIENCE_ROLES.map(({ role, label }) => (
              <label key={role} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={targetRoles.includes(role)} onChange={() => { toggleRole(role); setRolesError(false) }}
                  className="accent-amber-500" />
                {label}
              </label>
            ))}
          </div>
          {rolesError && <p className="text-xs text-red-500 mt-1">Select at least one role.</p>}
        </div>
        <div className="flex gap-2 pt-1">
          <Button roleColor={roleColor} type="submit"><Plus size={14} />Schedule Session</Button>
          <Button variant="ghost" roleColor={roleColor} onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

function SessionCard({ session }: { session: PDSession }) {
  const { currentUser, currentRole, checkInSession } = useAppStore()
  const [attendanceOpen, setAttendanceOpen] = useState(false)
  const isResearcher = currentRole === 'researcher'
  const isTargeted = session.targetAudience.includes(currentRole as Role)
  const myCheckIn = session.checkIns.find(c => c.userId === currentUser.id)
  const pendingCount = session.checkIns.filter(c => !c.approved).length
  const approvedCount = session.checkIns.filter(c => c.approved).length

  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  }

  return (
    <>
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-snug">{session.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{session.facilitator}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            <Badge color={typeBadge[session.type]}>{session.type}</Badge>
            <Badge color={session.status === 'upcoming' ? 'blue' : session.status === 'completed' ? 'green' : 'red'}>
              {session.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><CalendarDays size={11} />{session.scheduledDate}</span>
          {session.startTime && <span className="flex items-center gap-1"><Clock size={11} />{fmt(session.startTime)} · {session.durationHours}h</span>}
          <span className="flex items-center gap-1"><MapPin size={11} />{session.location}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {session.targetAudience.map(r => (
            <span key={r} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${roleColors[r]}20`, color: roleColors[r] }}>
              {roleLabels[r]}
            </span>
          ))}
        </div>

        {isResearcher && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {approvedCount} confirmed · {pendingCount} pending
            </span>
            <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => setAttendanceOpen(true)}>
              <Users size={12} />Attendance
            </Button>
          </div>
        )}

        {!isResearcher && isTargeted && session.status === 'upcoming' && (
          <div className="pt-2 border-t border-gray-100">
            {!myCheckIn && (
              <Button size="sm" roleColor={roleColors[currentRole as Role] ?? roleColor}
                onClick={() => { checkInSession(session.id, currentUser.id); toast.success('Checked in! Awaiting researcher approval.') }}>
                <CheckCircle size={12} />Check In
              </Button>
            )}
            {myCheckIn && !myCheckIn.approved && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <CheckCircle size={12} />Checked in — awaiting approval
              </span>
            )}
            {myCheckIn?.approved && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle size={12} />Attendance confirmed
              </span>
            )}
          </div>
        )}
      </Card>
      {attendanceOpen && <AttendanceModal session={session} onClose={() => setAttendanceOpen(false)} />}
    </>
  )
}

export function PDPlanning() {
  const { pdSessions, currentRole } = useAppStore()
  const [addOpen, setAddOpen] = useState(false)

  const upcoming = pdSessions.filter(s => s.status === 'upcoming')
  const completed = pdSessions.filter(s => s.status === 'completed')
  const totalHours = pdSessions.reduce((sum, s) => sum + s.durationHours, 0)
  const confirmedTotal = pdSessions.reduce((sum, s) => sum + s.checkIns.filter(c => c.approved).length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Implementation Learning Laboratories</h1>
          <p className="text-xs text-gray-500 mt-0.5">Schedule and manage training sessions and learning laboratories</p>
        </div>
        {currentRole === 'researcher' && (
          <Button roleColor={roleColor} size="sm" onClick={() => setAddOpen(true)}><Plus size={14} />Add Session</Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Upcoming Sessions" value={upcoming.length} sub="Scheduled ahead" icon={<CalendarDays size={18} />} iconColor={roleColor} />
        <StatCard label="Total Hours Planned" value={totalHours.toFixed(1)} sub="Across all sessions" icon={<Clock size={18} />} iconColor={roleColor} />
        <StatCard label="Confirmed Attendances" value={confirmedTotal} sub="Researcher approved" icon={<Users size={18} />} iconColor={roleColor} />
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Completed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completed.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      )}

      {addOpen && <AddSessionModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
