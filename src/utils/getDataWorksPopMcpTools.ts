import fs from 'fs';
import fetch from 'node-fetch';
import { ActionTool } from "../types/action.js";
import { isPreMode, parseJSONString } from "./common.js";
import { dataWorksPopMcpToolsUrl, dataWorksPrePopMcpToolsUrl } from '../constants/index.js';

export default async function getDataWorksPopMcpTools(options?: { categories?: string[]; names?: string[]; }) {
  const isPre = isPreMode();
  // 如果是预发环境，支持本地文件
  const toolFileUri = isPre ? process.env.TOOL_FILE_URI ? process.env.TOOL_FILE_URI : dataWorksPrePopMcpToolsUrl : dataWorksPopMcpToolsUrl;

  let dataWorksPopMcpTools: ActionTool[] = [];
  try {
    if (!toolFileUri?.startsWith?.('http')) {
      // local file
      const fileContent = fs.readFileSync(toolFileUri, 'utf8');
      dataWorksPopMcpTools = parseJSONString(fileContent);
    } else {
      // http file
      const queryRes = await fetch(toolFileUri);
      const queryResStr = await queryRes.text() as string;
      dataWorksPopMcpTools = parseJSONString(queryResStr) as ActionTool[];
    }

    // 如果有传入 categories 只挑有列的
    const categories = (options?.categories || process.env?.TOOL_CATEGORIES?.split?.(',')) || [];
    if (categories?.length) {
      dataWorksPopMcpTools = dataWorksPopMcpTools.filter((item) => {
        return categories?.includes(item?.annotations?.category || '');
      });
    }

    // 如果有传入 names 只挑有列的
    const names = (options?.names || process.env?.TOOL_NAMES?.split?.(',')) || [];
    if (names?.length) {
      dataWorksPopMcpTools = dataWorksPopMcpTools.filter((item) => {
        return names?.includes(item?.name || '');
      });
    }

  } catch (e) {
    console.error('Failed to get dataWorksPopMcpTools:', e);
  }
  return dataWorksPopMcpTools;
}