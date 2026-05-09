const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const config = {
  port: process.env.PORT || 3000,
  cozeToken: process.env.COZE_TOKEN,
  cozeAppId: process.env.COZE_APP_ID,
  weatherWorkflowId: process.env.COZE_WEATHER_WORKFLOW_ID,
  ootdWorkflowId: process.env.COZE_OOTD_WORKFLOW_ID,
  cozeWorkflowUrl: process.env.COZE_WORKFLOW_URL || 'https://api.coze.cn/v1/workflow/run',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 60000),
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

const requiredEnvVars = [
  'COZE_TOKEN',
  'COZE_APP_ID',
  'COZE_WEATHER_WORKFLOW_ID',
  'COZE_OOTD_WORKFLOW_ID'
];

function validateConfig() {
  const missingVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Copy .env.example to .env and fill in your own Coze configuration.'
    );
  }
}

const cozeClient = axios.create({
  timeout: config.requestTimeoutMs,
  headers: {
    Authorization: `Bearer ${config.cozeToken}`,
    'Content-Type': 'application/json'
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

// 健康检查端点
app.get('/', (req, res) => {
  res.send('OOTD Mini Program Server is running');
});

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

function parseWorkflowData(rawData) {
  if (!rawData) {
    return {};
  }

  if (typeof rawData === 'object') {
    return rawData;
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    throw new Error('Coze workflow returned invalid JSON data');
  }
}

async function runCozeWorkflow(workflowId, parameters) {
  const response = await cozeClient.post(config.cozeWorkflowUrl, {
    parameters,
    workflow_id: workflowId,
    app_id: config.cozeAppId,
    is_async: false
  });

  if (response.data.code !== 0) {
    throw new Error(response.data.msg || 'Coze workflow failed');
  }

  return parseWorkflowData(response.data.data);
}

function extractWeatherList(weatherData) {
  if (Array.isArray(weatherData.output)) {
    return weatherData.output;
  }

  if (Array.isArray(weatherData.weather)) {
    return weatherData.weather;
  }

  if (Array.isArray(weatherData.data)) {
    return weatherData.data;
  }

  return [];
}

function extractImageUrls(ootdData) {
  const source = ootdData.files || ootdData.images || ootdData.output || [];

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      return item && (item.data || item.url || item.imageUrl);
    })
    .filter(Boolean);
}

// 天气API端点
app.get('/api/weather', async (req, res) => {
  try {
    const { city = '北京' } = req.query;
    const weatherData = await runCozeWorkflow(config.weatherWorkflowId, { city });

    console.log(`Successfully fetched weather data for ${city}`);
    return res.json({
      success: true,
      data: extractWeatherList(weatherData),
      city
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
});

// OOTD生成API端点
app.post('/api/generate-ootd', async (req, res) => {
  try {
    const { city, gender, personalTrait, selectedStyle, weather } = req.body;

    if (!city || !gender || !selectedStyle || !weather) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    const ootdData = await runCozeWorkflow(config.ootdWorkflowId, {
      city,
      gender,
      personalTrait: personalTrait || '',
      selectedStyle,
      weather
    });

    console.log(`Successfully generated OOTD for ${city}, style: ${selectedStyle}`);
    return res.json({
      success: true,
      data: {
        advice: ootdData.advice || '',
        images: extractImageUrls(ootdData)
      }
    });
  } catch (error) {
    console.error('OOTD Generation Error:', error);
    res.status(500).json({
      success: false,
      error: '生成穿搭建议失败'
    });
  }
});

// 启动服务器
validateConfig();

app.listen(config.port, () => {
  console.log(`服务器已在端口 ${config.port} 上运行`);
});
