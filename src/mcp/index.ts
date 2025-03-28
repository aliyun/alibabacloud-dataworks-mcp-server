import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OpenApiClientInstance } from "../openApiClient/index.js";
import { MCPSchemaShape, zodToMCPShape } from "../utils/zodToMCPSchema.js";
import type { ActionExample, ActionTool } from "../types/action.js";
import { convertInputSchemaToSchema } from "../utils/initDataWorksTools.js";
import { AlibabaCloudOpenApiInterface } from "../types/apibabaCloudApi.js";

/**
 * Creates an MCP server from a set of actions
 */
export function createMcpServer(
  actions: Record<string, ActionTool>,
  agent: OpenApiClientInstance,
  dataWorksOpenApis: AlibabaCloudOpenApiInterface,
  options: {
    name: string;
    version: string;
  }
) {
  // Create MCP server instance
  const server = new McpServer({
    name: options.name,
    version: options.version,
  });

  // Convert each action to an MCP tool
  for (const [key, action] of Object.entries(actions)) {

    let paramsSchema: MCPSchemaShape = {};
    if (action?.schema) {
      const { result = {} } = action?.schema ? zodToMCPShape(action.schema) : {};
      paramsSchema = result;
    } else {
      const { result = {} } = zodToMCPShape(convertInputSchemaToSchema(action?.inputSchema));
      paramsSchema = result;
    }

    console.log('active tool', action.name);

    server.tool(
      action.name,
      action.description || '',
      paramsSchema,
      async (params) => {
        try {
          // Execute the action handler with the params directly
          const result = await action?.handler?.(agent, params, dataWorksOpenApis);

          // Format the result as MCP tool response
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          console.error("error", error);
          // Handle errors in MCP format
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: error instanceof Error ? error.message : "Unknown error occurred"
              }
            ]
          };
        }
      }
    );

    // Add examples as prompts if they exist
    if (action.examples && action.examples.length > 0) {
      server.prompt(
        `${action.name}-examples`,
        {
          showIndex: z.string().optional().describe("Example index to show (number)")
        },
        (args) => {
          const showIndex = args.showIndex ? parseInt(args.showIndex) : undefined;
          const examples = action?.examples?.flat?.();
          const selectedExamples = (typeof showIndex === 'number'
            ? [examples?.[showIndex]]
            : examples) as ActionExample[];

          const exampleText = selectedExamples?.map((ex, idx) => `
Example ${idx + 1}:
Input: ${JSON.stringify(ex?.input, null, 2)}
Output: ${JSON.stringify(ex?.output, null, 2)}
Explanation: ${ex?.explanation}
            `)
            .join('\n');

          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Examples for ${action.name}:\n${exampleText}`
                }
              }
            ]
          };
        }
      );
    }
  }

  return server;
}
/**
 * Helper to start the MCP server with stdio transport
 * 
 * @param actions - The actions to expose to the MCP server
 * @param agent - Aliyun Open API client instance
 * @param options - The options for the MCP server
 * @returns The MCP server
 * @throws Error if the MCP server fails to start
 * @example 
 * import { ACTIONS } from "./actions";
 * import { startMcpServer } from "./mcpWrapper";
 *
 * const agent =  OpenApiClient.createClient({
        REGION: process.env.REGION || "",
        ALIBABA_CLOUD_ACCESS_KEY_ID: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || "",
        ALIBABA_CLOUD_ACCESS_KEY_SECRET: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || "",
      });
 * 
 * startMcpServer(ACTIONS, agent, {
 *   name: "dataworks-actions",
 *   version: "1.0.0"
 * });
 */
export async function startMcpServer(
  actions: Record<string, ActionTool>,
  agent: OpenApiClientInstance,
  dataWorksOpenApis: AlibabaCloudOpenApiInterface,
  options: {
    name: string;
    version: string;
  }
) {
  try {
    const server = createMcpServer(actions, agent, dataWorksOpenApis, options);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return server;
  } catch (error) {
    console.error("Error starting MCP server", error);
    throw error;
  }
}