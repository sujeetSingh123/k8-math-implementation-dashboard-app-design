import { useAppStore } from '../../store/useAppStore'
import { LongitudinalView } from '../researcher/LongitudinalView'

export function DistrictLongitudinalView() {
  const { currentUser } = useAppStore()
  return <LongitudinalView lockedDistrictId={currentUser.districtId} teacherBasePath="/district-admin/teacher" />
}
