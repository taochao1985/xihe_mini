var xihe = require('../../../utils/request.js');
var WxParse = require('../../common/lib/wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        lessionData : {},
        webUrl      : xihe.config.url,
        postId      : 0,
        uid         : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    xihe._set_lession_data = function(item, data){
        
        item.setData({
            lessionData : data
        });
        wx.setNavigationBarTitle({
            title: data.title
        })

        var article = data.description;
        WxParse.wxParse('article', 'html', article, item, 5);
    };

    xihe._get_lession_data = function (item, id) {
        xihe.get({
            url: "/api/lession/show/"+id,
            data: {},
            callback: function (data) {
                xihe._set_lession_data(item, data.data);
            }
        });
    }; 
    this.setData({
        postId : options.id,
        uid    : wx.getStorageSync("uid")
    });

    xihe._get_lession_data(this, options.id);
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
      var data = this.data;
      return {
          title    : data.lessionData.title,
          path     : '/pages/lessions/pages/detail?agent_uid='+data.uid+'&id=' + data.postId,
          imageUrl : data.lessionData.image_path,
          success  : function (res) {
              // 转发成功
          },
          fail: function (res) {
              // 转发失败
          }
      }
  }
})