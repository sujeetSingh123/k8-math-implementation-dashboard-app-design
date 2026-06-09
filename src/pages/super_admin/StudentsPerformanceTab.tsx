import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { roleColors } from '../../constants/roles'
import { studentDataRecords } from '../../data/mockData'
import { useAppStore } from '../../store/useAppStore'

const roleColor = roleColors.super_admin

function avg(vals: number[]) {
  return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : 0
}

export function StudentsPerformanceTab() {
  const { users, schools } = useAppStore()

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users])

  const districtAvgScore = avg(studentDataRecords.map(r => r.currentAvg))
  const districtAvgGrowth = avg(studentDataRecords.map(r => r.growth ?? 0))
  const districtAtBench = avg(studentDataRecords.map(r => r.atOrAboveBenchmark))

  const schoolRows = useMemo(() => schools.map(s => {
    const recs = studentDataRecords.filter(r => r.schoolId === s.id)
    if (!recs.length) return { id: s.id, name: s.name.split(' ')[0], avgScore: '—', avgGrowth: '—', atBench: '—' }
    return {
      id: s.id,
      name: s.name.split(' ').slice(0, 2).join(' '),
      avgScore: avg(recs.map(r => r.currentAvg)) + '%',
      avgGrowth: '+' + avg(recs.map(r => r.growth ?? 0)),
      atBench: avg(recs.map(r => r.atOrAboveBenchmark)) + '%',
    }
  }), [schools])

  const teacherRows = useMemo(() => teachers.map(t => {
    const recs = studentDataRecords.filter(r => r.teacherId === t.id)
    const school = schools.find(s => s.id === t.schoolId)?.name.split(' ')[0] ?? t.schoolId
    if (!recs.length) return { id: t.id, name: t.name, school, avgScore: '—', avgGrowth: '—', atBench: '—', records: 0 }
    return {
      id: t.id,
      name: t.name,
      school,
      avgScore: avg(recs.map(r => r.currentAvg)) + '%',
      avgGrowth: '+' + avg(recs.map(r => r.growth ?? 0)),
      atBench: avg(recs.map(r => r.atOrAboveBenchmark)) + '%',
      records: recs.length,
    }
  }).filter(r => r.records > 0), [teachers, schools])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="District Avg Score" value={`${districtAvgScore}%`} sub="All schools" color={roleColor} />
        <StatCard label="District Avg Growth" value={`+${districtAvgGrowth}`} sub="pts since baseline" color="#10B981" />
        <StatCard label="At Benchmark" value={`${districtAtBench}%`} sub="District-wide" color="#3B82F6" />
      </div>

      <Card>
        <p className="text-sm font-semibold text-gray-800 mb-3">Performance by School</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left border-b border-gray-100 text-gray-500">
              <th className="pb-2 pr-3">School</th>
              <th className="pb-2 px-2 text-center">Avg Score</th>
              <th className="pb-2 px-2 text-center">Growth</th>
              <th className="pb-2 pl-2 text-center">At Benchmark</th>
            </tr>
          </thead>
          <tbody>
            {schoolRows.map(r => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-3 font-medium text-gray-700">{r.name}</td>
                <td className="py-2 px-2 text-center text-gray-600">{r.avgScore}</td>
                <td className="py-2 px-2 text-center text-emerald-600">{r.avgGrowth}</td>
                <td className="py-2 pl-2 text-center font-semibold" style={{ color: roleColor }}>{r.atBench}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-gray-800 mb-3">Performance by Teacher</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-gray-100 text-gray-500">
                <th className="pb-2 pr-3">Teacher</th>
                <th className="pb-2 px-2 hidden sm:table-cell">School</th>
                <th className="pb-2 px-2 text-center">Avg Score</th>
                <th className="pb-2 px-2 text-center">Growth</th>
                <th className="pb-2 pl-2 text-center">At Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {teacherRows.map(r => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 font-medium text-gray-700">{r.name}</td>
                  <td className="py-2 px-2 text-gray-400 hidden sm:table-cell">{r.school}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.avgScore}</td>
                  <td className="py-2 px-2 text-center text-emerald-600">{r.avgGrowth}</td>
                  <td className="py-2 pl-2 text-center font-semibold" style={{ color: roleColor }}>{r.atBench}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
