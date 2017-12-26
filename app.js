var xihe = require('./utils/request.js');
//app.js
App({
    globalData: {
        userinfo : '',
        openid   : '',
        uid      : 0 
    },
    onLaunch: function (options) {  
        if (options.agent_uid ){
            wx.setStorageSync('agent_uid', options.agent_uid);
        }else{
            wx.setStorageSync('agent_uid', 0);
        }

        // 登录
        xihe._get_openid_callback =function(data){  
            var app               = getApp();
            app.globalData.openid = data.openid;
            app.globalData.uid    = data.uid;
            xihe._getSetting(app);
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
                }
            })
        }; 

        xihe._setUserInfo = function(app,data){
            
            app.globalData.userinfo = JSON.parse(data.data.userinfo);
        };

        xihe._getUserInfo = function(app){
            if ( !app ){
                app = getApp();
            }
            wx.getUserInfo({
                success: res => {
                    // 可以将 res 发送给后台解码出 unionId 
                    console.log(app);
                    if (app.globalData.openid){ 
                        var submitData = {
                            openid        : app.globalData.openid,
                            userinfo      : res.rawData,
                            encrypteddata : res.encryptedData
                        };
                        xihe.post({
                            url: "/api/wechat/update_userinfo",
                            data: submitData,
                            callback: function (data) {  
                                wx._setUserInfo(app, data); 
                            }
                        });
                    }else{
                        console.log(res);
                    }

                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    var app = getApp();
                    if ( app.userInfoReadyCallback ) {
                        app.userInfoReadyCallback(res)
                    }
                }
            })
        };
        
        xihe._getSetting = function(app){ 
            // 获取用户信息
            wx.getSetting({
                success: res => {  
                    if (!res.authSetting['scope.userInfo']) { 
                        console.log('A');
                        xihe._getUserInfo(app); 
                        
                    }else{
                         
                    }

                    if (res.authSetting['scope.userInfo']) {  
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        console.log('B');
                        xihe._getUserInfo(app);
                       
                    }
                },
                fail: res => {
                    console.log(res);
                }
            })
        };
 
        wx.checkSession({
            success: res => {  
                if ( !this.globalData.openid ){ 
                    xihe._login();
                } else if ( !this.globalData.userinfo ){
                    xihe._getSetting(this);
                }
            },
            fail: function (data) { 
                console.log('not login');
                xihe._login();
            }
        })
       
    },
})