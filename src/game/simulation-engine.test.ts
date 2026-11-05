import { describe, expect, it } from 'vitest'
import { ScenarioConfiguration, simulateScenario } from './simulation-engine'

const baseConfiguration: ScenarioConfiguration = {
  requestsPerSecond: 500,
  readRatio: 0.8,
  dbCapacity: { readRps: 1000, writeRps: 500 },
  scaleUpCapacity: { readRps: 0, writeRps: 0 },
  readReplicas: 0,
  shardCount: 1,
  shardDistribution: 'even',
}

describe('simulateScenario', () => {
  it('keeps a low-load baseline healthy', () => {
    const result = simulateScenario(baseConfiguration)

    expect(result.before.summary).toEqual({ servedRps: 500, queueRps: 0, errorRps: 0, errorRate: 0 })
    expect(result.after.summary).toEqual(result.before.summary)
    expect(result.after.nodes).toEqual([
      expect.objectContaining({ id: 'primary-1', readRps: 400, writeRps: 100, queueRps: 0, errorRps: 0 }),
    ])
    expect(result.quickExplanation).toContain('within capacity')
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.after.nodes)).toBe(true)
  })

  it('reports deterministic queue and errors when the primary is overloaded', () => {
    const result = simulateScenario({
      ...baseConfiguration,
      requestsPerSecond: 2000,
      readRatio: 0.5,
      dbCapacity: { readRps: 800, writeRps: 400 },
    })

    expect(result.after.summary).toEqual({ servedRps: 1200, queueRps: 800, errorRps: 800, errorRate: 0.4 })
    expect(result.after.nodes[0]).toEqual(expect.objectContaining({ readRps: 1000, writeRps: 1000, queueRps: 800 }))
    expect(result.events).toContainEqual(expect.objectContaining({ code: 'capacity-overload', severity: 'critical' }))
  })

  it('uses read replicas for read-heavy load and exposes replication trade-offs', () => {
    const result = simulateScenario({
      ...baseConfiguration,
      requestsPerSecond: 1800,
      readRatio: 0.9,
      readReplicas: 1,
    })

    expect(result.before.summary.errorRps).toBe(620)
    expect(result.after.summary.errorRps).toBe(0)
    expect(result.after.nodes).toHaveLength(2)
    expect(result.after.replicationLagMs).toBe(83)
    expect(result.after.staleReadRate).toBeGreaterThan(0)
    expect(result.events.map((event) => event.code)).toEqual(expect.arrayContaining(['read-replica-added', 'replication-lag']))
  })

  it('does not let read replicas solve a write-heavy bottleneck', () => {
    const result = simulateScenario({
      ...baseConfiguration,
      requestsPerSecond: 1500,
      readRatio: 0.2,
      readReplicas: 2,
    })

    expect(result.before.summary.errorRps).toBe(700)
    expect(result.after.summary.errorRps).toBe(700)
    expect(result.after.nodes.filter((node) => node.role === 'read-replica').every((node) => node.writeRps === 0)).toBe(true)
    expect(result.events).toContainEqual(expect.objectContaining({ code: 'write-bottleneck', severity: 'critical' }))
    expect(result.quickExplanation).toContain('writes')
  })

  it('distributes load evenly across shards while reporting added complexity', () => {
    const result = simulateScenario({
      ...baseConfiguration,
      requestsPerSecond: 2400,
      readRatio: 0.5,
      dbCapacity: { readRps: 700, writeRps: 400 },
      shardCount: 3,
    })

    expect(result.before.summary.errorRps).toBe(1300)
    expect(result.after.summary.errorRps).toBe(0)
    expect(result.after.nodes.map((node) => [node.readRps, node.writeRps])).toEqual([[400, 400], [400, 400], [400, 400]])
    expect(result.after.complexityScore).toBe(5)
    expect(result.events.map((event) => event.code)).toEqual(expect.arrayContaining(['even-sharding', 'cross-shard-complexity']))
  })

  it('detects a hot shard even when aggregate shard capacity is sufficient', () => {
    const result = simulateScenario({
      ...baseConfiguration,
      requestsPerSecond: 2400,
      readRatio: 0.5,
      dbCapacity: { readRps: 700, writeRps: 400 },
      shardCount: 3,
      shardDistribution: [0.7, 0.2, 0.1],
    })

    expect(result.after.hotShardId).toBe('shard-1')
    expect(result.after.summary.errorRps).toBe(580)
    expect(result.events).toContainEqual(expect.objectContaining({ code: 'hot-shard', severity: 'critical' }))
    expect(result.quickExplanation).toContain('hot shard')
  })

  it('applies scale-up capacity to each database node', () => {
    const result = simulateScenario({
      ...baseConfiguration,
      requestsPerSecond: 1200,
      readRatio: 0.5,
      dbCapacity: { readRps: 500, writeRps: 300 },
      scaleUpCapacity: { readRps: 100, writeRps: 300 },
    })

    expect(result.before.summary.errorRps).toBe(400)
    expect(result.after.summary.errorRps).toBe(0)
    expect(result.after.nodes[0]).toEqual(expect.objectContaining({ readCapacityRps: 600, writeCapacityRps: 600 }))
    expect(result.events).toContainEqual(expect.objectContaining({ code: 'scaled-up' }))
    expect(result.after.costUnits).toBe(0.8)
  })

  it('returns the same immutable result for the same input without mutating it', () => {
    const configuration: ScenarioConfiguration = {
      ...baseConfiguration,
      requestsPerSecond: 2100,
      readRatio: 0.75,
      readReplicas: 1,
      shardCount: 2,
      shardDistribution: [0.6, 0.4],
    }
    const first = simulateScenario(configuration)
    const second = simulateScenario(configuration)

    expect(first).toEqual(second)
    expect(first).not.toBe(second)
    expect(first.after).not.toBe(second.after)
    expect(Object.isFrozen(configuration)).toBe(false)
    expect(configuration.shardDistribution).toEqual([0.6, 0.4])
  })
})
