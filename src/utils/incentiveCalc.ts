import type { ImplementationLog, StudentDataRecord, FidelityCheck, User } from '../types'

// ── Semester utilities ────────────────────────────────────────────────────────
export function getSemester(dateStr: string): string {
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const y = d.getFullYear()
  if (m >= 8) return `Fall ${y}`
  if (m >= 6) return `Summer ${y}`
  return `Spring ${y}`
}

export function getSemesterRange(semester: string): [Date, Date] {
  const [term, yr] = semester.split(' ')
  const year = parseInt(yr)
  if (term === 'Fall') return [new Date(year, 7, 1), new Date(year, 11, 31, 23, 59, 59)]
  if (term === 'Summer') return [new Date(year, 5, 1), new Date(year, 6, 31, 23, 59, 59)]
  return [new Date(year, 0, 1), new Date(year, 4, 31, 23, 59, 59)]
}

export function filterLogsBySemester(logs: ImplementationLog[], semester: string): ImplementationLog[] {
  const [start, end] = getSemesterRange(semester)
  return logs.filter(l => { const d = new Date(l.date); return d >= start && d <= end })
}

export function filterStudentDataBySemester(records: StudentDataRecord[], semester: string): StudentDataRecord[] {
  const [start, end] = getSemesterRange(semester)
  return records.filter(r => { const d = new Date(r.date); return d >= start && d <= end })
}

export function filterFidelityBySemester(checks: FidelityCheck[], semester: string): FidelityCheck[] {
  const [start, end] = getSemesterRange(semester)
  return checks.filter(c => { const d = new Date(c.date); return d >= start && d <= end })
}

export function currentSemester(): string {
  return getSemester(new Date().toISOString())
}

export function sortSemesters(semesters: string[]): string[] {
  const order: Record<string, number> = { Fall: 3, Spring: 2, Summer: 1 }
  return [...semesters].sort((a, b) => {
    const [tA, yA] = a.split(' '), [tB, yB] = b.split(' ')
    if (yA !== yB) return parseInt(yB) - parseInt(yA)
    return (order[tB] ?? 0) - (order[tA] ?? 0)
  })
}

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface TeacherBreakdown {
  userId: string
  name: string
  schoolId: string
  logRate: number
  twoWeekPerfect: number
  base: number
  twoWeekBonus: number
  rateBonus: number
  total: number
}

export interface CoachBreakdown {
  userId: string
  name: string
  schoolId: string
  avgLogRate: number
  base: number
  rateBonus: number
  avgTeacherFidelity: number
  allOnTrack: boolean
  teacherPerfBonus: number
  allOnTrackBonus: number
  total: number
}

export interface AdminBreakdown {
  userId: string
  name: string
  schoolId: string
  avgLogRate: number
  base: number
  rateBonus: number
  total: number
}

export interface SchoolTotal {
  schoolId: string
  teacherTotal: number
  coachTotal: number
  adminTotal: number
  total: number
}

// ── Log rate ──────────────────────────────────────────────────────────────────
export function calcLogRate(logs: ImplementationLog[], teacherId: string): number {
  const tl = logs.filter(l => l.teacherId === teacherId)
  if (!tl.length) return 0
  return Math.round((tl.filter(l => l.lessonCompletion === 'fully').length / tl.length) * 100)
}

function countTwoWeekPerfect(logs: ImplementationLog[], teacherId: string): number {
  const tl = [...logs.filter(l => l.teacherId === teacherId)].sort((a, b) => a.date.localeCompare(b.date))
  if (tl.length < 2) return 0
  let count = 0
  let cursor = new Date(tl[0].date)
  const last = new Date(tl[tl.length - 1].date)
  while (cursor <= last) {
    const end = new Date(cursor)
    end.setDate(end.getDate() + 13)
    const window = tl.filter(l => { const d = new Date(l.date); return d >= cursor && d <= end })
    if (window.length >= 2 && window.every(l => l.lessonCompletion === 'fully')) count++
    cursor.setDate(cursor.getDate() + 14)
  }
  return count
}

// ── Rate bonus tables ─────────────────────────────────────────────────────────
function teacherRateBonus(rate: number): number {
  if (rate >= 81) return 30
  if (rate >= 71) return 20
  if (rate >= 60) return 10
  return 0
}

function coachRateBonus(rate: number): number {
  if (rate >= 81) return 30
  if (rate >= 71) return 20
  if (rate >= 60) return 10
  return 0
}

function adminRateBonus(rate: number): number {
  if (rate >= 81) return 100
  if (rate >= 71) return 80
  if (rate >= 60) return 50
  return 0
}

// ── Teacher fidelity performance bonus (coach) ────────────────────────────────
function calcTeacherAvgFidelity(checks: FidelityCheck[], teacherId: string): number {
  const tc = checks.filter(c => c.teacherId === teacherId)
  if (!tc.length) return 0
  return tc.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / tc.length
}

function fidelityPerfBonus(avgFidelity: number): number {
  if (avgFidelity >= 4.0) return 50
  if (avgFidelity >= 3.5) return 30
  if (avgFidelity >= 3.0) return 15
  return 0
}

// ── Public calc functions ─────────────────────────────────────────────────────
export function calcTeacherBreakdown(teacher: User, logs: ImplementationLog[]): TeacherBreakdown {
  const logRate = calcLogRate(logs, teacher.id)
  const twoWeekPerfect = countTwoWeekPerfect(logs, teacher.id)
  const base = 50
  const twoWeekBonus = twoWeekPerfect * 5
  const rateBonus = teacherRateBonus(logRate)
  return {
    userId: teacher.id, name: teacher.name, schoolId: teacher.schoolId,
    logRate, twoWeekPerfect, base, twoWeekBonus, rateBonus,
    total: base + twoWeekBonus + rateBonus,
  }
}

export function calcCoachBreakdown(
  coach: User,
  teachers: User[],
  logs: ImplementationLog[],
  fidelityChecks: FidelityCheck[] = [],
): CoachBreakdown {
  const myTeachers = teachers.filter(t => t.coachId === coach.id)
  const rates = myTeachers.map(t => calcLogRate(logs, t.id))
  const avgLogRate = rates.length ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0
  const base = 100
  const rateBonus = coachRateBonus(avgLogRate)
  const fidelities = myTeachers.map(t => calcTeacherAvgFidelity(fidelityChecks, t.id))
  const avgTeacherFidelity = fidelities.length
    ? parseFloat((fidelities.reduce((s, f) => s + f, 0) / fidelities.length).toFixed(2))
    : 0
  const allOnTrack = fidelities.length > 0 && fidelities.every(f => f >= 4.0)
  const teacherPerfBonus = fidelityPerfBonus(avgTeacherFidelity)
  const allOnTrackBonus = allOnTrack ? 25 : 0
  return {
    userId: coach.id, name: coach.name, schoolId: coach.schoolId,
    avgLogRate, base, rateBonus,
    avgTeacherFidelity, allOnTrack, teacherPerfBonus, allOnTrackBonus,
    total: base + rateBonus + teacherPerfBonus + allOnTrackBonus,
  }
}

export function calcAdminBreakdown(admin: User, teachers: User[], logs: ImplementationLog[]): AdminBreakdown {
  const schoolTeachers = teachers.filter(t => t.schoolId === admin.schoolId)
  const rates = schoolTeachers.map(t => calcLogRate(logs, t.id))
  const avgLogRate = rates.length ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0
  const base = 200
  const rateBonus = adminRateBonus(avgLogRate)
  return { userId: admin.id, name: admin.name, schoolId: admin.schoolId, avgLogRate, base, rateBonus, total: base + rateBonus }
}

// ── Label helpers ─────────────────────────────────────────────────────────────
export function rateTierLabel(rate: number, role: 'teacher' | 'coach' | 'admin'): string {
  if (rate >= 81) return role === 'admin' ? '+$100 (81–100%)' : '+$30 (81–100%)'
  if (rate >= 71) return role === 'admin' ? '+$80 (71–80%)' : '+$20 (71–80%)'
  if (rate >= 60) return role === 'admin' ? '+$50 (60–70%)' : '+$10 (60–70%)'
  return '$0 (below 60%)'
}

export function fidelityPerfTierLabel(fidelity: number): string {
  if (fidelity >= 4.0) return '+$50 (avg ≥ 4.0)'
  if (fidelity >= 3.5) return '+$30 (avg ≥ 3.5)'
  if (fidelity >= 3.0) return '+$15 (avg ≥ 3.0)'
  return '$0 (avg below 3.0)'
}
