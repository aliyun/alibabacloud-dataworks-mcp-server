import record from '../utils/record.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { isVerboseMode, getEnvInfo, getMcpResourceName, toJSONString } from '../utils/common.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ActionTool } from '../types/action.js';
import { DataWorksMCPResponse } from '../types/common.js';

/**
 * init resources of this MCP server
 */
async function initResources(
  server: McpServer['server'],
  dataWorksPopMcpTools: ActionTool[],
  dataworksMcpRes?: DataWorksMCPResponse,
) {

  try {

    // Resource file

    // DW 资源的白名单
    const dwWhiteList: string[] = dataworksMcpRes?.result?.a2reslist || [];

    server?.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resourceList = dataWorksPopMcpTools?.filter((item) => dwWhiteList?.includes?.(item?.name))?.map?.((item) => {
        return {
          uri: item?.name,
          name: getMcpResourceName({ toolName: item?.name }),
          description: `${item?.name}的定义详情，如接口返回范例描述，输入参数范例等`,
          mimeType: "text/json",
        }
      }) || [];
      return {
        resources: resourceList,
      };
    });

    server?.setRequestHandler?.(ReadResourceRequestSchema, async (request) => {
      const uri = request?.params?.uri;
      try {
        if (uri?.startsWith?.('http')) {
          const res = await fetch(uri);
          const jsonStr = await res.text() || '{}'; // 不使用 .json()，可能会丢失精度

          await record({ success: true, resourceUri: uri });

          return {
            contents: [
              {
                uri,
                mimeType: "text/json",
                text: jsonStr,
              }
            ]
          };
        } else {

          const toolInfo = dataWorksPopMcpTools?.find?.((item) => {
            return item?.name === uri;
          });

          if (toolInfo) {

            await record({ success: true, resourceUri: uri });

            return {
              contents: [
                {
                  uri,
                  mimeType: "text/json",
                  text: toJSONString(toolInfo || {}),
                }
              ]
            };
          } else {
            throw new Error(`Resource not found. ${uri}`);
          }

        }
      } catch (e: any) {
        console.error(e);
        await record({ success: false, error: e?.message });
        throw new Error(`Resource not found. ${uri}`);
      }
    });

  } catch (error: any) {
    const verbose = isVerboseMode();
    const errorMessage = `init resources failed: ${error.message}, ${verbose ? `, env info: ${getEnvInfo()}` : ''}`;
    throw new Error(errorMessage);
  }
};

export default initResources;
