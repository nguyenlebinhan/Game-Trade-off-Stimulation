import { act, cleanup, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GameShell } from './GameShell'

afterEach(cleanup)
afterEach(() => { window.localStorage.clear(); vi.useRealTimers() })

describe('Feature 4 simulation UI integration', () => {
  it('lets the user start and pause the simulation from the control bar', () => {
    render(<GameShell />)

    fireEvent.click(screen.getByRole('button', { name: 'Start simulation' }))
    expect(screen.getByRole('button', { name: 'Pause simulation' })).toBeInTheDocument()
    expect(screen.getByText('Simulation running')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pause simulation' }))
    expect(screen.getByRole('button', { name: 'Start simulation' })).toBeInTheDocument()
    expect(screen.getByText('Ready to simulate')).toBeInTheDocument()
  })

  it('steps once and exposes deterministic results', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    expect(screen.getByText('Architecture evaluated')).toBeInTheDocument()
    expect(screen.getByText('Simulation results')).toBeInTheDocument()
  })

  it('runs with purposeful animation state and publishes results after the deterministic delay', () => {
    vi.useFakeTimers()
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Start simulation' }))
    expect(document.querySelector('.simulation-running')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(900) })
    expect(screen.getByText('Architecture evaluated')).toBeInTheDocument()
  })

  it('resets output and persisted scenario configuration', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    expect(window.localStorage.getItem('architecture-run:scenario')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reset simulation' }))
    expect(screen.getByText('Ready to simulate')).toBeInTheDocument()
    expect(screen.getByText(/Run or step the simulation/)).toBeInTheDocument()
    expect(window.localStorage.getItem('architecture-run:scenario')).toBeNull()
  })
})
