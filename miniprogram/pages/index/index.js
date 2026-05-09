// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const api = require('../../utils/api');

// 男生风格选项
const MALE_STYLES = [
  '街头潮流', '商务休闲', '学院风', '日系简约',
  '工装风', '户外机能', '运动休闲', '复古文艺',
  '嘻哈风', '极简风'
];

// 女生风格选项
const FEMALE_STYLES = [
  '甜酷风', '温柔风', '学院风', '韩系简约风',
  '设计师品牌风', '复古文艺风', '小香风', '森女系',
  '运动休闲风', 'Y2K风', '日系'
];

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),

    // 新增的数据
    selectedStyle: '', // 选中的穿搭风格
    currentDate: '', // 当前日期
    currentDay: '', // 当前星期
    isWeatherLoading: true, // 天气数据加载状态
    weatherData: {
      city: '北京',
      temperature: '',
      description: '',
      humidity: '',
      highTemp: '',
      lowTemp: ''
    },
    forecastData: [],

    // 性别相关数据
    gender: 2, // 默认为女生 (1-男生, 2-女生)
    styleOptions: FEMALE_STYLES, // 默认显示女生风格

    // OOTD弹窗相关
    showOOTDPopup: false,

    // 存储上次使用的城市，用于判断是否需要刷新天气
    lastUsedCity: ''
  },

  onLoad() {
    this.setCurrentDate();
    this.checkOnboardingStatus();
    this.loadUserInfo();
    this.fetchWeatherData();
  },

  // 页面显示时执行，用于从个人信息页切换回首页时更新性别相关数据
  onShow() {
    this.updateGenderBasedStyles();

    const userInfo = wx.getStorageSync('userInfo') || {};
    const currentCity = userInfo.city || '北京';
    if (this.data.lastUsedCity && currentCity !== this.data.lastUsedCity) {
      this.fetchWeatherData();
    }
  },

  // 更新基于性别的风格选项
  updateGenderBasedStyles() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    const gender = userInfo.gender || 2; // 默认女生

    // 如果性别发生变化，需要更新风格选项
    if (gender !== this.data.gender) {
      const styleOptions = gender === 1 ? MALE_STYLES : FEMALE_STYLES;
      this.setData({
        gender,
        styleOptions,
        selectedStyle: '' // 重置已选择的风格
      });
    } else if (!this.data.styleOptions || this.data.styleOptions.length === 0) {
      // 如果styleOptions为空，初始化它
      const styleOptions = gender === 1 ? MALE_STYLES : FEMALE_STYLES;
      this.setData({
        styleOptions
      });
    }

    // 更新用户信息
    if (userInfo.avatarUrl && userInfo.nickName) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
    }
  },

  // 检查是否完成引导
  checkOnboardingStatus() {
    const userInfo = wx.getStorageSync('userInfo');

    // 如果没有用户信息或者没有完成引导，跳转到引导页
    if (!userInfo || !userInfo.hasCompletedOnboarding) {
      wx.redirectTo({
        url: '../onboarding/onboarding'
      });
    } else {
      // 更新天气数据中的城市
      if (userInfo.city) {
        this.setData({
          'weatherData.city': userInfo.city
        });
      }
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });

      // 加载完用户信息后更新风格选项
      this.updateGenderBasedStyles();
    }
  },

  // 设置当前日期和星期
  setCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = now.getDay();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    this.setData({
      currentDate: `${year}年${month}月${date}日`,
      currentDay: `星期${weekdays[day]}`
    });
  },

  // 获取天气数据
  fetchWeatherData() {
    const that = this;

    // 获取当前用户设置的城市
    const userInfo = wx.getStorageSync('userInfo') || {};
    const currentCity = userInfo.city || '北京';

    that.setData({
      isWeatherLoading: true,
      lastUsedCity: currentCity  // 记录当前使用的城市
    });

    api.getWeatherData({ city: currentCity })
      .then(data => {
        // 处理天气数据
        if (data && data.length > 0) {
          const todayWeather = data[0];

          // 确定天气图标
          let weatherIcon = 'icon-sun'; // 默认晴天
          if (todayWeather.weather_day.includes('晴')) {
            weatherIcon = 'icon-sun';
          } else if (todayWeather.weather_day.includes('多云')) {
            weatherIcon = 'icon-cloud-sun';
          } else if (todayWeather.weather_day.includes('阴')) {
            weatherIcon = 'icon-cloud';
          } else if (todayWeather.weather_day.includes('雨')) {
            weatherIcon = 'icon-cloud-rain';
          } else if (todayWeather.weather_day.includes('雪')) {
            weatherIcon = 'icon-cloud-snow';
          }

          const weatherData = {
            city: currentCity,  // 使用当前城市
            temperature: `${todayWeather.temp_high}°`,
            description: todayWeather.weather_day,
            humidity: `${todayWeather.humidity}%`,
            highTemp: `${todayWeather.temp_high}°`,
            lowTemp: `${todayWeather.temp_low}°`,
            weatherIcon: weatherIcon // 添加天气图标
          };

          // 处理未来7天天气数据
          const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          const forecastData = [];

          // 获取今天是星期几
          const today = new Date();
          const todayWeekday = today.getDay(); // 0-6, 0是周日

          data.forEach((item, index) => {
            // 计算日期对应的星期
            const date = new Date(item.predict_date);
            const weekday = weekdays[date.getDay()];
            const dayLabel = index === 0 ? '今天' : weekday;

            // 设置图标（根据天气状态）
            let icon = 'icon-sun'; // 默认是晴天图标

            if (item.weather_day.includes('晴')) {
              icon = 'icon-sun';
            } else if (item.weather_day.includes('多云')) {
              icon = 'icon-cloud-sun';
            } else if (item.weather_day.includes('阴')) {
              icon = 'icon-cloud';
            } else if (item.weather_day.includes('雨')) {
              icon = 'icon-cloud-rain';
            } else if (item.weather_day.includes('雪')) {
              icon = 'icon-cloud-snow';
            }

            forecastData.push({
              day: dayLabel,
              icon: icon,
              highTemp: `${item.temp_high}°`,
              lowTemp: `${item.temp_low}°`
            });
          });

          that.setData({
            weatherData: weatherData,
            forecastData: forecastData,
            isWeatherLoading: false
          });
        }
      })
      .catch(err => {
        console.error('获取天气数据失败:', err);
        // 设置默认数据
        that.setData({
          isWeatherLoading: false
        });
      });
  },

  // 选择穿搭风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({
      selectedStyle: style
    });
  },

  // 生成今日穿搭
  generateOOTD() {
    if (!this.data.selectedStyle) {
      wx.showToast({
        title: '请先选择一种穿搭风格',
        icon: 'none'
      });
      return;
    }

    // 显示OOTD弹窗
    this.setData({
      showOOTDPopup: true
    });
  },

  // 关闭OOTD弹窗
  closeOOTDPopup() {
    this.setData({
      showOOTDPopup: false
    });
  },

  // 导航到个人资料页面
  navigateToProfile() {
    wx.switchTab({
      url: '../profile/profile'
    });
  },

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '今日OOTD穿搭推荐',
      path: '/pages/index/index'
    };
  }
})
