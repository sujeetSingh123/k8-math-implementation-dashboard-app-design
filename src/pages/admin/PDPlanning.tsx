import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarDays, Users, Clock, Plus, MapPin } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import type { PDSession } from '../../types'

const roleColor = roleColors.admin

const typeBadge: Record<PDSession['type'], 'blue' | 'purple' | 'green'> = {
  training: 'blue', coaching: 'purple', lab: 'green',
}

type FormData = {
  title: string
  type: PDSession['type']
  scheduledDate: string
  durationHours: number
  targetAudience: string
  facilitator: string
  location: string
  capacity: number
}

function SessionCard({ session }: { session: PDSession }) {
  const pct = Math.round((session.enrolledCount / session.capacity) * 100)
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{session.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{session.facilitator}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color={typeBadge[session.type]}>{session.type}</Badge>
          <Badge color={session.status === 'upcoming' ? 'blue' : session.status === 'completed' ? 'green' : 'red'}>
            {session.status}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><CalendarDays size={11} />{session.scheduledDate}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{session.durationHours}h</span>
        <span className="flex items-center gap-1"><Users size={11} />{session.targetAudience}</span>
        <span className="flex items-center gap-1"><MapPin size={11} />{session.location}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Enrolled</span>
          <span>{session.enrolledCount}/{session.capacity}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? '#EF4444' : roleColor }} />
        </div>
      </div>
    </Card>
  )
}

function AddSessionModal({ onClose }: { onClose: () => void }) {
  const { addPDSession } = useAppStore()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: 'training', durationHours: 2, capacity: 20 },
  })

  const onSubmit = (data: FormData) => {
    const session: PDSession = {
      id: `pd-new-${Date.now()}`,
      title: data.title,
      type: data.type,
      scheduledDate: data.scheduledDate,
      durationHours: Number(data.durationHours),
      targetAudience: data.targetAudience,
      facilitator: data.facilitator,
      location: data.location,
      enrolledCount: 0,
      capacity: Number(data.capacity),
      status: 'upcoming',
    }
    addPDSession(session)
    toast.success('Session scheduled!')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Schedule Session" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Session Title</label>
          <input {...register('title', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="e.g. CRA Lab: Representational Phase" />
          {errors.title && <p className="text-xs text-red-500 mt-1">Title is required.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
            <select {...register('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
              <option value="training">Training</option>
              <option value="lab">Lab</option>
              <option value="coaching">Coaching</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
            <input type="date" {...register('scheduledDate', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Duration (hours)</label>
            <input type="number" step={0.5} min={0.5} {...register('durationHours', { required: true, min: 0.5 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Capacity</label>
            <input type="number" min={1} {...register('capacity', { required: true, min: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Target Audience</label>
            <input {...register('targetAudience', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="All Teachers, Coaches" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Facilitator</label>
            <input {...register('facilitator', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="e.g. Maria Chen" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
          <input {...register('location', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="e.g. Lincoln Elementary — Room 12" />
        </div>
        <div className="flex gap-2 pt-1">
          <Button roleColor={roleColor} type="submit"><Plus size={14} />Schedule Session</Button>
          <Button variant="ghost" roleColor={roleColor} onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export function PDPlanning() {
  const { pdSessions, currentRole } = useAppStore()
  const [addOpen, setAddOpen] = useState(false)

  const upcoming = pdSessions.filter(s => s.status === 'upcoming')
  const completed = pdSessions.filter(s => s.status === 'completed')

  const totalHours = pdSessions.reduce((sum, s) => sum + s.durationHours, 0)
  const completedWithEnroll = completed.filter(s => s.capacity > 0)
  const avgAttendance = completedWithEnroll.length > 0
    ? Math.round(completedWithEnroll.reduce((sum, s) => sum + (s.enrolledCount / s.capacity) * 100, 0) / completedWithEnroll.length)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Implementation Learning Laboratories</h1>
          <p className="text-xs text-gray-500 mt-0.5">Schedule and manage training sessions and meeting laboratories</p>
        </div>
        {currentRole === 'researcher' && (
          <Button roleColor={roleColor} size="sm" onClick={() => setAddOpen(true)}><Plus size={14} />Add Session</Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Upcoming Sessions" value={upcoming.length} sub="Scheduled ahead" icon={<CalendarDays size={18} />} iconColor={roleColor} />
        <StatCard label="Total Hours Planned" value={totalHours.toFixed(1)} sub="Across all sessions" icon={<Clock size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Attendance Rate" value={`${avgAttendance}%`} sub="Completed sessions" icon={<Users size={18} />} iconColor={roleColor} />
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
