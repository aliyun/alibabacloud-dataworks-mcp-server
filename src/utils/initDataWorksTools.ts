import { getHandler, getZObjByType } from '../actions/genAction.js';
import { ActionTool, DwInputSchema } from '../types/action.js';
import { z } from "zod";
import { ApiParameter, ApiParameterSchema } from '../types/apibabaCloudApi.js';
import { DataWorksMCPResponse } from '../types/common.js';

export const convertInputSchemaToSchema = (inputSchema?: DwInputSchema, apiParameters?: ApiParameter[]) => {
  const schema: { [name: string]: any } = {};

  if (!inputSchema) return z.object(schema);

  const propertyKeys = Object.keys(inputSchema?.properties || {});
  const required = inputSchema?.required || [];

  // 先处理 required
  propertyKeys?.sort?.((a, b) => {
    if (required?.includes?.(a) && !required?.includes?.(b)) {
      return -1;
    } else if (!required?.includes?.(a) && required?.includes?.(b)) {
      return 1;
    } else {
      return 0;
    }
  });

  propertyKeys?.forEach?.((pKey) => {

    const info = inputSchema?.properties?.[pKey];
    const description = info?.description;

    let obj = getZObjByType(info as ApiParameterSchema);

    if (description) obj = obj?.describe?.(description);

    if (!required?.includes?.(pKey)) {
      obj = obj?.optional?.();
      // 有 bug 需要执行两次
      if (obj?.optional) obj = obj?.optional?.();
    }

    schema[pKey] = obj;

  });

  return z.object(schema);

};

/** 此方法是将 dw mcp 接口转成 action */
const initDataWorksTools = (dwTools: ActionTool[], dwMcpRes?: DataWorksMCPResponse) => {

  const actionMap: { [name: string]: ActionTool } = {};

  try {

    // DW 资源的白名单
    const dwWhiteList: string[] = dwMcpRes?.result?.a2reslist || [];

    dwTools?.forEach?.((t) => {
      const apiKey = t?.name;

      // 先过滤掉几个，方便调式
      // if (!['CreateDataServiceApi'].includes(apiKey)) return;

      if (apiKey) {

        const map: ActionTool = { ...t };

        if (t?.inputSchema && !t?.schema) {
          const apiMeta = (Object.keys(t?.annotations?.pmd || {})?.map?.((apiKey) => (t?.annotations?.pmd?.[apiKey])) || []) as ApiParameter[];
          map.schema = convertInputSchemaToSchema(t?.inputSchema, apiMeta);
        }

        if (!map?.handler) {
          map.handler = getHandler(apiKey, t) as any;
        }

        // 查看是否有对应的 MCP Resource
        map.hasMcpResource = dwWhiteList?.includes?.(t?.name);

        actionMap[t?.name] = map;

      }

    });

    return actionMap;
  } catch (e) {
    console.error(e);
    return {};
  }
};

export default initDataWorksTools;

