var xihe = require('./utils/request.js');
//app.js
App({
    globalData: {
        userinfo   : '',
        openid     : '',
        uid        : 0 ,
        agent_id   : 0 ,
        free_trial : 0,
        pay_status : 0,
        check_user: xihe.check_user
    },
    onLaunch: function (options) {
        if (options.query && options.query.agent_uid ){
            wx.setStorageSync('agent_uid', options.query.agent_uid);
        }else{
            wx.setStorageSync('agent_uid', 0);
        }

        // 登录
        xihe._get_openid_callback =function(data){   
            var app                   = getApp();
            app.globalData.openid     = data.openid;
            app.globalData.uid        = data.uid;  
            app.globalData.agent_id   = data.agent_id;
            app.globalData.free_trial = data.free_trial;
            app.globalData.pay_status = data.pay_status;
            if( data.userinfo == ""){
                xihe._getSetting();
            }else{
                app.globalData.userinfo = JSON.parse(data.userinfo);
            }
        }; 

        xihe._login = function(){  
            wx.login({
                success: res => { 
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    xihe.post({
                        url: "/api/wechat/get_openid_sessionkey",
                        data: {
                            js_code: res.code,
                            grant_type: "authorization_code",
                            agent_uid: wx.getStorageSync('agent_uid')
                        },
                        callback: function (data) { 
                            xihe._get_openid_callback(data);
                        }
                    });
                },
                fail: res => {
                    console.log("login failed");
                    console.log(res);  
                }
            })
        }; 
 
        xihe._getUserInfo = function(){
            var App = getApp();
            wx.getUserInfo({
                success: res => {
                    // 可以将 res 发送给后台解码出 unionId  
                    if (App.globalData.openid && !App.globalData.userinfo){ 
                        var submitData = {
                            openid        : App.globalData.openid,
                            userinfo      : res.rawData,
                            encrypteddata : res.encryptedData
                        };
                        xihe.post({
                            url: "/api/wechat/update_userinfo",
                            data: submitData,
                            callback: function (data) {   
                                App.globalData.userinfo = JSON.parse(data.data.userinfo);
                            }
                        });
                    }else{
                        console.log('did not have openid');
                        // console.log(res);
                        // xihe._login();
                    }

                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    var app = getApp();
                    if ( app.userInfoReadyCallback ) {
                        app.userInfoReadyCallback(res)
                    }
                },
                fail: res => {
                    console.log('a'); 
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
        };
        
        xihe._getSetting = function(){ 
            // 获取用户信息
            wx.getSetting({
                success: res => {  
                    if (!res.authSetting['scope.userInfo']) {  
                        xihe._getUserInfo(); 
                    }else {
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框 
                        xihe._getUserInfo();
                    }
                },
                fail: res => {
                    console.log(res);
                }
            })
        };
 
        wx.checkSession({
            success: res => {  
                console.log('logined'); 
                if ( !this.globalData.openid ){ 
                    xihe._login();
                } else if ( !this.globalData.userinfo ){
                    xihe._getSetting();
                }
            },
            fail: function (data) { 
                console.log('not login');
                xihe._login();
            }
        })
       
    },
})