import { useEffect, useRef, useState } from 'react'

type ElementKind = 'client' | 'app-server' | 'database' | 'replica' | 'shard'
type PlacedElement = { id: string; kind: ElementKind; label: string; capacity: number; x?: number; z?: number }
type Relation = { source: string; target: string; type: string }
const palette: readonly { kind: ElementKind; label: string; limit: number }[] = [
  { kind: 'client', label: 'Client device', limit: 2 }, { kind: 'app-server', label: 'App server', limit: 2 },
  { kind: 'database', label: 'Primary database', limit: 1 }, { kind: 'replica', label: 'Read replica', limit: 2 }, { kind: 'shard', label: 'Shard partition', limit: 4 },
]

export function ArchitecturePalette() {
  const sequence = useRef(0)
  const [placed, setPlaced] = useState<PlacedElement[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [relations, setRelations] = useState<Relation[]>([])
  const selectedElement = placed.find((element) => element.id === selected)
  const publish = (next: PlacedElement[], nextRelations = relations) => {
    setPlaced(next); setRelations(nextRelations)
    window.dispatchEvent(new CustomEvent('architecture:instances', { detail: next }))
    window.dispatchEvent(new CustomEvent('architecture:relations', { detail: nextRelations }))
  }
  const add = (kind: ElementKind, position?: { x: number; z: number }) => {
    const config = palette.find((item) => item.kind === kind)!
    const count = placed.filter((element) => element.kind === kind).length
    if (count >= config.limit) return
    const id = `${kind}-${++sequence.current}`
    setSelected(id)
    publish([...placed, { id, kind, label: config.label, capacity: kind === 'app-server' ? 500 : kind === 'database' ? 680 : 250, x: -.8 + (placed.length % 2) * 1.4, z: -.5 + Math.floor(placed.length / 2) * 1.2, ...position }])
  }
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>('.scene-stage'); if (!stage) return
    const over = (event: DragEvent) => event.preventDefault()
    const drop = (event: DragEvent) => { event.preventDefault(); const kind = event.dataTransfer?.getData('application/x-architecture-kind') as ElementKind; if (!kind) return; const rect = stage.getBoundingClientRect(); add(kind, { x: ((event.clientX - rect.left) / rect.width - .5) * 7, z: ((event.clientY - rect.top) / rect.height - .5) * 4 }) }
    const picked = (event: Event) => setSelected((event as CustomEvent<string>).detail)
    const connected = (event: Event) => { const { source, target } = (event as CustomEvent<{ source: string; target: string }>).detail; const from = placed.find((item) => item.id === source); const to = placed.find((item) => item.id === target); if (from && to && source !== target && !relations.some((item) => item.source === source && item.target === target)) publish(placed, [...relations, { source, target, type: `${from.kind}-to-${to.kind}` }]) }
    const reset = () => { publish([], []); setSelected(null) }
    stage.addEventListener('dragover', over); stage.addEventListener('drop', drop); window.addEventListener('architecture:select', picked); window.addEventListener('architecture:connect', connected); window.addEventListener('architecture:reset', reset)
    return () => { stage.removeEventListener('dragover', over); stage.removeEventListener('drop', drop); window.removeEventListener('architecture:select', picked); window.removeEventListener('architecture:connect', connected); window.removeEventListener('architecture:reset', reset) }
  })
  const remove = () => { if (!selected) return; publish(placed.filter((element) => element.id !== selected), relations.filter((relation) => relation.source !== selected && relation.target !== selected)); setSelected(null) }
  return <section className="architecture-palette" aria-label="Architecture palette">
    <div className="palette-heading"><span>BUILD LOADOUT</span><small>{placed.length}/8 placed</small></div>
    <p className="palette-help">Drag a role into the ground, or use Add. Select a body, then connect it to a target.</p>
    <div className="palette-list">{palette.map((item) => <button key={item.kind} draggable onDragStart={(event) => event.dataTransfer.setData('application/x-architecture-kind', item.kind)} onClick={() => add(item.kind)} aria-label={`Add ${item.label}`}><span className={`palette-glyph ${item.kind}`} /><span>{item.label}</span><small>{placed.filter((element) => element.kind === item.kind).length}/{item.limit}</small></button>)}</div>
    {selectedElement && <div className="inspector" role="region" aria-label="Placed element inspector"><div><span>INSPECTOR</span><button onPointerUp={(event) => { if (event.pointerType === 'touch') { event.preventDefault(); remove() } }} onClick={remove} aria-label={`Remove ${selectedElement.label}`}>Remove</button></div><strong>{selectedElement.label}</strong><label>Capacity<input aria-label="Element capacity" type="number" value={selectedElement.capacity} onChange={(event) => publish(placed.map((element) => element.id === selected ? { ...element, capacity: Number(event.target.value) } : element))} /></label><button className="connector-handle" aria-label={`Drag connector from ${selectedElement.label}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId) }} onPointerUp={(event) => { window.dispatchEvent(new CustomEvent('architecture:connect-at', { detail: { source: selected, x: event.clientX, y: event.clientY } })) }}>Drag connector to another mesh</button><div className="connection-list"><span>CONNECT TO</span>{placed.filter((element) => element.id !== selected).map((element) => <button key={element.id} onClick={() => { const relation = { source: selected!, target: element.id, type: `${selectedElement.kind}-to-${element.kind}` }; if (!relations.some((item) => item.source === relation.source && item.target === relation.target)) publish(placed, [...relations, relation]) }} aria-label={`Connect to ${element.label}`}>{element.label}</button>)}</div></div>}
    {relations.length > 0 && <div className="relation-status" aria-live="polite">{relations.length} relationship edge{relations.length === 1 ? '' : 's'} active</div>}
    <button className="palette-reset" onClick={() => { publish([], []); setSelected(null) }}>Reset placed elements</button>
  </section>
}
