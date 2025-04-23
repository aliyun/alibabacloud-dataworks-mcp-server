import OpenApiClientInstance from "../openApiClient/index.js";
import callTool from "../tools/callTool.js";
import { ActionTool } from "../types/action.js";

export const getHandler = (apiKey: string, actionTool: ActionTool) => async (agent: OpenApiClientInstance, input: Record<string, any>) => {
  try {

    const response = await callTool(agent, apiKey, actionTool, input);
    return response;

  } catch (error: any) {
    // Handle specific Perplexity API error types
    if (error.response) {
      const { status, data } = error.response;
      if (status === 429) {
        return {
          statusCode: status,
          body: "Error: Rate limit exceeded. Please try again later.",
        };
      }
      return {
        statusCode: status,
        body: `Error: ${data.error?.message || error.message}`,
      };
    }

    return {
      body: `Failed to get information: ${error.message}`,
    };
  }
};

export type { ActionTool, ActionExample, Handler } from "../types/action.js";
