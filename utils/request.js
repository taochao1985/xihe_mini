var config = require('config.js');
function get(opt) {
    wx.request({
        url: config.url + opt.url,
        data: opt.data,
        success: function (res) {
            if (opt.callback) {
                return opt.callback(res.data);
            }
        }
    })
}

function check_user(){
    var App = getApp();
    if ( App.globalData.uid ==0 ){
        // console.log('c');
        // wx.showModal({
        //     title: '操作提示',
        //     showCancel: false,
        //     content: '【兮和摄影俱乐部】小程序需要获取您的用户资料，用于登录。请重试登录，并确保允许小程序获取用户资料',
        //     success: function (res) {
        //         if (res.confirm) {
        //             wx.switchTab({
        //                 url: '/pages/users/index'
        //             })
        //         }
        //     }
        // })
    } else if ( !App.globalData.userinfo ){
        wx.getUserInfo({
            success: res => {
                if (App.globalData.openid) {
                    var submitData = {
                        openid: App.globalData.openid,
                        userinfo: res.rawData,
                        encrypteddata: res.encryptedData
                    };
                    post({
                        url: "/api/wechat/update_userinfo",
                        data: submitData,
                        callback: function (data) {
                            App.globalData.userinfo = JSON.parse(data.data.userinfo);
                        }
                    });
                } else {
                    console.log('did not have openid');
                }
                var app = getApp();
                if (app.userInfoReadyCallback) {
                    app.userInfoReadyCallback(res)
                }
            },
            fail: res => {
                console.log('b');
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
    }
}

function post(opt) {
    var json2Form = function (json) {
        var str = [];
        for (var p in json) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
        }
        return str.join("&");
    } 
    wx.request({
        url: config.url + opt.url,
        data: json2Form(opt.data),
        method: 'POST',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) { 
            if (opt.callback) {
                return opt.callback(res.data);
            }
        }
    });
}

function upload_image(opt){
    wx.uploadFile({
        url: config.url+'/api/fileupload', //仅为示例，非真实的接口地址
        filePath: opt.image_path,
        name: 'userfile',
        formData: {
            'file_type': 'miniprogram'
        },
        success: function (res) {
            opt.callback(res.data);
        },
        fail : function(res){
            console.log("upload err");
            console.log(res);
        }
    })
}

module.exports = {
    get: get,
    post: post,
    config: config,
    upload_image: upload_image,
    check_user: check_user
}