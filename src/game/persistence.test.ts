import { describe, expect, it } from 'vitest'
import { clearScenario, loadScenario, saveScenario } from './persistence'
import type { ScenarioConfiguration } from './simulation-engine'

const scenario: ScenarioConfiguration = { requestsPerSecond: 900, readRatio: 0.6, dbCapacity: { readRps: 500, writeRps: 180 }, scaleUpCapacity: { readRps: 100, writeRps: 0 }, readReplicas: 1, shardCount: 1, shardDistribution: 'even' }

describe('scenario persistence', () => {
  it('round-trips campaign configuration through local storage', () => {
    const storage = new StorageMock()
    saveScenario(storage, scenario)
    expect(loadScenario(storage, scenario)).toEqual(scenario)
  })
  it('falls back safely and clears persisted progress', () => {
    const storage = new StorageMock()
    storage.setItem('architecture-run:scenario', '{bad json')
    expect(loadScenario(storage, scenario)).toBe(scenario)
    saveScenario(storage, scenario); clearScenario(storage)
    expect(storage.getItem('architecture-run:scenario')).toBeNull()
  })
})

class StorageMock implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}
