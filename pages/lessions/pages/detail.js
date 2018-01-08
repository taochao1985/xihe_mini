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
        postId      : 0
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

    xihe._save_share_data = function(uid, post_id){
        xihe.post({
            url: "/api/lession/shared",
            data: {uid:uid, post_id:post_id},
            callback: function (data) {
                
            }
        })
    };

    xihe._wechatPay = function (item, id, opt){
        opt = JSON.parse(opt);
        wx.requestPayment({
            'timeStamp': opt.timeStamp,
            'nonceStr': opt.nonceStr,
            'package': opt.package,
            'signType': 'MD5',
            'paySign': opt.paySign,
            'success': function (res) {
                xihe._get_lession_data(item,id );  
            },
            'fail': function (res) { 
            }
        })
    };

    xihe._create_wechat_pay = function(item, id){
        xihe.post({
            url: "/api/user/create_wechat_pay",
            data: { uid: app.globalData.uid},
            callback: function (data) {
                if (data.code == 0) {
                    xihe._wechatPay(item, id, data.data);
                }
            }
        });
    };

    xihe._get_lession_data = function (item, id) {
        xihe.get({
            url: "/api/lession/show/" + id + "/" + app.globalData.uid,
            data: {},
            callback: function (data) {
                if(data.code == 0 ){
                    xihe._set_lession_data(item, data.data);
                } else if (data.code == 10001){
                    wx.navigateBack({
                        delta: 1
                    })
                }else{
                    xihe._create_wechat_pay(item, id);
                    
                }
            }
        });
    }; 
    this.setData({
        postId : options.id
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
      xihe._getUserInfo = function () {
          var App = getApp();
          wx.getUserInfo({
              success: res => {
                  // 可以将 res 发送给后台解码出 unionId  
                  if (App.globalData.openid) {
                      var submitData = {
                          openid: App.globalData.openid,
                          userinfo: res.rawData,
                          encrypteddata: res.encryptedData
                      };
                      xihe.post({
                          url: "/api/wechat/update_userinfo",
                          data: submitData,
                          callback: function (data) {
                              App.globalData.userinfo = JSON.parse(data.data.userinfo);
                          }
                      });
                  } else {
                      console.log('did not have openid');
                      // console.log(res);
                      // xihe._login();
                  }

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  var app = getApp();
                  if (app.userInfoReadyCallback) {
                      app.userInfoReadyCallback(res)
                  }
              },
              fail: res => {
                  console.log(res);
              }
          })
      };

      xihe._getSetting = function () {
          // 获取用户信息
          wx.getSetting({
              success: res => {
                  if (!res.authSetting['scope.userInfo']) {
                      xihe._getUserInfo();
                  } else {
                      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框 
                      xihe._getUserInfo();
                  }
              },
              fail: res => {
                  console.log(res);
              }
          })
      };
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
          path: '/pages/lessions/pages/detail?agent_uid=' + app.globalData.uid+'&id=' + data.postId,
          imageUrl : data.lessionData.image_path,
          success  : function (res) {
              xihe._save_share_data(app.globalData.uid, data.postId);
          },
          fail: function (res) {
              // 转发失败
          }
      }
  }
})