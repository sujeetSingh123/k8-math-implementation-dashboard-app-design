import { useAppStore } from '../store/useAppStore'

export function usePermissions() {
  const { currentRole, rolePermissions } = useAppStore()
  const ids = rolePermissions.find(rp => rp.role === currentRole)?.permissionIds ?? []
  const set = new Set(ids)
  return (permId: string) => set.has(permId)
}
