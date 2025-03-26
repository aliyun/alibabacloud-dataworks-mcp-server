import DataWorksPublic20240518 from '@alicloud/dataworks-public20240518';
import Util from '@alicloud/tea-util';
export default async function listProjects(agent, pageNumber, pageSize) {
    try {
        let listProjectsRequest = new DataWorksPublic20240518.ListProjectsRequest({
            pageNumber: pageNumber,
            pageSize: pageSize,
        });
        let runtime = new Util.RuntimeOptions({});
        return await agent.listProjectsWithOptions(listProjectsRequest, runtime);
    }
    catch (error) {
        throw new Error(`List Projects failed: ${error.message}`);
    }
}
