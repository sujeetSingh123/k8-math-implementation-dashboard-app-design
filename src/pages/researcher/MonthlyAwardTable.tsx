import { Card } from '../../components/ui/Card'

export interface MonthlyAmount {
  month: string
  label: string
  teacherTotal: number
  coachTotal: number
  adminTotal: number
  total: number
}

interface Props {
  semester: string
  rows: MonthlyAmount[]
  total: number
  color: string
}

export function MonthlyAwardTable({ semester, rows, total, color }: Props) {
  return (
    <Card title={`Amount to Award by Month — ${semester}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Month</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Teachers</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Coaches</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Admins</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Amount Needed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(m => (
              <tr key={m.month} className="hover:bg-gray-50">
                <td className="py-2.5 font-medium text-gray-800">{m.label}</td>
                <td className="py-2.5 text-right text-gray-600">${m.teacherTotal}</td>
                <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${m.coachTotal}</td>
                <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${m.adminTotal}</td>
                <td className="py-2.5 text-right font-bold text-gray-900">${m.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td className="py-2 text-xs font-bold text-gray-700 uppercase">Semester Total</td>
              <td colSpan={3} />
              <td className="py-2 text-right text-lg font-bold" style={{ color }}>${total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
