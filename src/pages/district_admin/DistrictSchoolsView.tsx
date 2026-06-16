import { useState, useMemo } from 'react'
import { Building2, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { roleColors } from '../../constants/roles'
import type { School } from '../../types'

const roleColor = roleColors.district_admin

type SchoolRow = School & { teacherCount: number; adminCount: number; coachCount: number; logCount: number }

export function DistrictSchoolsView() {
  const { currentUser, schools, users, districts, implementationLogs } = useAppStore()
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null)

  const myDistrict = districts.find(d => d.id === currentUser.districtId)

  const schoolRows: SchoolRow[] = useMemo(() =>
    schools
      .filter(s => s.districtId === currentUser.districtId)
      .map(s => ({
        ...s,
        teacherCount: users.filter(u => u.schoolId === s.id && u.role === 'teacher').length,
        adminCount: users.filter(u => u.schoolId === s.id && u.role === 'admin').length,
        coachCount: users.filter(u => u.schoolId === s.id && u.role === 'coach').length,
        logCount: implementationLogs.filter(l => l.schoolId === s.id).length,
      })),
    [schools, users, implementationLogs, currentUser.districtId],
  )

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-xl">
          <Building2 size={16} style={{ color: roleColor }} />
          <span className="text-sm font-semibold text-gray-800">{myDistrict?.name ?? 'My District'}</span>
          <Badge color="blue">{schoolRows.length} school{schoolRows.length !== 1 ? 's' : ''}</Badge>
        </div>

        {schoolRows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Building2 size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No schools in this district yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {schoolRows.map(s => (
              <button key={s.id} onClick={() => setSelectedSchool(s)}
                className="w-full px-4 sm:px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.id}</p>
                </div>
                <div className="hidden sm:flex gap-4 text-xs text-gray-500">
                  <span>{s.teacherCount} teachers</span>
                  <span>{s.adminCount} admins</span>
                  <span>{s.coachCount} coaches</span>
                </div>
                <Badge color="green">Active</Badge>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {selectedSchool && (
        <Modal open onClose={() => setSelectedSchool(null)} title={selectedSchool.name} size="sm">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'School ID', value: selectedSchool.id },
              { label: 'District', value: myDistrict?.name ?? selectedSchool.districtId },
              { label: 'Teachers', value: selectedSchool.teacherCount },
              { label: 'Coaches', value: selectedSchool.coachCount },
              { label: 'Admins', value: selectedSchool.adminCount },
              { label: 'Total Logs', value: selectedSchool.logCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Staff: {users.filter(u => u.schoolId === selectedSchool.id).map(u => u.name).join(', ') || 'None yet'}
          </p>
        </Modal>
      )}
    </div>
  )
}
