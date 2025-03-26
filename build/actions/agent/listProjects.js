import listProjects from "../../tools/agent/listProjects.js";
import { z } from "zod";
const getInfoAction = {
    name: "LIST_PROJECTS",
    similes: [
        "get DataWorks project list information",
    ],
    description: "Get DataWorks projects information",
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
    handler: async (agent, input) => {
        try {
            const { pageNumber, pageSize } = input;
            const response = await listProjects(agent, pageNumber, pageSize);
            return {
                status: "success",
                message: response,
            };
        }
        catch (error) {
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
