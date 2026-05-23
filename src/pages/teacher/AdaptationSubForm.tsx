import { useForm } from 'react-hook-form'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { roleColors } from '../../constants/roles'
import { modificationOptions, adaptationReasons } from '../../data/mockData'

const roleColor = roleColors.teacher

type LogForm = {
  plannedVsReactive: 'planned' | 'reactive'
  fidelityType: 'consistent' | 'inconsistent'
  description: string
}

type Props = {
  occurred: boolean
  onToggle: (v: boolean) => void
  whatModified: string[]
  setWhatModified: (v: string[]) => void
  reasons: string[]
  setReasons: (v: string[]) => void
  register: ReturnType<typeof useForm<LogForm>>['register']
}

export function AdaptationSubForm({ occurred, onToggle, whatModified, setWhatModified, reasons, setReasons, register }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-800">Post-Instruction Reflections</p>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Did an adaptation occur?</label>
        <div className="flex gap-4">
          {([true, false] as const).map(v => (
            <label key={String(v)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input type="radio" checked={occurred === v} onChange={() => onToggle(v)} className="accent-emerald-500" name="adaptToggle" />
              {v ? 'Yes' : 'No'}
            </label>
          ))}
        </div>
      </div>
      {occurred && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
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
                {(['planned', 'reactive'] as const).map(v => (
                  <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" value={v} {...register('plannedVsReactive')} className="accent-emerald-500" />
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Fidelity Type</label>
              <div className="flex gap-3 flex-wrap">
                {(['consistent', 'inconsistent'] as const).map(v => (
                  <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" value={v} {...register('fidelityType')} className="accent-emerald-500" />
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Brief Description (optional)</label>
            <textarea {...register('description')} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Describe the adaptation..." />
          </div>
        </div>
      )}
    </div>
  )
}
