import { useState } from 'react'
import { Building2, Plus, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { School, District, User, ImplementationLog } from '../../types'

const roleColor = roleColors.super_admin

type DistrictForm = { name: string }
type SchoolForm = { name: string }

type SchoolRow = School & { teacherCount: number; adminCount: number; coachCount: number }

function SchoolDetail({ school, districts, users, implementationLogs, onClose }: {
  school: SchoolRow
  districts: District[]
  users: User[]
  implementationLogs: ImplementationLog[]
  onClose: () => void
}) {
  const districtName = districts.find(d => d.id === school.districtId)?.name ?? school.districtId
  return (
    <Modal open onClose={onClose} title={school.name} size="sm">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'School ID', value: school.id },
          { label: 'District', value: districtName },
          { label: 'Teachers', value: school.teacherCount },
          { label: 'Coaches', value: school.coachCount },
          { label: 'Admins', value: school.adminCount },
          { label: 'Total Logs', value: implementationLogs.filter(l => l.schoolId === school.id).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Staff: {users.filter(u => u.schoolId === school.id).map(u => u.name).join(', ') || 'None yet'}
      </p>
    </Modal>
  )
}

export function SchoolManagement() {
  const { districts, schools, users, addDistrict, addSchool, implementationLogs } = useAppStore()
  const [districtModal, setDistrictModal] = useState(false)
  const [addSchoolForDistrict, setAddSchoolForDistrict] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null)

  const districtForm = useForm<DistrictForm>()
  const schoolForm = useForm<SchoolForm>()

  const schoolsByDistrict = (districtId: string): SchoolRow[] =>
    schools
      .filter(s => s.districtId === districtId)
      .map(s => ({
        ...s,
        teacherCount: users.filter(u => u.schoolId === s.id && u.role === 'teacher').length,
        adminCount: users.filter(u => u.schoolId === s.id && u.role === 'admin').length,
        coachCount: users.filter(u => u.schoolId === s.id && u.role === 'coach').length,
      }))

  const onAddDistrict = (data: DistrictForm) => {
    const id = `dist${districts.length + 1}`
    addDistrict({ id, name: data.name })
    toast.success(`${data.name} added!`)
    districtForm.reset()
    setDistrictModal(false)
  }

  const onAddSchool = (data: SchoolForm) => {
    const id = `SCH${String(schools.length + 1).padStart(2, '0')}`
    addSchool({ id, name: data.name, districtId: addSchoolForDistrict! })
    toast.success(`${data.name} added!`)
    schoolForm.reset()
    setAddSchoolForDistrict(null)
  }

  const openAddSchool = (districtId: string) => {
    schoolForm.reset()
    setAddSchoolForDistrict(districtId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          {districts.length} district{districts.length !== 1 ? 's' : ''} · {schools.length} school{schools.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" roleColor={roleColor} onClick={() => { districtForm.reset(); setDistrictModal(true) }}>
          <Plus size={14} /> Add District
        </Button>
      </div>

      {districts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={28} className="mx-auto mb-3" />
          <p className="text-sm">No districts yet. Add your first district to get started.</p>
        </div>
      )}

      {districts.map(district => {
        const distSchools = schoolsByDistrict(district.id)
        return (
          <Card key={district.id} padding="none">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: roleColor }} />
                <span className="text-sm font-semibold text-gray-800">{district.name}</span>
                <span className="text-xs text-gray-400">({district.id})</span>
                <Badge color="blue">{distSchools.length} school{distSchools.length !== 1 ? 's' : ''}</Badge>
              </div>
              <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => openAddSchool(district.id)}>
                <Plus size={12} /> Add School
              </Button>
            </div>

            {distSchools.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-gray-400">
                No schools in this district yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {distSchools.map(s => (
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
        )
      })}

      {selectedSchool && (
        <SchoolDetail
          school={selectedSchool}
          districts={districts}
          users={users}
          implementationLogs={implementationLogs}
          onClose={() => setSelectedSchool(null)}
        />
      )}

      <Modal open={districtModal} onClose={() => setDistrictModal(false)} title="Add New District" size="sm">
        <form onSubmit={districtForm.handleSubmit(onAddDistrict)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District Name</label>
            <input
              {...districtForm.register('name', { required: 'District name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="e.g. Riverside Unified School District"
            />
            {districtForm.formState.errors.name && (
              <p className="mt-1 text-xs text-red-500">{districtForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" roleColor={roleColor}>Add District</Button>
            <Button type="button" variant="ghost" roleColor={roleColor} onClick={() => setDistrictModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!addSchoolForDistrict}
        onClose={() => setAddSchoolForDistrict(null)}
        title={`Add School — ${districts.find(d => d.id === addSchoolForDistrict)?.name ?? ''}`}
        size="sm"
      >
        <form onSubmit={schoolForm.handleSubmit(onAddSchool)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
            <input
              {...schoolForm.register('name', { required: 'School name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="e.g. Jefferson Middle School"
            />
            {schoolForm.formState.errors.name && (
              <p className="mt-1 text-xs text-red-500">{schoolForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" roleColor={roleColor}>Add School</Button>
            <Button type="button" variant="ghost" roleColor={roleColor} onClick={() => setAddSchoolForDistrict(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
