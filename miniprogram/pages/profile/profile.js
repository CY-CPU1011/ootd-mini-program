// profile.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    defaultAvatarUrl: defaultAvatarUrl,
    userInfo: {
      city: '北京',
      gender: 2, // 1: 男生, 2: 女生, 0: 未设置
      personalTrait: '喜欢简约时尚，偏爱明亮色调',
      hasCompletedOnboarding: false
    },
    hasUserInfo: false
  },

  onLoad() {
    // 尝试获取缓存中的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    } else {
      // 如果没有用户信息，跳转到引导页
      wx.redirectTo({
        url: '../onboarding/onboarding'
      });
    }
  },

  // 导航到首页
  navigateToIndex() {
    wx.switchTab({
      url: '../index/index'
    });
  },

  // 编辑城市 - 直接显示输入框
  editCity() {
    wx.showModal({
      title: '请输入城市',
      editable: true,
      content: this.data.userInfo.city || '',
      placeholderText: '请输入您所在的城市',
      success: (res) => {
        if (res.confirm && res.content) {
          this.updateUserInfo('city', res.content);
        }
      }
    });
  },

  // 编辑性别
  editGender() {
    wx.showActionSheet({
      itemList: ['男生', '女生'],
      success: (res) => {
        const gender = res.tapIndex + 1; // 1: 男生, 2: 女生
        this.updateUserInfo('gender', gender);
      }
    });
  },

  // 编辑个人特性
  editTrait() {
    wx.showModal({
      title: '个人特性',
      editable: true,
      content: this.data.userInfo.personalTrait,
      placeholderText: '请描述您的穿搭偏好和风格特点',
      success: (res) => {
        if (res.confirm && res.content) {
          this.updateUserInfo('personalTrait', res.content);
        }
      }
    });
  },

  // 更新用户信息
  updateUserInfo(field, value) {
    const userInfo = this.data.userInfo;
    userInfo[field] = value;

    // 确保保留hasCompletedOnboarding标志
    userInfo.hasCompletedOnboarding = true;

    this.setData({
      userInfo: userInfo,
      hasUserInfo: true
    });

    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);

    wx.showToast({
      title: '更新成功',
      icon: 'success',
      duration: 2000
    });
  }
});