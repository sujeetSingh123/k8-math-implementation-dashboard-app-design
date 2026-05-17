import { GraduationCap, Clock, Calendar, ChevronRight, BookOpen } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { useState } from 'react'
import type { TrainingSession } from '../../types'

const roleColor = '#10B981'

const typeBadgeColors: Record<string, 'blue' | 'purple' | 'green'> = {
  training: 'blue', coaching: 'purple', lab: 'green',
}

const sessionDetails: Record<string, string> = {
  'Math MTSS Overview & Tier Structure': 'Covers the three-tier framework for math intervention, roles of general and special educators, and data-based decision making in a math MTSS model.',
  'CRA Instruction: Concrete Phase': 'Hands-on training with manipulatives for teaching number concepts using physical objects before moving to pictures or symbols.',
  'CRA Instruction: Representational Phase': 'Lab session exploring the pictorial/representational stage of the CRA sequence, including drawing models and diagrams.',
  'Error Correction Protocols': 'Learn and practice the four-step error correction procedure: Stop → Model → Re-teach → Practice.',
  'Fidelity Self-Assessment Practices': 'Coaching session on using the five-dimension fidelity rubric for self-reflection and goal-setting.',
  'Tier 2 Small Group Routines': 'Lab session building a consistent Tier 2 routine structure: warm-up, targeted instruction, guided practice, exit check.',
  'Data-Driven Instructional Decisions': 'Coaching session on interpreting progress monitoring data and using decision trees to adjust intervention intensity.',
  'Adaptation Documentation (FRAME-IS)': 'Training on the FRAME-IS framework for classifying, documenting, and analyzing instructional adaptations.',
}

export function TrainingHistory() {
  const { currentUser, trainingSessions } = useAppStore()
  const sessions = trainingSessions[currentUser.id] ?? []
  const [selected, setSelected] = useState<TrainingSession | null>(null)

  const attended = sessions.filter(s => s.attended)
  const hoursLogged = attended.reduce((sum, s) => sum + s.durationHours, 0)
  const nextSession = sessions.filter(s => new Date(s.date) > new Date()).sort((a, b) => a.date.localeCompare(b.date))[0]

  const columns = [
    { key: 'date', header: 'Date', className: 'whitespace-nowrap' },
    { key: 'title', header: 'Session Name' },
    { key: 'type', header: 'Type', className: 'hidden sm:table-cell',
      render: (row: TrainingSession) => <Badge color={typeBadgeColors[row.type] ?? 'gray'}>{row.type}</Badge> },
    { key: 'durationHours', header: 'Duration', className: 'hidden md:table-cell',
      render: (row: TrainingSession) => `${row.durationHours}h` },
    { key: 'attended', header: 'Status',
      render: (row: TrainingSession) => <Badge color={row.attended ? 'green' : 'red'}>{row.attended ? 'Attended' : 'Missed'}</Badge> },
    { key: 'action', header: '',
      render: (row: TrainingSession) => (
        <button onClick={e => { e.stopPropagation(); setSelected(row) }} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer flex items-center gap-0.5">
          Details<ChevronRight size={11} />
        </button>
      )},
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => toast.info('Attendance tracked across all PD sessions this year.')}>
          <StatCard label="Sessions Attended" value={`${attended.length}/${sessions.length}`}
            sub={`${Math.round((attended.length / Math.max(sessions.length, 1)) * 100)}% attendance rate`}
            icon={<GraduationCap size={18} />} iconColor={roleColor} />
        </div>
        <div onClick={() => toast.info(`${hoursLogged} hours of professional development logged.`)}>
          <StatCard label="Hours Logged" value={hoursLogged.toFixed(1)} sub="Professional development hours" icon={<Clock size={18} />} iconColor={roleColor} />
        </div>
        <div onClick={() => nextSession && setSelected(nextSession)}>
          <StatCard label="Next Session"
            value={nextSession ? new Date(nextSession.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'None'}
            sub={nextSession?.title ?? 'No upcoming sessions'}
            icon={<Calendar size={18} />} iconColor={roleColor} />
        </div>
      </div>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Training Sessions</h2>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => toast.info('Training calendar sync coming soon.')}>
            <Calendar size={13} />Sync Calendar
          </Button>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={sessions as unknown as Record<string, unknown>[]}
          emptyMessage="No training sessions found."
          emptyIcon={<GraduationCap size={24} />}
          onRowClick={(row) => setSelected(row as unknown as TrainingSession)}
        />
      </Card>

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.title}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color={typeBadgeColors[selected.type] ?? 'gray'}>{selected.type}</Badge>
              <Badge color={selected.attended ? 'green' : 'red'}>{selected.attended ? 'Attended' : 'Missed'}</Badge>
              <span className="text-xs text-gray-400">{selected.date} · {selected.durationHours}h</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {sessionDetails[selected.title] ?? 'Session details not available.'}
                </p>
              </div>
            </div>
            {!selected.attended && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium">You missed this session. Contact your coach to schedule a make-up.</p>
              </div>
            )}
            <div className="flex gap-2">
              {selected.attended ? (
                <Button roleColor={roleColor} onClick={() => { toast.success('Certificate downloaded!'); setSelected(null) }}>
                  <GraduationCap size={14} />Download Certificate
                </Button>
              ) : (
                <Button roleColor={roleColor} onClick={() => { toast.info('Make-up request sent to your coach.'); setSelected(null) }}>
                  Request Make-Up
                </Button>
              )}
              <Button variant="ghost" roleColor={roleColor} onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
