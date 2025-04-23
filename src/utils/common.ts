import isNumber from 'lodash/isNumber.js';
import isString from 'lodash/isString.js';
import { parse, stringify } from 'lossless-json';
import { BigNumber } from "bignumber.js";

/**
 * 是 undefined 或 null
 * @param value
 * @returns
 */
export function isEmpty(value: any) {
  return value === undefined || value === null;
}

/**
 * 是undefined null 空字串
 * @param input
 * @returns {boolean}
 */
export function isEmptyStr(input: any) {
  return (input === null || input === undefined || input === '');
}

export function isPreMode() {
  let pre: boolean = false;
  try {
    const env = process?.env || {};
    pre = env.NODE_ENV === 'development';
  } catch (e) {
    console.error(e);
  }
  return pre;
}

export function isVerboseMode() {
  let verbose: boolean = false;
  try {
    const env = process?.env || {};
    verbose = env.VERBOSE === 'true';
  } catch (e) {
    console.error(e);
  }
  return verbose;
}

export function getEnvRegion() {
  let regionId: string = '';
  try {
    regionId = process.env.DATAWORKS_REGION || process.env.REGION || '';
  } catch (e) {
    console.error(e);
  }
  return regionId;
}

export function getEnvInfo() {
  let envInfoStr: string = '';
  try {
    const env = process?.env || {};
    envInfoStr = toJSONString(env);
  } catch (e) {
    console.error(e);
  }
  return envInfoStr;
}

/** 检查 number 是否超过最大值，如果超过就用 BigInt */
export function getNumberString(v: number) {
  let result: number | string = v;
  try {
    if (!isNumber(v)) return result;
    if (v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER) {
      result = String(v);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
}

/** 检查 number 是否超过最大值，如果超过就用 BigInt */
export function getNumber(v: number) {
  let result: number | BigInt = v;
  try {
    if (!isNumber(v)) return result;
    if (v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER) {
      result = BigInt(v);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
}

/** 检查 number 是否超过最大值，如果超过就用 BigNumber (string) */
export function getBigNumber(v: number) {
  let result: number | BigNumber = v;
  try {
    if (!isNumber(v)) return result;
    if (v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER) {
      result = new BigNumber(v);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
}

export function getMcpResourceName(params: { toolName?: string; }) {
  return params?.toolName || '';
}

export function isBigNumber(num: number) {
  try {
    return !Number.isSafeInteger(+num);
  } catch (e) {
    console.error(e);
    return true;
  }
};

/** 将 string 里有大于 Number.MAX_SAFE_INTEGER 的数字转换为 特别的string */
export function parseJSONForBigNumber(jsonString: string, prefix = '__big_number__') {
  let result;
  try {
    // 自定义 reviver 函数
    function bigIntReviver(key: string, value: any) {
      if (isNumber(value) && isBigNumber(value)) {
        return `${prefix}${value}`;
      }
      return value;
    }
    result = JSON.parse(jsonString, bigIntReviver);
  } catch (e) {
    console.error(e);
  }
  return result;
}

/** 将值开头为 __big_number__ 转回正常的值 */
export function stringifyJSONForBigNumber(json: any, prefix = '__big_number__') {
  let result: string = '';
  try {
    function replacer(key: string, value: any) {
      if (isString(value) && value.startsWith(prefix)) {
        return value.slice(prefix.length);
      }
      return value;
    }
    result = JSON.stringify(json, replacer);

  } catch (e) {
    console.error(e);
  }
  return result;
}

/** 处理 big number 问题 */
export function parseJSONString(jsonString: string) {
  let result: any;
  try {
    result = parse(jsonString);
  } catch (e) {
    console.error(e);
  }
  return result;
}

/** 处理 big number 问题 */
export function toJSONString(json: any, replacer?: (number | string)[] | null, space?: string | number) {
  let result: string = '';
  try {
    result = stringify(json, replacer, space) || '';
  } catch (e) {
    console.error(e);
  }
  return result;
}
