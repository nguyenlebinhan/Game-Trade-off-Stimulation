import type { ScenarioConfiguration } from './simulation-engine'

export const scenarioStorageKey = 'architecture-run:scenario'
export const completionStorageKey = 'architecture-run:completion'

function isValidScenario(value: unknown): value is ScenarioConfiguration {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const capacity = (entry: unknown): entry is { readRps: number; writeRps: number } => {
    if (!entry || typeof entry !== 'object') return false
    const current = entry as Record<string, unknown>
    return typeof current.readRps === 'number' && Number.isFinite(current.readRps) && current.readRps >= 0 && typeof current.writeRps === 'number' && Number.isFinite(current.writeRps) && current.writeRps >= 0
  }
  const distribution = candidate.shardDistribution
  const validDistribution = distribution === 'even' || (Array.isArray(distribution) && distribution.every((weight) => typeof weight === 'number' && Number.isFinite(weight) && weight >= 0) && Math.abs(distribution.reduce((sum, weight) => sum + weight, 0) - 1) < 0.0001)
  return typeof candidate.requestsPerSecond === 'number' && Number.isFinite(candidate.requestsPerSecond) && candidate.requestsPerSecond >= 0 && typeof candidate.readRatio === 'number' && Number.isFinite(candidate.readRatio) && candidate.readRatio >= 0 && candidate.readRatio <= 1 && capacity(candidate.dbCapacity) && capacity(candidate.scaleUpCapacity) && Number.isInteger(candidate.readReplicas) && (candidate.readReplicas as number) >= 0 && Number.isInteger(candidate.shardCount) && (candidate.shardCount as number) >= 1 && validDistribution && (distribution === 'even' || distribution.length === candidate.shardCount)
}

export function loadScenario(storage: Storage | undefined, fallback: ScenarioConfiguration): ScenarioConfiguration {
  if (!storage) return fallback
  try {
    const value = JSON.parse(storage.getItem(scenarioStorageKey) ?? 'null') as ScenarioConfiguration | null
    return isValidScenario(value) ? value : fallback
  } catch { return fallback }
}

export function saveScenario(storage: Storage | undefined, scenario: ScenarioConfiguration) {
  storage?.setItem(scenarioStorageKey, JSON.stringify(scenario))
}

export function clearScenario(storage: Storage | undefined) { storage?.removeItem(scenarioStorageKey) }
export function loadCompletion(storage: Storage | undefined): boolean { try { return JSON.parse(storage?.getItem(completionStorageKey) ?? 'false') === true } catch { return false } }
export function saveCompletion(storage: Storage | undefined) { storage?.setItem(completionStorageKey, 'true') }
export function clearCompletion(storage: Storage | undefined) { storage?.removeItem(completionStorageKey) }
