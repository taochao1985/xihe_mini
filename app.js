var xihe = require('./utils/request.js');
//app.js
App({
    globalData: {
        userInfo : '',
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
        xihe._get_openid_callback =function(item,data){ 
            wx.setStorageSync('openid',data.openid);
            wx.setStorageSync('uid', data.uid) ;
            if( data.userinfo ){
                wx.setStorageSync('userinfo', JSON.parse(data.userinfo));
            } 
            
            xihe._getSetting(item);
        }; 

        xihe._login = function(item){ 
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
                            xihe._get_openid_callback(item, data);
                        }
                    });
                }
            })
        }; 

        xihe._getUserInfo = function(item){
            
            wx.getUserInfo({
                success: res => {
                    // 可以将 res 发送给后台解码出 unionId 
                    if (!wx.getStorageSync('openid')){
                        var submitData = {
                            openid: wx.getStorageSync('openid'),
                            userinfo: res.rawData,
                            encrypteddata: res.encryptedData
                        };
                        xihe.post({
                            url: "/api/wechat/update_userinfo",
                            data: submitData,
                            callback: function (data) {
                                wx.setStorageSync('userinfo', JSON.parse(data.data.userinfo));
                            }
                        });
                    }else{
                        console.log(res);
                    }

                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (item.userInfoReadyCallback) {
                        item.userInfoReadyCallback(res)
                    }
                }
            })
        };
        
        xihe._getSetting = function(item){
            // 获取用户信息
            wx.getSetting({
                success: res => { 
                    if (!res.authSetting['scope.userInfo']) {
                        wx.authorize({
                            scope: 'scope.userInfo',
                            success(res) {
                                console.log(res);
                                xihe._getUserInfo(item);
                            },
                            fail(res){
                                console.log(res);
                            }
                        })
                    }

                    if (res.authSetting['scope.userInfo']) { 
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        xihe._getUserInfo(item);
                    }
                }
            })
        };
 
        wx.checkSession({
            success: res => {  
                if (!wx.getStorageSync('openid')){ 
                    xihe._login(this);
                } else if (!wx.getStorageSync('userInfo')){
                    xihe._getSetting(this);
                }
                //session 未过期，并且在本生命周期一直有效
            },
            fail: function (data) { 
                xihe._login(this);
                return false;
            }
        })
       
    },
})