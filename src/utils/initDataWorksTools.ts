import { getHandler, getZObjByType } from '../actions/genAction.js';
import { ActionTool, DwInputSchema } from '../types/action.js';
import { z } from "zod";
import { AlibabaCloudOpenApiInterface, ApiParameter } from '../types/apibabaCloudApi.js';

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

    const propertyApiMeta = apiParameters?.find?.(p => p?.name === pKey);

    const info = inputSchema?.properties?.[pKey];
    const description = info?.description;

    // let obj = getZObjByType(info as ApiParameterSchema);
    // 用 open api 的信息来组织 schema
    let obj = getZObjByType(propertyApiMeta?.schema);

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

const initDataWorksTools = (dwTools: ActionTool[], dataWorksOpenApis: AlibabaCloudOpenApiInterface) => {

  const actionMap: { [name: string]: ActionTool } = {};

  try {

    dwTools?.forEach?.((t) => {
      const apiKey = t?.name;

      // 先过滤掉几个，方便调式
      // if(['ListProjects'].includes(apiKey)) return;

      if (apiKey) {

        const map: ActionTool = { ...t };

        if (t?.inputSchema && !t?.schema) {
          const apiMeta = dataWorksOpenApis?.apis?.[apiKey];
          map.schema = convertInputSchemaToSchema(t?.inputSchema, apiMeta?.parameters);
        }

        if (!map?.handler) {
          map.handler = getHandler(apiKey);
        }

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

