import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import type { StudentDataRecord, MeasureType, DataSource } from '../../types'

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
  instructionalSetting: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'SPED'
  measureType: MeasureType
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
  dataSource: DataSource
  notes: string
}

const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'

export function StudentDataUploadModal({ onClose, logId, defaultTier, defaultDate }: {
  onClose: () => void
  logId?: string
  defaultTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'SPED'
  defaultDate?: string
}) {
  const { currentUser, addStudentDataRecord } = useAppStore()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: defaultDate ?? new Date().toISOString().split('T')[0],
      week: 1,
      grade: '',
      instructionalSetting: defaultTier ?? 'Tier 1',
      measureType: 'CBM-Math Concepts & Applications',
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
      dataSource: 'Teacher upload',
      notes: '',
    },
  })

  const onSubmit = (data: FormData) => {
    const record: StudentDataRecord = {
      id: `sdr-${Date.now()}`,
      teacherId: currentUser.id,
      date: data.date,
      week: Number(data.week),
      grade: data.grade || undefined,
      instructionalSetting: data.instructionalSetting,
      measureType: data.measureType,
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
      dataSource: data.dataSource,
      uploadStatus: 'Submitted',
      notes: data.notes || undefined,
      logId,
    }
    addStudentDataRecord(record)
    toast.success('Student data record saved!')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Upload Student Data">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
            <input type="date" {...register('date', { required: true })} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Week #</label>
            <input type="number" min={1} max={36} {...register('week', { required: true, min: 1, max: 36 })} className={cls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Grade</label>
            <input type="text" placeholder="e.g. 4" {...register('grade')} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Instructional Setting</label>
            <select {...register('instructionalSetting', { required: true })} className={cls}>
              {(['Tier 1', 'Tier 2', 'Tier 3', 'SPED'] as const).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Measure Type</label>
          <select {...register('measureType', { required: true })} className={cls}>
            {MEASURE_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Students</label>
            <input type="number" min={0} {...register('studentsCount', { required: true })} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Baseline Avg %</label>
            <input type="number" min={0} max={100} step={0.1} {...register('baselineAvg', { required: true })} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Current Avg %</label>
            <input type="number" min={0} max={100} step={0.1} {...register('currentAvg', { required: true })} className={cls} />
            {errors.currentAvg && <p className="text-xs text-red-500 mt-0.5">Required.</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Median %</label>
            <input type="number" min={0} max={100} step={0.1} {...register('medianPct')} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">At/Above Benchmark %</label>
            <input type="number" min={0} max={100} step={0.1} {...register('atOrAboveBenchmark')} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Below Benchmark %</label>
            <input type="number" min={0} max={100} step={0.1} {...register('belowBenchmark')} className={cls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Intervention Group Avg % <span className="text-gray-400">(optional)</span></label>
            <input type="number" min={0} max={100} step={0.1} {...register('interventionGroupAvg')} className={cls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Comparison Group Avg % <span className="text-gray-400">(optional)</span></label>
            <input type="number" min={0} max={100} step={0.1} {...register('comparisonGroupAvg')} className={cls} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Goal % <span className="text-gray-400">(opt)</span></label>
            <input type="number" min={0} max={100} step={0.1} {...register('goalPct')} className={cls} />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="metGoal" {...register('metGoal')} className="w-4 h-4 accent-emerald-500" />
            <label htmlFor="metGoal" className="text-sm text-gray-700">Met Goal</label>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Data Source</label>
            <select {...register('dataSource', { required: true })} className={cls}>
              {DATA_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Notes <span className="text-gray-400">(optional)</span></label>
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
