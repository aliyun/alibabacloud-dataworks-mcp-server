import fs from 'fs';
import fetch from 'node-fetch';
import { isPreMode, parseJSONString } from "./common.js";
import { dataWorksMcpUrl, dataWorksPreMcpUrl } from '../constants/index.js';
import { DataWorksMCPResponse } from '../types/common.js';

/** 获取 dw mcp 接口 */
export default async function getDataWorksMcp(options?: {}) {
  const isPre = isPreMode();

  // 如果是预发环境，支持本地文件
  const fileUri = isPre ? process.env.MCP_FILE_URI ? process.env.MCP_FILE_URI : dataWorksPreMcpUrl : dataWorksMcpUrl;

  let dwMcpRes;
  try {
    if (!fileUri?.startsWith?.('http')) {
      // local file
      const fileContent = fs.readFileSync(fileUri, 'utf8');
      dwMcpRes = parseJSONString(fileContent);
    } else {
      // http file
      const queryRes = await fetch(fileUri);
      const resStr = await queryRes.text() as string;
      dwMcpRes = parseJSONString(resStr) as DataWorksMCPResponse;
    }
  } catch (e) {
    console.error('Failed to get getDataWorksMcp:', e);
  }
  return dwMcpRes;
}