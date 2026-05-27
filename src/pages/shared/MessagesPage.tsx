import { useState, useMemo } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { ChatPanel } from './ChatPanel'
import { NewConversationModal } from './NewConversationModal'
import type { Conversation } from '../../types'

export function MessagesPage() {
  const { currentUser, conversations, startConversation, markConversationRead } = useAppStore()
  const roleColor = roleColors[currentUser.role]
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)

  const myConversations = useMemo(() =>
    conversations
      .filter((c) => c.participantIds.includes(currentUser.id))
      .sort((a, b) => {
        const aLast = a.messages.at(-1)?.createdAt ?? a.createdAt
        const bLast = b.messages.at(-1)?.createdAt ?? b.createdAt
        return bLast.localeCompare(aLast)
      }),
    [conversations, currentUser.id],
  )

  const selected = myConversations.find((c) => c.id === selectedId) ?? null

  const getOther = (conv: Conversation) => {
    const id = conv.participantIds.find((p) => p !== currentUser.id)
    return users.find((u) => u.id === id)
  }

  const unread = (conv: Conversation) =>
    conv.messages.filter((m) => m.senderId !== currentUser.id && !m.readAt).length

  const handleSelect = (id: string) => {
    setSelectedId(id)
    markConversationRead(id, currentUser.id)
  }

  const handleStart = (userId: string) => {
    const id = startConversation(currentUser.id, userId)
    handleSelect(id)
    setShowNew(false)
  }

  return (
    <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} style={{ color: roleColor }} />
            <span className="text-sm font-semibold text-gray-800">Messages</span>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="p-1.5 rounded-lg text-white cursor-pointer"
            style={{ backgroundColor: roleColor }}
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {myConversations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10 px-4">No conversations yet. Start one!</p>
          ) : (
            myConversations.map((conv) => {
              const other = getOther(conv)
              const lastMsg = conv.messages.at(-1)
              const badge = unread(conv)
              const isActive = conv.id === selectedId
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className="w-full px-4 py-3 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={isActive ? { backgroundColor: `${roleColor}10`, borderLeft: `3px solid ${roleColor}` } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: other ? roleColors[other.role] : '#9CA3AF' }}
                    >
                      {other?.initials ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium text-gray-800 truncate">{other?.name ?? 'Unknown'}</span>
                        {badge > 0 && (
                          <span
                            className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: roleColor }}
                          >
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.body : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <ChatPanel conversation={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${roleColor}20` }}>
                <MessageSquare size={24} style={{ color: roleColor }} />
              </div>
              <p className="text-sm font-medium text-gray-500">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">or press + to start a new one</p>
            </div>
          </div>
        )}
      </div>

      {showNew && <NewConversationModal onClose={() => setShowNew(false)} onStart={handleStart} />}
    </div>
  )
}
