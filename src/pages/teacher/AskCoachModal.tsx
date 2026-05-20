import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import type { CoachingCycle, User } from '../../types'

const roleColor = roleColors.teacher

interface Props {
  cycle: CoachingCycle
  currentUser: User
  coachName: string
  onClose: () => void
}

export function AskCoachModal({ cycle, currentUser, coachName, onClose }: Props) {
  const { addFeedbackItem } = useAppStore()
  const [question, setQuestion] = useState('')

  const handleSubmit = () => {
    const trimmed = question.trim()
    if (!trimmed) return
    addFeedbackItem({
      id: `fq-${Date.now()}`,
      teacherId: currentUser.id,
      coachId: cycle.coachId,
      cycleId: cycle.id,
      teacherName: currentUser.name,
      initials: currentUser.initials,
      date: new Date().toISOString().split('T')[0],
      question: trimmed,
      reply: '',
      resolved: false,
    })
    toast.success(`Question sent to ${coachName}!`)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Ask Your Coach">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Your question will appear in <strong>{coachName}</strong>'s feedback queue and their reply will show up here in your coaching thread.
        </p>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Your Question</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={4}
            autoFocus
            placeholder="What's on your mind? Ask about implementation, fidelity, adaptations…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{question.trim().length} chars</p>
        </div>
        <div className="flex gap-2">
          <Button roleColor={roleColor} onClick={handleSubmit} disabled={!question.trim()}>
            <MessageSquare size={14} />Send Question
          </Button>
          <Button variant="ghost" roleColor={roleColor} onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
