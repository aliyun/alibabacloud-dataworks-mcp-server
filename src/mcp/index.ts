import isString from 'lodash/isString.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OpenApiClientInstance } from "../openApiClient/index.js";
import { MCPSchemaShape, zodToMCPShape } from "../utils/zodToMCPSchema.js";
import type { ActionExample, ActionTool } from "../types/action.js";
import { convertInputSchemaToSchema } from "../utils/initDataWorksTools.js";
import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { getMcpResourceName, toJSONString } from "../utils/common.js";

/**
 * Creates an MCP server from a set of actions
 */
export function createMcpServer(
  actions: Record<string, ActionTool>,
  agent: OpenApiClientInstance,
  options: {
    name: string;
    version: string;
    serverOptions?: ServerOptions;
  }
) {

  const serverOptions: ServerOptions = options?.serverOptions || {};

  // Create MCP server instance
  const serverWrapper = new McpServer({
    name: options.name,
    version: options.version,
  }, serverOptions);

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

    console.log('Active tool', action.name);

    let actionDescription = action.description || '';

    // 如果有对应的 MCP Resource，需要放在 description 给模型提示
    if (action.hasMcpResource) {
      actionDescription += `\n*This Tool has a 'MCP Resource'，please request ${getMcpResourceName({ toolName: action.name })}(MCP Resource) to get more examples for using this tool.`;
    }

    serverWrapper.tool(
      action.name,
      actionDescription,
      paramsSchema,
      async (params) => {
        try {
          // Execute the action handler with the params directly
          const result = await action?.handler?.(agent, params);

          // Format the result as MCP tool response
          return {
            content: [
              {
                type: "text",
                text: result ? (isString(result) ? result : toJSONString(result, null, 2)) : '',
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
      serverWrapper.prompt(
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
Input: ${toJSONString(ex?.input, null, 2)}
Output: ${toJSONString(ex?.output, null, 2)}
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

  return serverWrapper;
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
  options: {
    name: string;
    version: string;
    serverOptions?: ServerOptions;
  }
) {
  try {
    const serverWrapper = createMcpServer(actions, agent, options);
    const transport = new StdioServerTransport();
    await serverWrapper.connect(transport);

    if (process.env.LOGGING_LEVEL) {
      serverWrapper?.server?.sendLoggingMessage?.({
        level: process.env.LOGGING_LEVEL as any,
        data: "Server started successfully",
      });
    }

    return serverWrapper;
  } catch (error) {
    console.error("Error starting MCP server", error);
    throw error;
  }
}
