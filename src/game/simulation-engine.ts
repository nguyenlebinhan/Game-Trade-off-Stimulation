export type Capacity = Readonly<{ readRps: number; writeRps: number }>
export type ShardDistribution = 'even' | readonly number[]

export type ScenarioConfiguration = Readonly<{
  requestsPerSecond: number
  readRatio: number
  dbCapacity: Capacity
  scaleUpCapacity: Capacity
  readReplicas: number
  shardCount: number
  shardDistribution: ShardDistribution
}>

export type NodeLoad = Readonly<{
  id: string
  role: 'primary' | 'read-replica'
  shard: number
  readRps: number
  writeRps: number
  readCapacityRps: number
  writeCapacityRps: number
  utilization: number
  queueRps: number
  errorRps: number
}>

export type SimulationSummary = Readonly<{
  servedRps: number
  queueRps: number
  errorRps: number
  errorRate: number
}>

export type SimulationSnapshot = Readonly<{
  summary: SimulationSummary
  nodes: readonly NodeLoad[]
  latencyMs: number
  costUnits: number
  complexityScore: number
  replicationLagMs: number
  staleReadRate: number
  hotShardId: string | null
}>

export type SimulationEvent = Readonly<{
  code: string
  severity: 'info' | 'warning' | 'critical'
  message: string
}>

export type SimulationResult = Readonly<{
  configuration: ScenarioConfiguration
  before: SimulationSnapshot
  after: SimulationSnapshot
  events: readonly SimulationEvent[]
  quickExplanation: string
  technicalExplanation: string
  assumptions: readonly string[]
  limitations: readonly string[]
}>

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach((item) => deepFreeze(item))
    Object.freeze(value)
  }
  return value
}

const round = (value: number, digits = 3) => Number(value.toFixed(digits))

function validate(configuration: ScenarioConfiguration) {
  if (configuration.requestsPerSecond < 0) throw new RangeError('requestsPerSecond must be non-negative')
  if (configuration.readRatio < 0 || configuration.readRatio > 1) throw new RangeError('readRatio must be between 0 and 1')
  if (!Number.isInteger(configuration.readReplicas) || configuration.readReplicas < 0) throw new RangeError('readReplicas must be a non-negative integer')
  if (!Number.isInteger(configuration.shardCount) || configuration.shardCount < 1) throw new RangeError('shardCount must be a positive integer')
  const capacities = [configuration.dbCapacity.readRps, configuration.dbCapacity.writeRps, configuration.scaleUpCapacity.readRps, configuration.scaleUpCapacity.writeRps]
  if (capacities.some((capacity) => capacity < 0)) throw new RangeError('capacities must be non-negative')
  if (configuration.dbCapacity.readRps === 0 || configuration.dbCapacity.writeRps === 0) throw new RangeError('database capacity must be greater than zero')
  if (configuration.shardDistribution !== 'even') {
    if (configuration.shardDistribution.length !== configuration.shardCount) throw new RangeError('shardDistribution length must match shardCount')
    const total = configuration.shardDistribution.reduce((sum, weight) => sum + weight, 0)
    if (configuration.shardDistribution.some((weight) => weight < 0) || Math.abs(total - 1) > 0.0001) throw new RangeError('shardDistribution weights must be non-negative and sum to 1')
  }
}

function distributionFor(shardCount: number, distribution: ShardDistribution) {
  if (distribution !== 'even') return [...distribution]
  return Array.from({ length: shardCount }, () => 1 / shardCount)
}

function calculateSnapshot(configuration: ScenarioConfiguration, applyStrategies: boolean): SimulationSnapshot {
  const shardCount = applyStrategies ? configuration.shardCount : 1
  const readReplicas = applyStrategies ? configuration.readReplicas : 0
  const scaleUp = applyStrategies ? configuration.scaleUpCapacity : { readRps: 0, writeRps: 0 }
  const distribution = distributionFor(shardCount, applyStrategies ? configuration.shardDistribution : 'even')
  const readCapacity = configuration.dbCapacity.readRps + scaleUp.readRps
  const writeCapacity = configuration.dbCapacity.writeRps + scaleUp.writeRps
  const totalRead = configuration.requestsPerSecond * configuration.readRatio
  const totalWrite = configuration.requestsPerSecond - totalRead
  const nodes: NodeLoad[] = []

  distribution.forEach((weight, index) => {
    const shard = index + 1
    const shardRead = totalRead * weight
    const shardWrite = totalWrite * weight
    const readPerNode = shardRead / (readReplicas + 1)
    const primaryReadExcess = Math.max(0, readPerNode - readCapacity)
    const primaryWriteExcess = Math.max(0, shardWrite - writeCapacity)
    const primaryQueue = primaryReadExcess + primaryWriteExcess
    nodes.push({
      id: `primary-${shard}`, role: 'primary', shard,
      readRps: round(readPerNode), writeRps: round(shardWrite),
      readCapacityRps: readCapacity, writeCapacityRps: writeCapacity,
      utilization: round(Math.max(readPerNode / readCapacity, shardWrite / writeCapacity)),
      queueRps: round(primaryQueue), errorRps: round(primaryQueue),
    })
    for (let replica = 1; replica <= readReplicas; replica += 1) {
      const queue = Math.max(0, readPerNode - readCapacity)
      nodes.push({
        id: `replica-${shard}-${replica}`, role: 'read-replica', shard,
        readRps: round(readPerNode), writeRps: 0,
        readCapacityRps: readCapacity, writeCapacityRps: 0,
        utilization: round(readPerNode / readCapacity),
        queueRps: round(queue), errorRps: round(queue),
      })
    }
  })

  const queueRps = round(nodes.reduce((sum, node) => sum + node.queueRps, 0))
  const errorRps = round(nodes.reduce((sum, node) => sum + node.errorRps, 0))
  const errorRate = configuration.requestsPerSecond === 0 ? 0 : round(errorRps / configuration.requestsPerSecond)
  const maxUtilization = Math.max(0, ...nodes.map((node) => node.utilization))
  const hottestWeight = Math.max(...distribution)
  const evenWeight = 1 / shardCount
  const hotShardIndex = distribution.findIndex((weight) => weight === hottestWeight)
  const hotShardId = shardCount > 1 && hottestWeight > evenWeight * 1.25 ? `shard-${hotShardIndex + 1}` : null
  const replicationLagMs = readReplicas > 0 ? Math.round(40 + (totalWrite / (writeCapacity * shardCount)) * 120) : 0

  return {
    summary: {
      servedRps: round(Math.max(0, configuration.requestsPerSecond - errorRps)),
      queueRps, errorRps, errorRate,
    },
    nodes,
    latencyMs: Math.round(20 + Math.min(980, maxUtilization * 80 + errorRate * 800)),
    costUnits: applyStrategies ? round((scaleUp.readRps + scaleUp.writeRps) / 500 + readReplicas * shardCount * 1.5 + (shardCount - 1) * 2) : 0,
    complexityScore: applyStrategies ? round(1 + readReplicas * 0.5 + (shardCount - 1) * 2) : 1,
    replicationLagMs,
    staleReadRate: readReplicas > 0 ? round(Math.min(0.2, (replicationLagMs / 2000) * configuration.readRatio)) : 0,
    hotShardId,
  }
}

function cloneConfiguration(configuration: ScenarioConfiguration): ScenarioConfiguration {
  return {
    ...configuration,
    dbCapacity: { ...configuration.dbCapacity },
    scaleUpCapacity: { ...configuration.scaleUpCapacity },
    shardDistribution: configuration.shardDistribution === 'even' ? 'even' : [...configuration.shardDistribution],
  }
}

export function simulateScenario(configuration: ScenarioConfiguration): SimulationResult {
  validate(configuration)
  const before = calculateSnapshot(configuration, false)
  const after = calculateSnapshot(configuration, true)
  const healthy = after.summary.errorRps === 0
  const writeBottleneck = after.nodes.some((node) => node.role === 'primary' && node.writeRps > node.writeCapacityRps)
  const events: SimulationEvent[] = []
  if (configuration.scaleUpCapacity.readRps > 0 || configuration.scaleUpCapacity.writeRps > 0) events.push({
    code: 'scaled-up', severity: 'info',
    message: `Each database node gains ${configuration.scaleUpCapacity.readRps} read rps and ${configuration.scaleUpCapacity.writeRps} write rps capacity.`,
  })
  if (configuration.shardCount > 1) {
    if (configuration.shardDistribution === 'even') events.push({
      code: 'even-sharding', severity: 'info',
      message: `Traffic is distributed evenly across ${configuration.shardCount} shards.`,
    })
    events.push({
      code: 'cross-shard-complexity', severity: 'warning',
      message: 'Cross-shard queries and transactions require coordination outside a single primary.',
    })
    if (after.hotShardId) events.push({
      code: 'hot-shard', severity: 'critical',
      message: `${after.hotShardId} receives a disproportionate share of traffic and remains overloaded.`,
    })
  }
  if (configuration.readReplicas > 0) {
    events.push({ code: 'read-replica-added', severity: 'info', message: `${configuration.readReplicas} read replica(s) share read traffic but do not accept writes.` })
    events.push({ code: 'replication-lag', severity: 'warning', message: `Estimated replication lag is ${after.replicationLagMs}ms, creating a ${round(after.staleReadRate * 100, 1)}% stale-read risk.` })
  }
  if (after.summary.errorRps > 0) events.push({
    code: 'capacity-overload', severity: 'critical',
    message: `${after.summary.errorRps} requests/sec exceed effective database capacity.`,
  })
  if (writeBottleneck) events.push({
    code: 'write-bottleneck', severity: 'critical',
    message: 'Writes exceed primary capacity; read replicas cannot absorb write traffic.',
  })
  return deepFreeze({
    configuration: cloneConfiguration(configuration),
    before,
    after,
    events,
    quickExplanation: healthy
      ? 'Traffic is within capacity after the selected architecture changes.'
      : after.hotShardId
        ? `A hot shard (${after.hotShardId}) remains overloaded despite sufficient aggregate capacity.`
        : writeBottleneck
        ? 'The remaining bottleneck is writes on the shard primary; read replicas only help reads.'
        : 'Traffic exceeds capacity and produces queued or failed requests.',
    technicalExplanation: `Baseline uses one primary. Read load is ${round(configuration.requestsPerSecond * configuration.readRatio)} rps and write load is ${round(configuration.requestsPerSecond * (1 - configuration.readRatio))} rps. After changes, ${configuration.shardCount} shard(s) each use ${configuration.dbCapacity.readRps + configuration.scaleUpCapacity.readRps} read rps and ${configuration.dbCapacity.writeRps + configuration.scaleUpCapacity.writeRps} write rps capacity, with ${configuration.readReplicas} read replica(s) per shard. Errors move from ${before.summary.errorRps} to ${after.summary.errorRps} rps; estimated lag is ${after.replicationLagMs}ms and complexity score is ${after.complexityScore}.`,
    assumptions: ['Requests are independent and distributed according to shardDistribution.', 'Read replicas serve reads only; all writes go to shard primaries.'],
    limitations: ['This is a deterministic capacity model, not a latency or queueing-system benchmark.', 'Network, cache, failover, and transaction coordination are simplified.'],
  })
}
