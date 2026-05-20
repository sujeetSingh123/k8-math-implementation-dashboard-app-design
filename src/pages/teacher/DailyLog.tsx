import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { AlertTriangle, Upload, Save, Paperclip } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { instructionalRoutines, ebpComponents, implementationStrategies, implementationTiers, modificationOptions, adaptationReasons } from '../../data/mockData'
import type { ImplementationLog, Adaptation } from '../../types'

const roleColor = roleColors.teacher

type LogForm = {
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

function AdaptationSubForm({
  whatModified, setWhatModified, reasons, setReasons, register,
}: {
  whatModified: string[]; setWhatModified: (v: string[]) => void
  reasons: string[]; setReasons: (v: string[]) => void
  register: ReturnType<typeof useForm<LogForm>>['register']
}) {
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
      <p className="text-sm font-semibold text-amber-800">Adaptation Details (FRAME-IS)</p>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">What was modified</label>
        <ChipSelector options={modificationOptions} value={whatModified} onChange={setWhatModified} roleColor={roleColor} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Reason(s)</label>
        <ChipSelector options={adaptationReasons} value={reasons} onChange={setReasons} roleColor={roleColor} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Planned or Reactive</label>
          <div className="flex gap-3 flex-wrap">
            {(['planned','reactive'] as const).map(v => (
              <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" value={v} {...register('plannedVsReactive')} className="accent-emerald-500" />
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Fidelity Type</label>
          <div className="flex gap-3 flex-wrap">
            {(['consistent','inconsistent'] as const).map(v => (
              <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" value={v} {...register('fidelityType')} className="accent-emerald-500" />
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Brief Description (optional)</label>
        <textarea {...register('description')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Describe the adaptation..." />
      </div>
    </div>
  )
}

export function DailyLog() {
  const { currentUser, implementationLogs, addLog, addAdaptation } = useAppStore()
  const [tierChips, setTierChips] = useState<string[]>([])
  const [whatModified, setWhatModified] = useState<string[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [adaptationOccurred, setAdaptationOccurred] = useState(false)
  const [artifactFile, setArtifactFile] = useState<string | null>(null)
  const [dataFile, setDataFile] = useState<string | null>(null)
  const [dataScore, setDataScore] = useState('')
  const [dataType, setDataType] = useState('Class Average')
  const [dataDate, setDataDate] = useState(new Date().toISOString().split('T')[0])
  const artifactRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)

  const myLogs = implementationLogs.filter(l => l.teacherId === currentUser.id).sort((a,b) => b.date.localeCompare(a.date))
  const lastLog = myLogs[0]
  const daysSinceLog = lastLog ? Math.floor((Date.now() - new Date(lastLog.date).getTime()) / 86400000) : 99

  const { register, handleSubmit, reset } = useForm<LogForm>({
    defaultValues: {
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
      date: new Date().toISOString().split('T')[0],
      instructionalRoutine: data.instructionalRoutine, ebpComponent: data.ebpComponent,
      implementationStrategy: data.implementationStrategy,
      tier: (tierChips[0] ?? 'Tier 1') as ImplementationLog['tier'],
      durationMinutes: Number(data.durationMinutes), lessonCompletion: data.lessonCompletion,
      adaptationOccurred, notes: data.notes,
    }
    addLog(newLog)
    if (adaptationOccurred && whatModified.length > 0) {
      const adaptation: Adaptation = {
        id: `adp-new-${Date.now()}`, logId, teacherId: currentUser.id,
        whatModified, reasons, plannedVsReactive: data.plannedVsReactive,
        fidelityType: data.fidelityType, description: data.description,
        date: new Date().toISOString().split('T')[0],
      }
      addAdaptation(adaptation)
      toast.success('Log and adaptation saved!')
    } else {
      toast.success('Implementation log saved successfully!')
    }
    reset()
    setTierChips([])
    setWhatModified([])
    setReasons([])
    setAdaptationOccurred(false)
    setArtifactFile(null)
  }

  const handleArtifact = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArtifactFile(file.name)
      toast.success(`Artifact attached: ${file.name}`)
    }
  }

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDataFile(file.name)
      toast.info(`Parsing ${file.name}…`)
      setTimeout(() => toast.success('Student data uploaded successfully!'), 1000)
    }
  }

  const handleManualUpload = () => {
    if (!dataScore) { toast.warning('Enter a score value before uploading.'); return }
    toast.success(`${dataType} score of ${dataScore} recorded for ${dataDate}`)
    setDataScore('')
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {daysSinceLog >= 2 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">Implementation log missing for {daysSinceLog} days</p>
        </div>
      )}
      {lastLog && <p className="text-xs text-gray-400">Pre-filled from your last entry on {lastLog.date}</p>}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Instructional Routine</label>
              <select {...register('instructionalRoutine',{required:true})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                {instructionalRoutines.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">EBP Component</label>
              <select {...register('ebpComponent',{required:true})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                {ebpComponents.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Implementation Strategy</label>
              <select {...register('implementationStrategy',{required:true})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                {implementationStrategies.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Duration (minutes)</label>
              <input type="number" {...register('durationMinutes',{required:true,min:1,max:180})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Tier</label>
            <ChipSelector options={implementationTiers} value={tierChips} onChange={setTierChips} roleColor={roleColor} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Lesson Completion</label>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {[{v:'fully',l:'Fully completed'},{v:'partially',l:'Partially completed'},{v:'not_completed',l:'Not completed'}].map(({v,l})=>(
                <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" value={v} {...register('lessonCompletion')} className="accent-emerald-500" />{l}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Adaptation Occurred?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={adaptationOccurred} onChange={() => setAdaptationOccurred(true)} className="accent-emerald-500" name="adaptToggle" />Yes
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={!adaptationOccurred} onChange={() => setAdaptationOccurred(false)} className="accent-emerald-500" name="adaptToggle" />No
              </label>
            </div>
            {adaptationOccurred && (
              <AdaptationSubForm whatModified={whatModified} setWhatModified={setWhatModified} reasons={reasons} setReasons={setReasons} register={register} />
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Notes (optional)</label>
            <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Any notes about today's lesson..." />
          </div>
          {artifactFile && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              <Paperclip size={12} />{artifactFile}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" roleColor={roleColor}><Save size={15}/>Save Log</Button>
            <Button type="button" variant="secondary" roleColor={roleColor} onClick={() => artifactRef.current?.click()}>
              <Upload size={15}/>Upload Artifact
            </Button>
            <input ref={artifactRef} type="file" className="hidden" accept=".pdf,.jpg,.png,.doc,.docx" onChange={handleArtifact} />
          </div>
        </form>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-gray-800 mb-3">Student Data Upload</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <select value={dataType} onChange={e => setDataType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Class Average</option><option>Progress Monitoring</option><option>Benchmark Score</option>
          </select>
          <input type="date" value={dataDate} onChange={e => setDataDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Score / Value" value={dataScore} onChange={e => setDataScore(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        {dataFile && <p className="text-xs text-emerald-600 mb-2">File: {dataFile}</p>}
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" roleColor={roleColor} size="sm" onClick={handleManualUpload}>
            <Save size={14}/>Record Score
          </Button>
          <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => csvRef.current?.click()}>
            <Upload size={14}/>Upload CSV
          </Button>
          <input ref={csvRef} type="file" className="hidden" accept=".csv" onChange={handleCSV} />
        </div>
      </Card>
    </div>
  )
}
