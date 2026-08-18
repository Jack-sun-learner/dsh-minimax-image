// The `image-gen` tool: raw JSON-Schema definition; reads config through a
// thunk on every call so hot-reloaded config applies immediately.

import { generateImages } from './engine.js'

const ASPECTS = ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3', '21:9']

export function buildImageTool(getConfig, toolName) {
  return {
    name: toolName,
    description: [
      'Generate images from a text prompt using the MiniMax image generation API and save them to disk.',
      'Call this whenever the user asks you to create, draw, or generate an image (or a visual for a video/storyboard).',
      'The generated PNG files are saved under the workspace "generated" directory (or a custom output directory); the tool returns their absolute paths.',
      'Aspect ratio is optional; defaults to 16:9. Supported values: 16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9.',
      'Write the prompt in rich visual detail: subject, style, lighting, composition, color palette — the API performs best with concrete descriptions.',
    ].join('\n'),
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Text description of the image to generate (subject, style, lighting, composition).',
        },
        aspect_ratio: {
          type: 'string',
          enum: ASPECTS,
          description: 'Optional aspect ratio (default 16:9).',
        },
        output_dir: {
          type: 'string',
          description: 'Optional output directory (relative paths resolve against the workspace root; default "generated").',
        },
      },
      required: ['prompt'],
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    timeoutMs: 150_000,
    isConcurrencySafe: () => false,
    presentCall: (args) => {
      const prompt = typeof args?.prompt === 'string' ? args.prompt : ''
      return {
        card: 'generic',
        title: toolName,
        kind: 'write',
        rawInput: args,
        summary: prompt.length > 80 ? `${prompt.slice(0, 80)}…` : prompt,
      }
    },
    async execute(args, exec) {
      const prompt = typeof args?.prompt === 'string' ? args.prompt.trim() : ''
      if (!prompt) {
        throw new Error('"prompt" must be a non-empty string describing the image to generate.')
      }
      const config = getConfig()
      // Workspace root: the session's cwd is the project directory the user
      // opened; fall back to process.cwd() only when no session context exists.
      const workspace = exec?.agent?.session?.header?.cwd
        || exec?.workspace?.root
        || exec?.cwd
        || process.cwd()
      const { files, ratio } = await generateImages(
        config,
        prompt,
        args?.aspect_ratio,
        args?.output_dir,
        workspace,
        exec?.signal,
      )
      const lines = [
        `已生成 ${files.length} 张图片 (${ratio})：`,
        ...files.map((f) => `- ${f}`),
        '',
        '如需调整，可以修改 prompt 重新生成。',
      ]
      return lines.join('\n')
    },
  }
}
