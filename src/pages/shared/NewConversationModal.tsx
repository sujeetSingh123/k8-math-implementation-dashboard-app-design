import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { roleLabels } from '../../constants/roles'

interface Props {
  onClose: () => void
  onStart: (userId: string) => void
}

export function NewConversationModal({ onClose, onStart }: Props) {
  const { currentUser } = useAppStore()
  const [query, setQuery] = useState('')

  const candidates = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      (!query ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.role.includes(query.toLowerCase())),
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">New Conversation</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or role…"
            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No users found.</p>
          ) : (
            candidates.map((u) => (
              <button
                key={u.id}
                onClick={() => onStart(u.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: roleColors[u.role] }}
                >
                  {u.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs capitalize" style={{ color: roleColors[u.role] }}>
                    {roleLabels[u.role]}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
