# dsh-minimax-image

> MiniMax 文生图插件 for DeepSeek Harness (DSH)

**[English](#english) | [中文](#chinese)**

---

## English

A text-to-image plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH): turns a one-sentence visual description into a real image via the MiniMax `image_generation` API, saves it to your workspace, and exposes it to the model as an `image-gen` tool.

[切换到中文](#chinese) · [Back to top](#dsh-minimax-image)

### Features

- 🎨 **Text-to-image**: powered by the MiniMax `image-01` model, with 8 aspect ratios (`16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `3:2` / `2:3` / `21:9`)
- 🧩 **DSH tool integration**: registers the `image-gen` tool so the model can generate images directly from the conversation
- 🔑 **Credential reuse**: reads `MINIMAX_API_KEY` automatically (from the environment or the DSH credential store `~/.dsh/.credentials.yaml`) — no extra setup
- 💾 **Saved to disk**: generated PNGs land in the workspace `generated/` directory (customizable via the `output_dir` argument)

### Installation

Local install:

```bash
dsh plugin --profile web add /path/to/dsh-minimax-image
dsh plugin --profile headless add /path/to/dsh-minimax-image
```

### Usage

After restarting `dsh web`, just describe the picture in the conversation, for example:

> Generate a cyberpunk city night scene with neon lights and rain

The model calls the `image-gen` tool and returns the saved file path:

```
Generated 1 image (16:9):
- D:\AI_video\generated\minimax-2026-08-18T12-16-11-1.png
```

### Configuration

Config precedence (highest wins):

1. profile patch / plugin row config
2. `~/.config/dsh-minimax-image/config.json`
3. `MINIMAX_IMAGE_*` environment variables
4. built-in defaults

#### Common options

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

#### Environment variables

| Variable | Meaning |
| --- | --- |
| `MINIMAX_API_KEY` | MiniMax API key (the DSH credential store is also supported) |
| `MINIMAX_IMAGE_MODEL` | Model ID |
| `MINIMAX_IMAGE_BASE_URL` | API endpoint |
| `MINIMAX_IMAGE_OUTPUT_DIR` | Output directory |
| `MINIMAX_IMAGE_TIMEOUT_MS` | Request timeout |

### License

[MIT](LICENSE)

---

## 中文

DeepSeek Harness (DSH) 文生图插件：把一句话画面描述通过 MiniMax `image_generation` API 生成图片，保存到工作区，并作为 `image-gen` 工具提供给模型调用。

[切换到 English](#english) · [返回顶部](#dsh-minimax-image)

### 功能

- 🎨 **文生图**：基于 MiniMax `image-01` 模型，支持 8 种宽高比（16:9 / 9:16 / 1:1 / 4:3 / 3:4 / 3:2 / 2:3 / 21:9）
- 🧩 **DSH 工具集成**：注册 `image-gen` 工具，模型在对话中可直接调用生成图片
- 🔑 **凭据复用**：自动读取 `MINIMAX_API_KEY`（环境变量或 DSH 凭据库 `~/.dsh/.credentials.yaml`），无需额外配置
- 💾 **落盘保存**：生成的 PNG 保存到工作区 `generated/` 目录（可通过 `output_dir` 参数自定义）

### 安装

本地安装：

```bash
dsh plugin --profile web add /path/to/dsh-minimax-image
dsh plugin --profile headless add /path/to/dsh-minimax-image
```

### 使用

重启 `dsh web` 后，直接在对话里描述画面即可，例如：

> 帮我生成一张赛博朋克城市夜景图，霓虹灯，雨天

模型会调用 `image-gen` 工具，返回生成图片的保存路径：

```
已生成 1 张图片 (16:9)：
- D:\AI_video\generated\minimax-2026-08-18T12-16-11-1.png
```

### 配置

配置优先级（高到低）：

1. profile patch / 插件行配置
2. `~/.config/dsh-minimax-image/config.json`
3. `MINIMAX_IMAGE_*` 环境变量
4. 内置默认值

#### 常用配置项

| 字段 | 说明 | 默认值 |
| --- | --- | --- |
| `apiKeyEnv` | 存放 API Key 的环境变量名 | `MINIMAX_API_KEY` |
| `baseUrl` | MiniMax 文生图接口地址 | `https://api.minimaxi.com/v1/image_generation` |
| `model` | 模型 ID | `image-01` |
| `aspectRatio` | 默认宽高比 | `16:9` |
| `outputDir` | 默认输出目录（相对工作区） | `generated` |
| `timeoutMs` | 请求超时（毫秒） | `120000` |

示例 `~/.config/dsh-minimax-image/config.json`：

```json
{
  "model": "image-01",
  "aspectRatio": "9:16",
  "outputDir": "generated",
  "apiKeyEnv": "MINIMAX_API_KEY"
}
```

#### 环境变量

| 变量 | 含义 |
| --- | --- |
| `MINIMAX_API_KEY` | MiniMax API Key（也支持 DSH 凭据库） |
| `MINIMAX_IMAGE_MODEL` | 模型 ID |
| `MINIMAX_IMAGE_BASE_URL` | 接口地址 |
| `MINIMAX_IMAGE_OUTPUT_DIR` | 输出目录 |
| `MINIMAX_IMAGE_TIMEOUT_MS` | 请求超时 |

### 许可证

[MIT](LICENSE)
