import { useAppStore } from '../store/useAppStore'

export function usePermissions() {
  const { currentRole, rolePermissions } = useAppStore()
  if (currentRole === 'super_admin') return (_permId: string) => true
  const ids = rolePermissions.find(rp => rp.role === currentRole)?.permissionIds ?? []
  const permSet = new Set(ids)
  return (permId: string) => permSet.has(permId)
}
