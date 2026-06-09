import { useState } from 'react'
import { CalendarDays, Trash2, LogIn, CheckCircle2, AlertCircle, Clock, CalendarPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { PlanForm } from './PlanForm'
import type { LessonPlan } from '../../types'

const roleColor = roleColors.teacher
const today = new Date().toISOString().split('T')[0]

function effectiveStatus(plan: LessonPlan): LessonPlan['status'] {
  if (plan.status !== 'upcoming') return plan.status
  return plan.plannedDate < today ? 'missed' : 'upcoming'
}

function statusColor(s: LessonPlan['status']): 'blue' | 'green' | 'amber' {
  return s === 'upcoming' ? 'blue' : s === 'logged' ? 'green' : 'amber'
}

function StatusIcon({ status }: { status: LessonPlan['status'] }) {
  if (status === 'logged') return <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
  if (status === 'missed') return <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
  return <Clock size={12} className="text-blue-500 flex-shrink-0" />
}

type PlanCardProps = {
  plan: LessonPlan
  onLogThis: (plan: LessonPlan) => void
  onDelete: (id: string) => void
}

function PlanCard({ plan, onLogThis, onDelete }: PlanCardProps) {
  const status = effectiveStatus(plan)
  return (
    <Card>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusIcon status={status} />
          <span className="text-sm font-semibold text-gray-800">{plan.plannedDate}</span>
          {plan.plannedTime && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{plan.plannedTime}</span>
          )}
          <Badge color={statusColor(status)}>{status}</Badge>
          <Badge color="blue">{plan.tier}</Badge>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {status === 'upcoming' && (
            <Button size="sm" roleColor={roleColor} onClick={() => onLogThis(plan)}>
              <LogIn size={12} />Log This
            </Button>
          )}
          <button onClick={() => onDelete(plan.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {plan.instructionalRoutine} · {plan.ebpComponent.join(', ')} · {plan.implementationStrategy} · {plan.plannedDurationMinutes} min
      </p>
      {plan.goal && <p className="text-xs text-gray-400 italic mt-1">"{plan.goal}"</p>}
    </Card>
  )
}

type PlanningSessionProps = { onSwitchToLog?: () => void }

export function PlanningSession({ onSwitchToLog }: PlanningSessionProps = {}) {
  const { currentUser, lessonPlans, addLessonPlan, deleteLessonPlan, setPendingPlan } = useAppStore()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  const myPlans = lessonPlans
    .filter(p => p.teacherId === currentUser.id)
    .sort((a, b) => b.plannedDate.localeCompare(a.plannedDate))

  const upcoming = myPlans.filter(p => effectiveStatus(p) === 'upcoming')
  const past = myPlans.filter(p => effectiveStatus(p) !== 'upcoming')

  const handleLogThis = (plan: LessonPlan) => {
    setPendingPlan(plan)
    if (onSwitchToLog) {
      toast.success('Log pre-filled from your plan.')
      onSwitchToLog()
    } else {
      navigate('/teacher/log')
      toast.success('Daily Log pre-filled from your plan.')
    }
  }

  const handleDelete = (id: string) => {
    deleteLessonPlan(id)
    toast.info('Plan removed.')
  }

  const handleSave = (planData: Omit<LessonPlan, 'id' | 'status' | 'createdAt'>) => {
    addLessonPlan({ ...planData, id: `plan-${Date.now()}`, status: 'upcoming', createdAt: new Date().toISOString() })
    setShowForm(false)
    toast.success('Plan saved!')
  }

  return (
    <div className="w-full max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Pre-Planning Sessions</h2>
          <p className="text-xs text-gray-400 mt-0.5">Plan what you'll teach — pre-fills your Daily Log when it's time.</p>
        </div>
        <Button roleColor={roleColor} size="sm" onClick={() => setShowForm(true)}>
          <CalendarPlus size={14} />New Plan
        </Button>
      </div>

      {myPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <CalendarDays size={28} className="mb-2" />
          <p className="text-sm">No plans yet. Create one to get started.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Upcoming ({upcoming.length})
              </p>
              {upcoming.map(p => (
                <PlanCard key={p.id} plan={p} onLogThis={handleLogThis} onDelete={handleDelete} />
              ))}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Past ({past.length})
              </p>
              {past.map(p => (
                <PlanCard key={p.id} plan={p} onLogThis={handleLogThis} onDelete={handleDelete} />
              ))}
            </section>
          )}
        </>
      )}

      {showForm && (
        <Modal open onClose={() => setShowForm(false)} title="Plan a Session" size="lg">
          <PlanForm
            teacherId={currentUser.id}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  )
}
