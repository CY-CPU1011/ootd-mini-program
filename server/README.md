# OOTD Mini Program Server

这是 OOTD 微信小程序的 Node.js 后端服务，负责把小程序请求转发到你自己的 Coze Workflow，并返回天气数据与穿搭建议。

## 配置

复制环境变量模板：

```bash
cp .env.example .env
```

填写 `.env`：

```env
COZE_TOKEN=your_coze_api_token
COZE_APP_ID=your_coze_app_id
COZE_WEATHER_WORKFLOW_ID=your_weather_workflow_id
COZE_OOTD_WORKFLOW_ID=your_ootd_workflow_id

PORT=3000
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=60000
```

## 安装与运行

```bash
pnpm install
pnpm run dev
```

生产启动：

```bash
pnpm start
```

语法检查：

```bash
pnpm test
```

## 接口

- `GET /health`：健康检查
- `GET /api/weather?city=北京`：获取天气数据
- `POST /api/generate-ootd`：生成穿搭建议和图片

详细请求示例见项目根目录的 `docs.md`。
