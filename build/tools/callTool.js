// import DataWorksPublic20240518 from '@alicloud/dataworks-public20240518';
// import * as DataWorksPublic20240518Classes from '@alicloud/dataworks-public20240518';
import OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';
/**
 * Get detailed and latest information about any topic using Perplexity AI.
 * @param agent Aliyun Open API instance
 * @param prompt Text description of the topic to get information about
 * @returns Object containing the generated information
 */
async function callTool(agent, apiKey, input, dataWorksOpenApis) {
    let apiRequestConfigs = {};
    let query = {};
    let body = {};
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
        const style = dataWorksOpenApis?.info?.style;
        const apiMeta = dataWorksOpenApis?.apis?.[apiKey];
        const getMethod = (methods = []) => {
            if (methods?.includes?.('delete'))
                return 'DELETE';
            else if (methods?.includes?.('put'))
                return 'PUT';
            else if (methods?.includes?.('post'))
                return 'POST';
            else
                return 'GET';
        };
        const apiMethod = getMethod(apiMeta?.methods);
        const configs = {
            style, // API风格
            action: apiKey, // API 名称
            version: dataWorksOpenApis?.info?.version, // API版本号
            protocol: 'HTTPS', // API协议
            method: apiMethod, // 请求方法
            authType: 'AK',
            pathname: `/`, // 接口 PATH
            reqBodyType: 'json', // 接口请求体内容格式
            bodyType: 'json', // 接口响应体内容格式
        };
        if (['GET', 'DELETE'].includes(apiMethod))
            delete configs.reqBodyType;
        apiRequestConfigs = new OpenApi.Params(configs);
        const _input = { ...input };
        // 需要重新 assign 下
        Object.keys(_input)?.forEach((key) => {
            const value = _input[key];
            const paramMeta = apiMeta?.parameters?.find?.((p) => p?.name === key);
            if (paramMeta?.in === 'formData') {
                // body
                body[key] = value;
            }
            else if (paramMeta?.in === 'query' && paramMeta?.style === 'json') {
                query[key] = JSON.stringify(value);
            }
            else {
                query[key] = value;
            }
        });
        // GET DELETE 这边需要把 body 设定为空，不然签名不会过
        if (['GET', 'DELETE'].includes(apiMethod))
            body = null;
        const request = new OpenApi.OpenApiRequest({ query, body });
        const runtime = new Util.RuntimeOptions({});
        const res = await agent?.callApi?.(apiRequestConfigs, request, runtime);
        // 当执行成功，只取 message.body 的信息
        return (res?.statusCode === 200 && res?.body) ? res?.body : res;
    }
    catch (error) {
        throw new Error(`Call tool failed: ${error.message}, api key: ${apiKey}, api request configs: ${JSON.stringify(apiRequestConfigs)}, query: ${JSON.stringify(query)}, body: ${JSON.stringify(body)}`);
    }
}
;
export default callTool;
