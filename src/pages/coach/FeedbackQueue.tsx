import { useState } from 'react'
import { ChevronDown, ChevronUp, Send, Inbox, Plus, Clock } from 'lucide-react'
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
  { id: 'fq1', teacherName: 'Jane Smith',    initials: 'JS', date: '2026-05-15', question: 'How should I handle students who skip the representational phase during CRA? They jump straight to the abstract and I\'m not sure how to redirect without losing momentum.', reply: '', resolved: false },
  { id: 'fq2', teacherName: 'Kevin Johnson', initials: 'KJ', date: '2026-05-14', question: 'My lesson ran 10 minutes over today — should I log it as partially completed or fully completed? The content was all covered just not in the time I planned.', reply: '', resolved: false },
  { id: 'fq3', teacherName: 'Mira Park',     initials: 'MP', date: '2026-05-13', question: 'Can I count co-teaching sessions with the special ed teacher as a Tier 2 intervention? We\'re working with the same 5 students every day.', reply: '', resolved: false },
]

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function urgencyStyle(days: number): { border: string; badge: string } {
  if (days >= 7) return { border: 'border-l-4 border-l-red-400',   badge: 'bg-red-50 text-red-600' }
  if (days >= 3) return { border: 'border-l-4 border-l-amber-400', badge: 'bg-amber-50 text-amber-600' }
  return             { border: '',                                  badge: 'bg-gray-100 text-gray-500' }
}

function detectCategory(q: string): string | null {
  const t = q.toLowerCase()
  if (t.includes('cra') || t.includes('representational') || t.includes('concrete')) return 'CRA'
  if (t.includes('log') || t.includes('completed') || t.includes('logging'))         return 'Logging'
  if (t.includes('pacing') || t.includes('transition') || t.includes('ran over'))    return 'Pacing'
  if (t.includes('tier 2') || t.includes('tier 3') || t.includes('small group'))     return 'Tier Support'
  if (t.includes('co-teach') || t.includes('co teach') || t.includes('special ed'))  return 'Co-Teaching'
  return null
}

export function FeedbackQueue() {
  const [items, setItems]               = useState<FeedbackItem[]>(initialItems)
  const [showResolved, setShowResolved] = useState(false)
  const [actionPlanModal, setActionPlanModal] = useState<FeedbackItem | null>(null)
  const [actionText, setActionText]     = useState('')

  const pending  = items.filter(i => !i.resolved)
  const resolved = items.filter(i =>  i.resolved)

  const updateReply = (id: string, reply: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, reply } : i))

  const sendFeedback = (item: FeedbackItem) => {
    if (!item.reply.trim()) { toast.warning('Write a reply before sending.'); return }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, resolved: true } : i))
    toast.success(`Feedback sent to ${item.teacherName}!`)
  }

  const openActionPlan = (item: FeedbackItem) => {
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
      {/* Summary */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-700">{pending.length} pending</span>
        {resolved.length > 0 && (
          <span className="text-gray-400">· {resolved.length} resolved</span>
        )}
        {pending.some(i => daysAgo(i.date) >= 3) && (
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-200">
            Some items need attention
          </span>
        )}
      </div>

      {pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Inbox size={28} className="mb-2" />
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs mt-1">No pending feedback items.</p>
        </div>
      )}

      {pending.map(item => {
        const age      = daysAgo(item.date)
        const urgency  = urgencyStyle(age)
        const category = detectCategory(item.question)
        const chars    = item.reply.length

        return (
          <Card key={item.id} className={`space-y-4 overflow-hidden ${urgency.border}`}>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: roleColor }}
              >
                {item.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{item.teacherName}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {category}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${urgency.badge}`}>
                      <Clock size={10} />{age === 0 ? 'Today' : `${age}d ago`}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{item.question}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600">Your Reply</label>
                <span className={`text-xs ${chars > 0 ? 'text-gray-400' : 'text-gray-300'}`}>{chars} chars</span>
              </div>
              <textarea
                value={item.reply}
                onChange={e => updateReply(item.id, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Write your coaching response…"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => sendFeedback(item)} roleColor={roleColor} size="sm">
                <Send size={13} />Send Feedback
              </Button>
              <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => openActionPlan(item)}>
                <Plus size={13} />Add to Action Plan
              </Button>
            </div>
          </Card>
        )
      })}

      {resolved.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer mb-2"
          >
            {showResolved ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Resolved ({resolved.length})
          </button>
          {showResolved && (
            <div className="space-y-2">
              {resolved.map(item => (
                <Card key={item.id} className="opacity-70">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 bg-gray-400">
                      {item.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700">{item.teacherName}</p>
                      <p className="text-xs text-gray-400 truncate">{item.question}</p>
                    </div>
                    <button
                      onClick={() => { setItems(prev => prev.map(i => i.id === item.id ? { ...i, resolved: false } : i)); toast.info('Feedback item reopened.') }}
                      className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer flex-shrink-0"
                    >
                      Reopen
                    </button>
                  </div>
                  {item.reply && (
                    <p className="text-xs text-gray-500 mt-2 pl-9 italic">"{item.reply}"</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {actionPlanModal && (
        <Modal open onClose={() => setActionPlanModal(null)} title="Add to Action Plan">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Adding a coaching action for <strong>{actionPlanModal.teacherName}</strong>:
            </p>
            <textarea
              value={actionText}
              onChange={e => setActionText(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="flex gap-2">
              <Button roleColor={roleColor} onClick={confirmActionPlan}><Plus size={14} />Add Action</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setActionPlanModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
