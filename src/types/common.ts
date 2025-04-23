export interface Resource {
  uri?: string;
  name?: string;
  description?: string;
  mimeType?: 'text/json' | 'text/plain' | 'image/png';
}

/** mcp 接口返回 */
export interface DataWorksMCPResponse {
  jsonrpc: string;
  id: string;
  result: {
    /** resource 白名单 */
    a2reslist: string[];
  };
}
