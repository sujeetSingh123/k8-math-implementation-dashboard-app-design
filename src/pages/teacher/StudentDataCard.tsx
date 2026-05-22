import { useState, useRef } from 'react'
import { Save, Upload } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.teacher

export function StudentDataCard() {
  const { currentUser, addStudentDataRecord } = useAppStore()
  const [dataFile, setDataFile] = useState<string | null>(null)
  const [dataScore, setDataScore] = useState('')
  const [dataType, setDataType] = useState('Class Average')
  const [dataDate, setDataDate] = useState(new Date().toISOString().split('T')[0])
  const csvRef = useRef<HTMLInputElement>(null)

  const handleManualUpload = () => {
    if (!dataScore) { toast.warning('Enter a score value before uploading.'); return }
    addStudentDataRecord({
      id: `sdr-new-${Date.now()}`, teacherId: currentUser.id, date: dataDate,
      dataType: dataType as 'Class Average' | 'Progress Monitoring' | 'Benchmark Score',
      value: Number(dataScore), tier: 'Tier 1',
    })
    toast.success(`${dataType} score of ${dataScore} recorded for ${dataDate}`)
    setDataScore('')
  }

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDataFile(file.name)
      toast.info(`Parsing ${file.name}…`)
      setTimeout(() => toast.success('Student data uploaded successfully!'), 1000)
    }
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-800 mb-3">Student Data Upload</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <select value={dataType} onChange={e => setDataType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>Class Average</option>
          <option>Progress Monitoring</option>
          <option>Benchmark Score</option>
        </select>
        <input type="date" value={dataDate} onChange={e => setDataDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Score / Value" value={dataScore} onChange={e => setDataScore(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      {dataFile && <p className="text-xs text-emerald-600 mb-2">File: {dataFile}</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" roleColor={roleColor} size="sm" onClick={handleManualUpload}>
          <Save size={14} />Record Score
        </Button>
        <Button variant="secondary" roleColor={roleColor} size="sm" onClick={() => csvRef.current?.click()}>
          <Upload size={14} />Upload CSV
        </Button>
        <input ref={csvRef} type="file" className="hidden" accept=".csv" onChange={handleCSV} />
      </div>
    </Card>
  )
}
