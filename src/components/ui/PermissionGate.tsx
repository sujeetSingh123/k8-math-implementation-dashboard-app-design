import { Lock } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

export function PermissionGate({ permissionId, children }: { permissionId: string; children: React.ReactNode }) {
  const has = usePermissions()
  if (has(permissionId)) return <>{children}</>
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Lock size={24} />
      </div>
      <p className="text-base font-semibold text-gray-700 mb-1">Access Restricted</p>
      <p className="text-sm text-center max-w-xs leading-relaxed">
        Your role doesn't have permission to view this page. Contact an administrator to request access.
      </p>
    </div>
  )
}
