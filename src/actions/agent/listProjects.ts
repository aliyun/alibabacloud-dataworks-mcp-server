import listProjects from "../../tools/agent/listProjects.js";
import OpenApiClientInstance from "../../openApiClient/index.js";
import { ActionTool } from "../../types/action.js";
import { z } from "zod";

const getInfoAction: ActionTool = {
  name: "LIST_PROJECTS",
  similes: [
    "get DataWorks project list information",
  ],
  description:
    "Get DataWorks projects information",
  examples: [
    [
      {
        input: {
          pageNumber: "How many projects of a region are there?",
          pageSize: 50,
        },
        output: {
          status: "success",
          message: "Project list information...",
        },
        explanation: "Get project list about Aliyun DataWorks",
      },
    ],
  ],
  schema: z.object({
    pageNumber: z.number().describe("The page number").optional(),
    pageSize: z.number().describe("The page size").optional(),
  }),
  handler: async (agent: OpenApiClientInstance, input: Record<string, any>) => {
    try {

      const { pageNumber, pageSize } = input;
      const response = await listProjects(agent, pageNumber, pageSize,);

      return {
        status: "success",
        message: response,
      };
    } catch (error: any) {
      // Handle specific error types
      if (error.response) {
        const { status, data } = error.response;
        if (status === 429) {
          return {
            status: "error",
            message: "Rate limit exceeded. Please try again later.",
          };
        }
        return {
          status: "error",
          message: `Error: ${data.error?.message || error.message}`,
        };
      }

      return {
        status: "error",
        message: `Failed to get information: ${error.message}`,
      };
    }
  },
};

export default getInfoAction;
