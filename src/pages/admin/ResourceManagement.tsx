import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Library, Plus, Pencil, Trash2, Play, FileText, Upload, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../store/useToastStore'
import { roleColors, roleLabels } from '../../constants/roles'
import type { Resource, Role } from '../../types'

const roleColor = roleColors.admin

const allRoles: Role[] = ['teacher', 'coach', 'admin', 'researcher']

const typeIcons: Record<string, React.ReactNode> = {
  video: <Play size={14} className="text-blue-500" />,
  pdf: <FileText size={14} className="text-red-500" />,
  word: <FileText size={14} className="text-blue-600" />,
}

const typeBadgeColors: Record<string, 'blue' | 'red' | 'green' | 'purple'> = {
  video: 'blue', pdf: 'red', word: 'blue',
}

type FormData = {
  title: string
  type: Resource['type']
  duration: string
  description: string
}

function ResourceFormModal({
  initial, onSave, onClose,
}: {
  initial?: Resource
  onSave: (data: FormData, roles: Role[], fileName?: string) => void
  onClose: () => void
}) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(initial?.accessRoles ?? ['teacher'])
  const [fileName, setFileName] = useState<string | undefined>(initial?.fileName)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: initial ?? { type: 'pdf' },
  })

  const toggleRole = (role: Role) =>
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  const onSubmit = (data: FormData) => {
    if (selectedRoles.length === 0) { toast.warning('Select at least one role.'); return }
    onSave(data, selectedRoles, fileName)
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Resource' : 'Add Resource'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
          <input {...register('title', { required: true })} placeholder="Resource title…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          {errors.title && <p className="text-xs text-red-500 mt-1">Title is required.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
            <select {...register('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="word">Word</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Duration / Length</label>
            <input {...register('duration', { required: true })} placeholder="e.g. 22 min, 4 pages"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
          <textarea {...register('description', { required: true })} rows={2} placeholder="Brief description…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">File Upload</label>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          {fileName ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm">
              <FileText size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate flex-1">{fileName}</span>
              <button type="button" onClick={() => { setFileName(undefined); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
              <Upload size={14} />Upload file
            </button>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">Who can access this resource</label>
          <div className="flex flex-wrap gap-2">
            {allRoles.map(role => {
              const active = selectedRoles.includes(role)
              return (
                <button key={role} type="button" onClick={() => toggleRole(role)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
                  style={active
                    ? { backgroundColor: roleColors[role], borderColor: roleColors[role], color: '#fff' }
                    : { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }
                  }>
                  {roleLabels[role]}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Select all roles that should see this resource in their library.</p>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" roleColor={roleColor}><Plus size={14} />{initial ? 'Save Changes' : 'Add Resource'}</Button>
          <Button type="button" variant="ghost" roleColor={roleColor} onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export function ResourceManagement() {
  const { resources, addResource, updateResource, deleteResource } = useAppStore()
  const [modalState, setModalState] = useState<{ open: boolean; editing?: Resource }>({ open: false })

  const handleSave = (data: FormData, roles: Role[], fileName?: string) => {
    if (modalState.editing) {
      updateResource(modalState.editing.id, { ...data, accessRoles: roles, fileName })
      toast.success('Resource updated.')
    } else {
      addResource({ id: `res-${Date.now()}`, ...data, accessRoles: roles, fileName, uploadedAt: new Date().toISOString().split('T')[0] })
      toast.success('Resource added.')
    }
    setModalState({ open: false })
  }

  const handleDelete = (r: Resource) => {
    deleteResource(r.id)
    toast.info(`"${r.title}" removed.`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library size={18} className="text-amber-600" />
          <div>
            <h2 className="text-base font-bold text-gray-900">Resource Library Management</h2>
            <p className="text-xs text-gray-500">{resources.length} resources · control access by role</p>
          </div>
        </div>
        <Button roleColor={roleColor} size="sm" onClick={() => setModalState({ open: true })}>
          <Plus size={14} />Add Resource
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Access</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resources.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {typeIcons[r.type] ?? <FileText size={14} className="text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-48">{r.title}</p>
                        <p className="text-xs text-gray-400">{r.fileName ? r.fileName : r.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <Badge color={typeBadgeColors[r.type] ?? 'gray'}>{r.type}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {r.accessRoles.map(role => (
                        <span key={role} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: roleColors[role] }}>
                          {roleLabels[role]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setModalState({ open: true, editing: r })}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 cursor-pointer transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(r)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalState.open && (
        <ResourceFormModal
          initial={modalState.editing}
          onSave={handleSave}
          onClose={() => setModalState({ open: false })}
        />
      )}
    </div>
  )
}
