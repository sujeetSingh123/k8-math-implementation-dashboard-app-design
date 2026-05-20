import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { ChipSelector } from '../../components/ui/ChipSelector'
import { roleColors } from '../../constants/roles'
import { modificationOptions, adaptationReasons } from '../../data/mockData'
import type { Adaptation } from '../../types'

const roleColor = roleColors.teacher

export function AdaptationForm() {
  const { currentUser, adaptations, addAdaptation } = useAppStore()
  const [whatModified, setWhatModified] = useState<string[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [plannedVsReactive, setPlannedVsReactive] = useState<'planned' | 'reactive'>('planned')
  const [fidelityType, setFidelityType] = useState<'consistent' | 'inconsistent'>('consistent')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saved, setSaved] = useState(false)

  const myAdaptations = adaptations
    .filter(a => a.teacherId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (whatModified.length === 0) return
    const adaptation: Adaptation = {
      id: `adp-new-${Date.now()}`, logId: '', teacherId: currentUser.id,
      whatModified, reasons, plannedVsReactive, fidelityType, description, date,
    }
    addAdaptation(adaptation)
    setWhatModified([])
    setReasons([])
    setPlannedVsReactive('planned')
    setFidelityType('consistent')
    setDescription('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const columns = [
    { key: 'date', header: 'Date' },
    {
      key: 'whatModified',
      header: 'Modified',
      render: (row: Adaptation) => <span className="text-xs text-gray-600">{row.whatModified.join(', ')}</span>,
    },
    {
      key: 'reasons',
      header: 'Reason(s)',
      className: 'hidden sm:table-cell',
      render: (row: Adaptation) => <span className="text-xs text-gray-600">{row.reasons.join(', ')}</span>,
    },
    {
      key: 'fidelityType',
      header: 'Type',
      render: (row: Adaptation) => (
        <Badge color={row.fidelityType === 'consistent' ? 'green' : 'amber'}>{row.fidelityType}</Badge>
      ),
    },
    {
      key: 'plannedVsReactive',
      header: 'Timing',
      className: 'hidden md:table-cell',
      render: (row: Adaptation) => (
        <Badge color={row.plannedVsReactive === 'planned' ? 'blue' : 'gray'}>{row.plannedVsReactive}</Badge>
      ),
    },
  ]

  return (
    <div className="w-full max-w-2xl space-y-4">
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-800 text-sm font-medium">
          Adaptation saved!
        </div>
      )}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Document an Adaptation (FRAME-IS)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">What was modified</label>
            <ChipSelector options={modificationOptions} value={whatModified} onChange={setWhatModified} roleColor={roleColor} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Reason(s) for adaptation</label>
            <ChipSelector options={adaptationReasons} value={reasons} onChange={setReasons} roleColor={roleColor} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Planned or Reactive</label>
              <div className="flex gap-3 flex-wrap">
                {(['planned','reactive'] as const).map(v => (
                  <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" checked={plannedVsReactive === v} onChange={() => setPlannedVsReactive(v)} className="accent-emerald-500" />
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
                    <input type="radio" checked={fidelityType === v} onChange={() => setFidelityType(v)} className="accent-emerald-500" />
                    {v.charAt(0).toUpperCase()+v.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Description (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Briefly describe the adaptation..." />
          </div>
          <Button type="submit" roleColor={roleColor}>Save Adaptation</Button>
        </form>
      </Card>
      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Adaptations</h2>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={myAdaptations as unknown as Record<string, unknown>[]}
          emptyMessage="No adaptations documented yet."
          emptyIcon={<BookOpen size={24} />}
        />
      </Card>
    </div>
  )
}
