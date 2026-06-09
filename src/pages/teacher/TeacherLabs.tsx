import { CalendarDays, Clock, MapPin, Users, CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/StatCard'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { trainingAttendances } from '../../data/mockData'
import type { PDSession } from '../../types'

const roleColor = roleColors.teacher

const typeBadge: Record<PDSession['type'], 'blue' | 'purple' | 'green'> = {
  training: 'blue', lab: 'purple', coaching: 'green',
}

function SessionCard({ session, attended }: { session: PDSession; attended: boolean }) {
  const pct = Math.round((session.enrolledCount / session.capacity) * 100)
  const spotsLeft = session.capacity - session.enrolledCount
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{session.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{session.facilitator}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Badge color={typeBadge[session.type]}>{session.type}</Badge>
          {attended && <Badge color="green"><CheckCircle size={10} />Attended</Badge>}
        </div>
      </div>
      {session.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{session.description}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><CalendarDays size={11} />{session.scheduledDate}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{session.durationHours}h</span>
        <span className="flex items-center gap-1"><Users size={11} />{session.targetAudience}</span>
        <span className="flex items-center gap-1"><MapPin size={11} />{session.location}</span>
      </div>
      {session.status === 'upcoming' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{session.enrolledCount}/{session.capacity} enrolled</span>
            <span>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: roleColor }} />
          </div>
          <button
            onClick={() => toast.success(`Interest registered for "${session.title}"`)}
            disabled={spotsLeft === 0}
            className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: `${roleColor}18`, color: roleColor }}
          >
            {spotsLeft === 0 ? 'Session Full' : 'Register Interest'}
          </button>
        </div>
      )}
    </Card>
  )
}

export function TeacherLabs() {
  const { currentUser, pdSessions } = useAppStore()

  const myAttendances = trainingAttendances.filter(a => a.teacherId === currentUser.id)
  const attendedTitles = new Set(myAttendances.filter(a => !!a.checkedOutAt).map(a => a.sessionTitle))

  const upcoming = pdSessions.filter(s => s.status === 'upcoming')
  const completed = pdSessions.filter(s => s.status === 'completed')
  const myCompleted = completed.filter(s => attendedTitles.has(s.title))

  const hoursLogged = myAttendances
    .filter(a => !!a.checkedOutAt)
    .reduce((sum, a) => {
      const session = pdSessions.find(s => s.title === a.sessionTitle)
      return sum + (session?.durationHours ?? 0)
    }, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Implementation Learning Laboratories</h1>
        <p className="text-xs text-gray-500 mt-0.5">View upcoming sessions and track your attendance</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sessions Attended" value={myCompleted.length} sub="This semester" icon={<CheckCircle size={18} />} iconColor={roleColor} />
        <StatCard label="Upcoming" value={upcoming.length} sub="Scheduled ahead" icon={<CalendarDays size={18} />} iconColor={roleColor} />
        <StatCard label="Hours Logged" value={hoursLogged.toFixed(1)} sub="Total PD hours" icon={<Clock size={18} />} iconColor={roleColor} />
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map(s => (
              <SessionCard key={s.id} session={s} attended={attendedTitles.has(s.title)} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Past Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completed.map(s => (
              <SessionCard key={s.id} session={s} attended={attendedTitles.has(s.title)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
