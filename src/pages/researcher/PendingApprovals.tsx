import { useMemo } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { getSemester, sortSemesters } from '../../utils/incentiveCalc'
import type { IncentiveCategory } from '../../types'

const roleColor = roleColors.researcher

const CAT_COLORS: Record<IncentiveCategory, string> = {
  training: '#3B82F6',
  performance: '#10B981',
  logging: '#F59E0B',
}

interface Props { semester?: string }

export function PendingApprovals({ semester }: Props) {
  const { currentUser, incentives, approveIncentive, rejectIncentive } = useAppStore()

  const pending = useMemo(
    () => [...incentives.filter(i => i.status === 'pending' && (!semester || getSemester(i.awardedAt) === semester))].sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, semester],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, typeof pending>()
    pending.forEach(i => {
      const s = getSemester(i.awardedAt)
      if (!map.has(s)) map.set(s, [])
      map.get(s)!.push(i)
    })
    return sortSemesters([...map.keys()]).map(s => ({ semester: s, items: map.get(s)! }))
  }, [pending])

  const total = useMemo(() => pending.reduce((s, i) => s + i.amount, 0), [pending])

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <CheckCircle size={36} className="mb-3 text-emerald-400" />
        <p className="text-sm font-medium text-gray-600">All caught up!</p>
        <p className="text-xs mt-1">No incentives are waiting for approval.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 px-1">
        <Clock size={16} style={{ color: roleColor }} />
        <p className="text-sm text-gray-500">
          <strong className="text-gray-800">{pending.length} incentive{pending.length !== 1 ? 's' : ''}</strong> pending approval
          · <strong className="text-gray-800">${total.toLocaleString()}</strong> total
        </p>
      </div>

      {grouped.map(({ semester, items }) => (
        <div key={semester} className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">{semester}</p>
          {items.map(inc => (
            <div key={inc.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{inc.recipientName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{inc.recipientRole}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white capitalize" style={{ backgroundColor: CAT_COLORS[inc.category] }}>
                    {inc.category}
                  </span>
                  <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                </div>
                <p className="text-sm text-gray-600">{inc.reason}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-lg font-bold text-gray-800">${inc.amount}</span>
                <button
                  onClick={() => approveIncentive(inc.id, currentUser.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer bg-emerald-500 hover:bg-emerald-600 transition-colors"
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  onClick={() => rejectIncentive(inc.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 cursor-pointer transition-colors"
                >
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
