import { cleanup, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(cleanup)
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
})
