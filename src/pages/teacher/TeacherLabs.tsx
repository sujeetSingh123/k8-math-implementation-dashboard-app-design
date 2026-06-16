import { CalendarDays, Clock, MapPin, CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StatCard } from '../../components/ui/StatCard'
import { toast } from '../../store/useToastStore'
import { roleColors, roleLabels } from '../../constants/roles'
import type { PDSession, Role } from '../../types'

const roleColor = roleColors.teacher

const typeBadge: Record<PDSession['type'], 'blue' | 'purple' | 'green'> = {
  training: 'blue', lab: 'purple', coaching: 'green',
}

const fmt = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

function SessionCard({ session }: { session: PDSession }) {
  const { currentUser, checkInSession } = useAppStore()
  const myCheckIn = session.checkIns.find(c => c.userId === currentUser.id)

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{session.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{session.facilitator}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Badge color={typeBadge[session.type]}>{session.type}</Badge>
          {myCheckIn?.approved && <Badge color="green"><CheckCircle size={10} />Attended</Badge>}
        </div>
      </div>
      {session.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{session.description}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><CalendarDays size={11} />{session.scheduledDate}</span>
        {session.startTime && <span className="flex items-center gap-1"><Clock size={11} />{fmt(session.startTime)} · {session.durationHours}h</span>}
        <span className="flex items-center gap-1"><MapPin size={11} />{session.location}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {session.targetAudience.map(r => (
          <span key={r} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${roleColors[r]}20`, color: roleColors[r] }}>
            {roleLabels[r as Role]}
          </span>
        ))}
      </div>
      {session.status === 'upcoming' && (
        <div className="pt-2 border-t border-gray-100">
          {!myCheckIn && (
            <Button size="sm" roleColor={roleColor}
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
  )
}

export function TeacherLabs() {
  const { currentUser, currentRole, pdSessions } = useAppStore()

  const myRole = currentRole as Role
  const relevantSessions = pdSessions.filter(s => s.targetAudience.includes(myRole))
  const upcoming = relevantSessions.filter(s => s.status === 'upcoming')
  const completed = relevantSessions.filter(s => s.status === 'completed')
  const attended = pdSessions.filter(s => s.checkIns.some(c => c.userId === currentUser.id && c.approved))
  const hoursLogged = attended.reduce((sum, s) => sum + s.durationHours, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Implementation Learning Laboratories</h1>
        <p className="text-xs text-gray-500 mt-0.5">View sessions for your role and check in to confirm attendance</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sessions Attended" value={attended.length} sub="Approved by researcher" icon={<CheckCircle size={18} />} iconColor={roleColor} />
        <StatCard label="Upcoming" value={upcoming.length} sub="For your role" icon={<CalendarDays size={18} />} iconColor={roleColor} />
        <StatCard label="Hours Logged" value={hoursLogged.toFixed(1)} sub="Confirmed PD hours" icon={<Clock size={18} />} iconColor={roleColor} />
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Past Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completed.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}
