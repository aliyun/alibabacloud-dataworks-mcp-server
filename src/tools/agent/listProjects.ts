import DataWorksPublic20240518 from '@alicloud/dataworks-public20240518';
import Util from '@alicloud/tea-util';
import tea from '@alicloud/tea-typescript';
import { OpenApiClientInstance } from "../../openApiClient/index.js";

type Error = {
  message?: string;
  data?: { [name: string]: string };
};

export default async function listProjects(
  agent: OpenApiClientInstance,
  pageNumber?: number,
  pageSize?: number,
) {
  try {

    let listProjectsRequest = new DataWorksPublic20240518.ListProjectsRequest({
      pageNumber: pageNumber,
      pageSize: pageSize,
    });

    let runtime = new Util.RuntimeOptions({});

    return await (agent as any).listProjectsWithOptions(listProjectsRequest, runtime);

  } catch (error: any) {
    throw new Error(`List Projects failed: ${error.message}`);
  }
}
