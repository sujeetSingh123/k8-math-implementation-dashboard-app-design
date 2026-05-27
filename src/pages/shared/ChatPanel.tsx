import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Send } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { roleLabels } from '../../constants/roles'
import type { Conversation } from '../../types'

interface Props { conversation: Conversation }
type FormValues = { body: string }

export function ChatPanel({ conversation }: Props) {
  const { currentUser, sendDirectMessage } = useAppStore()
  const roleColor = roleColors[currentUser.role]
  const bottomRef = useRef<HTMLDivElement>(null)

  const otherId = conversation.participantIds.find((id) => id !== currentUser.id)
  const other = users.find((u) => u.id === otherId)

  const { register, handleSubmit, reset } = useForm<FormValues>()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages.length])

  const submit = ({ body }: FormValues) => {
    if (!body.trim()) return
    sendDirectMessage(conversation.id, body.trim(), currentUser.id)
    reset()
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: other ? roleColors[other.role] : '#9CA3AF' }}
        >
          {other?.initials ?? '?'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{other?.name ?? 'Unknown'}</p>
          <p className="text-xs" style={{ color: other ? roleColors[other.role] : '#9CA3AF' }}>
            {other ? roleLabels[other.role] : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet. Say hello!</p>
        )}
        {conversation.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id
          const sender = users.find((u) => u.id === msg.senderId)
          const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <div
                  className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: sender ? roleColors[sender.role] : '#9CA3AF' }}
                >
                  {sender?.initials ?? '?'}
                </div>
              )}
              <div className={`flex flex-col gap-0.5 max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    isMe
                      ? { backgroundColor: roleColor, color: '#fff', borderBottomRightRadius: 4 }
                      : { backgroundColor: '#F3F4F6', color: '#1F2937', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.body}
                </div>
                <span className="text-xs text-gray-400 px-1">{time}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit(submit)} className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
        <input
          {...register('body', { required: true })}
          placeholder="Type a message…"
          autoComplete="off"
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer flex-shrink-0"
          style={{ backgroundColor: roleColor }}
        >
          <Send size={15} />
        </button>
      </form>
    </>
  )
}
