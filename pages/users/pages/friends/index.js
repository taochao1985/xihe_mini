// pages/users/pages/mine/friends/index.js
var xihe = require('../../../../utils/request.js');
var app  = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      userInfo : {},
      uid      : 0,
      follows  : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          userInfo : app.globalData.userinfo,
          uid      : app.globalData.uid 
      });

      xihe._set_user_follows = function (item, users){
            item.setData({
                follows : users
            });
        };

        xihe._get_user_follows = function(item){
            xihe.get({
                url: "/api/user/follows",
                data: { uid: item.data.uid },
                callback: function (data) {
                    if (data.code == 0 ){
                        xihe._set_user_follows(item, data.users);
                    }
                }
            });
        };
        xihe._get_user_follows(this); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  unfollow:function(e){
      var target = e.currentTarget.dataset;
      var target_uid = target.uid;
      var follow = (target.follow == 1) ? 0 : 1;
      var that = this;
      xihe.post({
          url: "/api/user/follow",
          data: {
              user_id: this.data.uid,
              target_uid: target_uid,
              follow: follow
          },
          callback: function (data) {
              if (data.code == 0) {
                  xihe._get_user_follows(that);
              }
          }
      });
  }
})