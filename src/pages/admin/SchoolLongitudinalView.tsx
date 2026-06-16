import { useAppStore } from '../../store/useAppStore'
import { LongitudinalView } from '../researcher/LongitudinalView'

export function SchoolLongitudinalView() {
  const { currentUser } = useAppStore()
  return <LongitudinalView lockedSchoolId={currentUser.schoolId} teacherBasePath="/admin/teacher" />
}
