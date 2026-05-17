import { useState, useRef, useEffect } from 'react'
import { Send, CheckCircle, Circle, Calendar } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import type { CoachingMessage } from '../../types'
import { users, trainingSessions } from '../../data/mockData'

const roleColor = '#10B981'

export function CoachingThread() {
  const { currentUser, coachingCycles, sendMessage, completeAction } = useAppStore()
  const [text, setText] = useState('')
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

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Left: Thread */}
      <div className="flex-1 flex flex-col gap-0 min-w-0">
        <Card className="flex-shrink-0 mb-3">
          <p className="text-xs text-gray-500 mb-0.5">Current coaching goal</p>
          <p className="text-sm font-medium text-gray-800">{cycle.goal}</p>
        </Card>
        <Card padding="none" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cycle.messages.map(msg => {
              const isMe = msg.senderId === currentUser.id
              const sender = users.find(u => u.id === msg.senderId)
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3B82F6' }}>
                      {sender?.initials ?? '?'}
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}
                    style={isMe ? { backgroundColor: roleColor } : {}}>
                    {!isMe && <p className="text-xs font-semibold mb-0.5 text-blue-700">{sender?.name}</p>}
                    <p>{msg.body}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                    </p>
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
              placeholder={`Message ${coach?.name ?? 'coach'}...`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <Button onClick={handleSend} roleColor={roleColor} size="sm"><Send size={14}/></Button>
          </div>
        </Card>
      </div>

      {/* Right: Action plan + sessions */}
      <div className="w-64 flex-shrink-0 space-y-3">
        <Card>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Action Plan</h3>
          <ul className="space-y-2">
            {cycle.actions.map(action => (
              <li key={action.id} className="flex items-start gap-2">
                <button onClick={() => completeAction(cycle.id, action.id)} className="mt-0.5 flex-shrink-0 cursor-pointer">
                  {action.completedAt
                    ? <CheckCircle size={16} className="text-emerald-500" />
                    : <Circle size={16} className="text-gray-300" />}
                </button>
                <div>
                  <p className={`text-xs ${action.completedAt ? 'line-through text-gray-400' : 'text-gray-700'}`}>{action.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due {action.dueDate}</p>
                </div>
              </li>
            ))}
            {cycle.actions.length === 0 && <p className="text-xs text-gray-400">No actions yet.</p>}
          </ul>
        </Card>
        <Card>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Upcoming Sessions</h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming sessions.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(s => (
                <li key={s.id} className="flex items-start gap-2">
                  <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.date} · {s.durationHours}h</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
