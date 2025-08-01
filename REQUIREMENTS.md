# 项目需求文档：文档格式转换 MCP 服务器

## 1. 项目概述

本项目旨在创建一个基于模型-上下文协议（MCP）的 Node.js 服务器。该服务器作为一种可供大语言模型（LLM）调用的工具集，提供专业的文档格式转换服务，主要涉及 Microsoft Word (.docx) 和 Markdown (.md) 格式之间的相互转换。

## 2. 功能性需求

服务器必须提供以下两个核心工具：

### 2.1. 工具一：DOCX 转 Markdown (`docx_to_markdown`)

-   **功能描述**: 将一个指定的 `.docx` 文件转换为纯文本 Markdown 字符串。
-   **输入**:
    -   `path`: 目标 `.docx` 文件在服务器上的绝对路径（字符串）。
-   **处理流程**:
    -   服务器在本地文件系统上读取并解析指定的 `.docx` 文件。
    -   提取文件中的核心文本内容。
    -   此过程为本地操作，不依赖任何外部网络服务。
-   **输出**:
    -   一个包含从文档中提取的纯文本内容的 Markdown 字符串。
-   **错误处理**: 如果文件不存在或格式不正确，应返回明确的错误信息。

### 2.2. 工具二：Markdown 转 DOCX (`markdown_to_docx`)

-   **功能描述**: 根据输入的 Markdown 内容和一个作为样式参考的 `.docx` 文件，生成一个新的 `.docx` 文档。
-   **输入**:
    -   `markdown`: 需要转换的 Markdown 内容（字符串）。
    -   `referencePath`: 作为样式模板的 `.docx` 文件在服务器上的绝对路径（字符串）。
    -   `outputPath`: 新生成的 `.docx` 文件需要保存到的绝对路径（字符串）。
-   **处理流程**:
    -   此功能依赖一个外部 API (`https://www.toutoucj.top/api/v1/generate-from-md`) 来完成核心转换。
    -   服务器读取参考文件并将其内容进行 Base64 编码。
    -   服务器将 Markdown 内容和编码后的参考文件一同发送到外部 API。
    -   服务器接收 API 返回的二进制文件流，并将其写入用户指定的输出路径。
-   **输出**:
    -   一个确认文件成功生成的消息，包含新文件的存储路径。
-   **依赖与鉴权**:
    -   必须通过环境变量 `DOC_CONVERTER_API_KEY` 配置有效的 API 密钥，否则工具调用将失败。

## 3. 非功能性需求

-   **协议**: 服务器必须完全兼容模型-上下文协议（MCP），通过标准输入/输出（stdio）进行通信。
-   **环境**: 服务器必须能在标准的 Node.js 环境下运行。
-   **易用性**: 所有工具及其参数必须有清晰、详尽的描述，以便大语言模型能够准确理解和调用。
-   **安全性**: API 密钥等敏感信息必须通过环境变量进行配置，不能硬编码在代码中。
-   **健壮性**: 服务器必须能优雅地处理文件读写失败、API 调用异常等错误，并向客户端返回有意义的错误信息。
