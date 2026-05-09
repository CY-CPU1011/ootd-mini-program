# API 文档

本项目后端封装了 Coze Workflow，给微信小程序提供天气查询和 OOTD 穿搭生成接口。

## 环境变量

在 `server` 目录复制 `.env.example` 为 `.env`，并填入自己的 Coze 配置：

```env
COZE_TOKEN=your_coze_api_token
COZE_APP_ID=your_coze_app_id
COZE_WEATHER_WORKFLOW_ID=your_weather_workflow_id
COZE_OOTD_WORKFLOW_ID=your_ootd_workflow_id

PORT=3000
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=60000
```

## 健康检查

```bash
curl http://localhost:3000/health
```

响应：

```json
{
  "success": true,
  "status": "ok"
}
```

## 获取天气数据

请求：

```bash
curl "http://localhost:3000/api/weather?city=北京"
```

响应：

```json
{
  "success": true,
  "city": "北京",
  "data": [
    {
      "condition": "晴",
      "humidity": 45,
      "predict_date": "2026-05-09",
      "temp_high": 26,
      "temp_low": 16,
      "weather_day": "晴",
      "wind_dir_day": "南风",
      "wind_dir_night": "南风",
      "wind_level_day": "2",
      "wind_level_night": "2"
    }
  ]
}
```

## 生成 OOTD

请求：

```bash
curl -X POST "http://localhost:3000/api/generate-ootd" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "北京",
    "gender": "男",
    "personalTrait": "喜欢简约、干净的穿搭",
    "selectedStyle": "日系简约",
    "weather": {
      "condition": "晴",
      "humidity": 45,
      "predict_date": "2026-05-09",
      "temp_high": 26,
      "temp_low": 16,
      "weather_day": "晴",
      "wind_dir_day": "南风",
      "wind_dir_night": "南风",
      "wind_level_day": "2",
      "wind_level_night": "2"
    }
  }'
```

响应：

```json
{
  "success": true,
  "data": {
    "advice": "今天适合轻薄外套搭配直筒裤，整体保持清爽层次。",
    "images": [
      "https://example.com/outfit-1.png"
    ]
  }
}
```

后端会兼容 Coze Workflow 常见的图片字段：`files[].data`、`images[]`、`output[]`。
