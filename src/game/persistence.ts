import type { ScenarioConfiguration } from './simulation-engine'

export const scenarioStorageKey = 'architecture-run:scenario'

export function loadScenario(storage: Storage | undefined, fallback: ScenarioConfiguration): ScenarioConfiguration {
  if (!storage) return fallback
  try {
    const value = JSON.parse(storage.getItem(scenarioStorageKey) ?? 'null') as ScenarioConfiguration | null
    return value && typeof value === 'object' ? value : fallback
  } catch { return fallback }
}

export function saveScenario(storage: Storage | undefined, scenario: ScenarioConfiguration) {
  storage?.setItem(scenarioStorageKey, JSON.stringify(scenario))
}

export function clearScenario(storage: Storage | undefined) { storage?.removeItem(scenarioStorageKey) }
