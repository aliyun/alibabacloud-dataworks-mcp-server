import { OpenApiClientInstance } from "../openApiClient/index.js";
import { z } from "zod";
import { ApiMethodUpperCase, ApiParameter, ApiParameterSchema } from "./apibabaCloudApi.js";

/**
 * Example of an action with input and output
 */
export interface ActionExample {
  input: Record<string, any>;
  output: Record<string, any>;
  explanation: string;
}

/**
 * Handler function type for executing the action
 */
export type Handler = (
  agent: OpenApiClientInstance,
  input: Record<string, any>,
) => Promise<Record<string, any>>;

export interface DwInputSchema extends Omit<ApiParameterSchema, 'required' | 'properties' | 'items'> {
  /** 有 properties 时，required 为 string[] */
  required?: string[];
  items?: DwInputSchema;
  properties?: { [name: string]: DwInputSchema };
}

/**
 * Cline 的市集应用在 Tool 上包了一个 Action，做进一步扩展
 * Main Action interface inspired by ELIZA
 * This interface makes it easier to implement actions across different frameworks
 */
export interface ActionTool {
  /**
   * Unique name of the action
   */
  name: string;

  /**
   * Detailed description of what the action does
   */
  description?: string;

  /**
   * 直接写好 schema。
   * https://modelcontextprotocol.io/docs/concepts/tools
   */
  inputSchema?: DwInputSchema;

  annotations?: {
    path?: string;
    method?: ApiMethodUpperCase;
    /** ex 2024-05-18 */
    version?: string;
    example?: string;
    category?: string;
    pmd: {
      [name: string]: ApiParameter;
    };
  };

  // --------------- 以下为扩展 -----------------

  /**
   * Alternative names/phrases that can trigger this action
   */
  similes?: string[];

  /**
   * Array of example inputs and outputs for the action
   * Each inner array represents a group of related examples
   */
  examples?: ActionExample[][];

  /**
   * Zod schema for input validation
   */
  schema?: z.ZodType<any>;

  /**
   * Function that executes the action
   */
  handler?: Handler;

  /**
   * 有对应的 MCP Resource
   */
  hasMcpResource?: boolean;
}
