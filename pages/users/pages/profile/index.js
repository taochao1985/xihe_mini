var xihe = require('../../../../utils/request.js');
var app = getApp();
Page({
    data: {
        userinfo : {}
    },
    onLoad: function(){
        xihe._set_user_info = function(data, that){
            that.setData({
                userinfo : data.data
            })
        },

        xihe._get_user_info = function (that){
            xihe.get({
                url: "/api/user/get_userinfo",
                data: {uid : app.globalData.uid},
                callback: function (data) {
                    xihe._set_user_info(data, that);
                }
            })
        }
    },
    onShow: function (options) {
        app.globalData.check_user();
        xihe._get_user_info(this);
    },
    formSubmit: function (e) {
        wx.showToast({
            title: "提交中",
            icon: "loading",
            duration: 1000
        });
        xihe.post({
            url: "/api/user/update_userinfo?uid=" + app.globalData.uid,
            data: e.detail.value,
            callback: function (data) {
                wx.hideToast();
                if ( data.code == 0 ){
                    
                    wx.showModal({
                        title: '操作提示',
                        showCancel: false,
                        content: data.msg,
                        success: function (res) {
                            if (res.confirm) {
                                wx.switchTab({
                                    url: '/pages/users/index',
                                })
                            }
                        }
                    });
                }else{
                    wx.showToast({
                        title: data.msg,
                        icon: "loading",
                        duration: 1000
                    });
                }
            }
        })
    }
})
