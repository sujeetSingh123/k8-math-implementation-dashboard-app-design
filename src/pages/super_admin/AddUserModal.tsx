import { useForm } from 'react-hook-form'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { Role } from '../../types'

const roleColor = roleColors.super_admin

type UserForm = {
  name: string
  email: string
  role: Role
  schoolId: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export function AddUserModal({ open, onClose }: Props) {
  const { schools, addUser } = useAppStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>()

  const handleClose = () => { onClose(); reset() }

  const onSubmit = (data: UserForm) => {
    const initials = data.name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    const id = `USR${Date.now()}`
    addUser({ id, name: data.name, initials, role: data.role, schoolId: data.schoolId }, data.email)
    toast.success(`${data.name} added as ${data.role}. Password: demo1234`)
    handleClose()
  }

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'teacher', label: 'Teacher' },
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
          <select {...register('schoolId', { required: 'School is required' })} className={inputCls}>
            <option value="">Select school…</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.schoolId && <p className="mt-1 text-xs text-red-500">{errors.schoolId.message}</p>}
        </div>
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
