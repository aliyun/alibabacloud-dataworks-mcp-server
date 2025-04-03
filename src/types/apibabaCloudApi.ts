
/** https://api.aliyun.com/openmeta/struct/ApiDocs */


export type ApiParameterType = 'integer' | 'string' | 'date' | 'boolean' | 'array' | 'object';
export type ApiParameterFormat = 'int32' | 'int64';

interface ApiDirectory {
  id: number;
  title: string;
  type: 'directory';
  children: (string | ApiDirectory)[];
}

interface ApiProperty {
  id: number;
  title: string;
  type: 'directory';
  format: 'int64';
  example: string;
}

interface ApiSchema {
  title: string;
  description?: string;
  type: 'object';
  properties?: { [name: string]: ApiProperty };
}

export type ApiMethod = 'get' | 'post' | 'delete' | 'put';
export type ApiMethodUpperCase = 'GET' | 'POST' | 'DELETE' | 'PUT';
type ApiScheme = 'http' | 'https';
type ApiSecurity = {
  AK: []
};

export interface ApiParameterSchema {
  description?: string;
  type?: ApiParameterType;
  items?: ApiParameterSchema;
  properties?: { [name: string]: ApiParameterSchema };
  format?: ApiParameterFormat;
  required?: boolean;
  example?: string;
}

export interface ApiParameter {
  name?: string;
  /** https://help.aliyun.com/zh/sdk/developer-reference/generalized-call-node-js */
  in: 'query' | 'body' | 'formData' | 'byte';
  /** 【style=repeatList】时，数组的序列化方式为XXX.N的形式，例如：Instance.1=i-instance1&Instance.2=i-instance2,  需要配置元素最小值，最大值，根据需要开启repeatList参数校验，连续性校验 */
  style: 'json' | 'repeatList';
  schema?: ApiParameterSchema;
}

interface ApiResponseSchemaProperty {
  title: string;
  description: string;
  type: 'integer';
  format: 'int64';
  example: string;
}

interface ApiResponseSchema {
  title: string;
  description: string;
  type: 'object';
  properties: { [name: string]: ApiResponseSchemaProperty };
}

interface ApiResponse {
  schema: ApiResponseSchema;
}

export interface ApiObj {
  title: string;
  description?: string;
  summary: string;
  methods: ApiMethod[];
  schemes: ApiScheme[];
  security: ApiSecurity[];
  deprecated: boolean;
  systemTags: { [name: string]: any };
  parameters: ApiParameter[];
  responses: { [code: string]: ApiResponse };
  staticInfo: { [name: string]: any };
  responseDemo?: string;
}

interface ApiComponent {
  schemas: { [name: string]: ApiSchema };
  title: string;
  type: 'directory';
}

interface ApiEndpoint {
  regionId: string;
  endpoint: string;
}

export interface AlibabaCloudOpenApiInterface {
  version?: string;
  info?: {
    style: 'RPC';
    product: 'dataworks-public';
    version: string;
  };
  directories?: ApiDirectory[];
  /** 数据结构等信息 */
  components?: ApiComponent[];
  apis?: { [name: string]: ApiObj };
  endpoints?: ApiEndpoint[];
}

export interface IAlibabaCloudOpenApiJsonResponse {
  statusCode?: number;
  headers?: { [name: string]: string };
  body?: any;
}

export interface OpenApiConfigs {
  style: 'ROA' | 'RPC'; // API风格
  action: string; // API 名称
  version?: string; // API版本号
  protocol: 'HTTPS' | 'HTTP'; // API协议
  method?: ApiMethodUpperCase;// 请求方法
  authType: 'AK';
  pathname: string; // 接口 PATH
  reqBodyType?: 'formData' | 'byte' | 'json';// 接口请求体内容格式
  bodyType: 'binary' | 'array' | 'string' | 'json' | 'byte'; // 接口响应体内容格式
}