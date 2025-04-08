// import DataWorksPublic20240518 from '@alicloud/dataworks-public20240518';
// import * as DataWorksPublic20240518Classes from '@alicloud/dataworks-public20240518';
import fetch from 'node-fetch';
import OpenApi from '@alicloud/openapi-client';
import OpenApiUtil from '@alicloud/openapi-util';
import Util from '@alicloud/tea-util';
import tea from '@alicloud/tea-typescript';
import record from '../utils/record.js';
import isNumber from 'lodash/isNumber.js';
import isString from 'lodash/isString.js';
import isObject from 'lodash/isObject.js';
import { OpenApiClientInstance } from "../openApiClient/index.js";
import { IAlibabaCloudOpenApiJsonResponse, OpenApiConfigs } from '../types/apibabaCloudApi.js';
import { ActionTool } from '../types/action.js';
import { isEmptyStr, isVerboseMode, getEnvInfo, toJSONString, parseJSONString, isBigNumber } from '../utils/common.js';

/**
 * Get detailed and latest information about any topic using Perplexity AI.
 * @param agent Aliyun Open API instance
 * @param prompt Text description of the topic to get information about
 * @returns Object containing the generated information
 */
async function callTool(
  agent: OpenApiClientInstance,
  apiKey: string,
  actionTool: ActionTool,
  input?: Record<string, any>,
) {

  let apiRequestConfigs: OpenApi.Params = {} as any;
  let query: any = {};
  let body: any = {};

  // API版本号
  const version = actionTool?.annotations?.version;

  try {

    // 原来使用特定调用的方式
    // import * as DataWorksPublic20240518Classes from '@alicloud/dataworks-public20240518';
    // const FunctionClass = (DataWorksPublic20240518Classes as any)[`${apiKey}Request`];
    // const request = Reflect.construct(FunctionClass, input as any);
    // const runtime = new Util.RuntimeOptions({});
    // // 把apiKey第一个大小改小写
    // const funcName = `${apiKey.charAt(0).toLowerCase()}${apiKey.slice(1) || ''}WithOptions`;
    // return await (agent as any)[funcName](request, runtime);

    // 使用泛化方式调用
    // https://help.aliyun.com/zh/sdk/developer-reference/generalized-call-node-js

    // path 为空就是 RPC
    const style = isEmptyStr(actionTool?.annotations?.path) ? 'RPC' : 'ROA';

    const method = actionTool?.annotations?.method;

    let hasInQueryParams = false;
    let hasInBodyParams = false;
    let hasInByteParams = false;
    let hasInFormDataParams = false;

    // 需要重新 assign 下
    const _input: any = { ...input };

    Object.keys(_input)?.forEach((key) => {
      let value = _input[key];

      // if (isNumber(value)) {
      //   // 查看值有没有溢出，如果溢出了就用string
      //   if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      //     value = String(value);
      //   }
      // }

      const paramMeta = actionTool?.annotations?.pmd?.[key];
      if (paramMeta?.in === 'body') {
        hasInBodyParams = true;
        body[key] = value;
      } else if (paramMeta?.in === 'formData') {
        hasInFormDataParams = true;
        if (paramMeta?.style === 'json') {
          body[key] = toJSONString(value);
        } else {
          body[key] = value;
        }
      } else if (paramMeta?.in === 'byte') {
        hasInByteParams = true;
        body[key] = value;
      } else if (paramMeta?.in === 'query') {
        hasInQueryParams = true;
        if (paramMeta?.style === 'json') {
          query[key] = toJSONString(value);
        } else {
          query[key] = value;
        }
      } else {
        query[key] = value;
      }
    });

    const reqBodyType = hasInByteParams ? 'byte' : hasInFormDataParams ? 'formData' : 'json';

    const bodyJson = toJSONString(body);
    if (reqBodyType === 'byte') {
      body = Buffer.from(bodyJson);
    } else if (reqBodyType === 'json') {
      body = bodyJson;
    }

    const configs: OpenApiConfigs = {
      style, // API风格
      action: apiKey, // API 名称
      version,
      protocol: 'HTTPS', // API协议
      method, // 请求方法
      authType: 'AK',
      pathname: `/`, // 接口 PATH
      reqBodyType, // 接口请求体内容格式
      bodyType: 'string', // 使用 string，如果使用 json 在 sdk 里会有精度丢失的问题
    };

    if (['GET', 'DELETE'].includes(method || '')) delete configs.reqBodyType;

    apiRequestConfigs = new OpenApi.Params(configs);

    // GET DELETE 这边需要把 body 设定为空，不然签名不会过
    if (['GET', 'DELETE'].includes(method || '')) body = null;

    const request = new OpenApi.OpenApiRequest({ query, body });
    const runtime = new Util.RuntimeOptions({});
    // 查看 https://github.com/aliyun/darabonba-openapi/blob/master/ts/src/client.ts
    const res = await (agent as any)?.callApi?.(apiRequestConfigs, request, runtime);
    let result: IAlibabaCloudOpenApiJsonResponse['body'] | null = null;
    try {
      // 当执行成功，只取 message.body 的信息
      const obj = res?.statusCode === 200 && res?.body ? res?.body : res;
      result = parseJSONString(obj);
      await record({ success: true, toolName: apiKey, requestId: result?.RequestId, version });
    } catch (e) {
      console.error(e);
    }

    return result;

  } catch (error: any) {
    const verbose = isVerboseMode();
    const errorMsg = `Call tool failed: ${error.message}, api key: ${apiKey}, api request configs: ${toJSONString(apiRequestConfigs)}, query: ${toJSONString(query)}, body: ${toJSONString(body)}${verbose ? `, env info: ${getEnvInfo()}` : ''}`;
    const recordErr = `Call tool failed: ${error.message}, api key: ${apiKey}, api request configs: ${toJSONString(apiRequestConfigs)}, query: ${toJSONString(query)}, body: ${toJSONString(body)}`;
    await record({ success: false, toolName: apiKey, version, error: recordErr });
    throw new Error(errorMsg);
  }
};

export default callTool;
