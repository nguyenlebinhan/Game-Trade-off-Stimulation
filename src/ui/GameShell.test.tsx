import { cleanup, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

afterEach(cleanup)
beforeEach(() => window.localStorage.clear())
afterEach(() => window.localStorage.clear())
import { GameShell } from './GameShell'

describe('game shell', () => {
  it('keeps instance IDs unique after deletion and removes connected edges on reset', () => {
    render(<GameShell />)
    const instances: { id: string }[][] = []
    const edges: { source: string; target: string; type: string }[][] = []
    const onInstances = (event: Event) => instances.push((event as CustomEvent).detail)
    const onEdges = (event: Event) => edges.push((event as CustomEvent).detail)
    window.addEventListener('architecture:instances', onInstances)
    window.addEventListener('architecture:relations', onEdges)
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Add App server' }))
      fireEvent.click(screen.getByRole('button', { name: 'Add App server' }))
      const [first, second] = instances.at(-1)!
      fireEvent(window, new CustomEvent('architecture:select', { detail: first.id }))
      fireEvent.click(screen.getByRole('button', { name: 'Remove App server' }))
      fireEvent.click(screen.getByRole('button', { name: 'Add App server' }))
      const next = instances.at(-1)!
      expect(new Set(next.map((item) => item.id)).size).toBe(2)
      expect(next[0].id).toBe(second.id)
      fireEvent(window, new CustomEvent('architecture:connect', { detail: { source: next[0].id, target: next[1].id } }))
      expect(edges.at(-1)).toEqual([{ source: next[0].id, target: next[1].id, type: 'app-server-to-app-server' }])
      fireEvent.click(screen.getByRole('button', { name: 'Reset simulation' }))
      expect(edges.at(-1)).toEqual([])
      expect(instances.at(-1)).toEqual([])
    } finally {
      window.removeEventListener('architecture:instances', onInstances)
      window.removeEventListener('architecture:relations', onEdges)
    }
  })
  it('renders the campaign mission and core system nodes', () => {
    render(<GameShell />)
    expect(screen.getByText('Cứu shop trước giờ flash sale')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Mission progress' })).toHaveAttribute('aria-valuenow', '28')
    expect(screen.getByRole('button', { name: 'Select CLIENT' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select DATABASE' })).toBeInTheDocument()
    expect(screen.getByText('CPU đang tăng nhanh')).toBeInTheDocument()
  })

  it('updates component detail when a node is selected', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Select DATABASE' }))
    expect(screen.getByRole('heading', { name: 'Primary Database' })).toBeInTheDocument()
    expect(screen.getAllByText('CRITICAL').length).toBeGreaterThanOrEqual(1)
  })

  it('renders an interactive isometric scene with derived infrastructure nodes', () => {
    render(<GameShell />)
    expect(screen.getByLabelText('Interactive 3D architecture scene')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select REPLICA' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select SHARD 01' })).toBeInTheDocument()
    expect(document.querySelectorAll('.flow').length).toBe(3)
    fireEvent.click(screen.getByRole('button', { name: 'Select REPLICA' }))
    expect(screen.getByRole('heading', { name: 'Primary Database' })).toBeInTheDocument()
    expect(screen.getByText(/Architecture ready/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    expect(screen.getByText(/Evaluated after state/)).toBeInTheDocument()
  })

  it('keeps the semantic scene fallback available while the mesh renderer is deferred', () => {
    render(<GameShell />)
    expect(screen.getByLabelText('Interactive 3D architecture scene')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select CLIENT' })).toBeInTheDocument()
    expect(document.querySelector('.three-layer')).not.toBeInTheDocument()
  })

  it('keeps every scene target present in the compact 320px layout', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 })
    render(<GameShell />)
    expect(screen.getByLabelText('Interactive 3D architecture scene')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Select (CLIENT|APP SERVER|DATABASE|REPLICA|SHARD)/ }).length).toBe(6)
  })

  it('composes the simulation as a play space with floating HUD, tool rail, controls, and tactical map', () => {
    render(<GameShell />)
    expect(document.querySelector('.scene-stage')).toBeInTheDocument()
    expect(document.querySelector('.task-panel')).toBeInTheDocument()
    expect(document.querySelector('.model-toolbar')).toBeInTheDocument()
    expect(document.querySelector('.controls')).toBeInTheDocument()
    expect(document.querySelector('.scene-stage')?.className).toContain('scene-stage')
  })

  it('adds a role mesh through the accessible palette and exposes its inspector', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Add App server' }))
    expect(screen.getByRole('region', { name: 'Architecture palette' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Placed element inspector' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Element capacity' }), { target: { value: '900' } })
    expect(screen.getByRole('spinbutton', { name: 'Element capacity' })).toHaveValue(900)
    fireEvent.click(screen.getByRole('button', { name: 'Remove App server' }))
    expect(screen.queryByRole('region', { name: 'Placed element inspector' })).not.toBeInTheDocument()
  })

  it('resets the selected node to the initial App Server', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Select DATABASE' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset system model' }))

    expect(screen.getByRole('heading', { name: 'App Server' })).toBeInTheDocument()
    expect(screen.getByText('CPU đang tăng nhanh')).toBeInTheDocument()
  })

  it('provides an accessible simulation toggle', () => {
    render(<GameShell />)
    const toggle = screen.getByRole('button', { name: 'Start simulation' })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Pause simulation' })).toBeInTheDocument()
  })

  it('opens an accessible campaign map with one playable level and locked future levels', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Open campaign map' }))
    expect(screen.getByRole('dialog', { name: 'Cứu shop trước giờ flash sale' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Database overload/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Cache storm, locked, coming soon')).toBeInTheDocument()
    expect(screen.getByLabelText('Queue backlog, locked, coming soon')).toBeInTheDocument()
    expect(screen.getByText('Progress saved locally in this browser.')).toBeInTheDocument()
  })

  it('shows Feature 5 saved scenario progress in the map', () => {
    window.localStorage.setItem('architecture-run:scenario', JSON.stringify({ requestsPerSecond: 1240, readRatio: 0.75, dbCapacity: { readRps: 500, writeRps: 180 }, scaleUpCapacity: { readRps: 0, writeRps: 0 }, readReplicas: 0, shardCount: 1, shardDistribution: 'even' }))
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Open campaign map' }))
    expect(screen.getByText('Progress saved locally in this browser.')).toBeInTheDocument()
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
  })

  it('marks Database overload completed after a healthy solution and restores it on reload', () => {
    render(<GameShell />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Scale-up read capacity' }), { target: { value: '500' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Scale-up write capacity' }), { target: { value: '1000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open campaign map' }))
    expect(screen.getByText('COMPLETED')).toBeInTheDocument()
    expect(window.localStorage.getItem('architecture-run:completion')).toBe('true')
    cleanup()
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Open campaign map' }))
    expect(screen.getByText('COMPLETED')).toBeInTheDocument()
  })

  it('clears completion through the reset path', () => {
    window.localStorage.setItem('architecture-run:completion', 'true')
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset simulation' }))
    expect(window.localStorage.getItem('architecture-run:completion')).toBeNull()
  })

  it('moves focus into the map, traps Tab, and closes on Escape restoring the opener', () => {
    render(<GameShell />)
    const opener = screen.getByRole('button', { name: 'Open campaign map' })
    opener.focus()
    fireEvent.click(opener)
    const close = screen.getByRole('button', { name: 'Close campaign map' })
    const level = screen.getByRole('button', { name: /Database overload/ })
    expect(document.activeElement).toBe(close)

    level.focus()
    fireEvent.keyDown(level, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    close.focus()
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(level)

    fireEvent.keyDown(level, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(opener)
  })
})
