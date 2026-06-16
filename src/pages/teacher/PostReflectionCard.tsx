import { useState, forwardRef, useImperativeHandle } from 'react'
import { Card } from '../../components/ui/Card'
import { LikertScale } from '../../components/ui/LikertScale'
import { roleColors } from '../../constants/roles'
import { unplannedAdaptCauseHierarchy } from '../../data/mockData'

const roleColor = roleColors.teacher
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'
const labelCls = 'text-xs font-medium text-gray-600 block mb-1.5'
const req = <span className="text-red-400"> *</span>

const fidelityItems = [
  { key: 'ebpsDelivered' as const, label: 'Planned EBP components were delivered' },
  { key: 'amountDelivered' as const, label: 'Students received the intended amount of instruction' },
  { key: 'studentsEngaged' as const, label: 'Students were actively engaged' },
  { key: 'effectiveDelivery' as const, label: 'The lesson was delivered effectively and as intended' },
]
type FidelityScores = Record<typeof fidelityItems[number]['key'], number>

export type PostReflectionData = {
  date: string; startTime: string; durationMinutes: number
  lessonCompletion: 'fully' | 'partially' | 'not_completed'
  fidelity: FidelityScores
  adaptationImpl?: 'fully' | 'partially' | 'not_implemented'
  adaptationPartialNotes?: string; adaptationNotImplReason?: string
  unexpectedEvent: 'good' | 'bad' | 'none'
  unexpectedDetail?: string; unplannedAdaptCauses: string[]
  studentAvgScore?: number
}

export type PostReflectionRef = { validate: () => boolean; getData: () => PostReflectionData }

type Props = { anticipatesAdaptation: boolean }

export const PostReflectionCard = forwardRef<PostReflectionRef, Props>(({ anticipatesAdaptation }, ref) => {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')
  const [lessonImpl, setLessonImpl] = useState<'fully' | 'partially' | 'not_implemented' | ''>('')
  const [fidelity, setFidelity] = useState<FidelityScores>({ ebpsDelivered: 3, amountDelivered: 3, studentsEngaged: 3, effectiveDelivery: 3 })
  const [adaptImpl, setAdaptImpl] = useState<'fully' | 'partially' | 'not_implemented' | ''>('')
  const [adaptPartialNotes, setAdaptPartialNotes] = useState('')
  const [adaptNotImplReason, setAdaptNotImplReason] = useState('')
  const [unexpected, setUnexpected] = useState<'good' | 'bad' | 'none' | ''>('')
  const [unexpectedDetail, setUnexpectedDetail] = useState('')
  const [adaptCauses, setAdaptCauses] = useState<string[]>([])
  const [studentScore, setStudentScore] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const validate = (): boolean => {
    const errs: string[] = []
    if (!date) errs.push('Date is required.')
    if (!startTime) errs.push('Start time is required.')
    if (!duration || Number(duration) < 1) errs.push('Duration is required.')
    if (!lessonImpl) errs.push('How the lesson was implemented is required.')
    if (anticipatesAdaptation && !adaptImpl) errs.push('Adaptation implementation is required.')
    if (adaptImpl === 'partially' && !adaptPartialNotes.trim()) errs.push('Please describe the partial adaptation details.')
    if (adaptImpl === 'not_implemented' && !adaptNotImplReason.trim()) errs.push('Please provide a reason.')
    if (!unexpected) errs.push('Please indicate if anything unexpected occurred.')
    if ((unexpected === 'good' || unexpected === 'bad') && !unexpectedDetail.trim()) errs.push('Please describe the unexpected event.')
    setErrors(errs)
    return errs.length === 0
  }

  useImperativeHandle(ref, () => ({
    validate,
    getData: () => ({
      date, startTime, durationMinutes: Number(duration),
      lessonCompletion: lessonImpl === 'not_implemented' ? 'not_completed' : lessonImpl as 'fully' | 'partially',
      fidelity,
      adaptationImpl: adaptImpl || undefined,
      adaptationPartialNotes: adaptPartialNotes || undefined,
      adaptationNotImplReason: adaptNotImplReason || undefined,
      unexpectedEvent: unexpected as 'good' | 'bad' | 'none',
      unexpectedDetail: unexpectedDetail || undefined,
      unplannedAdaptCauses: adaptCauses,
      studentAvgScore: studentScore ? Number(studentScore) : undefined,
    }),
  }))

  const toggleCause = (cause: string) =>
    setAdaptCauses(prev => prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause])

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-800 mb-4">Post-Instruction Reflection</p>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg space-y-0.5">
          {errors.map(e => <p key={e} className="text-xs text-red-600">{e}</p>)}
        </div>
      )}
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Date{req}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Start Time{req}</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Duration (min){req}</label>
            <input type="number" min={1} max={180} value={duration} onChange={e => setDuration(e.target.value)} className={inputCls} placeholder="45" />
          </div>
        </div>

        <div>
          <label className={labelCls}>How was the lesson implemented?{req}</label>
          <div className="flex flex-wrap gap-4">
            {[{ v: 'fully', l: 'Fully' }, { v: 'partially', l: 'Partially' }, { v: 'not_implemented', l: 'Not implemented' }].map(({ v, l }) => (
              <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={lessonImpl === v} onChange={() => setLessonImpl(v as typeof lessonImpl)} className="accent-emerald-500" name="lessonImpl" />{l}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className={labelCls}>Fidelity Check <span className="text-gray-400 font-normal">(1 = Not at all, 5 = Completely)</span></p>
          <div className="space-y-4 mt-2">
            {fidelityItems.map(item => (
              <LikertScale key={item.key} label={item.label} value={fidelity[item.key]}
                onChange={v => setFidelity(prev => ({ ...prev, [item.key]: v }))}
                roleColor={roleColor} lowLabel="Not at all" highLabel="Completely" />
            ))}
          </div>
        </div>

        {anticipatesAdaptation && (
          <div className="space-y-2.5">
            <label className={labelCls}>If you pre-planned adaptation, how was the adaptation implemented?{req}</label>
            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={adaptImpl === 'fully'} onChange={() => setAdaptImpl('fully')} className="accent-emerald-500 mt-0.5 flex-shrink-0" name="adaptImpl" />
                <span>Fully</span>
              </label>
              <div>
                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" checked={adaptImpl === 'partially'} onChange={() => setAdaptImpl('partially')} className="accent-emerald-500 mt-0.5 flex-shrink-0" name="adaptImpl" />
                  <span>Partially — please list any adaptation you planned but didn't use, and provide the reason for not using it</span>
                </label>
                {adaptImpl === 'partially' && (
                  <textarea value={adaptPartialNotes} onChange={e => setAdaptPartialNotes(e.target.value)} rows={2}
                    className={`${inputCls} mt-2 ml-5`}
                    placeholder="e.g. Skipped extended time — students finished early; dropped visual aid — ran out of time" />
                )}
              </div>
              <div>
                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" checked={adaptImpl === 'not_implemented'} onChange={() => setAdaptImpl('not_implemented')} className="accent-emerald-500 mt-0.5 flex-shrink-0" name="adaptImpl" />
                  <span>Not implemented — please add the reason</span>
                </label>
                {adaptImpl === 'not_implemented' && (
                  <textarea value={adaptNotImplReason} onChange={e => setAdaptNotImplReason(e.target.value)} rows={2}
                    className={`${inputCls} mt-2 ml-5`}
                    placeholder="e.g. Student behavior required a different approach; time constraints" />
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Did anything unexpected affect implementation today?{req}</label>
          <div className="flex flex-wrap gap-4">
            {[{ v: 'good', l: 'Yes, in a good way' }, { v: 'bad', l: 'Yes, in a bad way' }, { v: 'none', l: 'No unexpected incident' }].map(({ v, l }) => (
              <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={unexpected === v} onChange={() => setUnexpected(v as typeof unexpected)} className="accent-emerald-500" name="unexpected" />{l}
              </label>
            ))}
          </div>
          {(unexpected === 'good' || unexpected === 'bad') && (
            <textarea value={unexpectedDetail} onChange={e => setUnexpectedDetail(e.target.value)} rows={2} className={`${inputCls} mt-3`}
              placeholder="Please describe what happened..." />
          )}
        </div>

        {(unexpected === 'good' || unexpected === 'bad') && (
          <div>
            <label className={labelCls}>What caused the unplanned adaptation? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
            <div className="space-y-3 mt-1">
              {unplannedAdaptCauseHierarchy.map(cat => (
                <div key={cat.id}>
                  <p className="text-xs font-semibold text-gray-600 mb-1">{cat.label}</p>
                  <div className="pl-3 flex flex-wrap gap-x-5 gap-y-1.5">
                    {cat.reasons.map(r => (
                      <label key={r} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={adaptCauses.includes(r)} onChange={() => toggleCause(r)} className="accent-emerald-500" />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>If students had an assessment today, what is their average score? <span className="text-gray-400 font-normal">(optional, 0–100 — saved to student data)</span></label>
          <input type="number" min={0} max={100} value={studentScore} onChange={e => setStudentScore(e.target.value)}
            className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="e.g. 78" />
        </div>
      </div>
    </Card>
  )
})

PostReflectionCard.displayName = 'PostReflectionCard'
