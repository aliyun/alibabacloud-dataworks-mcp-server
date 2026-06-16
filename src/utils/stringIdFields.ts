import isNumber from 'lodash/isNumber.js';

/**
 * Fields that changed from Long to String in DataWorks OpenAPI SDK 8.0.0+.
 * MCP tool metadata may still declare these as integer; normalize at runtime.
 */
const STRING_ID_FIELD_NAMES = new Set(['Id', 'id']);

export function isStringIdField(fieldName?: string): boolean {
  return !!fieldName && STRING_ID_FIELD_NAMES.has(fieldName);
}

export function shouldUseStringIdType(fieldName?: string, format?: string): boolean {
  return isStringIdField(fieldName) || format === 'int64';
}

export function normalizeStringIdValue(value: unknown): unknown {
  if (value === undefined || value === null) return value;
  if (isNumber(value) || typeof value === 'bigint') return String(value);
  return value;
}

export function normalizeInputStringIds(input?: Record<string, any>): Record<string, any> {
  if (!input) return {};

  const result: Record<string, any> = { ...input };
  for (const key of Object.keys(result)) {
    if (isStringIdField(key)) {
      result[key] = normalizeStringIdValue(result[key]);
    }
  }
  return result;
}
