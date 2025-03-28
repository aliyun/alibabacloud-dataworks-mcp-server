/**
 * 是 undefined 或 null
 * @param value
 * @returns
 */
export function isEmpty(value: any) {
  return value === undefined || value === null;
}


/**
 * 不是undefined null 空字串
 * @param input
 * @returns {boolean}
 */
export function isEmptyStr(input: any) {
  return (input === null || input === undefined || input === '');
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

export function getEnvInfo() {
  let envInfoStr: string = '';
  try {
    const env = process?.env || {};
    envInfoStr = JSON.stringify(env);
  } catch (e) {
    console.error(e);
  }
  return envInfoStr;
}
