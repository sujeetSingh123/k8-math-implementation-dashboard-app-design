import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { FidelityTrendChart, type TLPoint } from '../../components/ui/FidelityTrendChart'
import { schools, schoolFidelityTrends, dist2SchoolFidelityTrends, districtFidelityTrends, studentDataRecords } from '../../data/mockData'
import type { Role } from '../../types'

type MonthEntry = { month: string; adherence: number; dosage: number; quality: number; responsiveness: number; confidence: number }
const allSchoolTrends: Record<string, MonthEntry[]> = { ...schoolFidelityTrends, ...dist2SchoolFidelityTrends }

function composite(m: MonthEntry): number {
  return +((m.adherence + m.dosage + m.quality + m.responsiveness + m.confidence) / 5).toFixed(2)
}

interface Props {
  role: Role
  currentSchoolId: string
  roleColor: string
  districtId?: string
}

export function SchoolDistrictFidelity({ role, currentSchoolId, roleColor, districtId: propDistrictId }: Props) {
  const isResearcher = role === 'researcher' || role === 'super_admin'
  const isDistrictAdmin = role === 'district_admin'
  const districtId = propDistrictId ?? schools.find(s => s.id === currentSchoolId)?.districtId ?? 'dist1'

  const visibleSchools = isResearcher
    ? schools
    : isDistrictAdmin && propDistrictId
      ? schools.filter(s => s.districtId === propDistrictId)
      : schools.filter(s => s.id === currentSchoolId)

  // School fidelity table - last month (May)
  const schoolRows = visibleSchools.map(s => {
    const trend = allSchoolTrends[s.id]
    const may = trend?.[trend.length - 1]
    if (!may) return { id: s.id, name: s.name, adherence: '—', dosage: '—', quality: '—', responsiveness: '—', avg: '—' }
    return {
      id: s.id,
      name: s.name,
      adherence: `${Math.round(may.adherence * 20)}%`,
      dosage: `${Math.round(may.dosage * 20)}%`,
      quality: `${Math.round(may.quality * 20)}%`,
      responsiveness: `${Math.round(may.responsiveness * 20)}%`,
      avg: `${Math.round(composite(may) * 20)}%`,
    }
  })

  // District fidelity trend formatted as TLPoint[]
  const districtTrend = useMemo((): TLPoint[] => {
    const data = districtFidelityTrends[districtId] ?? districtFidelityTrends.dist1
    return data.map(m => ({
      label: m.month,
      adherence: m.adherence,
      dosage: m.dosage,
      quality: m.quality,
      responsiveness: m.responsiveness,
      composite: composite(m),
    }))
  }, [districtId])

  // Student performance by school (avg currentAvg)
  const studentRows = useMemo(() => {
    return visibleSchools.map(s => {
      const recs = studentDataRecords.filter(r => r.schoolId === s.id)
      if (!recs.length) return { id: s.id, name: s.name, avgScore: '—', avgGrowth: '—', count: 0 }
      const avgScore = (recs.reduce((sum, r) => sum + r.currentAvg, 0) / recs.length).toFixed(1)
      const avgGrowth = (recs.reduce((sum, r) => sum + (r.growth ?? 0), 0) / recs.length).toFixed(1)
      return { id: s.id, name: s.name, avgScore, avgGrowth, count: recs.length }
    })
  }, [visibleSchools])

  return (
    <>
      {/* School Fidelity by Dimension (May) */}
      <Card>
        <p className="text-sm font-semibold text-gray-800 mb-3">School Fidelity by Dimension (May)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-3 font-medium">School</th>
                <th className="pb-2 px-2 font-medium text-center">Adherence</th>
                <th className="pb-2 px-2 font-medium text-center">Dosage</th>
                <th className="pb-2 px-2 font-medium text-center">Quality</th>
                <th className="pb-2 px-2 font-medium text-center">Responsiveness</th>
                <th className="pb-2 pl-2 font-medium text-center" style={{ color: roleColor }}>Avg</th>
              </tr>
            </thead>
            <tbody>
              {schoolRows.map(r => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 font-medium text-gray-700">{r.name}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.adherence}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.dosage}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.quality}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.responsiveness}</td>
                  <td className="py-2 pl-2 text-center font-semibold" style={{ color: roleColor }}>{r.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* District Fidelity Trend */}
      <Card>
        <p className="text-sm font-semibold text-gray-800 mb-3">District Fidelity Trend</p>
        <FidelityTrendChart data={districtTrend} roleColor={roleColor} />
      </Card>

      {/* Student Performance */}
      <Card>
        <p className="text-sm font-semibold text-gray-800 mb-3">Student Performance by School</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-3 font-medium">School</th>
                <th className="pb-2 px-2 font-medium text-center">Avg Score %</th>
                <th className="pb-2 px-2 font-medium text-center">Avg Growth</th>
                <th className="pb-2 pl-2 font-medium text-center">Records</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map(r => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 font-medium text-gray-700">{r.name}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.avgScore}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{r.avgGrowth !== '—' ? `+${r.avgGrowth}` : '—'}</td>
                  <td className="py-2 pl-2 text-center text-gray-400">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
