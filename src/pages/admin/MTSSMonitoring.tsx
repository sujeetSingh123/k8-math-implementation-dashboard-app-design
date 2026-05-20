import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Settings } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../store/useToastStore'
import { useAppStore } from '../../store/useAppStore'
import { monthlyFidelityTrend } from '../../data/mockData'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.admin

type IndicatorDetail = { label: string; value: number; note: string; status: 'green' | 'amber' | 'red' }

const capacityMeta: Record<string, { status: 'green' | 'amber' | 'red'; note: string }> = {
  'Leadership Support': { status: 'amber', note: 'Principal walkthrough frequency correlates with fidelity. Sites with bi-weekly walkthroughs show 18% higher log completion. Additional data literacy PD requested for Q4.' },
  'Coaching Access': { status: 'green', note: '4 of 5 coaches have full caseloads. One vacancy is being filled for fall. Current coaches averaging 6 hrs/month contact per teacher.' },
  'Staffing Stability': { status: 'amber', note: 'Jefferson Elementary had 3 staff changes this semester, directly impacting implementation continuity and log completion rates.' },
  'MTSS Maturity': { status: 'red', note: 'Washington and Jefferson are in early implementation phase. Both sites flagged as priority for Q4 intensive coaching visits and leadership alignment.' },
  'Resource Availability': { status: 'green', note: 'Curricular materials available at all sites. Stipend budget approved for 2 additional PD days. Substitute coverage confirmed for training dates.' },
  'Implementation Climate': { status: 'amber', note: 'Staff surveys indicate moderate support for MTSS. Leadership alignment sessions planned for Q4 to strengthen buy-in across all sites.' },
}

const tierMeta: Record<string, { status: 'green' | 'amber' | 'red'; note: string }> = {
  'Tier 1 (Universal)': { status: 'green', note: '88% of students receiving core instruction with documented fidelity. Strong district baseline — Lincoln leads at 94%.' },
  'Tier 2 (Targeted)': { status: 'amber', note: '71% of Tier 2-identified students receiving targeted interventions. 3 schools meeting benchmark; Jefferson is below 60%.' },
  'Tier 3 (Intensive)': { status: 'amber', note: '45% of intensive-need students receiving individualized support — below the district target of 70%. Needs immediate attention.' },
  'SPED Services': { status: 'red', note: 'Only 38% of SPED students have co-teaching or push-in services logged. Coordination with special ed coordinator required.' },
}

interface ProgressBarProps { label: string; value: number; color?: string; onClick?: () => void }

function ProgressBar({ label, value, color = roleColor, onClick }: ProgressBarProps) {
  return (
    <div className={`space-y-1 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm text-gray-700 truncate">{label}</span>
        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const tierCoverage = [
  { label: 'Tier 1 (Universal)', value: 88, color: '#10B981' },
  { label: 'Tier 2 (Targeted)', value: 71, color: '#3B82F6' },
  { label: 'Tier 3 (Intensive)', value: 45, color: '#F59E0B' },
  { label: 'SPED Services', value: 38, color: '#8B5CF6' },
]

export function MTSSMonitoring() {
  const { determinants, updateDeterminant } = useAppStore()
  const [detail, setDetail] = useState<IndicatorDetail | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({ ...determinants })

  const capacityIndicators = Object.entries(determinants).map(([label, value]) => ({ label, value }))

  const trendData = monthlyFidelityTrend.map(m => ({
    month: m.month,
    'Avg Fidelity': parseFloat(((m.adherence + m.dosage + m.quality + m.responsiveness + m.confidence) / 5).toFixed(2)),
  }))

  const handleSaveEdits = () => {
    Object.entries(sliderValues).forEach(([key, val]) => updateDeterminant(key, val))
    toast.success('Capacity indicators updated.')
    setEditOpen(false)
  }

  const openEdit = () => {
    setSliderValues({ ...determinants })
    setEditOpen(true)
  }

  return (
    <div className="space-y-4">
      {capacityIndicators.some(c => c.value < 65) && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm cursor-pointer"
          onClick={() => toast.warning('MTSS Maturity and Staffing Stability are below 65% — review flagged indicators.')}>
          <AlertTriangle size={15} className="flex-shrink-0" />
          Some capacity indicators are below 65% — click for details.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Capacity Indicators</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" roleColor={roleColor} onClick={openEdit}>
                <Settings size={13} />Edit Indicators
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {capacityIndicators.map(ci => {
              const meta = capacityMeta[ci.label]
              return (
                <ProgressBar key={ci.label} label={ci.label} value={ci.value}
                  onClick={() => meta && setDetail({ label: ci.label, value: ci.value, ...meta })} />
              )
            })}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Tier Coverage</h2>
            <button onClick={() => toast.info('Tier coverage shows the % of students at each level receiving documented support.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">What's this?</button>
          </div>
          <div className="space-y-4">
            {tierCoverage.map(tc => (
              <ProgressBar key={tc.label} label={tc.label} value={tc.value} color={tc.color}
                onClick={() => setDetail({ label: tc.label, value: tc.value, ...tierMeta[tc.label] })} />
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">District-Wide Implementation Health (Sep–May)</h2>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => toast.info('Generating implementation health trend report PDF…')}>Export</Button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} onClick={d => { if (d?.activeLabel) toast.info(`${d.activeLabel}: Avg Fidelity ${trendData.find(t => t.month === d.activeLabel)?.['Avg Fidelity'] ?? '—'}`) }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="Avg Fidelity" stroke={roleColor} strokeWidth={2.5} dot={{ r: 4, fill: roleColor }} activeDot={{ r: 6, cursor: 'pointer' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {detail && (
        <Modal open onClose={() => setDetail(null)} title={detail.label}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-800">{detail.value}%</span>
              <Badge color={detail.status}>{detail.status === 'green' ? 'On Track' : detail.status === 'amber' ? 'Monitor' : 'Needs Attention'}</Badge>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${detail.value}%`, backgroundColor: detail.status === 'green' ? '#10B981' : detail.status === 'amber' ? '#F59E0B' : '#EF4444' }} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{detail.note}</p>
            <div className="flex flex-wrap gap-2">
              <Button roleColor={roleColor} onClick={() => { toast.success('Action item logged for this indicator.'); setDetail(null) }}>Log Action</Button>
              <Button variant="secondary" roleColor={roleColor} onClick={() => { toast.info('Pulling school-level breakdown for this indicator…'); setDetail(null) }}>View by School</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal open onClose={() => setEditOpen(false)} title="Edit Capacity Indicators">
          <div className="space-y-5">
            {Object.entries(sliderValues).map(([key, val]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">{key}</label>
                  <span className="text-sm font-bold text-gray-800 w-10 text-right">{val}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={e => setSliderValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: roleColor }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button roleColor={roleColor} onClick={handleSaveEdits}>Save Changes</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
