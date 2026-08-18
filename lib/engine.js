// Image generation engine: calls the MiniMax image_generation API and saves
// the returned base64 payloads to disk under the configured output directory.

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ASPECTS = ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3', '21:9']

/** Normalize an aspect ratio string against the API's supported set. */
export function normalizeAspect(value) {
  const v = String(value || '').trim()
  return ASPECTS.includes(v) ? v : null
}

/**
 * Generate one or more images from a prompt.
 * @param config - resolved plugin config (baseUrl, model, aspectRatio, apiKey, ...).
 * @param prompt - the text-to-image prompt.
 * @param aspect - optional aspect ratio override ("16:9" etc).
 * @param outputDir - optional output directory override (relative paths resolve
 *   against the workspace root).
 * @param workspace - the current workspace root, when known.
 * @returns {Promise<{files: string[], note?: string}>}
 */
export async function generateImages(config, prompt, aspect, outputDir, workspace, signal) {
  if (!config.apiKey) {
    throw new Error('MiniMax image generation: 未找到 API key（检查 MINIMAX_API_KEY 环境变量或 ~/.dsh/.credentials.yaml）')
  }
  const ratio = normalizeAspect(aspect) || normalizeAspect(config.aspectRatio) || '16:9'

  const body = {
    model: config.model,
    prompt,
    aspect_ratio: ratio,
    response_format: 'base64',
    n: 1,
    prompt_optimizer: true,
  }

  let response
  try {
    const timeoutSignal = AbortSignal.timeout(config.timeoutMs)
    const combined = signal === undefined
      ? timeoutSignal
      : AbortSignal.any([timeoutSignal, signal])
    response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: combined,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error(`MiniMax image generation timed out after ${config.timeoutMs} ms`)
    }
    throw new Error(`MiniMax image generation request failed: ${error.message}`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`MiniMax image generation returned a non-JSON response (HTTP ${response.status})`)
  }

  if (!response.ok) {
    const detail = data?.base_resp?.status_msg || data?.error?.message || JSON.stringify(data)
    throw new Error(`MiniMax image generation error (HTTP ${response.status}): ${detail}`)
  }

  const b64s = data?.data?.image_base64 ?? data?.data?.base64
  const urls = data?.data?.image_urls
  if (!Array.isArray(b64s) && !Array.isArray(urls)) {
    const detail = data?.base_resp?.status_msg || JSON.stringify(data).slice(0, 300)
    throw new Error(`MiniMax image generation returned no image data: ${detail}`)
  }

  const dir = resolve(workspace || process.cwd(), outputDir || config.outputDir)
  mkdirSync(dir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const files = []
  const save = (buf, i) => {
    const file = join(dir, `minimax-${ts}-${i + 1}.png`)
    writeFileSync(file, buf)
    files.push(file)
  }
  if (Array.isArray(b64s) && b64s.length > 0) {
    for (let i = 0; i < b64s.length; i++) save(Buffer.from(b64s[i], 'base64'), i)
  } else {
    for (let i = 0; i < urls.length; i++) {
      const imgResp = await fetch(urls[i])
      if (!imgResp.ok) throw new Error(`MiniMax image download failed (HTTP ${imgResp.status})`)
      save(Buffer.from(await imgResp.arrayBuffer()), i)
    }
  }
  if (files.length === 0) {
    throw new Error('MiniMax image generation succeeded but produced no files')
  }
  return { files, ratio }
}
