import genAction from '../actions/genAction.js';
const transferAlibabaCloudOpenApisToActions = (apiSpec) => {
    const actionMap = {};
    try {
        let apiKeys = Object.keys(apiSpec?.apis || []) || [];
        // 先过滤掉几个，方便调式
        // apiKeys = apiKeys?.filter?.((key) => ['ListProjects'].includes(key));
        apiKeys?.forEach?.((apiKey) => {
            if (apiKey) {
                const api = apiSpec?.apis?.[apiKey];
                if (api && api?.deprecated !== true)
                    actionMap[apiKey] = genAction(apiKey, api);
            }
        });
        return actionMap;
    }
    catch (e) {
        console.error(e);
        return {};
    }
};
export default transferAlibabaCloudOpenApisToActions;
