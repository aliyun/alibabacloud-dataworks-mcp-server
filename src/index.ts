#!/usr/bin/env node

import * as dotenv from "dotenv";
import OpenApiClient from "./openApiClient/index.js";
import initDataWorksTools from "./utils/initDataWorksTools.js";
import initExtraTools from "./utils/initExtraTools.js";
import initResources from "./resources/initResources.js";
import getDataWorksMcp from "./utils/getDataWorksMcp.js";
import getDataWorksPopMcpTools from "./utils/getDataWorksPopMcpTools.js";
import { startMcpServer } from "./mcp/index.js";
import { mcpServerVersion } from './constants/index.js';
import { ActionTool } from "./types/action.js";
import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";

dotenv.config();

// Validate required environment variables
function validateEnvironment() {
  const requiredEnvVars = {};

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

async function main() {
  try {
    // Validate environment before proceeding
    validateEnvironment();

    // Initialize the agent with error handling
    const agent = await OpenApiClient.createClient();

    // 请求 dataworks mcp tools json
    const dataWorksPopMcpTools: ActionTool[] = await getDataWorksPopMcpTools();

    // 请求 dataworks mcp resources
    const dwMcpRes = await getDataWorksMcp();

    const mcpActions = initDataWorksTools(dataWorksPopMcpTools, dwMcpRes);

    // 增加额外定义的 tools
    const extraTools = initExtraTools() || {};
    Object.keys(extraTools).forEach((k) => {
      if (!mcpActions[k] && extraTools[k]) mcpActions[k] = extraTools[k];
    });

    const serverOptions: ServerOptions = {
      capabilities: {
        resources: {
          subscribe: true,
          listChanged: true,
        },
        tools: {},
      },
      instructions: 'Operating with DataWorks Open APIs',
    };

    // https://spec.modelcontextprotocol.io/specification/2024-11-05/server/utilities/logging/
    if (serverOptions.capabilities && process.env.LOGGING_LEVEL) {
      serverOptions.capabilities.logging = {
        level: process.env.LOGGING_LEVEL,
        logFile: process.env.LOG_FILE,
      };
    }

    console.log('dataworks-mcp starting...');

    // Start the MCP server with error handling
    const serverWrapper = await startMcpServer(mcpActions, agent, {
      name: "dataworks-agent",
      version: mcpServerVersion,
      serverOptions,
    });

    const server = serverWrapper?.server;

    // List available resources
    await initResources(server, dataWorksPopMcpTools, dwMcpRes);

  } catch (error) {
    console.error('Failed to start MCP server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();