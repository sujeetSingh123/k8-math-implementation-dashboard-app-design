import { useState } from 'react'
import { ChevronDown, ChevronUp, Send, Inbox, Plus, Clock, Info } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAppStore } from '../../store/useAppStore'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { users } from '../../data/mockData'
import { TeacherDetailModal } from './TeacherDetailModal'
import type { CoachingAction, User } from '../../types'

const roleColor = roleColors.coach

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
  if (t.includes('log') || t.includes('completed') || t.includes('logging'))          return 'Logging'
  if (t.includes('pacing') || t.includes('transition') || t.includes('ran over'))     return 'Pacing'
  if (t.includes('tier 2') || t.includes('tier 3') || t.includes('small group'))      return 'Tier Support'
  if (t.includes('co-teach') || t.includes('co teach') || t.includes('special ed'))   return 'Co-Teaching'
  return null
}

export function FeedbackQueue() {
  const { currentUser, feedbackItems, replyToFeedback, addCycleAction } = useAppStore()

  const myItems = feedbackItems.filter(f => f.coachId === currentUser.id)
  const pending  = myItems.filter(f => !f.resolved)
  const resolved = myItems.filter(f =>  f.resolved)

  const [replies, setReplies]           = useState<Record<string, string>>({})
  const [showResolved, setShowResolved] = useState(false)
  const [actionModal, setActionModal]   = useState<{ id: string; cycleId: string; teacherName: string } | null>(null)
  const [actionText, setActionText]     = useState('')
  const [detailTeacher, setDetailTeacher] = useState<User | null>(null)

  const openDetails = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId)
    if (teacher) setDetailTeacher(teacher)
  }

  const updateReply = (id: string, val: string) =>
    setReplies(prev => ({ ...prev, [id]: val }))

  const handleSend = (id: string, teacherName: string) => {
    const reply = (replies[id] ?? '').trim()
    if (!reply) { toast.warning('Write a reply before sending.'); return }
    replyToFeedback(id, reply, currentUser.id)
    setReplies(prev => ({ ...prev, [id]: '' }))
    toast.success(`Reply sent to ${teacherName} — it now appears in their coaching thread.`)
  }

  const openActionPlan = (id: string, cycleId: string, teacherName: string, question: string) => {
    setActionModal({ id, cycleId, teacherName })
    setActionText(`Follow up with ${teacherName}: "${question.slice(0, 60)}…"`)
  }

  const confirmActionPlan = () => {
    if (!actionModal || !actionText.trim()) return
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    const action: CoachingAction = {
      id: `act-fq-${Date.now()}`,
      cycleId: actionModal.cycleId,
      description: actionText.trim(),
      dueDate,
    }
    addCycleAction(actionModal.cycleId, action)
    toast.success(`Action added to ${actionModal.teacherName}'s coaching cycle.`)
    setActionModal(null)
    setActionText('')
  }

  return (
    <div className="w-full max-w-2xl">
      <PageHeader
        title="Feedback Queue"
        description="Questions from your teachers. Replies are sent directly to their coaching thread."
      />

      {/* Summary */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <span className="font-semibold text-gray-700">{pending.length} pending</span>
        {resolved.length > 0 && <span className="text-gray-400">· {resolved.length} resolved</span>}
        {pending.some(i => daysAgo(i.date) >= 3) && (
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-200">
            Some items need attention
          </span>
        )}
      </div>

      <div className="space-y-4">
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
          const reply    = replies[item.id] ?? ''

          return (
            <Card key={item.id} className={`space-y-4 overflow-hidden ${urgency.border}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
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
                  <span className={`text-xs ${reply.length > 0 ? 'text-gray-400' : 'text-gray-300'}`}>{reply.length} chars</span>
                </div>
                <textarea
                  value={reply}
                  onChange={e => updateReply(item.id, e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Write your coaching response…"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleSend(item.id, item.teacherName)} roleColor={roleColor} size="sm">
                  <Send size={13} />Send Feedback
                </Button>
                <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => openActionPlan(item.id, item.cycleId, item.teacherName, item.question)}>
                  <Plus size={13} />Add to Action Plan
                </Button>
                <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => openDetails(item.teacherId)}>
                  <Info size={13} />View Details
                </Button>
              </div>
            </Card>
          )
        })}

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
                      <div className="w-7 h-7 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {item.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-700">{item.teacherName}</p>
                        <p className="text-xs text-gray-400 truncate">{item.question}</p>
                      </div>
                      <button onClick={() => openDetails(item.teacherId)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors flex-shrink-0" title="View Details">
                        <Info size={14} />
                      </button>
                    </div>
                    {item.reply && <p className="text-xs text-gray-500 mt-2 pl-9 italic">"{item.reply}"</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {detailTeacher && (
        <TeacherDetailModal teacher={detailTeacher} onClose={() => setDetailTeacher(null)} />
      )}

      {actionModal && (
        <Modal open onClose={() => setActionModal(null)} title="Add to Action Plan">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Adding an action to <strong>{actionModal.teacherName}</strong>'s coaching cycle (due in 7 days):
            </p>
            <textarea
              value={actionText}
              onChange={e => setActionText(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="flex gap-2">
              <Button roleColor={roleColor} onClick={confirmActionPlan}><Plus size={14} />Add Action</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setActionModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
