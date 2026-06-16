import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { implementationTiers, instructionalSettings } from '../../data/mockData'
import type { StudentDataRecord, MeasureType, DataSource, InstructionalSetting } from '../../types'

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

const DATA_SOURCES: DataSource[] = ['Teacher upload', 'Research team entry', 'Data system import']

type FormData = {
  date: string
  week: number
  grade: string
  studentsCount: number
  baselineAvg: number
  currentAvg: number
  medianPct: number
  atOrAboveBenchmark: number
  belowBenchmark: number
  interventionGroupAvg: string
  comparisonGroupAvg: string
  goalPct: string
  metGoal: boolean
  notes: string
}

const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'
const lbl = 'text-xs font-medium text-gray-600 block mb-1.5'

export function StudentDataUploadModal({ onClose, logId, defaultTier, defaultDate }: {
  onClose: () => void
  logId?: string
  defaultTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Special Education'
  defaultDate?: string
}) {
  const { currentUser, addStudentDataRecord } = useAppStore()

  const [mtssTier, setMtssTier] = useState<string[]>([defaultTier ?? 'Tier 1'])
  const [setting, setSetting] = useState<string[]>(['General Education'])
  const [measureType, setMeasureType] = useState<string[]>(['CBM-Math Concepts & Applications'])
  const [dataSource, setDataSource] = useState<string[]>(['Teacher upload'])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: defaultDate ?? new Date().toISOString().split('T')[0],
      week: 1,
      grade: '',
      studentsCount: 0,
      baselineAvg: 0,
      currentAvg: 0,
      medianPct: 0,
      atOrAboveBenchmark: 0,
      belowBenchmark: 0,
      interventionGroupAvg: '',
      comparisonGroupAvg: '',
      goalPct: '',
      metGoal: false,
      notes: '',
    },
  })

  const onSubmit = (data: FormData) => {
    const tier = (mtssTier[0] ?? 'Tier 1') as 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Special Education'
    const researchExportId = `EXP-${currentUser.schoolId}-${currentUser.id}-${tier.replace(' ', '')}-W${String(data.week).padStart(2, '0')}`
    const record: StudentDataRecord = {
      id: `sdr-${Date.now()}`,
      teacherId: currentUser.id,
      schoolId: currentUser.schoolId,
      date: data.date,
      week: Number(data.week),
      grade: data.grade || undefined,
      mtssTier: tier,
      instructionalSetting: (setting[0] ?? 'General Education') as InstructionalSetting,
      measureType: (measureType[0] ?? 'CBM-Math Concepts & Applications') as MeasureType,
      studentsCount: Number(data.studentsCount),
      baselineAvg: Number(data.baselineAvg),
      currentAvg: Number(data.currentAvg),
      growth: Number(data.currentAvg) - Number(data.baselineAvg),
      medianPct: Number(data.medianPct),
      atOrAboveBenchmark: Number(data.atOrAboveBenchmark),
      belowBenchmark: Number(data.belowBenchmark),
      interventionGroupAvg: data.interventionGroupAvg !== '' ? Number(data.interventionGroupAvg) : undefined,
      comparisonGroupAvg: data.comparisonGroupAvg !== '' ? Number(data.comparisonGroupAvg) : undefined,
      goalPct: data.goalPct !== '' ? Number(data.goalPct) : undefined,
      metGoal: data.metGoal,
      dataSource: (dataSource[0] ?? 'Teacher upload') as DataSource,
      uploadStatus: 'Submitted',
      researchExportId,
      notes: data.notes || undefined,
      logId,
    }
    addStudentDataRecord(record)
    toast.success('Student data record saved!')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Upload Student Data">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Date / Week / Grade */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={lbl}>Date</label>
            <input type="date" {...register('date', { required: true })} className={cls} />
          </div>
          <div>
            <label className={lbl}>Week #</label>
            <input type="number" min={1} max={36} {...register('week', { required: true, min: 1, max: 36 })} className={cls} />
          </div>
          <div>
            <label className={lbl}>Grade</label>
            <input type="text" placeholder="e.g. 4" {...register('grade')} className={cls} />
          </div>
        </div>

        {/* MTSS Tier */}
        <div>
          <label className={lbl}>MTSS Tier</label>
          <ChipSelector options={implementationTiers} value={mtssTier} onChange={setMtssTier} roleColor={roleColor} />
        </div>

        {/* Instructional Setting */}
        <div>
          <label className={lbl}>Instructional Setting</label>
          <ChipSelector options={instructionalSettings} value={setting} onChange={setSetting} roleColor={roleColor} />
        </div>

        {/* Measure Type */}
        <div>
          <label className={lbl}>Measure Type</label>
          <ChipSelector options={MEASURE_TYPES} value={measureType} onChange={setMeasureType} roleColor={roleColor} />
        </div>

        {/* Core metrics */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Class Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Students Count</label>
              <input type="number" min={0} {...register('studentsCount', { required: true })} className={cls} />
            </div>
            <div>
              <label className={lbl}>Baseline Avg %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('baselineAvg', { required: true })} className={cls} />
            </div>
            <div>
              <label className={lbl}>Current Avg %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('currentAvg', { required: true })} className={cls} />
              {errors.currentAvg && <p className="text-xs text-red-500 mt-0.5">Required.</p>}
            </div>
            <div>
              <label className={lbl}>Median %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('medianPct')} className={cls} />
            </div>
            <div>
              <label className={lbl}>At / Above Benchmark %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('atOrAboveBenchmark')} className={cls} />
            </div>
            <div>
              <label className={lbl}>Below Benchmark %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('belowBenchmark')} className={cls} />
            </div>
          </div>
        </div>

        {/* Group comparisons */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Group Comparisons <span className="font-normal normal-case text-gray-400">(optional)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Intervention Group Avg %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('interventionGroupAvg')} className={cls} />
            </div>
            <div>
              <label className={lbl}>Comparison Group Avg %</label>
              <input type="number" min={0} max={100} step={0.1} {...register('comparisonGroupAvg')} className={cls} />
            </div>
          </div>
        </div>

        {/* Goal */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Goal</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Goal % <span className="font-normal text-gray-400">(optional)</span></label>
              <input type="number" min={0} max={100} step={0.1} {...register('goalPct')} className={cls} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="metGoal" {...register('metGoal')} className="w-4 h-4 accent-emerald-500" />
              <label htmlFor="metGoal" className="text-sm text-gray-700">Met Goal</label>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div>
          <label className={lbl}>Data Source</label>
          <ChipSelector options={DATA_SOURCES} value={dataSource} onChange={setDataSource} roleColor={roleColor} />
        </div>

        {/* Notes */}
        <div>
          <label className={lbl}>Notes <span className="font-normal text-gray-400">(optional)</span></label>
          <textarea rows={2} {...register('notes')} placeholder="Any observations or context…"
            className={`${cls} resize-none`} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button roleColor={roleColor} type="submit"><Upload size={14} />Save Record</Button>
          <Button variant="ghost" roleColor={roleColor} onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
