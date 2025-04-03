
import OpenApiClientInstance from "../openApiClient/index.js";
import callTool from "../tools/callTool.js";
import { ActionTool, ActionExample } from "../types/action.js";
import { z } from "zod";
import { ApiMethod, ApiObj, ApiParameter, ApiParameterSchema } from "../types/apibabaCloudApi.js";
import { defaultDataWorksAliyunOpenApiVersion } from "../constants/index.js";
import { toJSONString } from "../utils/common.js";

interface ExampleInput { [name: string]: any };

interface Example {
  input?: ExampleInput;
  output?: { [name: string]: any } | string;
  explanation?: string;
}

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

export const getZObjByType = (item?: ApiParameterSchema) => {

  let obj: any;

  const type = item?.type?.toLocaleLowerCase?.();

  if (type?.includes?.('int')) {
    // obj = z.bigint();
    obj = z.number();
  } if (type?.includes?.('double') || type?.includes?.('float')) {
    obj = z.number();
  } else if (type?.includes?.('string')) {
    obj = z.string();
  } else if (type?.includes?.('boolean')) {
    obj = z.boolean();
  } else if (type?.includes?.('date')) {
    obj = z.date();
  } else if (type?.includes?.('array')) {
    if (item?.items) {
      const childrenObjType = getZObjByType(item.items);
      obj = z.array(childrenObjType);
    } else obj = z.any();
  } else if (type?.includes?.('object')) {

    if (item?.properties) {
      const schema: { [name: string]: any } = {};
      Object.keys(item?.properties || {})?.forEach?.((paramName) => {
        const param = item?.properties?.[paramName];
        if (paramName) {
          let obj = getZObjByType(param);
          if (param?.description) obj = obj?.describe?.(param?.description);
          if (param?.required === false) {
            obj = obj?.optional?.();
            // 有 bug 需要执行两次
            if (obj?.optional) obj = obj?.optional?.();
          }
          schema[paramName] = obj;
        }
      });
      obj = z.object(schema);
    } else obj = z.any();

  } else {
    obj = z.any();
  }

  return obj;
}

/** 此方法是透过 open api 的对象转 Action */
const genAction = (apiKey: string, api: ApiObj): ActionTool => {

  const input: ExampleInput = {};
  const schema: { [name: string]: any } = {};

  const pmd: { [name: string]: ApiParameter } = {};

  api?.parameters?.forEach?.((param) => {
    const paramName = param?.name;
    if (paramName) {
      input[paramName] = param?.schema?.description;
      let obj = getZObjByType(param?.schema);

      if (param?.schema?.description) obj = obj?.describe?.(param?.schema?.description);
      if (param?.schema?.required === false) {
        obj = obj?.optional?.();
        // 有 bug 需要执行两次
        if (obj?.optional) obj = obj?.optional?.();
      }
      schema[paramName] = obj;
      pmd[paramName] = { in: param?.in, style: param?.style };
    }
  });

  const responses = api?.responses;
  const responseKeys = Object.keys(responses || {});
  const examples = responseKeys?.map?.((responseKey) => {
    const response = responses?.[responseKey];
    const example: Example = {};
    if (response) {
      example.explanation = `status ${responseKey} input and response schema example`;
      example.input = input;
      example.output = toJSONString(response?.schema || {});
    }
    return example as ActionExample;
  });

  const getMethod = (methods: ApiMethod[] = []) => {
    if (methods?.includes?.('delete'))
      return 'DELETE';
    else if (methods?.includes?.('put'))
      return 'PUT';
    else if (methods?.includes?.('post'))
      return 'POST';
    else
      return 'GET';
  };

  const annotations = {
    path: '', // default 使用 RPC 没有 path
    version: defaultDataWorksAliyunOpenApiVersion,
    method: getMethod(api?.methods),
    pmd,
  };

  const actionTool = ({
    name: apiKey,
    similes: [
      apiKey || '',
      api?.title || '',
      api?.summary || '',
    ],
    description: api?.description || '',
    examples: [examples],
    schema: z.object(schema),
    annotations,
  }) as ActionTool;

  actionTool.handler = getHandler(apiKey, actionTool) as any;

  return actionTool;
};

export default genAction;
