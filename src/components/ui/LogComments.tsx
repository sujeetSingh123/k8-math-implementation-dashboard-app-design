import { useForm } from 'react-hook-form'
import { Send } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'

type Props = { logId: string }
type FormData = { body: string }

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function LogComments({ logId }: Props) {
  const { currentUser, logComments, addLogComment } = useAppStore()
  const comments = logComments.filter(c => c.logId === logId)
  const { register, handleSubmit, reset } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    if (!data.body.trim()) return
    addLogComment({
      id: `lc-${Date.now()}`,
      logId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      body: data.body.trim(),
      createdAt: new Date().toISOString(),
    })
    reset()
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Comments ({comments.length})
      </p>

      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No comments yet.</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-2.5">
            <div
              className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: roleColors[c.authorRole] }}
            >
              {initials(c.authorName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-gray-800">{c.authorName}</span>
                <span className="text-xs text-gray-400">{c.createdAt.slice(0, 10)}</span>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 leading-relaxed">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 pt-1">
        <input
          {...register('body')}
          placeholder="Add a comment…"
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          type="submit"
          className="p-2 rounded-lg text-white cursor-pointer flex-shrink-0 transition-opacity hover:opacity-80"
          style={{ backgroundColor: roleColors[currentUser.role] }}
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  )
}
