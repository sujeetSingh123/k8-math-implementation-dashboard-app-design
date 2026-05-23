import { useState, useRef } from 'react'
import { BarChart2, ClipboardList, Upload, Paperclip, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import type { ImplementationLog } from '../../types'

const roleColor = roleColors.teacher

type CompletionFilter = 'all' | ImplementationLog['lessonCompletion']

function completionColor(c: ImplementationLog['lessonCompletion']): 'green' | 'amber' | 'red' {
  return c === 'fully' ? 'green' : c === 'partially' ? 'amber' : 'red'
}

const FILTERS: { value: CompletionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fully', label: 'Fully completed' },
  { value: 'partially', label: 'Partial' },
  { value: 'not_completed', label: 'Not completed' },
]

export function MyLogs() {
  const { currentUser, implementationLogs, adaptations, studentDataRecords, addStudentDataRecord } = useAppStore()
  const [filter, setFilter] = useState<CompletionFilter>('all')
  const [dataModal, setDataModal] = useState<ImplementationLog | null>(null)
  const [dataType, setDataType] = useState('Class Average')
  const [score, setScore] = useState('')
  const [attachedFile, setAttachedFile] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const myLogs = implementationLogs
    .filter(l => l.teacherId === currentUser.id)
    .filter(l => filter === 'all' || l.lessonCompletion === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  const openAdd = (log: ImplementationLog) => {
    setDataModal(log)
    setDataType('Class Average')
    setScore('')
    setAttachedFile(null)
  }

  const handleSave = () => {
    if (!dataModal || !score) { toast.warning('Enter a score value.'); return }
    addStudentDataRecord({
      id: `sdr-${Date.now()}`,
      teacherId: currentUser.id,
      date: dataModal.date,
      dataType: dataType as 'Class Average' | 'Progress Monitoring' | 'Benchmark Score',
      value: Number(score),
      tier: dataModal.tier,
      logId: dataModal.id,
    })
    const msg = attachedFile
      ? `${dataType} score recorded with file: ${attachedFile}`
      : `${dataType} score recorded for ${dataModal.date}`
    toast.success(msg)
    setDataModal(null)
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500">{myLogs.length} log{myLogs.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(o => (
            <button key={o.value} onClick={() => setFilter(o.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${filter !== o.value ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'text-white'}`}
              style={filter === o.value ? { backgroundColor: roleColor } : {}}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {myLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ClipboardList size={28} className="mb-2" />
          <p className="text-sm">No logs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myLogs.map(log => {
            const adapt = adaptations.find(a => a.logId === log.id)
            return (
              <Card key={log.id}>
                <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{log.date}</span>
                    {log.startTime && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{log.startTime}</span>
                    )}
                    <Badge color={completionColor(log.lessonCompletion)}>
                      {log.lessonCompletion.replace('_', ' ')}
                    </Badge>
                    <Badge color="blue">{log.tier}</Badge>
                    {log.adaptationOccurred && <Badge color="purple">Adapted</Badge>}
                  </div>
                  <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => openAdd(log)}>
                    <BarChart2 size={12} />Add Student Data
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {log.instructionalRoutine} · {log.ebpComponent.join(', ')} · {log.implementationStrategy} · {log.durationMinutes} min
                </p>
                {log.notes && (
                  <p className="text-xs text-gray-400 italic mt-1">"{log.notes}"</p>
                )}
                {adapt && (
                  <div className="mt-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-2.5 py-1.5">
                    Adaptation: {adapt.whatModified.join(', ')} ·{' '}
                    <span className={adapt.fidelityType === 'consistent' ? 'text-emerald-600' : 'text-amber-600'}>
                      {adapt.fidelityType}
                    </span>
                    {' · '}{adapt.plannedVsReactive}
                  </div>
                )}
                {(() => {
                  const logData = studentDataRecords.filter(r => r.logId === log.id)
                  if (logData.length === 0) return null
                  return (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {logData.map(r => (
                        <span key={r.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-2 py-0.5">
                          {r.dataType}: <span className="font-semibold">{r.value}</span>
                        </span>
                      ))}
                    </div>
                  )
                })()}
              </Card>
            )
          })}
        </div>
      )}

      {dataModal && (
        <Modal open onClose={() => setDataModal(null)} title={`Add Student Data — ${dataModal.date}`}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600">
              <span className="font-medium">{dataModal.instructionalRoutine}</span>
              {' · '}{dataModal.tier}{' · '}{dataModal.durationMinutes} min
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Data Type</label>
              <select value={dataType} onChange={e => setDataType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option>Class Average</option>
                <option>Progress Monitoring</option>
                <option>Benchmark Score</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Score / Value</label>
              <input type="number" value={score} onChange={e => setScore(e.target.value)}
                placeholder="Enter score…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Attach File (optional)</label>
              {attachedFile ? (
                <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2">
                  <Paperclip size={12} />
                  <span className="flex-1 truncate">{attachedFile}</span>
                  <button onClick={() => setAttachedFile(null)} className="cursor-pointer flex-shrink-0"><X size={12} /></button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-500 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition-colors">
                  <Upload size={13} />Upload CSV or document
                </button>
              )}
              <input ref={fileRef} type="file" className="hidden" accept=".csv,.pdf,.xlsx,.doc,.docx"
                onChange={e => { const f = e.target.files?.[0]; if (f) setAttachedFile(f.name); e.target.value = '' }} />
            </div>
            <div className="flex gap-2">
              <Button roleColor={roleColor} onClick={handleSave}><BarChart2 size={14} />Save Data</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setDataModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
