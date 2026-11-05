import { cleanup, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { GameShell } from './GameShell'

afterEach(cleanup)

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

  it.todo('steps the simulation once and exposes the resulting metrics and events')

  it.todo('shows before/after summary metrics and the quick explanation after a run')

  it.todo('resets the simulation to its initial state and clears the displayed result')
})
