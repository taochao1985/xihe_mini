var xihe = require('../../utils/request.js');
var WxParse = require('../common/lib/wxParse/wxParse.js');
var app  = getApp();
Page({
    data: {
        uid : 0,
        list: [
            {
                id: 'friends',
                name: '关注',
                img_path : '../common/images/follow_icon.png',
                url:  'friends/index'
            }, {
                id: 'collections',
                name: '收藏',
                img_path: '../common/images/collections_icon.png',
                url: 'collections/index'
                 
            }, {
                id: 'publishes',
                name: '相册',
                img_path: '../common/images/publishes_icon.png',
                url: 'publishes/index?'
            }, {
                id: 'news',
                name: '系统公告',
                img_path: '../common/images/publishes_announce.png',
                url: 'news/index'
            }
        ],
        userInfo: {},
        followTime : 0,
        agent_status : 0,
        reason : "",
        apply_note : "",
        apply_title : "",
        showModalStatus : false,
        showPayStatus : false,
        showPayBtn:0,
        pay_title: "",
        qrcode_url : "",
        checked:false,
        invalid_time: "",
        member_valid: 0,
        wechat_num:"",
        mobile:""
    },
    onLoad: function (options) {
        this.setData({
            userInfo : app.globalData.userinfo
        });

        xihe._set_follow_count = function(item, data){
            item.setData({
                followTime   : data.count,
                agent_status : data.agent_status,
                pay_status   : data.pay_status,
                reason       : data.reason,
                apply_title  : data.apply_title,
                qrcode_url   : data.agent_qrcode,
                pay_title    : data.pay_title,
                showPayBtn   : parseInt(data.pay_status),
                invalid_time : data.valid_time,
                member_valid : parseInt(data.member_valid)
            });
            var article = data.apply_note;
            WxParse.wxParse('article', 'html', article, item, 5);

            var pay_article = data.pay_note;
            WxParse.wxParse('pay_article', 'html', pay_article, item, 5);
        };

        xihe._get_follow_count = function(item ){
            xihe.get({
                url: "/api/user/get_follow_count",
                data: {
                    uid: app.globalData.uid
                },
                callback: function (data) {
                    xihe._set_follow_count(item, data);
                }
            });
        };

        xihe._wechatPay = function (item, opt) {
            opt = JSON.parse(opt);
            wx.requestPayment({
                'timeStamp': opt.timeStamp,
                'nonceStr': opt.nonceStr,
                'package': opt.package,
                'signType': 'MD5',
                'paySign': opt.paySign,
                'success': function (res) {
                    item.setData({
                        showPayStatus:false,
                        showPayBtn:1
                    })
                },
                'fail': function (res) {

                    // wx.switchTab({
                    //     url: '/pages/index/index',
                    // })
                }
            })
        };

        xihe._create_wechat_pay = function (item) {
            xihe.post({
                url: "/api/user/create_wechat_pay",
                data: { uid: app.globalData.uid },
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._wechatPay(item, data.data);
                    }
                }
            });
        };

        xihe._get_follow_count(this);
    },
    change_location: function(e){
        wx.switchTab({
            url: '/pages/users/'+e.currentTarget.dataset.url
        })
    },
    visitPublish: function (e) {
        wx.setStorageSync("publish_uid", app.globalData.uid);
        wx.switchTab({
            url: '/pages/users/pages/publishes/index',
        })
    }, 
    getUserInfo: function(e) {
        var that = this;
        wx.getUserInfo({
            success: res => {
                var app = getApp();
                // 可以将 res 发送给后台解码出 unionId  
                if (app.globalData.openid) {
                    var submitData = {
                        openid: app.globalData.openid,
                        userinfo: res.rawData,
                        encrypteddata: res.encryptedData
                    };
                    xihe.post({
                        url: "/api/wechat/update_userinfo",
                        data: submitData,
                        callback: function (data) {
                            app.globalData.userinfo = JSON.parse(data.data.userinfo);
                            that.setData({
                                userInfo: app.globalData.userinfo
                            })
                        }
                    });
                } else {
                    console.log('did not have openid');
                }

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                
                if (app.userInfoReadyCallback) {
                    app.userInfoReadyCallback(res)
                }
            },
            fail: res => {
                that.setData({
                    checked:false
                });
                wx.showModal({
                    title: '操作提示',
                    showCancel: false,
                    content: '【兮和摄影俱乐部】小程序需要获取您的用户资料，用于登录。请重试登录，并确保允许小程序获取用户资料',
                    success: function (res) {
                        if (res.confirm) {
                            wx.switchTab({
                                url: '/pages/users/index'
                            })
                        }
                    }
                })
            }
        })
    },
    freeTrial: function (e) {
        this.setData({
            showModalStatus: false,
            showPayStatus  : false
        });
    },
    showPayStatus: function(){
        this.setData({
            showPayStatus: true
        })
    },

    joinClub: function(e){
        xihe._create_wechat_pay(this);
    },
    
    applyAgentModal: function(e){
        this.setData({
            showModalStatus: true
        });
    },

    wechat_num_changed: function(e){
        this.setData({
            wechat_num : e.detail.value
        });
    },

    mobile_changed: function(e) {
        this.setData({
            mobile: e.detail.value
        });
    },

    applyAgent: function(e){
        var that = this;
        var wechat_num = that.data.wechat_num;
        if ( wechat_num == ""){
            wx.showToast({
                title: '请输入您的微信号！',
                icon: 'success',
                duration: 1500
            })
            return false;
        }

        var mobile = that.data.mobile;
        if (wechat_num == "") {
            wx.showToast({
                title: '请输入您的手机号！',
                icon: 'success',
                duration: 1500
            })
            return false;
        }
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
        if (!myreg.test(mobile)) {
            wx.showToast({
                title: '手机号有误！',
                icon: 'success',
                duration: 1500
            })
            return false;
        }

        this.setData({
            showModalStatus: false
        });
        
        xihe.post({
            url: "/api/user/apply_agent",
            data: {
                uid : app.globalData.uid,
                wechat_num : wechat_num,
                mobile : mobile
            },
            callback: function (data) {

                var icon = 'success';
                if( data.code == 1){
                    icon = 'danger';
                }else{
                    that.setData({
                        agent_status : 2
                    })
                }
                wx.showToast({
                    title: data.msg,
                    icon: icon,
                    duration: 2000
                })
            }
        });
    },
    downloadQrcode : function(e){
        var qrcode_url = e.currentTarget.dataset.url;
        var images = qrcode_url.split(';');
        wx.previewImage({
            current: qrcode_url,
            urls: images
        });
    }
})
