import { useState, forwardRef, useImperativeHandle } from 'react'
import { Card } from '../../components/ui/Card'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { EBPSelector } from '../../components/ui/EBPSelector'
import { roleColors } from '../../constants/roles'
import { plannedAdaptationTypes } from '../../data/mockData'
import type { ImplementationLog } from '../../types'

const roleColor = roleColors.teacher
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'
const labelCls = 'text-xs font-medium text-gray-600 block mb-1.5'
const req = <span className="text-red-400"> *</span>

const MTSS_TIERS: ImplementationLog['tier'][] = ['Tier 1', 'Tier 2', 'Tier 3', 'Special Education']

export type PrePlanData = {
  sectionName: string
  tiers: ImplementationLog['tier'][]
  mathSkill: string
  groupSize: string
  selectedEBPs: string[]
  ebpComponents: string[]
  anticipatesAdaptation: boolean
  plannedAdaptationTypes: string[]
}

export type PrePlanRef = { validate: () => boolean; getData: () => PrePlanData }

type Props = { onAnticipatesChange?: (v: boolean | null) => void }

export const PrePlanCard = forwardRef<PrePlanRef, Props>(({ onAnticipatesChange }, ref) => {
  const [sectionName, setSectionName] = useState('')
  const [tier, setTier] = useState<string[]>([])
  const [mathSkill, setMathSkill] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [selectedEBPs, setSelectedEBPs] = useState<string[]>([])
  const [ebpComponents, setEbpComponents] = useState<string[]>([])
  const [anticipates, setAnticipates] = useState<boolean | null>(null)
  const [adaptTypes, setAdaptTypes] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const validate = (): boolean => {
    const errs: string[] = []
    if (!tier.length) errs.push('Select at least one MTSS Tier.')
    if (!mathSkill.trim()) errs.push('Math Skill is required.')
    if (!groupSize.trim()) errs.push('Group Size is required.')
    if (ebpComponents.length === 0) errs.push('Select at least one EBP component.')
    if (anticipates === null) errs.push('Please indicate if you anticipate adapting EBPs.')
    if (anticipates && adaptTypes.length === 0) errs.push('Select what will be adapted.')
    setErrors(errs)
    return errs.length === 0
  }

  useImperativeHandle(ref, () => ({
    validate,
    getData: () => ({
      sectionName, tiers: tier as ImplementationLog['tier'][],
      mathSkill, groupSize, selectedEBPs, ebpComponents,
      anticipatesAdaptation: anticipates ?? false, plannedAdaptationTypes: adaptTypes,
    }),
  }))

  const handleAnticipates = (v: boolean) => {
    setAnticipates(v)
    onAnticipatesChange?.(v)
  }

  const toggleAdaptType = (opt: string) =>
    setAdaptTypes(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-800 mb-4">Pre-Instruction Planning</p>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg space-y-0.5">
          {errors.map(e => <p key={e} className="text-xs text-red-600">{e}</p>)}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Section / Group Name <span className="text-gray-400 font-normal">(optional)</span></label>
          <input type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} className={inputCls} placeholder="e.g. Period 2" />
        </div>
        <div>
          <label className={labelCls}>MTSS{req}</label>
          <ChipSelector options={MTSS_TIERS} value={tier} onChange={setTier} roleColor={roleColor} />
        </div>
        <div>
          <label className={labelCls}>Math Skill{req}</label>
          <input type="text" value={mathSkill} onChange={e => setMathSkill(e.target.value)} className={inputCls} placeholder="e.g. Fraction addition" />
        </div>
        <div>
          <label className={labelCls}>Group Size{req}</label>
          <input type="text" value={groupSize} onChange={e => setGroupSize(e.target.value)} className={inputCls} placeholder="e.g. 4 students, whole class of 22" />
        </div>
        <div>
          <label className={labelCls}>Which EBPs and components will you implement today?{req}</label>
          <EBPSelector selectedEBPs={selectedEBPs} selectedComponents={ebpComponents}
            onChangeEBPs={setSelectedEBPs} onChangeComponents={setEbpComponents} roleColor={roleColor} />
        </div>
        <div>
          <label className={labelCls}>Do you anticipate adapting EBPs?{req}</label>
          <div className="flex gap-4">
            {([true, false] as const).map(v => (
              <label key={String(v)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={anticipates === v} onChange={() => handleAnticipates(v)}
                  className="accent-emerald-500" name="anticipates" />
                {v ? 'Yes' : 'No'}
              </label>
            ))}
          </div>
        </div>
        {anticipates && (
          <div>
            <label className={labelCls}>If yes, what will be adapted?{req}</label>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {plannedAdaptationTypes.map(opt => (
                <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={adaptTypes.includes(opt)} onChange={() => toggleAdaptType(opt)} className="accent-emerald-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
})

PrePlanCard.displayName = 'PrePlanCard'
