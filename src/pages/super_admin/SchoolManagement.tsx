import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { School } from '../../types'

const roleColor = roleColors.super_admin

type SchoolForm = { name: string; districtId: string }
type SchoolRow = School & { teacherCount: number; adminCount: number; coachCount: number }

export function SchoolManagement() {
  const { schools, users, addSchool, implementationLogs } = useAppStore()
  const [open, setOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SchoolForm>()

  const schoolRows: SchoolRow[] = schools.map(s => ({
    ...s,
    teacherCount: users.filter(u => u.schoolId === s.id && u.role === 'teacher').length,
    adminCount: users.filter(u => u.schoolId === s.id && u.role === 'admin').length,
    coachCount: users.filter(u => u.schoolId === s.id && u.role === 'coach').length,
  }))

  const onSubmit = (data: SchoolForm) => {
    const id = `SCH${String(schools.length + 1).padStart(2, '0')}`
    addSchool({ id, name: data.name, districtId: data.districtId || 'dist1' })
    toast.success(`${data.name} added successfully!`)
    reset()
    setOpen(false)
  }

  const columns = [
    { key: 'name', header: 'School', render: (row: SchoolRow) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: 'id', header: 'ID', className: 'hidden sm:table-cell' },
    { key: 'districtId', header: 'District', className: 'hidden md:table-cell' },
    { key: 'teacherCount', header: 'Teachers', render: (row: SchoolRow) => String(row.teacherCount) },
    { key: 'coachCount', header: 'Coaches', render: (row: SchoolRow) => String(row.coachCount) },
    { key: 'adminCount', header: 'Admins', render: (row: SchoolRow) => String(row.adminCount) },
    { key: 'status', header: 'Status', render: () => <Badge color="green">Active</Badge> },
  ]

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Schools ({schools.length})</h2>
          <Button size="sm" roleColor={roleColor} onClick={() => setOpen(true)}>
            <Plus size={14} /> Add School
          </Button>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={schoolRows as unknown as Record<string, unknown>[]}
          emptyMessage="No schools found."
          emptyIcon={<Building2 size={24} />}
          onRowClick={(row) => setSelectedSchool(row as unknown as SchoolRow)}
        />
      </Card>

      {selectedSchool && (
        <Modal open onClose={() => setSelectedSchool(null)} title={selectedSchool.name} size="sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'School ID', value: selectedSchool.id },
                { label: 'District', value: selectedSchool.districtId },
                { label: 'Teachers', value: selectedSchool.teacherCount },
                { label: 'Coaches', value: selectedSchool.coachCount },
                { label: 'Admins', value: selectedSchool.adminCount },
                { label: 'Total Logs', value: implementationLogs.filter(l => l.schoolId === selectedSchool.id).length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Staff: {users.filter(u => u.schoolId === selectedSchool.id).map(u => u.name).join(', ')}</p>
          </div>
        </Modal>
      )}

      <Modal open={open} onClose={() => { setOpen(false); reset() }} title="Add New School" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
            <input
              {...register('name', { required: 'School name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="e.g. Jefferson Middle School"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District ID</label>
            <input
              {...register('districtId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="dist1"
            />
            <p className="mt-1 text-xs text-gray-400">Leave blank to use default district (dist1)</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" roleColor={roleColor}>Add School</Button>
            <Button type="button" variant="ghost" roleColor={roleColor} onClick={() => { setOpen(false); reset() }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
