# OOTD Mini Program

OOTD Mini Program 是一个基于微信小程序 + Node.js 后端 + Coze Workflow 的智能穿搭推荐项目。用户填写城市、性别和个人穿搭偏好后，小程序会根据天气和选择的风格生成今日 OOTD 建议，并展示可参考的穿搭图片。

## 项目能做什么

- 根据城市获取未来天气数据
- 按男生/女生展示不同穿搭风格选项
- 结合天气、个人特征和风格生成 OOTD 建议
- 展示 Coze Workflow 返回的穿搭图片
- 支持用户在“我的”页面修改城市、性别和个人偏好

## 目录结构

```text
.
├── miniprogram/       # 微信小程序源码
├── server/            # Express 后端服务
├── prototype/         # 早期静态原型页面
├── docs.md            # 后端 API 示例
└── README.md
```

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/CY-CPU1011/ootd-mini-program.git
cd ootd-mini-program
```

### 2. 配置后端 Coze API

进入后端目录：

```bash
cd server
pnpm install
cp .env.example .env
```

编辑 `server/.env`，填入自己的 Coze 配置：

```env
COZE_TOKEN=your_coze_api_token
COZE_APP_ID=your_coze_app_id
COZE_WEATHER_WORKFLOW_ID=your_weather_workflow_id
COZE_OOTD_WORKFLOW_ID=your_ootd_workflow_id

PORT=3000
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=60000
```

启动后端：

```bash
pnpm run dev
```

如果配置正确，访问：

```bash
curl http://localhost:3000/health
```

会返回：

```json
{"success":true,"status":"ok"}
```

### 3. 配置小程序 API 地址

编辑：

```text
miniprogram/config.js
```

本地开发默认是：

```js
module.exports = {
  API_BASE_URL: 'http://localhost:3000'
};
```

如果要真机预览或发布小程序，请先部署后端到 HTTPS 域名，然后改成你的线上地址：

```js
module.exports = {
  API_BASE_URL: 'https://your-api-domain.com'
};
```

同时需要在微信公众平台配置合法 request 域名。

### 4. 打开小程序

使用微信开发者工具打开 `miniprogram` 目录。

如果你使用自己的小程序 AppID，请修改：

```text
miniprogram/project.config.json
```

把 `appid` 从 `touristappid` 改成你的 AppID。

## 后端命令

在 `server` 目录运行：

```bash
pnpm install
pnpm run dev
pnpm test
pnpm start
```

## 上传前检查

```bash
cd server
pnpm test
pnpm audit --prod
```

确认不要提交这些文件：

- `server/.env`
- `node_modules/`
- `miniprogram/project.private.config.json`
- `.DS_Store`

## 技术栈

- 微信小程序原生开发
- Node.js
- Express
- Axios
- Coze Workflow API

## 说明

本仓库不包含任何 Coze Token、Workflow ID 或真实私有配置。下载后需要填写自己的 API 信息才能调用生成能力。
