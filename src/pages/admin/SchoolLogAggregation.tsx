import { useAppStore } from '../../store/useAppStore'
import { LogAggregation } from '../researcher/LogAggregation'

export function SchoolLogAggregation() {
  const { currentUser } = useAppStore()
  return <LogAggregation lockedSchoolId={currentUser.schoolId} teacherBasePath="/admin/teacher" />
}
