var xihe = require('./utils/request.js');
//app.js
App({
    globalData: {
        userinfo : '',
        openid   : '',
        uid      : 0 
    },
    onLaunch: function (options) {   
        // wx.showModal({
        //     title: "留住美原来如此简单",
        //     content: "兮和摄影俱乐部提供的服务：\r\n 1、俱乐部为免费您提供发布摄影作品平台，与其他摄影爱好者一起讨论；兮和老师也会时常进行点评。\r\n 2、付费会员建立自己的收藏夹，收集喜欢的作品。\r\n 3、付费会员收听一年50节摄影教学课程（视频+图文），每周四晚上8：00更新，无间断。\r\n4、付费会员收听一年200张佳作评析课程（语音+图文），每周一、二、三、五晚上8：00更新，无间断。\r\n 5、本产品为虚拟内容服务，一经订阅成功，不可退款，敬请理解。",
        //     showCancel: true,
        //     confirmText: "立即入会",
        //     cancelText: "免费体验"
        // })

        if (options.query.agent_uid ){
            wx.setStorageSync('agent_uid', options.query.agent_uid);
        }else{
            wx.setStorageSync('agent_uid', 0);
        }

        // 登录
        xihe._get_openid_callback =function(data){   
            var app               = getApp();
            app.globalData.openid = data.openid;
            app.globalData.uid    = data.uid;  
            xihe._getSetting();
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
                    if (App.globalData.openid){ 
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
                    console.log(res);
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