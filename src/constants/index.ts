import { getEnvRegion } from "../utils/common.js";

export const defaultDataWorksAliyunOpenApiVersion = '2024-05-18';
/** dataworks 全部线上 open api 元数据 */
export const dataWorksAliyunAllOpenApiUrl = `https://next.api.aliyun.com/meta/v1/products/dataworks-public/versions/${defaultDataWorksAliyunOpenApiVersion}/api-docs.json?file=api-docs.json`;
/** dataworks mcp tools 线上元数据接口 */
export const dataWorksPopMcpToolsUrl = 'https://dataworks.data.aliyun.com/pop-mcp-tools';
/** dataworks mcp tools 预发元数据接口 */
export const dataWorksPrePopMcpToolsUrl = 'https://pre-dataworks.data.aliyun.com/pop-mcp-tools';
/** dataworks mcp 线上元数据接口 */
export const dataWorksMcpUrl = 'https://dataworks.data.aliyun.com/mcp';
/** dataworks mcp 预发元数据接口 */
export const dataWorksPreMcpUrl = 'https://pre-dataworks.data.aliyun.com/mcp';


/** dataworks mcp record 接口 */
export const dataWorksRecordUrl = 'https://dataworks.data.aliyun.com/mcp';
/** dataworks mcp record 预发接口 */
export const dataWorksPreRecordUrl = 'https://pre-dataworks.data.aliyun.com/mcp';

/** 参数为 url */
export const convertOAS2ToOAS3Url = 'https://converter.swagger.io/api/convert';

/** mcp server version */
export const mcpServerVersion = '0.0.2';