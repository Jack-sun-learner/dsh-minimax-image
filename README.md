# dsh-minimax-image

**English** | [中文](README.zh.md)

A text-to-image plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH): turns a one-sentence visual description into a real image via the MiniMax `image_generation` API, saves it to your workspace, and exposes it to the model as an `image-gen` tool.

## Features

- 🎨 **Text-to-image**: powered by the MiniMax `image-01` model, with 8 aspect ratios (`16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `3:2` / `2:3` / `21:9`)
- 🧩 **DSH tool integration**: registers the `image-gen` tool so the model can generate images directly from the conversation
- 🔑 **Credential reuse**: reads `MINIMAX_API_KEY` automatically (from the environment or the DSH credential store `~/.dsh/.credentials.yaml`) — no extra setup
- 💾 **Saved to disk**: generated PNGs land in the workspace `generated/` directory (customizable via the `output_dir` argument)

## Installation

Local install:

```bash
dsh plugin --profile web add /path/to/dsh-minimax-image
dsh plugin --profile headless add /path/to/dsh-minimax-image
```

## Usage

After restarting `dsh web`, just describe the picture in the conversation, for example:

> Generate a cyberpunk city night scene with neon lights and rain

The model calls the `image-gen` tool and returns the saved file path:

```
Generated 1 image (16:9):
- D:\AI_video\generated\minimax-2026-08-18T12-16-11-1.png
```

## Configuration

Config precedence (highest wins):

1. profile patch / plugin row config
2. `~/.config/dsh-minimax-image/config.json`
3. `MINIMAX_IMAGE_*` environment variables
4. built-in defaults

### Common options

| Field | Description | Default |
| --- | --- | --- |
| `apiKeyEnv` | Environment variable holding the API key | `MINIMAX_API_KEY` |
| `baseUrl` | MiniMax image generation endpoint | `https://api.minimaxi.com/v1/image_generation` |
| `model` | Model ID | `image-01` |
| `aspectRatio` | Default aspect ratio | `16:9` |
| `outputDir` | Default output directory (relative to the workspace) | `generated` |
| `timeoutMs` | Request timeout (milliseconds) | `120000` |

Example `~/.config/dsh-minimax-image/config.json`:

```json
{
  "model": "image-01",
  "aspectRatio": "9:16",
  "outputDir": "generated",
  "apiKeyEnv": "MINIMAX_API_KEY"
}
```

### Environment variables

| Variable | Meaning |
| --- | --- |
| `MINIMAX_API_KEY` | MiniMax API key (the DSH credential store is also supported) |
| `MINIMAX_IMAGE_MODEL` | Model ID |
| `MINIMAX_IMAGE_BASE_URL` | API endpoint |
| `MINIMAX_IMAGE_OUTPUT_DIR` | Output directory |
| `MINIMAX_IMAGE_TIMEOUT_MS` | Request timeout |

## License

[MIT](LICENSE)
