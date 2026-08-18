// Runtime configuration for dsh-minimax-image.
// Layering (highest wins): plugin row config > MINIMAX_IMAGE_* env > config file > defaults.

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CONFIG_PATH = join(homedir(), '.config', 'dsh-minimax-image', 'config.json')

const DEFAULTS = {
  apiKeyEnv: 'MINIMAX_API_KEY',
  baseUrl: 'https://api.minimaxi.com/v1/image_generation',
  model: 'image-01',
  aspectRatio: '16:9',
  outputDir: 'generated',
  timeoutMs: 120_000,
}

function env(name) {
  const value = process.env[name]
  return value === undefined || value === '' ? undefined : value
}

function readConfigFile() {
  try {
    const data = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch {
    return {}
  }
}

/**
 * Resolve the MiniMax API key: plugin config > MINIMAX_API_KEY env >
 * DSH credentials store (~/.dsh/.credentials.yaml).
 */
export function resolveApiKey(rowConfig = {}) {
  const merged = { ...DEFAULTS, ...readConfigFile(), ...rowConfig }
  const envName = merged.apiKeyEnv || DEFAULTS.apiKeyEnv
  const direct = merged.apiKey || ''
  if (direct) return direct
  const fromEnv = env(envName)
  if (fromEnv) return fromEnv
  const fromEnvGeneric = env('MINIMAX_IMAGE_API_KEY')
  if (fromEnvGeneric) return fromEnvGeneric
  try {
    const cred = readFileSync(join(homedir(), '.dsh', '.credentials.yaml'), 'utf8')
    const line = cred.split(/\r?\n/).find((l) => l.startsWith('MINIMAX_API_KEY:'))
    if (line) {
      const key = line.split(':', 2)[1].trim()
      if (key) return key
    }
  } catch { /* credentials store missing — fall through */ }
  return ''
}

/** Full resolved config for one generation call (hot-read on every call). */
export function resolveConfig(rowConfig = {}) {
  const merged = { ...DEFAULTS, ...readConfigFile(), ...rowConfig }
  return {
    baseUrl: merged.baseUrl || DEFAULTS.baseUrl,
    model: merged.model || DEFAULTS.model,
    aspectRatio: merged.aspectRatio || DEFAULTS.aspectRatio,
    outputDir: merged.outputDir || DEFAULTS.outputDir,
    timeoutMs: Number.isFinite(Number(merged.timeoutMs)) && Number(merged.timeoutMs) > 0
      ? Number(merged.timeoutMs)
      : DEFAULTS.timeoutMs,
    apiKey: resolveApiKey(rowConfig),
  }
}
