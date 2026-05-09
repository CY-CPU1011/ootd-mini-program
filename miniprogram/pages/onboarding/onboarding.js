// onboarding.js
Page({
  data: {
    city: '',
    gender: 0, // 0: 未设置, 1: 男生, 2: 女生
    personalTrait: ''
  },

  onLoad() {
    // 尝试获取已有的用户信息（如果有）
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        city: userInfo.city || '',
        gender: userInfo.gender || 0,
        personalTrait: userInfo.personalTrait || ''
      });
    }
  },

  // 城市输入处理
  onCityInput(e) {
    this.setData({
      city: e.detail.value
    });
  },

  // 性别选择处理
  selectGender(e) {
    const gender = parseInt(e.currentTarget.dataset.gender);
    this.setData({
      gender: gender
    });
  },

  // 个人特性输入处理
  onTraitInput(e) {
    this.setData({
      personalTrait: e.detail.value
    });
  },

  // 表单提交处理
  onSubmit() {
    // 表单验证
    if (!this.data.city) {
      wx.showToast({
        title: '请输入你所在的城市',
        icon: 'none'
      });
      return;
    }

    if (this.data.gender === 0) {
      wx.showToast({
        title: '请选择你的性别',
        icon: 'none'
      });
      return;
    }

    if (!this.data.personalTrait) {
      wx.showToast({
        title: '请描述你的个人特性',
        icon: 'none'
      });
      return;
    }

    // 保存用户信息到本地存储
    const userInfo = {
      city: this.data.city,
      gender: this.data.gender,
      personalTrait: this.data.personalTrait,
      hasCompletedOnboarding: true
    };

    wx.setStorageSync('userInfo', userInfo);

    // 显示成功提示
    wx.showToast({
      title: '设置成功',
      icon: 'success',
      duration: 2000
    });

    // 延迟后跳转到首页
    setTimeout(() => {
      wx.switchTab({
        url: '../index/index'
      });
    }, 1500);
  }
});