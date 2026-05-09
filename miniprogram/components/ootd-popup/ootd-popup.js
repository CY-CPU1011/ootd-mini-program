// components/ootd-popup/ootd-popup.js
const { API_BASE_URL } = require('../../config');

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal && this.properties.selectedStyle) {
          this.fetchOOTD();
        }
      }
    },
    selectedStyle: {
      type: String,
      value: ''
    },
    weatherData: {
      type: Object,
      value: {}
    },
    userInfo: {
      type: Object,
      value: {}
    }
  },

  data: {
    currentSlide: 0,
    isLoading: false,
    outfitImages: [],
    outfitSuggestion: ''
  },

  lifetimes: {
    attached() {
      // 组件加载时不立即请求，等待弹窗显示时请求
    }
  },

  methods: {
    // 请求OOTD数据
    fetchOOTD() {
      const selectedStyle = this.properties.selectedStyle;
      if (!selectedStyle) {
        wx.showToast({
          title: '请先选择穿搭风格',
          icon: 'none'
        });
        return;
      }

      // 获取用户信息和当前城市
      const userInfo = wx.getStorageSync('userInfo') || {};
      const city = userInfo.city || this.properties.weatherData.city || '北京';
      const gender = userInfo.gender === 1 ? '男' : (userInfo.gender === 2 ? '女' : '不限');
      const personalTrait = userInfo.personalTrait || '';

      this.setData({
        isLoading: true
      });

      // 获取今天的天气数据
      const todayWeather = this.properties.weatherData;

      wx.request({
        url: `${API_BASE_URL}/api/generate-ootd`,
        method: 'POST',
        data: {
          city: city,
          gender: gender,
          personalTrait: personalTrait,
          selectedStyle: selectedStyle,
          weather: {
            condition: todayWeather.description || '晴',
            humidity: parseInt(todayWeather.humidity) || 45,
            predict_date: new Date().toISOString().split('T')[0],
            temp_high: parseInt(todayWeather.highTemp) || 22,
            temp_low: parseInt(todayWeather.lowTemp) || 12,
            weather_day: todayWeather.description || '晴',
            wind_dir_day: '东南风',
            wind_dir_night: '东南风',
            wind_level_day: '3',
            wind_level_night: '2'
          }
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            const ootdData = res.data.data;

            this.setData({
              outfitImages: ootdData.images || [],
              outfitSuggestion: ootdData.advice || this.generateDefaultSuggestion(),
              isLoading: false
            });
          } else {
            console.error('Failed to generate OOTD:', res);
            this.setData({
              outfitSuggestion: this.generateDefaultSuggestion(),
              isLoading: false
            });
            wx.showToast({
              title: '生成穿搭建议失败',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('Error generating OOTD:', error);
          this.setData({
            outfitSuggestion: this.generateDefaultSuggestion(),
            isLoading: false
          });
          wx.showToast({
            title: '生成穿搭建议失败',
            icon: 'none'
          });
        }
      });
    },

    // 生成默认穿搭建议文本
    generateDefaultSuggestion() {
      const weather = this.properties.weatherData;
      const selectedStyle = this.properties.selectedStyle;

      let suggestion = `今天${weather.city || '北京'}天气${weather.description || '晴朗'}，温度在${weather.lowTemp || '12°'}-${weather.highTemp || '22°'}之间，`;

      // 根据温度范围给出基础建议
      if (parseInt(weather.lowTemp) < 10) {
        suggestion += '建议穿着保暖外套搭配长裤。';
      } else if (parseInt(weather.highTemp) > 25) {
        suggestion += '建议穿着轻薄透气的衣物。';
      } else {
        suggestion += '建议穿着轻薄外套搭配长裤。';
      }

      // 根据风格给出具体穿搭建议
      switch(selectedStyle) {
        case '甜酷风':
          suggestion += '甜酷风可以选择oversized卫衣配高腰牛仔裤，脚踩厚底运动鞋，搭配棒球帽和链条包，既保暖又时尚。';
          break;
        case '温柔风':
          suggestion += '温柔风可以选择针织开衫配百褶裙，内搭轻薄高领，脚踩玛丽珍鞋，搭配珍珠发夹和小巧手提包，优雅又不失温度。';
          break;
        case '学院风':
          suggestion += '学院风可以选择条纹毛衣配格纹半身裙，外搭西装外套，脚踩小皮鞋，搭配贝雷帽和帆布包，知性又活泼。';
          break;
        case '韩系简约风':
          suggestion += '韩系简约风可以选择纯色T恤配直筒牛仔裤，外搭宽松西装，脚踩小白鞋，搭配简约手表和托特包，干净利落又有型。';
          break;
        default:
          suggestion += `${selectedStyle || '当前'}风格可以选择符合个人气质的单品组合，注重层次感和色彩搭配，展现个性魅力。`;
      }

      return suggestion;
    },

    // 关闭弹窗
    closePopup() {
      this.triggerEvent('close');
    },

    // 切换到下一张轮播图
    nextSlide() {
      let current = this.data.currentSlide;
      current = (current + 1) % this.data.outfitImages.length;
      this.setData({
        currentSlide: current
      });
    },

    // 切换到上一张轮播图
    prevSlide() {
      let current = this.data.currentSlide;
      current = (current - 1 + this.data.outfitImages.length) % this.data.outfitImages.length;
      this.setData({
        currentSlide: current
      });
    },

    // 切换到指定轮播图
    goToSlide(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({
        currentSlide: index
      });
    },

    // 分享OOTD
    shareOOTD() {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    },

    // 阻止滑动穿透
    preventTouchMove() {
      return false;
    },

    // 阻止冒泡
    preventBubble() {
      return false;
    }
  }
})
