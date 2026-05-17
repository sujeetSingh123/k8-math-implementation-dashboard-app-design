import { useState } from 'react'
import { Play, FileText, CheckSquare, Clipboard, Download, Library } from 'lucide-react'
import { resources } from '../../data/mockData'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const roleColor = '#10B981'

type ResourceType = 'all' | 'video' | 'pdf' | 'checklist' | 'rubric'

const typeIcons: Record<string, React.ReactNode> = {
  video: <Play size={20} className="text-blue-500" />,
  pdf: <FileText size={20} className="text-red-500" />,
  checklist: <CheckSquare size={20} className="text-emerald-500" />,
  rubric: <Clipboard size={20} className="text-purple-500" />,
}

const typeBadgeColors: Record<string, 'blue' | 'red' | 'green' | 'purple'> = {
  video: 'blue',
  pdf: 'red',
  checklist: 'green',
  rubric: 'purple',
}

const filters: { key: ResourceType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Video' },
  { key: 'pdf', label: 'PDF' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'rubric', label: 'Rubric' },
]

export function ResourceLibrary() {
  const [activeFilter, setActiveFilter] = useState<ResourceType>('all')
  const [search, setSearch] = useState('')

  const filtered = resources.filter(r => {
    const matchesType = activeFilter === 'all' || r.type === activeFilter
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <div className="flex gap-1 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: activeFilter === f.key ? roleColor : '#F3F4F6',
                color: activeFilter === f.key ? '#fff' : '#6B7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Library size={28} className="mb-2" />
          <p className="text-sm">No resources match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(res => (
            <Card key={res.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {typeIcons[res.type] ?? <FileText size={20} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{res.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{res.duration}</p>
                  </div>
                </div>
                <Badge color={typeBadgeColors[res.type] ?? 'gray'}>{res.type}</Badge>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{res.description}</p>
              <div className="mt-auto pt-1">
                <Button variant="secondary" roleColor={roleColor} size="sm" fullWidth>
                  <Download size={13} />Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
