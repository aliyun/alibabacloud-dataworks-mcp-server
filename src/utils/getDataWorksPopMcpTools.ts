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

    } else {
      // http file

      // 接口过滤
      const categories = (options?.categories?.join?.(',') || process.env?.TOOL_CATEGORIES) || '';
      const names = (options?.names?.join?.(',') || process.env?.TOOL_NAMES) || '';
      let _params = '';
      if (categories) _params += `categories=${encodeURIComponent(categories)}`;
      if (names) _params += `${_params ? '&' : ''}names=${encodeURIComponent(names)}`;
      if (_params) _params = `?${_params}`;
      const queryRes = await fetch(`${toolFileUri}${_params}`);
      const queryResStr = await queryRes.text() as string;
      dataWorksPopMcpTools = parseJSONString(queryResStr) as ActionTool[];
    }
  } catch (e) {
    console.error('Failed to get dataWorksPopMcpTools:', e);
  }
  return dataWorksPopMcpTools;
}