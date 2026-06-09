import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, Save, Paperclip } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { EBPSelector } from '../../components/ui/EBPSelector'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { instructionalRoutines, implementationStrategies, implementationTiers, instructionalSettings } from '../../data/mockData'
import { FidelitySection } from './FidelitySection'
import { AdaptationSubForm } from './AdaptationSubForm'
import { StudentPerfSummary } from './StudentPerfSummary'
import type { CoreScores, ExtraScores } from './FidelitySection'
import type { ImplementationLog, Adaptation, FidelityCheck } from '../../types'

const roleColor = roleColors.teacher
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'
const labelCls = 'text-xs font-medium text-gray-600 block mb-1.5'

type LogForm = {
  sessionGoal: string; preInstructionNotes: string; date: string; startTime: string
  instructionalRoutine: string; implementationStrategy: string; durationMinutes: number
  lessonCompletion: 'fully' | 'partially' | 'not_completed'; notes: string
  plannedVsReactive: 'planned' | 'reactive'; fidelityType: 'consistent' | 'inconsistent'
  description: string; coachMessage: string
}

export function DailyLog() {
  const { currentUser, implementationLogs, addLog, addAdaptation, addFidelityCheck, pendingPlan, setPendingPlan, updateLessonPlan } = useAppStore()
  const myLogs = implementationLogs.filter(l => l.teacherId === currentUser.id).sort((a, b) => b.date.localeCompare(a.date))
  const lastLog = myLogs[0]
  const fromPlan = pendingPlan !== null

  const [tierChips, setTierChips] = useState<string[]>(() => pendingPlan ? [pendingPlan.tier] : [])
  const [settingChips, setSettingChips] = useState<string[]>(() => pendingPlan?.instructionalSetting ? [pendingPlan.instructionalSetting] : ['General Education'])
  const [selectedEBPs, setSelectedEBPs] = useState<string[]>([])
  const [ebpChips, setEbpChips] = useState<string[]>(() => pendingPlan ? pendingPlan.ebpComponent : lastLog?.ebpComponent ?? [])
  const [whatModified, setWhatModified] = useState<string[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [adaptationOccurred, setAdaptationOccurred] = useState(false)
  const [fidelity, setFidelity] = useState<CoreScores>({ adherence: 3, dosage: 3, quality: 3, responsiveness: 3, confidence: 3 })
  const [extra, setExtra] = useState<ExtraScores>({ feasibility: 3, acceptability: 3, sustainment: 3 })
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [artifactFile, setArtifactFile] = useState<string | null>(null)
  const artifactRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset } = useForm<LogForm>({
    defaultValues: fromPlan ? {
      sessionGoal: pendingPlan!.goal ?? '', preInstructionNotes: '', date: pendingPlan!.plannedDate,
      startTime: pendingPlan!.plannedTime ?? '', instructionalRoutine: pendingPlan!.instructionalRoutine,
      implementationStrategy: pendingPlan!.implementationStrategy, durationMinutes: pendingPlan!.plannedDurationMinutes,
      lessonCompletion: 'fully', plannedVsReactive: 'planned', fidelityType: 'consistent', coachMessage: '',
    } : {
      sessionGoal: '', preInstructionNotes: '', date: new Date().toISOString().split('T')[0], startTime: '',
      instructionalRoutine: lastLog?.instructionalRoutine ?? 'Number Sense Warm-up',
      implementationStrategy: lastLog?.implementationStrategy ?? 'Think-aloud',
      durationMinutes: lastLog?.durationMinutes ?? 45,
      lessonCompletion: 'fully', plannedVsReactive: 'planned', fidelityType: 'consistent', coachMessage: '',
    },
  })

  const onSubmit = (data: LogForm) => {
    const logId = `log-new-${Date.now()}`
    const combinedNotes = [
      data.sessionGoal && `Goal: ${data.sessionGoal}`,
      data.preInstructionNotes && `Pre-plan: ${data.preInstructionNotes}`,
      data.notes,
    ].filter(Boolean).join('\n').trim()
    const newLog: ImplementationLog = {
      id: logId, teacherId: currentUser.id, schoolId: currentUser.schoolId,
      date: data.date, startTime: data.startTime || undefined,
      instructionalRoutine: data.instructionalRoutine, ebpComponent: ebpChips,
      implementationStrategy: data.implementationStrategy,
      tier: (tierChips[0] ?? 'Tier 1') as ImplementationLog['tier'],
      instructionalSetting: (settingChips[0] ?? 'General Education') as ImplementationLog['instructionalSetting'],
      durationMinutes: Number(data.durationMinutes), lessonCompletion: data.lessonCompletion,
      adaptationOccurred, notes: combinedNotes,
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
    } else if (data.coachMessage.trim()) {
      toast.success('Log saved and message sent to coach!')
    } else {
      toast.success(`Log and fidelity check saved${fromPlan ? ' — plan marked complete!' : '!'}`)
    }
    if (fromPlan && pendingPlan) { updateLessonPlan(pendingPlan.id, { status: 'logged', logId }); setPendingPlan(null) }
    reset()
    setTierChips([]); setSettingChips(['General Education']); setSelectedEBPs([]); setEbpChips([])
    setWhatModified([]); setReasons([]); setAdaptationOccurred(false)
    setFidelity({ adherence: 3, dosage: 3, quality: 3, responsiveness: 3, confidence: 3 })
    setExtra({ feasibility: 3, acceptability: 3, sustainment: 3 })
    setReflectionNotes(''); setArtifactFile(null)
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {fromPlan
        ? <p className="text-xs text-emerald-600 font-medium">Pre-filled from your plan for {pendingPlan!.plannedDate}</p>
        : lastLog && <p className="text-xs text-gray-400">Pre-filled from your last entry on {lastLog.date}</p>
      }
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-4">Pre-Instruction Planning</p>
          <div className="space-y-4">
            <div><label className={labelCls}>Session Goal / Learning Objective</label>
              <input type="text" {...register('sessionGoal')} className={inputCls} /></div>
            <div><label className={labelCls}>Pre-Instruction Notes (optional)</label>
              <textarea {...register('preInstructionNotes')} rows={2} className={inputCls} placeholder="What are you planning to do? Any materials or preparations?" /></div>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-4">Instructional Implementation</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Date</label>
                <input type="date" {...register('date', { required: true })} className={inputCls} /></div>
              <div><label className={labelCls}>Start Time</label>
                <input type="time" {...register('startTime')} className={inputCls} /></div>
              <div><label className={labelCls}>Instructional Routine</label>
                <select {...register('instructionalRoutine', { required: true })} className={inputCls}>
                  {instructionalRoutines.map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label className={labelCls}>Implementation Strategy</label>
                <select {...register('implementationStrategy', { required: true })} className={inputCls}>
                  {implementationStrategies.map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label className={labelCls}>Duration (minutes)</label>
                <input type="number" {...register('durationMinutes', { required: true, min: 1, max: 180 })} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>MTSS Tier</label>
              <ChipSelector options={implementationTiers} value={tierChips} onChange={setTierChips} roleColor={roleColor} /></div>
            <div><label className={labelCls}>Instructional Setting</label>
              <ChipSelector options={instructionalSettings} value={settingChips} onChange={setSettingChips} roleColor={roleColor} /></div>
            <div><label className={labelCls}>EBP Selection</label>
              <EBPSelector selectedEBPs={selectedEBPs} selectedComponents={ebpChips} onChangeEBPs={setSelectedEBPs} onChangeComponents={setEbpChips} roleColor={roleColor} /></div>
            <div>
              <label className={labelCls}>Lesson Completion</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {([{ v: 'fully', l: 'Fully completed' }, { v: 'partially', l: 'Partially completed' }, { v: 'not_completed', l: 'Not completed' }]).map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" value={v} {...register('lessonCompletion')} className="accent-emerald-500" />{l}
                  </label>
                ))}
              </div>
            </div>
            <div><label className={labelCls}>Notes (optional)</label>
              <textarea {...register('notes')} rows={2} className={inputCls} placeholder="Any notes about today's lesson..." /></div>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-4">Post Instruction Reflections</p>
          <FidelitySection scores={fidelity} onScore={(k, v) => setFidelity(prev => ({ ...prev, [k]: v }))}
            extra={extra} onExtra={(k, v) => setExtra(prev => ({ ...prev, [k]: v }))}
            notes={reflectionNotes} onNotes={setReflectionNotes} />
        </Card>
        <Card>
          <AdaptationSubForm occurred={adaptationOccurred} onToggle={setAdaptationOccurred}
            whatModified={whatModified} setWhatModified={setWhatModified}
            reasons={reasons} setReasons={setReasons} register={register} />
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-4">Coach Communication</p>
          <div><label className={labelCls}>Message to Coach (optional)</label>
            <textarea {...register('coachMessage')} rows={3} className={inputCls} placeholder="Share any questions, wins, or challenges with your coach..." /></div>
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
      <StudentPerfSummary />
    </div>
  )
}
