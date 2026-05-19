import { useState, useRef, useEffect } from 'react'
import { Send, CheckCircle, Circle, Calendar, AlertCircle, HelpCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { AskCoachModal } from './AskCoachModal'
import type { CoachingMessage } from '../../types'
import { users, trainingSessions } from '../../data/mockData'

const roleColor = '#10B981'

const sessionBadge: Record<string, { color: string; label: string }> = {
  coaching: { color: '#3B82F6', label: 'Coaching' },
  lab:      { color: '#8B5CF6', label: 'Lab' },
  training: { color: '#F59E0B', label: 'Training' },
}

function msgDateLabel(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

export function CoachingThread() {
  const { currentUser, coachingCycles, sendMessage, completeAction } = useAppStore()
  const [text, setText] = useState('')
  const [askOpen, setAskOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const cycle = coachingCycles.find(c => c.teacherId === currentUser.id)
  const coach = users.find(u => u.id === cycle?.coachId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [cycle?.messages])

  const handleSend = () => {
    if (!text.trim() || !cycle) return
    const msg: CoachingMessage = {
      id: `msg-new-${Date.now()}`,
      cycleId: cycle.id,
      senderId: currentUser.id,
      body: text.trim(),
      createdAt: new Date().toISOString(),
    }
    sendMessage(cycle.id, msg)
    setText('')
  }

  const mySessions = trainingSessions[currentUser.id] ?? []
  const upcoming = mySessions.filter(s => new Date(s.date) >= new Date()).slice(0, 2)

  if (!cycle) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm">No active coaching cycle found.</p>
      </div>
    )
  }

  const completedCount = cycle.actions.filter(a => a.completedAt).length

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-160px)]">
      {/* Thread column */}
      <div className="flex-1 flex flex-col min-w-0 gap-3">
        {/* Coach + goal header */}
        <Card>
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#3B82F6' }}
            >
              {coach?.initials ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-[11px] text-gray-400 leading-none mb-0.5">Your coach</p>
                  <p className="text-sm font-semibold text-gray-800">{coach?.name ?? 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {cycle.actions.length > 0 && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {completedCount}/{cycle.actions.length} actions done
                    </span>
                  )}
                  <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => setAskOpen(true)}>
                    <HelpCircle size={13} />Ask a question
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{cycle.goal}</p>
            </div>
          </div>
        </Card>

        {/* Message thread */}
        <Card padding="none" className="flex flex-col overflow-hidden flex-1 min-h-80">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cycle.messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id
              const sender = users.find(u => u.id === msg.senderId)
              const prev = cycle.messages[idx - 1]
              const showSep = idx === 0 || (prev && !isSameDay(prev.createdAt, msg.createdAt))
              return (
                <div key={msg.id}>
                  {showSep && (
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-[11px] text-gray-400">{msgDateLabel(msg.createdAt)}</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                  )}
                  <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div
                        className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#3B82F6' }}
                      >
                        {sender?.initials ?? '?'}
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}
                      style={isMe ? { backgroundColor: roleColor } : {}}
                    >
                      {!isMe && <p className="text-xs font-semibold mb-0.5 text-blue-700">{sender?.name}</p>}
                      <p>{msg.body}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Message ${coach?.name ?? 'coach'}…`}
              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <Button onClick={handleSend} roleColor={roleColor} size="sm"><Send size={14} /></Button>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0 flex flex-col gap-3">
        <Card>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Action Plan</h3>
          <ul className="space-y-2.5">
            {cycle.actions.map(action => {
              const overdue = !action.completedAt && new Date(action.dueDate) < new Date()
              return (
                <li key={action.id} className="flex items-start gap-2">
                  <button onClick={() => completeAction(cycle.id, action.id)} className="mt-0.5 flex-shrink-0 cursor-pointer">
                    {action.completedAt
                      ? <CheckCircle size={16} className="text-emerald-500" />
                      : overdue
                        ? <AlertCircle size={16} className="text-red-400" />
                        : <Circle size={16} className="text-gray-300" />}
                  </button>
                  <div>
                    <p className={`text-xs ${action.completedAt ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {action.description}
                    </p>
                    <p className={`text-xs mt-0.5 ${overdue && !action.completedAt ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      {overdue && !action.completedAt ? 'Overdue · ' : 'Due '}{action.dueDate}
                    </p>
                  </div>
                </li>
              )
            })}
            {cycle.actions.length === 0 && <p className="text-xs text-gray-400">No actions yet.</p>}
          </ul>
        </Card>

        <Card>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Upcoming Sessions</h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming sessions.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map(s => {
                const badge = sessionBadge[s.type]
                return (
                  <li key={s.id} className="flex items-start gap-2">
                    <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 leading-snug">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-xs text-gray-400">{s.date} · {s.durationHours}h</p>
                        {badge && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: `${badge.color}18`, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>

    {askOpen && coach && (
      <AskCoachModal
        cycle={cycle}
        currentUser={currentUser}
        coachName={coach.name}
        onClose={() => setAskOpen(false)}
      />
    )}
    </>
  )
}
