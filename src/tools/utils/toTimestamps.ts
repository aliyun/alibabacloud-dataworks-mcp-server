import dayjs from 'dayjs';
import { OpenApiClientInstance } from "../../openApiClient/index.js";

export default async function toTimestamps(
  agent: OpenApiClientInstance,
  dateTimeDisplay?: string[],
) {
  try {
    const result: number[] = [];
    if (dateTimeDisplay) {
      dateTimeDisplay?.forEach?.((str) => {
        try {
          const timestamp = dayjs(str).valueOf();
          result.push(timestamp);
        } catch (e) {
          console.error(e);
        }
      });
    }
    return result;
  } catch (error: any) {
    throw new Error(`To timestamps failed: ${error.message}`);
  }
}
