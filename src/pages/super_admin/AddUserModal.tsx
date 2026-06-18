import { useForm } from 'react-hook-form'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { Role } from '../../types'

const roleColor = roleColors.super_admin

const SCHOOL_ROLES: Role[] = ['teacher', 'paraprofessional', 'coach', 'admin']

type UserForm = {
  name: string
  email: string
  role: Role | ''
  districtId: string
  schoolId: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export function AddUserModal({ open, onClose }: Props) {
  const { districts, schools, addUser } = useAppStore()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UserForm>({
    defaultValues: { role: '', districtId: '', schoolId: '' },
  })

  const role = watch('role') as Role | ''
  const districtId = watch('districtId')

  const needsDistrict = !!role && role !== 'researcher'
  const needsSchool = SCHOOL_ROLES.includes(role as Role)
  const filteredSchools = districtId ? schools.filter(s => s.districtId === districtId) : []

  const handleClose = () => { onClose(); reset() }

  const onSubmit = (data: UserForm) => {
    const initials = data.name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const id = `USR${Date.now()}`

    let schoolId = data.schoolId
    let districtId: string | undefined

    if (data.role === 'district_admin') {
      schoolId = 'DISTRICT'
      districtId = data.districtId
    } else if (data.role === 'researcher') {
      schoolId = 'PLATFORM'
    }

    addUser({ id, name: data.name, initials, role: data.role as Role, schoolId, districtId }, data.email)
    toast.success(`${data.name} added as ${data.role}. Password: demo1234`)
    handleClose()
  }

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'paraprofessional', label: 'Paraprofessional' },
    { value: 'coach', label: 'Coach' },
    { value: 'admin', label: 'Principal of School' },
    { value: 'district_admin', label: 'Superintendent' },
    { value: 'researcher', label: 'Researcher' },
  ]

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400'

  return (
    <Modal open={open} onClose={handleClose} title="Add New User" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input {...register('name', { required: 'Name is required' })} className={inputCls} placeholder="e.g. Jane Smith" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
            className={inputCls}
            placeholder="jane.smith@district.edu"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select {...register('role', { required: 'Role is required' })} className={inputCls}>
            <option value="">Select role…</option>
            {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
        </div>

        {needsDistrict && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              {...register('districtId', { required: needsDistrict ? 'District is required' : false })}
              className={inputCls}
            >
              <option value="">Select district…</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.districtId && <p className="mt-1 text-xs text-red-500">{errors.districtId.message}</p>}
          </div>
        )}

        {needsSchool && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
            <select
              {...register('schoolId', { required: needsSchool ? 'School is required' : false })}
              className={inputCls}
              disabled={!districtId}
            >
              <option value="">{districtId ? 'Select school…' : 'Select a district first'}</option>
              {filteredSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.schoolId && <p className="mt-1 text-xs text-red-500">{errors.schoolId.message}</p>}
          </div>
        )}

        {role === 'district_admin' && (
          <p className="text-xs text-gray-400">Superintendent has district-wide access — no specific school assignment.</p>
        )}
        {role === 'researcher' && (
          <p className="text-xs text-gray-400">Researcher has platform-wide access — no district or school assignment needed.</p>
        )}

        <p className="text-xs text-gray-400">
          Default login password: <span className="font-mono font-medium text-gray-600">demo1234</span>
        </p>
        <div className="flex gap-2 pt-2">
          <Button type="submit" roleColor={roleColor}>Add User</Button>
          <Button type="button" variant="ghost" roleColor={roleColor} onClick={handleClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
