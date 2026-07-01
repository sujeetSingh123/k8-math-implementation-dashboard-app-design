import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { users } from '../../data/mockData'

export type RecipientRole = 'teacher' | 'coach' | 'admin' | 'paraprofessional'

const ROLE_OPTIONS: { key: RecipientRole; label: string }[] = [
  { key: 'teacher',          label: 'Teacher' },
  { key: 'coach',            label: 'Coach' },
  { key: 'admin',            label: 'Admin' },
  { key: 'paraprofessional', label: 'Para' },
]

const AMOUNT_SUGGESTIONS = [25, 50, 75, 100]
const ROLE_COLOR = '#8B5CF6'

type FormValues = { recipientId: string; category: string; amount: string; reason: string }

interface Props {
  defaultRecipientId?: string
  defaultRecipientRole?: RecipientRole
  onClose: () => void
  onSave: (data: {
    recipientId: string
    recipientName: string
    recipientRole: RecipientRole
    category: string
    amount: number
    reason: string
  }) => void
}

export function IncentiveModal({ defaultRecipientId, defaultRecipientRole = 'teacher', onClose, onSave }: Props) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      recipientId: defaultRecipientId ?? users.filter(u => u.role === defaultRecipientRole)[0]?.id ?? '',
      category: 'Logging',
      amount: '',
      reason: '',
    },
  })

  const handleRoleChange = (role: RecipientRole) => {
    const list = users.filter(u => u.role === role)
    reset({ recipientId: list[0]?.id ?? '', category: 'Logging', amount: '', reason: '' })
  }

  const activeRole = ROLE_OPTIONS.find(r => users.filter(u => u.role === r.key).some(u => u.id === watch('recipientId')))?.key ?? defaultRecipientRole
  const recipientList = users.filter(u => u.role === activeRole)

  const submit = (values: FormValues) => {
    const recipient = users.find(u => u.id === values.recipientId)
    if (!recipient) return
    onSave({
      recipientId: values.recipientId,
      recipientName: recipient.name,
      recipientRole: activeRole,
      category: values.category.trim() || 'Logging',
      amount: Number(values.amount),
      reason: values.reason,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Award Incentive</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* Recipient role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {ROLE_OPTIONS.map(role => (
                <button
                  key={role.key} type="button" onClick={() => handleRoleChange(role.key)}
                  className="py-2 rounded-lg text-xs font-semibold border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: activeRole === role.key ? ROLE_COLOR : '#E5E7EB',
                    backgroundColor: activeRole === role.key ? ROLE_COLOR : '#fff',
                    color: activeRole === role.key ? '#fff' : '#6B7280',
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{activeRole}</label>
            {recipientList.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 px-3 border border-gray-200 rounded-lg">No {activeRole}s found.</p>
            ) : (
              <select
                {...register('recipientId', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {recipientList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            )}
          </div>

          {/* Category — open text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              {...register('category', { required: true })}
              type="text"
              placeholder="e.g. Logging, Attendance, Completion..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">Category is required</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <div className="flex gap-2 mb-2">
              {AMOUNT_SUGGESTIONS.map(s => (
                <button
                  key={s} type="button" onClick={() => setValue('amount', String(s))}
                  className="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                  style={{ borderColor: ROLE_COLOR, color: ROLE_COLOR }}
                >
                  ${s}
                </button>
              ))}
            </div>
            <input
              {...register('amount', { required: true, min: 1 })}
              type="number" min="1" placeholder="Custom amount"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">Enter a valid amount</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              {...register('reason', { required: true })}
              rows={3} placeholder="Describe the reason for this incentive..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">Reason is required</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: ROLE_COLOR }}>
              Approve & Award
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
