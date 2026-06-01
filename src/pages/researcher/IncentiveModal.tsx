import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { users } from '../../data/mockData'
import type { IncentiveCategory } from '../../types'

const CAT_OPTIONS: { key: IncentiveCategory; label: string; color: string; suggestions: number[] }[] = [
  { key: 'training',    label: 'Training',    color: '#3B82F6', suggestions: [50, 100, 150] },
  { key: 'performance', label: 'Performance', color: '#10B981', suggestions: [100, 200, 300] },
  { key: 'logging',     label: 'Logging',     color: '#F59E0B', suggestions: [25, 50, 75] },
]

type RecipientRole = 'teacher' | 'coach'
type FormValues = { recipientId: string; amount: string; reason: string }

interface Props {
  defaultRecipientId?: string
  defaultRecipientRole?: RecipientRole
  onClose: () => void
  onSave: (data: { recipientId: string; recipientName: string; recipientRole: RecipientRole; category: IncentiveCategory; amount: number; reason: string }) => void
}

export function IncentiveModal({ defaultRecipientId, defaultRecipientRole = 'teacher', onClose, onSave }: Props) {
  const [recipientRole, setRecipientRole] = useState<RecipientRole>(defaultRecipientRole)
  const [category, setCategory] = useState<IncentiveCategory>(defaultRecipientRole === 'coach' ? 'performance' : 'logging')

  const teachers = users.filter(u => u.role === 'teacher')
  const coaches = users.filter(u => u.role === 'coach')
  const recipientList = recipientRole === 'teacher' ? teachers : coaches

  const defaultId = defaultRecipientId ?? recipientList[0]?.id ?? ''

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { recipientId: defaultId, amount: '', reason: '' },
  })

  const handleRoleChange = (role: RecipientRole) => {
    setRecipientRole(role)
    if (role === 'coach') setCategory('performance')
    const list = role === 'teacher' ? teachers : coaches
    reset({ recipientId: list[0]?.id ?? '', amount: '', reason: '' })
  }

  const visibleCategories = recipientRole === 'coach' ? CAT_OPTIONS.filter(c => c.key === 'performance') : CAT_OPTIONS
  const catOpt = CAT_OPTIONS.find(c => c.key === category)!

  const submit = (values: FormValues) => {
    const recipient = recipientList.find(u => u.id === values.recipientId)
    if (!recipient) return
    onSave({
      recipientId: values.recipientId,
      recipientName: recipient.name,
      recipientRole,
      category,
      amount: Number(values.amount),
      reason: values.reason,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Award & Approve Incentive</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* Recipient role toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
            <div className="flex gap-2">
              {(['teacher', 'coach'] as RecipientRole[]).map(role => (
                <button
                  key={role} type="button" onClick={() => handleRoleChange(role)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border-2 cursor-pointer transition-all capitalize"
                  style={{
                    borderColor: recipientRole === role ? '#8B5CF6' : '#E5E7EB',
                    backgroundColor: recipientRole === role ? '#8B5CF6' : '#fff',
                    color: recipientRole === role ? '#fff' : '#6B7280',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {recipientRole === 'teacher' ? 'Teacher' : 'Coach'}
            </label>
            <select
              {...register('recipientId', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {recipientList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="flex gap-2">
              {visibleCategories.map(opt => (
                <button
                  key={opt.key} type="button" onClick={() => setCategory(opt.key)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: category === opt.key ? opt.color : '#E5E7EB',
                    backgroundColor: category === opt.key ? opt.color : '#fff',
                    color: category === opt.key ? '#fff' : '#6B7280',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <div className="flex gap-2 mb-2">
              {catOpt.suggestions.map(s => (
                <button
                  key={s} type="button" onClick={() => setValue('amount', String(s))}
                  className="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                  style={{ borderColor: catOpt.color, color: catOpt.color }}
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
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: catOpt.color }}
            >
              Approve & Award
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
