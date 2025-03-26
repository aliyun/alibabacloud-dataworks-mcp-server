import genTool from "../tools/callTool.js";
import { z } from "zod";
;
export const getHandler = (apiKey) => async (agent, input, dataWorksOpenApis) => {
    try {
        const response = await genTool(agent, apiKey, input, dataWorksOpenApis);
        return response;
    }
    catch (error) {
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
export const getZObjByType = (item) => {
    let obj;
    const type = item?.type?.toLocaleLowerCase?.();
    if (type?.includes?.('int')) {
        obj = z.number();
    }
    else if (type?.includes?.('string')) {
        obj = z.string();
    }
    else if (type?.includes?.('boolean')) {
        obj = z.boolean();
    }
    else if (type?.includes?.('date')) {
        obj = z.date();
    }
    else if (type?.includes?.('array')) {
        if (item?.items) {
            const childrenObjType = getZObjByType(item.items);
            obj = z.array(childrenObjType);
        }
        else
            obj = z.any();
    }
    else if (type?.includes?.('object')) {
        if (item?.properties) {
            const schema = {};
            Object.keys(item?.properties || {})?.forEach?.((paramName) => {
                const param = item?.properties?.[paramName];
                if (paramName) {
                    let obj = getZObjByType(param);
                    if (param?.description)
                        obj = obj?.describe?.(param?.description);
                    if (param?.required === false) {
                        obj = obj?.optional?.();
                        // 有 bug 需要执行两次
                        if (obj?.optional)
                            obj = obj?.optional?.();
                    }
                    schema[paramName] = obj;
                }
            });
            obj = z.object(schema);
        }
        else
            obj = z.any();
    }
    else {
        obj = z.string();
    }
    return obj;
};
const genAction = (apiKey, api) => {
    const input = {};
    const schema = {};
    api?.parameters?.forEach?.((param) => {
        const paramName = param?.name;
        if (paramName) {
            input[paramName] = param?.schema?.description;
            let obj = getZObjByType(param?.schema);
            if (param?.schema?.description)
                obj = obj?.describe?.(param?.schema?.description);
            if (param?.schema?.required === false) {
                obj = obj?.optional?.();
                // 有 bug 需要执行两次
                if (obj?.optional)
                    obj = obj?.optional?.();
            }
            schema[paramName] = obj;
        }
    });
    const responses = api?.responses;
    const responseKeys = Object.keys(responses || {});
    const examples = responseKeys?.map?.((responseKey) => {
        const response = responses?.[responseKey];
        const example = {};
        if (response) {
            example.explanation = `status ${responseKey} input and response schema example`;
            example.input = input;
            example.output = JSON.stringify(response?.schema || {});
        }
        return example;
    });
    return ({
        name: apiKey,
        similes: [
            apiKey || '',
            api?.title || '',
            // api?.description || '',
            api?.summary || '',
        ],
        description: api?.summary || '',
        examples: [examples],
        schema: z.object(schema),
        handler: getHandler(apiKey),
    });
};
export default genAction;
