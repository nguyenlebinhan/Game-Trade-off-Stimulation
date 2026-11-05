import { act, cleanup, render, screen, within } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GameShell } from './GameShell'

afterEach(cleanup)
afterEach(() => { window.localStorage.clear(); vi.useRealTimers() })

const directions = ['Latency', 'Errors', 'Cost', 'Complexity']
function predictionFieldset() { return screen.getByRole('group', { name: /prediction/i }) }

describe('Feature 9 prediction-before-run flow', () => {
  it('requires predictions before running when the optional interaction is enabled', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('checkbox', { name: /enable prediction/i }))
    const group = predictionFieldset()
    for (const metric of directions) expect(within(group).getByRole('combobox', { name: new RegExp(metric, 'i') })).toBeRequired()
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    expect(screen.getByRole('group', { name: /prediction/i })).toBeInTheDocument()
    expect(screen.queryByText(/prediction comparison/i)).not.toBeInTheDocument()
  })
  it('compares each prediction with the deterministic result after a completed run', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('checkbox', { name: /enable prediction/i }))
    const group = predictionFieldset()
    for (const metric of directions) fireEvent.change(within(group).getByRole('combobox', { name: new RegExp(metric, 'i') }), { target: { value: 'worse' } })
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    const comparison = screen.getByRole('region', { name: /prediction comparison/i })
    for (const metric of directions) { expect(within(comparison).getByText(new RegExp(metric, 'i'))).toBeInTheDocument(); expect(within(comparison).getByText(/predicted/i)).toBeInTheDocument(); expect(within(comparison).getByText(/actual/i)).toBeInTheDocument() }
    expect(within(comparison).getByText(/trade-offs depend on workload|no architecture is universally correct/i)).toBeInTheDocument()
  })
  it('keeps predictions out of persistence and results', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('checkbox', { name: /enable prediction/i }))
    fireEvent.change(within(predictionFieldset()).getByRole('combobox', { name: /latency/i }), { target: { value: 'better' } })
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    const saved = JSON.parse(window.localStorage.getItem('architecture-run:scenario') ?? '{}')
    expect(saved).not.toHaveProperty('predictions'); expect(saved).not.toHaveProperty('predictionEnabled'); expect(screen.getByText('Simulation results')).toBeInTheDocument()
  })
  it('clears predictions and comparison on reset, then allows replay', () => {
    render(<GameShell />)
    fireEvent.click(screen.getByRole('checkbox', { name: /enable prediction/i }))
    fireEvent.change(within(predictionFieldset()).getByRole('combobox', { name: /latency/i }), { target: { value: 'better' } })
    for (const metric of ['Errors', 'Cost', 'Complexity']) fireEvent.change(within(predictionFieldset()).getByRole('combobox', { name: new RegExp(metric, 'i') }), { target: { value: 'same' } })
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' }))
    expect(screen.getByRole('region', { name: /prediction comparison/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset simulation' }))
    expect(screen.queryByRole('region', { name: /prediction comparison/i })).not.toBeInTheDocument(); expect(screen.queryByRole('checkbox', { name: /enable prediction/i })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Step simulation' })); expect(screen.getByText('Simulation results')).toBeInTheDocument(); expect(screen.queryByRole('region', { name: /prediction comparison/i })).not.toBeInTheDocument()
  })
  it('supports keyboard-only access to prediction controls and run', () => {
    render(<GameShell />)
    const toggle = screen.getByRole('checkbox', { name: /enable prediction/i }); toggle.focus(); fireEvent.keyDown(toggle, { key: ' ' }); expect(toggle).toBeChecked()
    const latency = within(predictionFieldset()).getByRole('combobox', { name: /latency/i }); latency.focus(); fireEvent.keyDown(latency, { key: 'ArrowDown' }); expect(document.activeElement).toBe(latency)
    vi.useFakeTimers(); const run = screen.getByRole('button', { name: 'Start simulation' }); run.focus(); fireEvent.keyDown(run, { key: 'Enter' }); expect(screen.getByRole('button', { name: 'Pause simulation' })).toBeInTheDocument(); act(() => { vi.advanceTimersByTime(900) }); expect(screen.getByText('Architecture evaluated')).toBeInTheDocument()
  })
})
