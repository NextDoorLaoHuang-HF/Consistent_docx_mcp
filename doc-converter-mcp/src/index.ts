#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import mammoth from "mammoth";
import axios from "axios";
import minimist from "minimist";

// --- Argument Parsing ---
const args = minimist(process.argv.slice(2));
const apiKeyFromArgs = args['api-key'] || args['apiKey'];

// Create server instance
const server = new McpServer({
  name: "doc-converter",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {
      docx_to_markdown: {},
      markdown_to_docx: {},
    },
  },
});

server.tool(
  "docx_to_markdown",
  "Locally converts a .docx document into a plain Markdown string. This tool reads the specified .docx file and extracts its raw text content. It's ideal for getting the textual information from a document without complex formatting. The path to the input .docx file must be absolute.",
  {
    path: z.string().describe("The absolute path to the .docx file to be converted."),
  },
  async ({ path }) => {
    try {
      const result = await mammoth.extractRawText({ path });
      return {
        content: [
          {
            type: "text",
            text: result.value,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error converting DOCX to Markdown: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "markdown_to_docx",
  "Generates a new .docx file from a Markdown string, applying styles from a reference .docx document. This tool calls a secure external API to perform the conversion. It requires an API key for authentication, provided via command-line argument when starting the server.",
  {
    markdown: z.string().describe("The Markdown content that will be placed in the new document."),
    referencePath: z.string().describe("The absolute path to a .docx file whose styles will be used as a template."),
    outputPath: z.string().describe("The absolute path where the newly generated .docx file will be saved."),
  },
  async ({ markdown, referencePath, outputPath }) => {
    try {
      // 1. Get API Key from environment or command-line arguments
      const apiKey = apiKeyFromArgs || process.env.DOC_CONVERTER_API_KEY;
      if (!apiKey) {
        throw new Error("API key is not set. Please provide it via the --api-key command-line argument or set the DOC_CONVERTER_API_KEY environment variable.");
      }

      // 2. Read the reference file and encode it in Base64
      const referenceFileContent = await fs.readFile(referencePath, { encoding: 'base64' });

      // 3. Call the external API
      const response = await axios.post(
        "https://www.toutoucj.top/api/v1/generate-from-md",
        {
          markdown,
          referenceFileContent,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          responseType: 'arraybuffer',
        }
      );

      // 4. Save the returned .docx file
      await fs.writeFile(outputPath, response.data);

      return {
        content: [
          {
            type: "text",
            text: `Successfully generated DOCX file at: ${outputPath}`,
          },
        ],
      };
    } catch (error) {
      let errorMessage = "An unknown error occurred.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = JSON.parse(Buffer.from(error.response.data).toString('utf8'));
          errorMessage = `API Error (${error.response.status}): ${errorData.error || 'Failed to generate DOCX.'}`;
        } else if (error.request) {
          errorMessage = "API Error: No response received from the server.";
        } else {
          errorMessage = `API Error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Error generating DOCX from Markdown: ${errorMessage}`,
          },
        ],
      };
    }
  }
);


// Main function to run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Doc Converter MCP Server running on stdio. Ready to receive commands.");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});