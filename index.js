// dsh-minimax-image — generate images from text prompts via the MiniMax
// image_generation API and save them to the workspace.

import { resolveConfig } from './lib/config.js'
import { buildImageTool } from './lib/tool.js'

export const name = 'dsh-minimax-image'
export const inject = ['tools', 'systemPrompt']

export function apply(ctx, rowConfig = {}) {
  // Re-read config file / env / credentials on every call so changes apply
  // without restart.
  const getConfig = () => resolveConfig(rowConfig)

  registerSystemPrompt(ctx)
  registerImageTool(ctx, getConfig)
}

function registerSystemPrompt(ctx) {
  if (typeof ctx.systemPrompt?.section !== 'function') return
  ctx.systemPrompt.section({
    name: 'dsh-minimax-image:instructions',
    order: 120,
    text: [
      'You can generate images: when the user asks you to create, draw, or generate an image, call the `image-gen` tool with a detailed visual prompt (subject, style, lighting, composition).',
      'The tool saves PNG files to the workspace and returns their paths; mention the saved paths to the user.',
    ].join('\n'),
  })
}

function registerImageTool(ctx, getConfig) {
  const tryRegister = (toolName) => {
    try {
      ctx.tools.register(buildImageTool(getConfig, toolName))
      return true
    } catch (error) {
      return error
    }
  }
  const preferred = 'image-gen'
  const first = tryRegister(preferred)
  if (first === true) return
  const fallback = 'dsh_image_gen'
  if (/already|duplicate/i.test(String(first))) {
    const second = tryRegister(fallback)
    if (second === true) {
      console.error(`[dsh-minimax-image] tool name "${preferred}" is taken by the host; registered as "${fallback}" instead`)
      return
    }
  }
  console.error(`[dsh-minimax-image] image tool registration skipped: ${first}`)
}
