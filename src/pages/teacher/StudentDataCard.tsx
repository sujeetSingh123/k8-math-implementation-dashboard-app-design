import { useState } from 'react'
import { Save } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { StudentDataUploadModal } from './StudentDataUploadModal'
import type { MeasureType } from '../../types'

const roleColor = roleColors.teacher

const MEASURE_TYPES: MeasureType[] = [
  'CBM-Math Concepts & Applications',
  'Unit Assessment',
  'CBM-Math Computation',
  'Goal-Specific Progress Monitoring',
  'IEP Math Goal Probe',
  'Intervention Skill Probe',
  'Intensive Intervention Probe',
]

export function StudentDataCard({ logId, defaultTier, defaultDate }: {
  logId?: string
  defaultTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'SPED'
  defaultDate?: string
}) {
  const { currentUser, addStudentDataRecord } = useAppStore()
  const [measureType, setMeasureType] = useState<MeasureType>('CBM-Math Concepts & Applications')
  const [currentAvg, setCurrentAvg] = useState('')
  const [showFull, setShowFull] = useState(false)

  const handleQuickSave = () => {
    if (!currentAvg) { toast.warning('Enter a score value before saving.'); return }
    addStudentDataRecord({
      id: `sdr-${Date.now()}`,
      teacherId: currentUser.id,
      date: defaultDate ?? new Date().toISOString().split('T')[0],
      mtssTier: defaultTier ?? 'Tier 1',
      measureType,
      currentAvg: Number(currentAvg),
      dataSource: 'Teacher upload',
      uploadStatus: 'Submitted',
      logId,
    })
    toast.success(`${measureType} score of ${currentAvg}% recorded.`)
    setCurrentAvg('')
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-800 mb-3">Student Data Upload</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <select value={measureType} onChange={e => setMeasureType(e.target.value as MeasureType)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          {MEASURE_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="number" placeholder="Current class avg %" value={currentAvg}
          onChange={e => setCurrentAvg(e.target.value)} min={0} max={100} step={0.1}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" roleColor={roleColor} size="sm" onClick={handleQuickSave}>
          <Save size={14} />Quick Save
        </Button>
        <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => setShowFull(true)}>
          Full Form
        </Button>
      </div>
      {showFull && (
        <StudentDataUploadModal
          onClose={() => setShowFull(false)}
          logId={logId}
          defaultTier={defaultTier}
          defaultDate={defaultDate}
        />
      )}
    </Card>
  )
}
