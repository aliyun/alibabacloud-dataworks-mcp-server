
import convertTimestamps from '../tools/agent/convertTimestamps.js';
import toTimestamps from '../tools/agent/toTimestamps.js';
import { ActionTool } from '../types/action.js';
import { convertInputSchemaToSchema } from './initDataWorksTools.js';

/** 增加一些额外的帮助 Tools */
const initExtraTools = (options?: { categories?: string[]; names?: string[]; }) => {

  const actionMap: { [name: string]: ActionTool } = {};

  try {

    // 如果有定义 categories，需要看有没有 UTILS。

    const categories = (options?.categories || process.env?.TOOL_CATEGORIES?.split?.(',')) || [];

    if (categories?.length && !categories.includes('UTILS')) return actionMap;

    // 如果有传入 names 只挑有列的
    const names = (options?.names || process.env?.TOOL_NAMES?.split?.(',')) || [];

    // 将 timestamp 转成 date */
    if (!names?.length || names?.includes?.('ConvertTimestamps')) {
      const actionKey = 'ConvertTimestamps';
      const action: ActionTool = {
        name: actionKey,
        description: '将时间戳转成日期或时间。返回内容如果有时间戳，透过此Tool显示成为日期或时间。',
        schema: convertInputSchemaToSchema({
          type: 'object',
          properties: {
            Timestamps: {
              type: 'array',
              description: '时间戳数组',
              items: {
                type: 'integer',
                description: '时间戳，如：1743422516765',
              }
            },
            Format: {
              type: 'string',
              description: '日期格式，如：YYYY-MM-DD HH:mm:ss',
            },
          },
          required: ['Timestamps'],
        }),
        handler: async (agent, input) => {
          try {
            const { Timestamps, Format } = input;
            const response = await convertTimestamps(agent, Timestamps, Format);
            return response as any;
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
        }
      };
      actionMap[actionKey] = action;
    }

    // 将 display 转成 timestamp */
    if (!names?.length || names?.includes?.('ToTimestamps')) {
      const actionKey = 'ToTimestamps';
      const action: ActionTool = {
        name: actionKey,
        description: '将日期或时间转成时间戳。',
        schema: convertInputSchemaToSchema({
          type: 'object',
          properties: {
            DateTimeDisplay: {
              type: 'array',
              description: '日期或时间数组',
              items: {
                type: 'string',
                description: '日期或时间，如：2025-01-02 或 2025-01-01 12:11:00',
              }
            },
          },
          required: ['DateTimeDisplay'],
        }),
        handler: async (agent, input) => {
          try {
            const { DateTimeDisplay } = input;
            const response = await toTimestamps(agent, DateTimeDisplay);
            return response as any;
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
        }
      };
      actionMap[actionKey] = action;
    }

    return actionMap;
  } catch (e) {
    console.error(e);
    return {};
  }
};

export default initExtraTools;

