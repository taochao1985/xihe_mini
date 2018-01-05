var xihe = require('../../../../utils/request.js');
var WxParse = require('../../../common/lib/wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        newsData : {},
        webUrl      : xihe.config.url,
        newsId      : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
      xihe._set_news_data = function(item, data){
        
        item.setData({
            newsData : data
        });
        wx.setNavigationBarTitle({
            title: data.title
        })

        var article = data.description;
        WxParse.wxParse('article', 'html', article, item, 5);
    };
 
    xihe._get_news_data = function (item, id) {
        xihe.get({
            url: "/api/news/show/" + id,
            data: {},
            callback: function (data) {
                if(data.code == 0 ){
                    xihe._set_news_data(item, data.data);
                }
            }
        });
    }; 
    this.setData({
        newsId : options.id
    });

    xihe._get_news_data(this, options.id);
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
})