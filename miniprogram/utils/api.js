// API 配置
const { API_BASE_URL } = require('../config');

/**
 * 请求天气数据
 * @param {Object} options - 请求选项
 * @param {string} options.city - 城市名称，默认从本地存储获取，如果没有则使用北京
 * @returns {Promise} - 返回Promise对象
 */
const getWeatherData = (options = {}) => {
  // 优先使用传入的城市，其次从本地存储获取用户设置的城市
  let city = options.city;

  if (!city) {
    const userInfo = wx.getStorageSync('userInfo') || {};
    city = userInfo.city;
  }

  // 如果没有城市信息，拒绝 Promise
  if (!city) {
    return Promise.reject(new Error('没有城市信息，无法获取天气数据'));
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/weather`,
      method: 'GET',
      data: { city },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.data);
        } else {
          reject(new Error('获取天气数据失败'));
        }
      },
      fail: (err) => {
        console.error('请求天气API失败:', err);
        reject(err);
      }
    });
  });
};

module.exports = {
  getWeatherData
};
