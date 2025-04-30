import OpenApi, { Config as OpenApiConfig } from '@alicloud/openapi-client';
import Credential from '@alicloud/credentials';
import Util from '@alicloud/tea-util';
import tea from '@alicloud/tea-typescript';
import typeClient from '@alicloud/openapi-client';
import { getEnvInfo, getEnvRegion, isPreMode, isVerboseMode } from '../utils/common.js';

type Error = { message: string; };

export interface Config {
  ALIBABA_CLOUD_ACCESS_KEY_ID?: string;
  ALIBABA_CLOUD_ACCESS_KEY_SECRET?: string;
  REGION?: string;
}

export interface OpenApiClientInstance {

}

class OpenApiClient {

  /**
   * use ak and sk to init a client
   * @param regionId
   */
  static async createClient(config?: Config) {

    let apiConfig: OpenApi.Config;

    // 先拿参数的 region 再判断 DATAWORKS_REGION 跟 REGION
    const regionId = config?.REGION || getEnvRegion();

    if (config?.ALIBABA_CLOUD_ACCESS_KEY_ID) {
      // please use security sts way to auth: https://help.aliyun.com/document_detail/378664.html
      // 自己设定 ak
      apiConfig = new OpenApi.Config({
        // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
        accessKeyId: config?.ALIBABA_CLOUD_ACCESS_KEY_ID,
        // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
        accessKeySecret: config?.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
      });
    } else {
      // 参考 https://help.aliyun.com/zh/sdk/developer-reference/v2-manage-node-js-access-credentials

      // 使用默认凭证初始化Credentials Client，
      const credentialClient = new Credential.default();
      apiConfig = new OpenApi.Config();
      // 使用Credentials配置凭证。@alicloud/credentials 2.4.2 已支持 credentialsURI
      apiConfig.credential = credentialClient;
    }

    const isPre = isPreMode();

    // Endpoint 请参考 https://api.aliyun.com/product/dataworks-public https://api.aliyun.com/product/CloudAPI
    const endpoint = process.env.OPEN_API_ENDPOINT || (`dataworks${isPre ? '-pre' : ''}.${regionId ? `${regionId}.` : ''}aliyuncs.com`);
    apiConfig.endpoint = endpoint;

    // timeout 设定 https://github.com/aliyun/credentials-nodejs/blob/0bd0925b18e0cb831a3bc824d5f87a51e688e452/src/providers/uri.ts#L77

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