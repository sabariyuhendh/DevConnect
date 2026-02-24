import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
// Since we run from dist/index.js, PROJECT_ROOT is two levels up
const PROJECT_ROOT = join(__dirname, "..", "..");

const server = new Server(
  {
    name: "devconnect-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_routes",
        description: "Returns a list of API endpoints parsed from documentation and route definitions.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_schema",
        description: "Returns the Prisma database schema content.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_essential_files",
        description: "Lists key configuration and structural files of the project.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "run_dev_command",
        description: "Runs a predefined development command (e.g., build, lint, prisma:generate).",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              enum: ["build", "lint", "prisma:generate"],
              description: "The command to run.",
            },
            context: {
              type: "string",
              enum: ["root", "backend", "frontend"],
              description: "The directory to run the command in.",
            },
          },
          required: ["command", "context"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_routes": {
        const docPath = join(PROJECT_ROOT, "backend", "API.md");
        const content = await readFile(docPath, "utf-8");
        return {
          content: [{ type: "text", text: content }],
        };
      }
      case "get_schema": {
        const schemaPath = join(PROJECT_ROOT, "backend", "prisma", "schema.prisma");
        const content = await readFile(schemaPath, "utf-8");
        return {
          content: [{ type: "text", text: content }],
        };
      }
      case "list_essential_files": {
        const rootFiles = await readdir(PROJECT_ROOT);
        const backendFiles = await readdir(join(PROJECT_ROOT, "backend"));
        const frontendFiles = await readdir(join(PROJECT_ROOT, "frontend"));

        const summary = [
          "Root Files: " + rootFiles.filter(f => !f.startsWith(".")).join(", "),
          "Backend Key Files: " + backendFiles.filter(f => !f.startsWith(".")).join(", "),
          "Frontend Key Files: " + frontendFiles.filter(f => !f.startsWith(".")).join(", "),
        ].join("\n");

        return {
          content: [{ type: "text", text: summary }],
        };
      }
      case "run_dev_command": {
        const { command, context } = args as { command: string; context: string };
        const cwd = context === "root" ? PROJECT_ROOT : join(PROJECT_ROOT, context);
        
        const fullCommand = `npm run ${command}`;
        const { stdout, stderr } = await execAsync(fullCommand, { cwd });

        return {
          content: [
            { type: "text", text: `Command: ${fullCommand}\nStdout: ${stdout}\nStderr: ${stderr}` },
          ],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DevConnect MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
