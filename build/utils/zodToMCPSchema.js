import { z } from "zod";
// Type guards for Zod schema types
function isZodOptional(schema) {
    return schema instanceof z.ZodOptional;
}
function isZodObject(schema) {
    // Check both instanceof and the typeName property
    return (schema instanceof z.ZodObject ||
        (schema?._def?.typeName === 'ZodObject'));
}
/**
 * Converts a Zod object schema to a flat shape for MCP tools
 * @param schema The Zod schema to convert
 * @returns A flattened schema shape compatible with MCP tools
 * @throws Error if the schema is not an object type
 */
export function zodToMCPShape(schema) {
    if (!isZodObject(schema)) {
        throw new Error("MCP tools require an object schema at the top level");
    }
    const shape = schema.shape;
    const result = {};
    for (const [key, value] of Object.entries(shape)) {
        result[key] = isZodOptional(value) ? value.unwrap() : value;
    }
    return {
        result,
        keys: Object.keys(result)
    };
}
