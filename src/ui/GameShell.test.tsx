import { cleanup, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

afterEach(cleanup)
beforeEach(() => window.localStorage.clear())
afterEach(() => window.localStorage.clear())
import { GameShell } from './GameShell'

describe('game shell', () => {
  it('renders the campaign mission and core system nodes', () => {
    render(<GameShell />)
    expect(screen.getByText('Cứu shop trước giờ flash sale')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Mission progress' })).toHaveAttribute('aria-valuenow', '28')
    expect(screen.getByRole('button', { name: /Client/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Primary Database/ })).toBeInTheDocument()
    expect(screen.getByText('CPU đang tăng nhanh')).toBeInTheDocument()
  })

  it('updates component detail when a node is selected', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: /Primary Database/ }))
    expect(screen.getByRole('heading', { name: 'Primary Database' })).toBeInTheDocument()
    expect(screen.getAllByText('CRITICAL').length).toBeGreaterThanOrEqual(2)
  })

  it('resets the selected node to the initial App Server', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: /Primary Database/ }))
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
