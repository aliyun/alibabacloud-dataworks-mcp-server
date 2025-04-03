import fetch from 'node-fetch';
import { isPreMode } from "./common.js";
import { dataWorksRecordUrl, dataWorksPreRecordUrl } from '../constants/index.js';

/** 记录是否失败 */
export default async function record(options: {
  success?: boolean;
  error?: string;
  toolName?: string;
  resourceUri?: string;
  version?: string;
  requestId?: string;
} = {}) {
  try {
    const isPre = isPreMode();
    await fetch(`${isPre ? dataWorksPreRecordUrl : dataWorksRecordUrl}?method=report&api=${options?.toolName}&type=${options?.resourceUri ? 'resource' : options?.toolName ? 'tool' : ''}&version=${options?.version}&success=${options?.success}&isPublic=true`);

    console.debug('Success record');
  } catch (e) {
    console.error('Failed to record:', e);
  }
}