import { useMemo } from 'react'
import { Award } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import type { IncentiveCategory } from '../../types'

const CAT_COLORS: Record<IncentiveCategory, string> = {
  training: '#3B82F6',
  performance: '#10B981',
  logging: '#F59E0B',
}

const CAT_LABELS: Record<IncentiveCategory, string> = {
  training: 'Training',
  performance: 'Performance',
  logging: 'Logging',
}

const PERFORMANCE_COLOR = CAT_COLORS.performance

function IncentiveList({ items }: { items: ReturnType<typeof useAppStore>['incentives'] }) {
  if (items.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No incentives yet.</p>
  return (
    <div className="space-y-3">
      {items.map(inc => (
        <div key={inc.id} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLORS[inc.category] }}>
                {CAT_LABELS[inc.category]}
              </span>
              {'recipientRole' in inc && inc.recipientRole === 'teacher' && (
                <span className="text-sm font-medium text-gray-800">{inc.recipientName.split(' ')[0]}</span>
              )}
              <span className="text-xs text-gray-400">{inc.awardedAt}</span>
            </div>
            <p className="text-sm text-gray-600">{inc.reason}</p>
          </div>
          <span className="text-base font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
        </div>
      ))}
    </div>
  )
}

export function CoachIncentives() {
  const { currentUser, incentives } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const myTeachers = useMemo(() => users.filter(u => u.role === 'teacher' && u.coachId === currentUser.id), [currentUser.id])
  const teacherIdSet = useMemo(() => new Set(myTeachers.map(t => t.id)), [myTeachers])

  const myIncentives = useMemo(() =>
    incentives.filter(i => i.recipientId === currentUser.id && i.recipientRole === 'coach').sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, currentUser.id],
  )

  const caseloadIncentives = useMemo(() =>
    incentives.filter(i => i.recipientRole === 'teacher' && teacherIdSet.has(i.recipientId)).sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, teacherIdSet],
  )

  const myTotal = myIncentives.reduce((s, i) => s + i.amount, 0)

  const teacherTotals = useMemo(() =>
    myTeachers.map(t => ({
      ...t,
      total: caseloadIncentives.filter(i => i.recipientId === t.id).reduce((s, i) => s + i.amount, 0),
      count: caseloadIncentives.filter(i => i.recipientId === t.id).length,
    })).sort((a, b) => b.total - a.total),
    [myTeachers, caseloadIncentives],
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Incentives</h2>
          <p className="text-sm text-gray-500">Your earned incentives + {myTeachers.length} caseload teacher{myTeachers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* My earned incentives */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">My Incentives</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Total Earned" value={`$${myTotal.toLocaleString()}`} color={roleColor} />
          <StatCard label="Performance Incentives" value={`$${myTotal.toLocaleString()}`} color={PERFORMANCE_COLOR} />
        </div>
        <Card title="My Incentive History">
          <IncentiveList items={myIncentives} />
        </Card>
      </div>

      {/* Caseload teacher incentives */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Caseload Teacher Incentives</p>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Per-Teacher Summary">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                    <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Awards</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teacherTotals.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleColor }}>
                            {t.initials}
                          </div>
                          <span className="font-medium text-gray-800">{t.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-gray-600">{t.count}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-800">${t.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Recent Teacher Awards">
            <IncentiveList items={caseloadIncentives.slice(0, 6)} />
          </Card>
        </div>
      </div>
    </div>
  )
}
