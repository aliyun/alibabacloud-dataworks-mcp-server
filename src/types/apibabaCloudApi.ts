
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
  name: string;
  in: 'query' | 'formData';
  style: 'json';
  schema: ApiParameterSchema;
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

export interface IAlibabaCloudOpenApiResponse {
  statusCode?: number;
  headers?: { [name: string]: string };
  body?: any;
}