import { ebpHierarchy } from '../../data/mockData'

type Props = {
  selectedEBPs: string[]
  selectedComponents: string[]
  onChangeEBPs: (ids: string[]) => void
  onChangeComponents: (components: string[]) => void
  roleColor: string
}

export function EBPSelector({ selectedEBPs, selectedComponents, onChangeEBPs, onChangeComponents, roleColor }: Props) {
  const toggleEBP = (id: string) => {
    if (selectedEBPs.includes(id)) {
      const ebp = ebpHierarchy.find(e => e.id === id)
      const removedComponents: readonly string[] = ebp ? ebp.components : []
      onChangeComponents(selectedComponents.filter(c => !removedComponents.includes(c)))
      onChangeEBPs(selectedEBPs.filter(e => e !== id))
    } else {
      onChangeEBPs([...selectedEBPs, id])
    }
  }

  const toggleComponent = (component: string) => {
    onChangeComponents(
      selectedComponents.includes(component)
        ? selectedComponents.filter(c => c !== component)
        : [...selectedComponents, component]
    )
  }

  const activeEBPs = ebpHierarchy.filter(e => selectedEBPs.includes(e.id))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ebpHierarchy.map(ebp => {
          const selected = selectedEBPs.includes(ebp.id)
          return (
            <button
              key={ebp.id}
              type="button"
              onClick={() => toggleEBP(ebp.id)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-150 cursor-pointer"
              style={{
                borderColor: selected ? roleColor : '#D1D5DB',
                backgroundColor: selected ? roleColor : '#FFFFFF',
                color: selected ? '#FFFFFF' : '#6B7280',
              }}
            >
              {ebp.name}
            </button>
          )
        })}
      </div>

      {activeEBPs.length > 0 && (
        <div className="space-y-2 pl-1">
          {activeEBPs.map(ebp => (
            <div key={ebp.id}>
              <p className="text-xs font-semibold text-gray-500 mb-1">{ebp.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {ebp.components.map(component => {
                  const selected = selectedComponents.includes(component)
                  const label = component.length > 60 ? component.slice(0, 60) + '…' : component
                  return (
                    <button
                      key={component}
                      type="button"
                      title={component}
                      onClick={() => toggleComponent(component)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer"
                      style={{
                        borderColor: selected ? roleColor : '#D1D5DB',
                        backgroundColor: selected ? roleColor : '#F9FAFB',
                        color: selected ? '#FFFFFF' : '#4B5563',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
