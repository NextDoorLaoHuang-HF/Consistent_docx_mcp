# 文档格式转换 MCP 服务器

这是一个基于 Node.js 和 TypeScript 构建的 MCP (Model-Context Protocol) 服务器，旨在为大语言模型 (LLM) 提供一套能保持文档格式一致的md-docx互相转换工具。

本项目已被打包成一个可通过 `npx` 直接运行的命令行工具，实现了真正的“开箱即用”。

## 核心功能

1.  **`docx_to_markdown`**
    -   **功能**: 将一个 `.docx` 文件本地转换为纯文本 Markdown。
    -   **描述**: 读取指定路径的 `.docx` 文件并提取其纯文本内容。
    -   **参数**: `path` (字符串) - 输入的 `.docx` 文件的绝对路径。

2.  **`markdown_to_docx`**
    -   **功能**: 根据 Markdown 内容和参考样式，生成一个新的 `.docx` 文件。
    -   **描述**: 将您的 Markdown 文本，按照一个参考 `.docx` 文件的样式，生成一个格式精美的新文档。
    -   **参数**:
        -   `markdown` (字符串) - 要转换的 Markdown 内容。
        -   `referencePath` (字符串) - 作为样式模板的 `.docx` 文件的绝对路径。
        -   `outputPath` (字符串) - 生成的 `.docx` 文件要保存到的绝对路径。

## 如何使用 (NPX 方式)

本服务器可以作为一个独立的命令行工具，通过 `npx` 在任何兼容 MCP 的客户端中进行配置。这种方式无需手动下载、安装或编译。

1.  **打开客户端配置**: 找到并打开您 MCP 客户端的配置文件（例如 Claude for Desktop 的 `claude_desktop_config.json`）。

2.  **添加服务器配置**: 在 `mcpServers` 对象中，添加以下配置。

    **重要提示**: 您必须将 `--api-key` 的值替换为您自己的真实 API 密钥。

    ```json
    {
      "mcpServers": {
        "doc-converter": {
          "command": "npx",
          "args": [
            "consistent-docx-mcp",
            "--api-key",
            "YOUR-API-KEY-HERE"
          ]
        }
      }
    }
    ```
    -   **`consistent-docx-mcp`**: 这是您将项目发布到 npm 仓库时使用的包名。
    -   **`--api-key`**: 这是向服务器传递 API 密钥的标准方式。请将后面的值替换为您的有效密钥。API密钥请关注公众号“偷偷成精的咸鱼”获取。


3.  **重启客户端**: 保存配置文件，然后完全关闭并重新启动您的 MCP 客户端。

现在，客户端将自动通过 `npx` 下载并运行此工具，您可以在客户端中直接调用 `docx_to_markdown` 和 `markdown_to_docx`。

## 相关文档

-   [**需求文档 (`REQUIREMENTS.md`)**](./REQUIREMENTS.md)
-   [**架构文档 (`ARCHITECTURE.md`)**](./ARCHITECTURE.md)