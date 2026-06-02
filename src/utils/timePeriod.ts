import type { TimePeriod } from '../components/ui/TimePeriodSelector'

export interface TimeBucket { label: string; start: Date; end: Date }

export function getTimeBuckets(period: TimePeriod): TimeBucket[] {
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  if (period === 'day') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), start, end }
    })
  }

  if (period === 'week') {
    return Array.from({ length: 12 }, (_, i) => {
      const weeksAgo = 11 - i
      const end = new Date(); end.setDate(end.getDate() - weeksAgo * 7); end.setHours(23, 59, 59, 999)
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0)
      return { label: `W${i + 1}`, start, end }
    })
  }

  // year — last 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = 11 - i
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - monthsAgo)
    const start = new Date(d); start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    end.setHours(23, 59, 59, 999)
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      start,
      end,
    }
  })
}

export function inBucket(dateStr: string, bucket: TimeBucket): boolean {
  const d = new Date(dateStr)
  return d >= bucket.start && d <= bucket.end
}
