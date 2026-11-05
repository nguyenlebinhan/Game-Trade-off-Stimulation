import { describe, expect, it } from 'vitest'
import { createInitialSystemState, initialSystemConfiguration, resetSystemState, selectNode } from './system-model'

describe('system model', () => {
  it('creates the initial three-node topology with App Server selected', () => {
    const state = createInitialSystemState()

    expect(state.nodes.map((node) => node.id)).toEqual(['client', 'app-server', 'database'])
    expect(state.connections).toEqual([
      { id: 'client-to-app', sourceId: 'client', targetId: 'app-server' },
      { id: 'app-to-database', sourceId: 'app-server', targetId: 'database' },
    ])
    expect(state.selectedNodeId).toBe('app-server')
  })

  it('selects a node without mutating the previous state', () => {
    const initialState = createInitialSystemState()
    const nextState = selectNode(initialState, 'database')

    expect(nextState.selectedNodeId).toBe('database')
    expect(initialState.selectedNodeId).toBe('app-server')
    expect(nextState).not.toBe(initialState)
  })

  it('resets to a fresh copy of the initial state', () => {
    const changedState = selectNode(createInitialSystemState(), 'database')
    const resetState = resetSystemState(changedState)

    expect(resetState.selectedNodeId).toBe('app-server')
    expect(resetState.nodes.map((node) => node.id)).toEqual(['client', 'app-server', 'database'])
    expect(resetState.nodes).not.toBe(changedState.nodes)
    expect(resetState.connections).not.toBe(changedState.connections)
  })

  it('protects initial data from accidental mutation and shared references', () => {
    const firstState = createInitialSystemState()
    const secondState = createInitialSystemState()

    expect(Object.isFrozen(initialSystemConfiguration)).toBe(true)
    expect(Object.isFrozen(firstState)).toBe(true)
    expect(Object.isFrozen(firstState.nodes)).toBe(true)
    expect(Object.isFrozen(firstState.nodes[0])).toBe(true)
    expect(firstState.nodes[0]).not.toBe(secondState.nodes[0])
  })
})
