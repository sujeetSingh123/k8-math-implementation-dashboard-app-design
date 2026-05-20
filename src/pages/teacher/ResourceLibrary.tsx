import { useState } from 'react'
import { Play, FileText, Download, Library, ExternalLink } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import type { Resource } from '../../types'

type ResourceType = 'all' | 'video' | 'pdf' | 'word'

const typeIcons: Record<string, React.ReactNode> = {
  video: <Play size={20} className="text-blue-500" />,
  pdf: <FileText size={20} className="text-red-500" />,
  word: <FileText size={20} className="text-blue-600" />,
}

const typeBadgeColors: Record<string, 'blue' | 'red' | 'green' | 'purple'> = {
  video: 'blue', pdf: 'red', word: 'blue',
}

const filters: { key: ResourceType; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'video', label: 'Video' }, { key: 'pdf', label: 'PDF' }, { key: 'word', label: 'Word' },
]

function ResourcePreviewModal({ resource, roleColor, onClose }: { resource: Resource; roleColor: string; onClose: () => void }) {
  const isVideo = resource.type === 'video'
  return (
    <Modal open onClose={onClose} title={resource.title} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            {typeIcons[resource.type]}
          </div>
          <div>
            <Badge color={typeBadgeColors[resource.type] ?? 'gray'}>{resource.type}</Badge>
            <p className="text-xs text-gray-400 mt-0.5">{resource.duration}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
        {isVideo ? (
          <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <Play size={40} className="mx-auto mb-2 opacity-60" />
              <p className="text-sm opacity-60">Video preview — click Play to stream</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <FileText size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Document preview available after download</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button roleColor={roleColor} onClick={() => { toast.success(`Downloading ${resource.title}…`); onClose() }}>
            <Download size={14} />Download
          </Button>
          <Button variant="secondary" roleColor={roleColor} onClick={() => { toast.info('Opening in new tab…'); onClose() }}>
            <ExternalLink size={14} />Open
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function ResourceLibrary() {
  const { resources, currentUser, currentRole } = useAppStore()
  const roleColor = roleColors[currentRole]
  const [activeFilter, setActiveFilter] = useState<ResourceType>('all')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<Resource | null>(null)

  const filtered = resources.filter(r => {
    if (!r.accessRoles.includes(currentUser.role)) return false
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
            <button key={f.key} onClick={() => setActiveFilter(f.key)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{ backgroundColor: activeFilter === f.key ? roleColor : '#F3F4F6', color: activeFilter === f.key ? '#fff' : '#6B7280' }}>
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
            <Card key={res.id} className="flex flex-col gap-3 cursor-pointer hover:border-gray-300 transition-colors" onClick={() => setPreview(res)}>
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
              <div className="mt-auto pt-1" onClick={e => e.stopPropagation()}>
                <Button variant="secondary" roleColor={roleColor} size="sm" fullWidth onClick={() => toast.success(`Downloading ${res.title}…`)}>
                  <Download size={13} />Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {preview && <ResourcePreviewModal resource={preview} roleColor={roleColor} onClose={() => setPreview(null)} />}
    </div>
  )
}
