#!/usr/bin/env node

import * as dotenv from "dotenv";
import OpenApiClient from "./openApiClient/index.js";
import fetch from 'node-fetch';
import initDataWorksTools from "./utils/initDataWorksTools.js";
import { startMcpServer } from "./mcp/index.js";
import { dataWorksPopMcpToolsUrl, dataWorksPrePopMcpToolsUrl, dataWorksAliyunAllOpenApiUrl } from './constants/index.js';
import { ActionTool } from "./types/action.js";
import { AlibabaCloudOpenApiInterface } from "./types/apibabaCloudApi.js";

dotenv.config();

// Validate required environment variables
function validateEnvironment() {
  const requiredEnvVars = {
    'REGION': process.env.REGION,
  };

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

    // method 1: 请求所有 dataworks open api json
    const queryOpenApisRes = await fetch(dataWorksAliyunAllOpenApiUrl);
    const dataWorksOpenApis = await queryOpenApisRes.json() as unknown as AlibabaCloudOpenApiInterface;
    // const mcpActions = transferAlibabaCloudOpenApisToActions(dataWorksOpenApis);

    // method 2: 请求 dataworks mcp tools json
    const isPre = process.env.NODE_ENV === 'development';
    const queryRes = await fetch(isPre ? dataWorksPrePopMcpToolsUrl : dataWorksPopMcpToolsUrl);
    const dataWorksPopMcpTools = await queryRes.json() as unknown as ActionTool[];
    const mcpActions = initDataWorksTools(dataWorksPopMcpTools, dataWorksOpenApis);

    // Start the MCP server with error handling
    await startMcpServer(mcpActions, agent, dataWorksOpenApis, {
      name: "dataworks-agent",
      version: "0.0.1"
    });
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