import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { roleColors } from '../../constants/roles'
import { instructionalRoutines, ebpComponents, implementationStrategies, implementationTiers, instructionalSettings } from '../../data/mockData'
import type { LessonPlan } from '../../types'

const roleColor = roleColors.teacher

type PlanFormData = {
  plannedDate: string
  plannedTime: string
  instructionalRoutine: string
  implementationStrategy: string
  plannedDurationMinutes: number
  goal: string
}

type Props = {
  teacherId: string
  onSave: (plan: Omit<LessonPlan, 'id' | 'status' | 'createdAt'>) => void
  onCancel: () => void
}

export function PlanForm({ teacherId, onSave, onCancel }: Props) {
  const [tierChips, setTierChips] = useState<string[]>(['Tier 1'])
  const [settingChips, setSettingChips] = useState<string[]>(['General Education'])
  const [ebpChips, setEbpChips] = useState<string[]>([ebpComponents[0]])
  const { register, handleSubmit } = useForm<PlanFormData>({
    defaultValues: {
      plannedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      plannedTime: '',
      instructionalRoutine: instructionalRoutines[0],
      implementationStrategy: implementationStrategies[0],
      plannedDurationMinutes: 45,
      goal: '',
    },
  })

  const onSubmit = (data: PlanFormData) => {
    onSave({
      teacherId,
      plannedDate: data.plannedDate,
      plannedTime: data.plannedTime || undefined,
      instructionalRoutine: data.instructionalRoutine,
      ebpComponent: ebpChips,
      implementationStrategy: data.implementationStrategy,
      tier: (tierChips[0] ?? 'Tier 1') as LessonPlan['tier'],
      instructionalSetting: (settingChips[0] ?? 'General Education') as LessonPlan['instructionalSetting'],
      plannedDurationMinutes: Number(data.plannedDurationMinutes),
      goal: data.goal || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Planned Date</label>
          <input type="date" {...register('plannedDate', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Start Time (optional)</label>
          <input type="time" {...register('plannedTime')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Instructional Routine</label>
          <select {...register('instructionalRoutine', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
            {instructionalRoutines.map(o => <option key={o}>{o}</option>)}
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
          <input type="number" {...register('plannedDurationMinutes', { required: true, min: 1, max: 180 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">MTSS Tier</label>
        <ChipSelector options={implementationTiers} value={tierChips} onChange={setTierChips} roleColor={roleColor} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Instructional Setting</label>
        <ChipSelector options={instructionalSettings} value={settingChips} onChange={setSettingChips} roleColor={roleColor} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">EBP Component</label>
        <ChipSelector options={ebpComponents} value={ebpChips} onChange={setEbpChips} roleColor={roleColor} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Goal / Intention (optional)</label>
        <textarea {...register('goal')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="What do you want to focus on or try differently?" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" roleColor={roleColor}>Save Plan</Button>
        <Button type="button" variant="ghost" roleColor={roleColor} onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
