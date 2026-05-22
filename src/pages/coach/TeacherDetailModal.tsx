import { CheckCircle, Circle, AlertCircle, Paperclip } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import type { User } from '../../types'

type Props = { teacher: User; onClose: () => void }

export function TeacherDetailModal({ teacher, onClose }: Props) {
  const { coachingCycles, feedbackItems } = useAppStore()
  const cycle = coachingCycles.find(c => c.teacherId === teacher.id)
  const feedback = feedbackItems.filter(f => f.teacherId === teacher.id)

  return (
    <Modal open onClose={onClose} title={`${teacher.name} — Details`} size="lg">
      {!cycle ? (
        <p className="text-sm text-gray-400 text-center py-8">No active coaching cycle.</p>
      ) : (
        <div className="space-y-5">
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-500 font-medium mb-0.5">Coaching Goal</p>
            <p className="text-sm text-blue-900">{cycle.goal}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Action Items</p>
            {cycle.actions.length === 0 ? (
              <p className="text-xs text-gray-400">No action items yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {cycle.actions.map(action => {
                  const overdue = !action.completedAt && new Date(action.dueDate) < new Date()
                  return (
                    <li key={action.id} className="flex items-start gap-2.5">
                      {action.completedAt
                        ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        : overdue
                          ? <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          : <Circle size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-sm ${action.completedAt ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {action.description}
                        </p>
                        <p className={`text-xs mt-0.5 ${overdue && !action.completedAt ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                          {overdue && !action.completedAt ? 'Overdue · ' : 'Due '}{action.dueDate}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Coaching Thread</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cycle.messages.length === 0 ? (
                <p className="text-xs text-gray-400">No messages yet.</p>
              ) : cycle.messages.map(msg => {
                const sender = users.find(u => u.id === msg.senderId)
                const isTeacher = msg.senderId === teacher.id
                return (
                  <div key={msg.id} className={`flex gap-2 ${isTeacher ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: sender ? roleColors[sender.role] : '#9CA3AF' }}>
                      {sender?.initials ?? '?'}
                    </div>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${isTeacher ? 'text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}
                      style={isTeacher ? { backgroundColor: roleColors.teacher } : {}}>
                      {msg.body}
                      {msg.attachmentName && (
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                          <Paperclip size={10} />{msg.attachmentName}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {feedback.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Questions Asked</p>
              <div className="space-y-2">
                {feedback.map(f => (
                  <div key={f.id} className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">{f.date}</span>
                      <Badge color={f.resolved ? 'green' : 'amber'}>{f.resolved ? 'Resolved' : 'Pending'}</Badge>
                    </div>
                    <p className="text-gray-700 font-medium">Q: {f.question}</p>
                    {f.reply && <p className="text-gray-500">A: {f.reply}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
