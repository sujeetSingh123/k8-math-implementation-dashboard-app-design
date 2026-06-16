import { useAppStore } from '../../store/useAppStore'
import { LogAggregation } from '../researcher/LogAggregation'

export function DistrictLogAggregation() {
  const { currentUser } = useAppStore()
  return <LogAggregation lockedDistrictId={currentUser.districtId} teacherBasePath="/district-admin/teacher" />
}
