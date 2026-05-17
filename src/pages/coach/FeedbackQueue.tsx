import { useState } from 'react'
import { ChevronDown, ChevronUp, Send, Inbox, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'

const roleColor = '#3B82F6'

type FeedbackItem = {
  id: string
  teacherName: string
  initials: string
  date: string
  question: string
  reply: string
  resolved: boolean
}

const initialItems: FeedbackItem[] = [
  { id: 'fq1', teacherName: 'Jane Smith', initials: 'JS', date: '2026-05-15', question: 'How should I handle students who skip the representational phase during CRA? They jump straight to the abstract and I\'m not sure how to redirect without losing momentum.', reply: '', resolved: false },
  { id: 'fq2', teacherName: 'Kevin Johnson', initials: 'KJ', date: '2026-05-14', question: 'My lesson ran 10 minutes over today — should I log it as partially completed or fully completed? The content was all covered just not in the time I planned.', reply: '', resolved: false },
  { id: 'fq3', teacherName: 'Mira Park', initials: 'MP', date: '2026-05-13', question: 'Can I count co-teaching sessions with the special ed teacher as a Tier 2 intervention? We\'re working with the same 5 students every day.', reply: '', resolved: false },
]

export function FeedbackQueue() {
  const [items, setItems] = useState<FeedbackItem[]>(initialItems)
  const [showResolved, setShowResolved] = useState(false)
  const [actionPlanModal, setActionPlanModal] = useState<FeedbackItem | null>(null)
  const [actionText, setActionText] = useState('')

  const pending = items.filter(i => !i.resolved)
  const resolved = items.filter(i => i.resolved)

  const updateReply = (id: string, reply: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, reply } : i))

  const sendFeedback = (item: FeedbackItem) => {
    if (!item.reply.trim()) { toast.warning('Write a reply before sending.'); return }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, resolved: true } : i))
    toast.success(`Feedback sent to ${item.teacherName}!`)
  }

  const addToActionPlan = (item: FeedbackItem) => {
    setActionPlanModal(item)
    setActionText(`Follow up with ${item.teacherName}: "${item.question.slice(0, 60)}…"`)
  }

  const confirmActionPlan = () => {
    if (!actionText.trim()) return
    toast.success(`Action item added to ${actionPlanModal?.teacherName}'s plan!`)
    setActionPlanModal(null)
    setActionText('')
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Inbox size={28} className="mb-2" />
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs mt-1">No pending feedback items.</p>
        </div>
      )}
      {pending.map(item => (
        <Card key={item.id} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
              {item.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800">{item.teacherName}</p>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.question}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Your Reply</label>
            <textarea
              value={item.reply}
              onChange={e => updateReply(item.id, e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Write your coaching response..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => sendFeedback(item)} roleColor={roleColor} size="sm"><Send size={13}/>Send Feedback</Button>
            <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => addToActionPlan(item)}><Plus size={13}/>Add to Action Plan</Button>
          </div>
        </Card>
      ))}

      {resolved.length > 0 && (
        <div>
          <button onClick={() => setShowResolved(!showResolved)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer mb-2">
            {showResolved ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Resolved ({resolved.length})
          </button>
          {showResolved && (
            <div className="space-y-2">
              {resolved.map(item => (
                <Card key={item.id} className="opacity-70">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#6B7280' }}>{item.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700">{item.teacherName}</p>
                      <p className="text-xs text-gray-400 truncate">{item.question}</p>
                    </div>
                    <button onClick={() => { setItems(prev => prev.map(i => i.id === item.id ? { ...i, resolved: false } : i)); toast.info('Feedback item reopened.') }}
                      className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer flex-shrink-0">Reopen</button>
                  </div>
                  {item.reply && <p className="text-xs text-gray-500 mt-2 pl-9 italic">"{item.reply}"</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {actionPlanModal && (
        <Modal open onClose={() => setActionPlanModal(null)} title="Add to Action Plan">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Adding a coaching action for <strong>{actionPlanModal.teacherName}</strong>:</p>
            <textarea value={actionText} onChange={e => setActionText(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <div className="flex gap-2">
              <Button roleColor={roleColor} onClick={confirmActionPlan}><Plus size={14}/>Add Action</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setActionPlanModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
