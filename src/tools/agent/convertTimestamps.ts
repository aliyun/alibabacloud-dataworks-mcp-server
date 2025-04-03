import dayjs from 'dayjs';
import { OpenApiClientInstance } from "../../openApiClient/index.js";

export default async function convertTimestamps(
  agent: OpenApiClientInstance,
  timestamps?: number[],
  format?: string,
) {
  try {
    const result: string[] = [];
    if (timestamps) {
      if (format) {
        timestamps?.forEach?.((timestamp) => {
          try {
            const date = new Date(timestamp);
            const display = dayjs(date).format(format || 'YYYY-MM-DD');
            result.push(display);
          } catch (e) {
            console.error(e);
          }
        });
      };
    }
    return result;
  } catch (error: any) {
    throw new Error(`Convert timestamps failed: ${error.message}`);
  }
}
