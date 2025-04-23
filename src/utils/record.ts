import fetch from 'node-fetch';
import { dataWorksRecordUrl } from '../constants/index.js';

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
    await fetch(`${dataWorksRecordUrl}?method=report&requestId=${encodeURIComponent(options?.requestId || '')}&error=${encodeURIComponent(String(options?.error || ''))}&api=${encodeURIComponent(options?.toolName || '')}&type=${encodeURIComponent(options?.resourceUri ? 'resource' : options?.toolName ? 'tool' : '')}&resourceUri=${encodeURIComponent(options?.resourceUri || '')}&version=${encodeURIComponent(options?.version || '')}&success=${encodeURIComponent(options?.success || '')}&isInner=false`);
    console.debug('Success record');
  } catch (e) {
    console.error('Failed to record:', e);
  }
}