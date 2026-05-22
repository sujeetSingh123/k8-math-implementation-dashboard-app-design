import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, Save, Paperclip } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { instructionalRoutines, ebpComponents, implementationStrategies, implementationTiers } from '../../data/mockData'
import { FidelitySection } from './FidelitySection'
import { AdaptationSubForm } from './AdaptationSubForm'
import type { CoreScores, ExtraScores } from './FidelitySection'
import type { ImplementationLog, Adaptation, FidelityCheck } from '../../types'

const roleColor = roleColors.teacher

type LogForm = {
  date: string
  startTime: string
  instructionalRoutine: string
  ebpComponent: string
  implementationStrategy: string
  durationMinutes: number
  lessonCompletion: 'fully' | 'partially' | 'not_completed'
  notes: string
  plannedVsReactive: 'planned' | 'reactive'
  fidelityType: 'consistent' | 'inconsistent'
  description: string
}

export function DailyLog() {
  const { currentUser, implementationLogs, addLog, addAdaptation, addFidelityCheck } = useAppStore()
  const [tierChips, setTierChips] = useState<string[]>([])
  const [whatModified, setWhatModified] = useState<string[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [adaptationOccurred, setAdaptationOccurred] = useState(false)
  const [fidelity, setFidelity] = useState<CoreScores>({ adherence: 3, dosage: 3, quality: 3, responsiveness: 3, confidence: 3 })
  const [extra, setExtra] = useState<ExtraScores>({ feasibility: 3, acceptability: 3, sustainment: 3 })
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [artifactFile, setArtifactFile] = useState<string | null>(null)
  const artifactRef = useRef<HTMLInputElement>(null)

  const myLogs = implementationLogs.filter(l => l.teacherId === currentUser.id).sort((a, b) => b.date.localeCompare(a.date))
  const lastLog = myLogs[0]

  const { register, handleSubmit, reset } = useForm<LogForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      instructionalRoutine: lastLog?.instructionalRoutine ?? 'Number Sense Warm-up',
      ebpComponent: lastLog?.ebpComponent ?? 'CRA',
      implementationStrategy: lastLog?.implementationStrategy ?? 'Think-aloud',
      durationMinutes: lastLog?.durationMinutes ?? 45,
      lessonCompletion: 'fully',
      plannedVsReactive: 'planned',
      fidelityType: 'consistent',
    },
  })

  const onSubmit = (data: LogForm) => {
    const logId = `log-new-${Date.now()}`

    const newLog: ImplementationLog = {
      id: logId, teacherId: currentUser.id, schoolId: currentUser.schoolId,
      date: data.date, startTime: data.startTime || undefined,
      instructionalRoutine: data.instructionalRoutine, ebpComponent: data.ebpComponent,
      implementationStrategy: data.implementationStrategy,
      tier: (tierChips[0] ?? 'Tier 1') as ImplementationLog['tier'],
      durationMinutes: Number(data.durationMinutes), lessonCompletion: data.lessonCompletion,
      adaptationOccurred, notes: data.notes,
    }
    addLog(newLog)

    const check: FidelityCheck = {
      id: `fid-new-${Date.now()}`, teacherId: currentUser.id, logId, date: data.date,
      adherence: fidelity.adherence, dosage: fidelity.dosage, quality: fidelity.quality,
      responsiveness: fidelity.responsiveness, confidence: fidelity.confidence,
      reflectionNotes: reflectionNotes || undefined,
      feasibility: extra.feasibility, acceptability: extra.acceptability, sustainment: extra.sustainment,
    }
    addFidelityCheck(check)

    if (adaptationOccurred && whatModified.length > 0) {
      const adaptation: Adaptation = {
        id: `adp-new-${Date.now()}`, logId, teacherId: currentUser.id,
        whatModified, reasons, plannedVsReactive: data.plannedVsReactive,
        fidelityType: data.fidelityType, description: data.description, date: data.date,
      }
      addAdaptation(adaptation)
      toast.success('Log, fidelity check, and adaptation saved!')
    } else {
      toast.success('Log and fidelity check saved!')
    }

    reset()
    setTierChips([])
    setWhatModified([])
    setReasons([])
    setAdaptationOccurred(false)
    setFidelity({ adherence: 3, dosage: 3, quality: 3, responsiveness: 3, confidence: 3 })
    setExtra({ feasibility: 3, acceptability: 3, sustainment: 3 })
    setReflectionNotes('')
    setArtifactFile(null)
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
{lastLog && <p className="text-xs text-gray-400">Pre-filled from your last entry on {lastLog.date}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-4">What you taught</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Date</label>
                <input type="date" {...register('date', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Start Time</label>
                <input type="time" {...register('startTime')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Instructional Routine</label>
                <select {...register('instructionalRoutine', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  {instructionalRoutines.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">EBP Component</label>
                <select {...register('ebpComponent', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  {ebpComponents.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Implementation Strategy</label>
                <select {...register('implementationStrategy', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  {implementationStrategies.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Duration (minutes)</label>
                <input type="number" {...register('durationMinutes', { required: true, min: 1, max: 180 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Tier</label>
              <ChipSelector options={implementationTiers} value={tierChips} onChange={setTierChips} roleColor={roleColor} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Lesson Completion</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {([{ v: 'fully', l: 'Fully completed' }, { v: 'partially', l: 'Partially completed' }, { v: 'not_completed', l: 'Not completed' }]).map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" value={v} {...register('lessonCompletion')} className="accent-emerald-500" />{l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Notes (optional)</label>
              <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Any notes about today's lesson..." />
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-4">How well you taught it</p>
          <FidelitySection
            scores={fidelity} onScore={(k, v) => setFidelity(prev => ({ ...prev, [k]: v }))}
            extra={extra} onExtra={(k, v) => setExtra(prev => ({ ...prev, [k]: v }))}
            notes={reflectionNotes} onNotes={setReflectionNotes}
          />
        </Card>

        <Card>
          <AdaptationSubForm
            occurred={adaptationOccurred} onToggle={setAdaptationOccurred}
            whatModified={whatModified} setWhatModified={setWhatModified}
            reasons={reasons} setReasons={setReasons}
            register={register}
          />
        </Card>

        {artifactFile && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <Paperclip size={12} />{artifactFile}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" roleColor={roleColor}><Save size={15} />Save Entry</Button>
          <Button type="button" variant="secondary" roleColor={roleColor} onClick={() => artifactRef.current?.click()}>
            <Upload size={15} />Upload Artifact
          </Button>
          <input ref={artifactRef} type="file" className="hidden" accept=".pdf,.jpg,.png,.doc,.docx"
            onChange={e => { const f = e.target.files?.[0]; if (f) { setArtifactFile(f.name); toast.success(`Artifact attached: ${f.name}`) } }} />
        </div>
      </form>

    </div>
  )
}
