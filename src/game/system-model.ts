export type NodeId = 'client' | 'app-server' | 'database'
export type NodeStatus = 'healthy' | 'warning' | 'critical'

export type SystemNode = Readonly<{
  id: NodeId
  label: string
  kind: string
  status: NodeStatus
  detail: string
  requestsPerSecond: number
}>

export type SystemConnection = Readonly<{
  id: string
  sourceId: NodeId
  targetId: NodeId
}>

export type SystemState = Readonly<{
  nodes: readonly SystemNode[]
  connections: readonly SystemConnection[]
  selectedNodeId: NodeId
}>

const initialNodes: readonly SystemNode[] = [
  { id: 'client', label: 'Client', kind: 'Traffic entry', status: 'healthy', detail: 'Web & mobile shoppers', requestsPerSecond: 1240 },
  { id: 'app-server', label: 'App Server', kind: 'Compute', status: 'warning', detail: 'CPU đang tăng nhanh', requestsPerSecond: 1180 },
  { id: 'database', label: 'Primary Database', kind: 'Storage', status: 'critical', detail: 'Connection pool gần đầy', requestsPerSecond: 980 },
]

const initialConnections: readonly SystemConnection[] = [
  { id: 'client-to-app', sourceId: 'client', targetId: 'app-server' },
  { id: 'app-to-database', sourceId: 'app-server', targetId: 'database' },
]

export const initialSystemConfiguration = Object.freeze({
  nodes: Object.freeze(initialNodes.map((node) => Object.freeze({ ...node }))),
  connections: Object.freeze(initialConnections.map((connection) => Object.freeze({ ...connection }))),
  selectedNodeId: 'app-server' as const,
})

export function createInitialSystemState(): SystemState {
  return Object.freeze({
    nodes: Object.freeze(initialSystemConfiguration.nodes.map((node) => Object.freeze({ ...node }))),
    connections: Object.freeze(initialSystemConfiguration.connections.map((connection) => Object.freeze({ ...connection }))),
    selectedNodeId: initialSystemConfiguration.selectedNodeId,
  })
}

export function selectNode(state: SystemState, nodeId: NodeId): SystemState {
  return Object.freeze({ ...state, selectedNodeId: nodeId })
}

export function resetSystemState(_state: SystemState): SystemState {
  return createInitialSystemState()
}

export type SystemStateAction =
  | Readonly<{ type: 'select-node'; nodeId: NodeId }>
  | Readonly<{ type: 'reset' }>

export function systemStateReducer(state: SystemState, action: SystemStateAction): SystemState {
  switch (action.type) {
    case 'select-node':
      return selectNode(state, action.nodeId)
    case 'reset':
      return resetSystemState(state)
  }
}
