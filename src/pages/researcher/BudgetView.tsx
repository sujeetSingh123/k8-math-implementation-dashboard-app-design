import { useState, useMemo } from 'react'
import { DollarSign, Plus, BarChart2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { IncentiveModal } from './IncentiveModal'
import { EarningsBreakdown } from './EarningsBreakdown'
import { calcTeacherBreakdown, calcCoachBreakdown, calcAdminBreakdown } from '../../utils/incentiveCalc'
import type { IncentiveCategory } from '../../types'

const roleColor = roleColors.researcher

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

export function BudgetView() {
  const { users, schools, implementationLogs, fidelityChecks, trainingAttendances, incentives, budgetAllocations, awardIncentive } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [preselectedId, setPreselectedId] = useState<string | undefined>()
  const [preselectedRole, setPreselectedRole] = useState<'teacher' | 'coach'>('teacher')
  const [tab, setTab] = useState<'awards' | 'formula'>('formula')

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users])
  const coaches = useMemo(() => users.filter(u => u.role === 'coach'), [users])
  const admins = useMemo(() => users.filter(u => u.role === 'admin'), [users])
  const schoolName = useMemo(() => Object.fromEntries(schools.map(s => [s.id, s.name.replace(' School', '').replace(' Middle', '')])), [schools])

  const formulaTotal = useMemo(() => {
    const t = teachers.reduce((s, u) => s + calcTeacherBreakdown(u, implementationLogs).total, 0)
    const c = coaches.reduce((s, u) => s + calcCoachBreakdown(u, users, implementationLogs).total, 0)
    const a = admins.reduce((s, u) => s + calcAdminBreakdown(u, users, implementationLogs).total, 0)
    return t + c + a
  }, [teachers, coaches, admins, users, implementationLogs])

  const teacherIncentives = useMemo(() => incentives.filter(i => i.recipientRole === 'teacher'), [incentives])
  const coachIncentives = useMemo(() => incentives.filter(i => i.recipientRole === 'coach'), [incentives])

  const teacherStats = useMemo(() => teachers.map(t => {
    const checks = fidelityChecks.filter(c => c.teacherId === t.id)
    const avgFidelity = checks.length
      ? +(checks.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length).toFixed(1)
      : 0
    return {
      ...t,
      logCount: implementationLogs.filter(l => l.teacherId === t.id).length,
      avgFidelity,
      trainings: trainingAttendances.filter(a => a.teacherId === t.id).length,
      totalAwards: teacherIncentives.filter(i => i.recipientId === t.id).reduce((s, i) => s + i.amount, 0),
    }
  }), [teachers, implementationLogs, fidelityChecks, trainingAttendances, teacherIncentives])

  const coachStats = useMemo(() => coaches.map(c => ({
    ...c,
    totalAwards: coachIncentives.filter(i => i.recipientId === c.id).reduce((s, i) => s + i.amount, 0),
    count: coachIncentives.filter(i => i.recipientId === c.id).length,
  })), [coaches, coachIncentives])

  const tabBtnCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${active ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`

  const recentAwards = useMemo(() => [...incentives].sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)).slice(0, 8), [incentives])
  const totalBudget = budgetAllocations.reduce((s, a) => s + a.allocated, 0)
  const totalSpent = incentives.reduce((s, i) => s + i.amount, 0)

  const openModal = (id?: string, role: 'teacher' | 'coach' = 'teacher') => {
    setPreselectedId(id)
    setPreselectedRole(role)
    setShowModal(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
            <DollarSign size={20} style={{ color: roleColor }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Budget & Incentives</h2>
            <p className="text-sm text-gray-500">Training · Performance · Logging incentive tracking</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer"
          style={{ backgroundColor: roleColor }}
        >
          <Plus size={15} />
          Award Incentive
        </button>
      </div>

      {/* Budget allocation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {budgetAllocations.map(alloc => {
          const spent = incentives.filter(i => i.category === alloc.category).reduce((s, i) => s + i.amount, 0)
          const pct = Math.min(100, Math.round(spent / alloc.allocated * 100))
          return (
            <div key={alloc.category} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{alloc.label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLORS[alloc.category] }}>
                  {CAT_LABELS[alloc.category]}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${spent.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mb-2">of ${alloc.allocated.toLocaleString()} allocated</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CAT_COLORS[alloc.category] }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}% used · ${(alloc.allocated - spent).toLocaleString()} remaining</p>
            </div>
          )
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Budget" value={`$${totalBudget.toLocaleString()}`} color={roleColor} />
        <StatCard label="Formula Total" value={`$${formulaTotal.toLocaleString()}`} sub="Projected semester" color={roleColor} />
        <StatCard label="Manually Awarded" value={`$${totalSpent.toLocaleString()}`} color={roleColor} />
        <StatCard label="Awards Given" value={String(incentives.length)} color={roleColor} />
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button className={tabBtnCls(tab === 'formula')} style={tab === 'formula' ? { backgroundColor: roleColor } : {}} onClick={() => setTab('formula')}>
          <span className="flex items-center gap-1.5"><BarChart2 size={14} /> Formula Earnings</span>
        </button>
        <button className={tabBtnCls(tab === 'awards')} style={tab === 'awards' ? { backgroundColor: roleColor } : {}} onClick={() => setTab('awards')}>
          <span className="flex items-center gap-1.5"><DollarSign size={14} /> Manual Awards</span>
        </button>
      </div>

      {tab === 'formula' && <EarningsBreakdown />}

      {tab === 'awards' && (<><div className="grid lg:grid-cols-2 gap-4">
        <Card title="Teacher Incentive Tracker">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Logs</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Fidelity</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Training</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Awards</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teacherStats.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-2.5">
                      <p className="font-medium text-gray-800">{t.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400">{schoolName[t.schoolId]}</p>
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{t.logCount}</td>
                    <td className="py-2.5 text-center font-medium" style={{ color: t.avgFidelity >= 4 ? '#10B981' : t.avgFidelity >= 3.5 ? '#F59E0B' : '#EF4444' }}>
                      {t.avgFidelity.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{t.trainings}</td>
                    <td className="py-2.5 text-center font-semibold text-gray-800">${t.totalAwards}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => openModal(t.id, 'teacher')} className="text-xs px-2.5 py-1 rounded-md text-white cursor-pointer" style={{ backgroundColor: roleColor }}>
                        Award
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent Awards">
          <div className="space-y-3">
            {recentAwards.map(inc => (
              <div key={inc.id} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLORS[inc.category] }}>
                      {CAT_LABELS[inc.category]}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium capitalize">{inc.recipientRole}</span>
                    <span className="text-sm font-medium text-gray-800">{inc.recipientName.split(' ')[0]}</span>
                    <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{inc.reason}</p>
                </div>
                <span className="text-sm font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Coach tracker */}
      <Card title="Coach Incentive Tracker">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Coach</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Awards</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Total Earned</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coachStats.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-2.5">
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{schoolName[c.schoolId]}</p>
                  </td>
                  <td className="py-2.5 text-center text-gray-600">{c.count}</td>
                  <td className="py-2.5 text-center font-semibold text-gray-800">${c.totalAwards}</td>
                  <td className="py-2.5 text-right">
                    <button onClick={() => openModal(c.id, 'coach')} className="text-xs px-2.5 py-1 rounded-md text-white cursor-pointer" style={{ backgroundColor: roleColor }}>
                      Award
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </>)}

      {showModal && (
        <IncentiveModal
          defaultRecipientId={preselectedId}
          defaultRecipientRole={preselectedRole}
          onClose={() => setShowModal(false)}
          onSave={(data) => { awardIncentive(data); setShowModal(false) }}
        />
      )}
    </div>
  )
}
