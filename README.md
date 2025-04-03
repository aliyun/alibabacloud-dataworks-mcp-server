# DataWorks MCP Server

A Model Context Protocol (MCP) server that provides tools for AI, allowing it to interact with the DataWorks Open API through a standardized interface. This implementation is based on the Aliyun Open API and enables AI agents to perform cloud resources operations seamlessly.

## Overview

This MCP server:

* Interact with DataWorks Open API
* Manage DataWorks resources

The server implements the Model Context Protocol specification to standardize cloud resource interactions for AI agents.

## Prerequisites

* Node.js (v16 or higher)
* pnpm (recommended), npm, or yarn
* DataWorks Open API with access key and secret key

## Installation

### Option 1: Install from npm (recommend for clients like Cursor/Cline)

```bash
# Install globally
npm install -g alibabacloud-dataworks-mcp-server

# Or install locally in your project
npm install alibabacloud-dataworks-mcp-server
```

### Option 2: Build from Source (for developers)

1. Clone this repository:
```bash
git clone https://github.com/aliyun/alibabacloud-dataworks-mcp-server
cd alibabacloud-dataworks-mcp-server
```

2. Install dependencies (pnpm is recommended, npm is supported):
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```

4. Development the project (by @modelcontextprotocol/inspector):
```bash
pnpm run dev
```
open http://localhost:5173

## Configuration

### MCP Server Configuration

If you installed via npm (Option 1):
```json
{
  "mcpServers": {
    "alibabacloud-dataworks-mcp-server": {
      "command": "npx",
      "args": ["alibabacloud-dataworks-mcp-server"],
      "env": {
        "REGION": "your_dataworks_open_api_region_id_here",
        "ALIBABA_CLOUD_ACCESS_KEY_ID": "your_alibaba_cloud_access_key_id",
        "ALIBABA_CLOUD_ACCESS_KEY_SECRET": "your_alibaba_cloud_access_key_secret",
        "TOOL_CATEGORIES": "optional_your_tool_categories_here_ex_UTILS"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

If you built from source (Option 2):
```json
{
  "mcpServers": {
    "alibabacloud-dataworks-mcp-server": {
      "command": "node",
      "args": ["/path/to/alibabacloud-dataworks-mcp-server/build/index.js"],
      "env": {
        "REGION": "your_dataworks_open_api_region_id_here",
        "ALIBABA_CLOUD_ACCESS_KEY_ID": "your_alibaba_cloud_access_key_id",
        "ALIBABA_CLOUD_ACCESS_KEY_SECRET": "your_alibaba_cloud_access_key_secret",
        "TOOL_CATEGORIES": "optional_your_tool_categories_here_ex_UTILS",
        "NODE_ENV": "optional_development_or_product",
        "TOOL_FILE_URI":"if_NODE_ENV_is_development_then_the_tool_path_to_the_tool_file_uri",
        "OPEN_API_ENDPOINT": "open_api_endpoint_here",
        "VERBOSE": "export_more_logs_when_needed"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Environment Setup

init variables in your environment:

```env
# DataWorks Configuration
REGION=your_dataworks_open_api_region_id_here
ALIBABA_CLOUD_ACCESS_KEY_ID=your_alibaba_cloud_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET＝your_alibaba_cloud_access_key_secret
TOOL_CATEGORIES=optional_your_tool_categories_here_ex_UTILS
NODE_ENV=development_or_product
TOOL_FILE_URI=if_NODE_ENV_is_development_then_the_tool_path_to_the_tool_file_uri
OPEN_API_ENDPOINT=open_api_endpoint_here
VERBOSE=export_more_logs_when_needed
```

### Configuration Description
#### Required
- REGION: Open API 使用的地域，如 cn-shanghai、cn-beijing...
- ALIBABA_CLOUD_ACCESS_KEY_ID: 阿里云 AK ID，跟阿里云 AK Secret 匹配
- ALIBABA_CLOUD_ACCESS_KEY_SECRET: 阿里云 AK Secret，跟阿里云 AK ID 匹配
- ALIBABA_CLOUD_CREDENTIALS_URI: DataWorks 个人开发环境使用的认证方式，透过接口获取临时 AK，如果填了上面的 AK ID 与 AK Secret，就不用填这项。

#### Optional
- NODE_ENV: development 或 product，当设定为 development 时，DataWorks MCP Tool 列表接口会带上 pre- ，如此链接，Open API endpoint 会带上 pre-。
- OPEN_API_ENDPOINT: 更改 Open API 打的 endpoint，如"dataworks.cn-shanghai.aliyuncs.com"。
- TOOL_FILE_URI：DataWorks MCP Tool 列表的获取地址，可指定一个 http 地址，没有 http 开头的话就会读本地路径，如 "/Users/xxx/Documents/dev-tools.json"。
- MCP_FILE_URI：DataWorks MCP 资源的获取地址，可指定一个 http 地址，没有 http 开头的话就会读本地路径，如 "/Users/xxx/Documents/mcp.json"。
- TOOL_CATEGORIES: Tool 分类的白名单，这边写 Open API 的分类，在此接口查看 Category，可多选，透过半符逗号分开，如 空间管理,运维中心,数据开发（新版）,UTILS。
- TOOL_NAMES: Tool 名字的白名单，这边写 Open API 的名字，可多选，透过半符逗号分开，如 CreateNode,UpdateNode。
- VERBOSE: true 或 false，当 API 报错时，会打印出环境变量。

## Project Structure

```
alibabacloud-dataworks-mcp-server/
├── src/
│   ├── index.ts          # Main entry point
├── package.json
└── tsconfig.json
```

## Available Tools

The MCP server provides the following DataWorks tools:

See this [link](https://dataworks.data.aliyun.com/dw-pop-mcptools)

## Security Considerations

* Keep your private key secure and never share it
* Use environment variables for sensitive information
* Regularly monitor and audit AI agent activities

## Troubleshooting

If you encounter issues:

1. Verify your Aliyun Open API access key and secret key are correct
2. Check your region id is correct
3. Ensure you're on the intended network (mainnet, testnet, or devnet)
4. Verify the build was successful

## Dependencies

Key dependencies include:
* [@alicloud/dataworks-public20240518](https://github.com/alibabacloud-sdk-swift/dataworks-public-20240518)
* [@alicloud/openapi-client](https://github.com/aliyun/darabonba-openapi)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache 2.0 License.
