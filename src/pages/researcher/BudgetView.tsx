import { useState, useMemo } from 'react'
import { DollarSign, Plus, BarChart2 } from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { IncentiveModal } from './IncentiveModal'
import type { RecipientRole } from './IncentiveModal'
import { EarningsBreakdown } from './EarningsBreakdown'
import { PendingApprovals } from './PendingApprovals'
import { AwardHistoryTab } from './AwardHistoryTab'
import {
  getSemester, currentSemester, sortSemesters,
  filterLogsBySemester,
  calcTeacherBreakdown, calcCoachBreakdown, calcAdminBreakdown,
} from '../../utils/incentiveCalc'

const roleColor = roleColors.researcher

export function BudgetView() {
  const { currentUser, users, implementationLogs, fidelityChecks, incentives, awardIncentive } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [preselectedId, setPreselectedId] = useState<string | undefined>()
  const [preselectedRole, setPreselectedRole] = useState<RecipientRole>('teacher')
  const [tab, setTab] = useState<'formula' | 'pending' | 'awards'>('formula')

  // ── Semester selector ──────────────────────────────────────────────────────
  const semesters = useMemo(() => {
    const set = new Set<string>([currentSemester()])
    incentives.forEach(i => set.add(getSemester(i.awardedAt)))
    return sortSemesters([...set])
  }, [incentives])

  const [semester, setSemester] = useState(() => currentSemester())

  // ── Data for current semester ──────────────────────────────────────────────
  const semLogs = useMemo(() => filterLogsBySemester(implementationLogs, semester), [implementationLogs, semester])

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users])
  const coaches = useMemo(() => users.filter(u => u.role === 'coach'), [users])
  const admins = useMemo(() => users.filter(u => u.role === 'admin'), [users])

  const formulaTotal = useMemo(() => {
    const t = teachers.reduce((s, u) => s + calcTeacherBreakdown(u, semLogs).total, 0)
    const c = coaches.reduce((s, u) => s + calcCoachBreakdown(u, users, semLogs, fidelityChecks).total, 0)
    const a = admins.reduce((s, u) => s + calcAdminBreakdown(u, users, semLogs).total, 0)
    return t + c + a
  }, [teachers, coaches, admins, users, semLogs, fidelityChecks])

  const semApproved = useMemo(
    () => incentives.filter(i => i.status === 'approved' && getSemester(i.awardedAt) === semester),
    [incentives, semester],
  )
  const semPending = useMemo(
    () => incentives.filter(i => i.status === 'pending' && getSemester(i.awardedAt) === semester),
    [incentives, semester],
  )
  const totalSpent = semApproved.reduce((s, i) => s + i.amount, 0)
  const totalPending = semPending.reduce((s, i) => s + i.amount, 0)
  const pendingCount = incentives.filter(i => i.status === 'pending').length
  const totalAwardedAllTime = useMemo(
    () => incentives.filter(i => i.status === 'approved').reduce((s, i) => s + i.amount, 0),
    [incentives],
  )

  const openModal = (id?: string, role: RecipientRole = 'teacher') => {
    setPreselectedId(id)
    setPreselectedRole(role)
    setShowModal(true)
  }

  const tabBtnCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${active ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
            <DollarSign size={20} style={{ color: roleColor }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Budget & Incentives</h2>
            <p className="text-sm text-gray-500">Semester tracking · Logging incentives</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Awarded</p>
            <p className="text-xl font-bold" style={{ color: roleColor }}>${totalAwardedAllTime.toLocaleString()}</p>
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
      </div>

      {/* Semester selector */}
      <div className="flex gap-2 flex-wrap">
        {semesters.map(s => (
          <button key={s} onClick={() => setSemester(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              semester === s ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={semester === s ? { backgroundColor: roleColor } : undefined}>
            {s}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Earnings Total" value={`$${formulaTotal.toLocaleString()}`} sub={semester} color={roleColor} />
        <StatCard label="Awarded" value={`$${totalSpent.toLocaleString()}`} sub={`${semester} · approved`} color={roleColor} />
        <StatCard label="Pending Approval" value={`$${totalPending.toLocaleString()}`} sub={`${semPending.length} in ${semester}`} color="#F59E0B" />
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button className={tabBtnCls(tab === 'formula')} style={tab === 'formula' ? { backgroundColor: roleColor } : {}} onClick={() => setTab('formula')}>
          <span className="flex items-center gap-1.5"><BarChart2 size={14} /> Earnings</span>
        </button>
        <button className={tabBtnCls(tab === 'pending')} style={tab === 'pending' ? { backgroundColor: '#F59E0B' } : {}} onClick={() => setTab('pending')}>
          <span className="flex items-center gap-1.5"><DollarSign size={14} /> Pending {pendingCount > 0 && <span className="ml-0.5 bg-white text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}</span>
        </button>
        <button className={tabBtnCls(tab === 'awards')} style={tab === 'awards' ? { backgroundColor: roleColor } : {}} onClick={() => setTab('awards')}>
          <span className="flex items-center gap-1.5"><DollarSign size={14} /> Award History</span>
        </button>
      </div>

      {tab === 'formula' && <EarningsBreakdown semester={semester} />}
      {tab === 'pending' && <PendingApprovals semester={semester} />}
      {tab === 'awards' && <AwardHistoryTab semester={semester} />}

      {showModal && (
        <IncentiveModal
          defaultRecipientId={preselectedId}
          defaultRecipientRole={preselectedRole}
          onClose={() => setShowModal(false)}
          onSave={(data) => { awardIncentive(data, currentUser.id); setShowModal(false) }}
        />
      )}
    </div>
  )
}
