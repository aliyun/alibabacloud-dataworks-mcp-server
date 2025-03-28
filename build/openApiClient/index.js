import OpenApi from '@alicloud/openapi-client';
import Credential from '@alicloud/credentials';
import { getEnvInfo, isVerboseMode } from '../utils/common.js';
class OpenApiClient {
    /**
     * use ak and sk to init a client
     * @param regionId
     */
    static async createClient(config) {
        let apiConfig;
        // 先拿参数的 region 再判断 DATAWORKS_REGION 跟 REGION
        const regionId = config?.REGION || process.env.DATAWORKS_REGION || process.env.REGION || "";
        if (config?.ALIBABA_CLOUD_ACCESS_KEY_ID) {
            // please use security sts way to auth: https://help.aliyun.com/document_detail/378664.html
            // 自己设定 ak
            apiConfig = new OpenApi.Config({
                // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
                accessKeyId: config?.ALIBABA_CLOUD_ACCESS_KEY_ID,
                // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
                accessKeySecret: config?.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
            });
        }
        else {
            // 参考 https://help.aliyun.com/zh/sdk/developer-reference/v2-manage-node-js-access-credentials
            // 使用默认凭证初始化Credentials Client，
            const credentialClient = new Credential.default();
            apiConfig = new OpenApi.Config();
            // 使用Credentials配置凭证。@alicloud/credentials 2.4.2 已支持 credentialsURI
            apiConfig.credential = credentialClient;
        }
        // Endpoint 请参考 https://api.aliyun.com/product/dataworks-public https://api.aliyun.com/product/CloudAPI
        apiConfig.endpoint = `dataworks.${regionId ? `${regionId}.` : ''}aliyuncs.com`;
        // 使用特定方式调用
        // import DataWorksPublic20240518 from '@alicloud/dataworks-public20240518';
        // return new DataWorksPublic20240518.default(apiConfig);
        const verbose = isVerboseMode();
        if (verbose) {
            console.debug('apiConfig endpoint', apiConfig.endpoint);
            console.debug('env info', getEnvInfo());
        }
        // 使用泛化方式调用
        // https://help.aliyun.com/zh/sdk/developer-reference/generalized-call-node-js
        return new OpenApi.default(apiConfig);
    }
}
export default OpenApiClient;
