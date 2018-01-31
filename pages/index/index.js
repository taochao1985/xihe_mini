//index.js 
var xihe = require('../../utils/request.js'); 
var WxParse = require('../common/lib/wxParse/wxParse.js');
var app  = getApp();
Page({
    data: {
        activecolor: '#ff3334',
        base_url : xihe.config.url,
        imgUrls: {},
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        lessionTypes:[],
        publishes : [],
        collects : [],
        follows: [],
        currentPage : 0,
        totalPages : 0,
        uid : 0,
        inputTxt : "",
        target_data : {},
        totalImageUrls : "",
        collect_folders:[],
        showModalStatus : false,
        title:"",
        description:'',
        showPayBtn:0,
        collect_pages:0,
        follow_pages:0,
        collect_current_page:1,
        follow_current_page:1
    },
    onLoad: function () {
        wx.showLoading({
            title: '加载中',
        })

        var item = this;
        
        xihe._set_index_data = function (item, data) {
            if (app.globalData.free_trial == 0 && item.data.showModalStatus == false && app.globalData.pay_status == 0) {
                item.setData({
                    showModalStatus: true
                });
            }else{
                item.setData({
                    showModalStatus: false
                });
            }

            item.setData({
                imgUrls: data.slider_images,
                totalImageUrls: data.slider_images_url,
                lessionTypes: data.lession_type,
                publishes: data.publishes,
                collects: data.collects,
                follows: data.follows,
                currentPage: 1,
                totalPages: data.total_pages,
                uid: app.globalData.uid,
                title:data.title,
                showPayBtn:parseInt(data.pay_status),
                collect_pages: data.collect_pages,
                follow_pages:data.follow_pages,
                collect_current_page: 1,
                follow_current_page: 1
            })
            wx.hideLoading();

            var article = data.description;
            WxParse.wxParse('article', 'html', article, item, 5);
        };
        xihe._get_index_data = function () {
            xihe.get({
                url: "/api/main/index",
                data: { uid: app.globalData.uid },
                callback: function (data) {
                    xihe._set_index_data(item, data);
                }
            });
        }; 
    
        xihe._save_comment_complete = function(item, data, post_id){
            item.data.publishes[post_id].comments = data.data;
            item.setData({
                publishes: item.data.publishes,
                inputTxt : ""
            });
        };

        xihe._save_userfollow_complete = function(item, data){
            for (var i = 0 ; i < item.data.publishes.length ; i++ ){
                var target = item.data.publishes[i];
                if ( target.uid == data.target_uid ){
                    target.is_follow = data.is_follow;
                }
                item.data.publishes[i] = target;
            }
            item.setData({
                publishes: item.data.publishes
            });
        };

        xihe._save_usercollect_complete = function (item, data, post_id, index){
            item.data.publishes[post_id].image_path_collect[index].is_collect = data.is_collect;
            item.setData({
                publishes: item.data.publishes
            });
        };

        xihe._save_collect_complete = function (item, data){
            item.setData({
                collects: data.data.collections
            });
        };

        xihe._set_more_publish = function(that, data, page){
            var publishes = that.data.publishes.concat(data);
            that.setData({
                currentPage : ++page,
                publishes: publishes
            });
        };

        xihe._set_more_collect = function (that, data, page, urls) {
            var collects = that.data.collects.concat(data);
            var urls = that.data.totalImageUrls + ";" + urls;
            that.setData({
                collect_current_page: ++page,
                collects: collects,
                totalImageUrls : urls
            });
        };

        xihe._set_more_follows = function (that, data, page) {
            var follows = that.data.follows.concat(data);
            that.setData({
                follow_current_page: ++page,
                follows: follows
            });
        };

        xihe._get_more_publish = function(that, page){
            xihe.get({
                url: "/api/main/get_more_publish",
                data: {
                    uid  : app.globalData.uid,
                    page : page
                },
                callback: function (data) {
                    xihe._set_more_publish(that, data.data, page);
                }
            });
        };

        xihe._save_user_collect = function(index, that){
            if ( index >= 0 ){
                that.data.target_data.folder_name = that.data.collect_folders[index];
            }
            xihe.post({
                url: "/api/user/collect_image",
                data: that.data.target_data,
                callback: function (data) {
                    if (data.code == 0) {
                        if (that.data.target_data.act_type == 'collect' ){
                            xihe._save_collect_complete(that, data);
                        }else{
                            xihe._save_usercollect_complete(that, data, that.data.target_data.post_id, that.data.target_data.index);
                        }
                    }
                }
            });
        }

        xihe._exec_actionsheet = function (data, that) {
            if ( data.length > 0 ){
                that.setData({
                    collect_folders : data
                })
                wx.showActionSheet({
                    itemList: data,
                    success: function (res) {
                        xihe._save_user_collect(res.tapIndex, that)
                    },
                    fail: function (res) {
                        console.log(res.errMsg)
                    }
                })
            } 
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
                        showModalStatus: false
                    })
                },
                'fail': function (res) {
                    
                }
            })
        };

        xihe._create_wechat_pay = function (item) {
            xihe.post({
                url: "/api/user/create_wechat_pay/",
                data: { uid: app.globalData.uid},
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._wechatPay(item, data.data);
                    }
                }
            });
        };

        if (app.globalData.uid == 0) {
            xihe._getUserInfo = function () {
                var App = getApp();
                wx.getUserInfo({
                    success: res => {
                        // 可以将 res 发送给后台解码出 unionId  
                        if (App.globalData.openid && !App.globalData.userinfo) {
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
                if (wx.getSetting) {
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
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                    })
                }
            };

            // 登录
            xihe._get_openid_callback = function (data) {
                app.globalData.openid = data.openid;
                app.globalData.uid = data.uid;
                app.globalData.agent_id = data.agent_id;
                app.globalData.free_trial = data.free_trial;
                app.globalData.pay_status = data.pay_status;
                xihe._getSetting();
                xihe._get_index_data();
            };

        } else {
            xihe._get_index_data();
        }
    },

    onShow: function(){
        app.globalData.check_user();
        
    },
    joinClub: function(e){
        xihe._create_wechat_pay(this);
    },
    showpaymodal: function(e){
        this.setData({
            showModalStatus: true,
            showPayBtn:1
        })
    },
    replayComment: function(e){
        // var target = e.currentTarget.dataset;
        // var post_id = target.postId;
        // var comment_id = target.id;
        // var nickname = target.nickname;

        // var target_input = '#comment_input_'+post_id;
        // var target_item = wx.createSelectorQuery().select(target_input).boundingClientRect(function (rect) {
        //     console.log(rect)
        // }).exec();
    },

    freeTrial: function(e){
        var that = this;
        xihe.post({
            url: "/api/user/update_free_trial",
            data: { uid: app.globalData.uid },
            callback: function (data) {
                if (data.code == 0) {
                    app.globalData.free_trial = 1;
                    that.setData({
                        showModalStatus: false
                    })
                }
            }
        });
    },

    onReachBottom: function (e) {
        var current_page = this.data.currentPage;
        var total_page   = this.data.totalPages;
        if ( current_page < total_page ){
            xihe._get_more_publish(this, current_page);
        }
    },
    onShareAppMessage: function () {
        return {
            title: '摄影人学习、交流的地盘',
            imageUrl: 'https://www.photoclub.vip/uploads/images/201801197046FjwkTDoidA.jpg',
            path: '/pages/index/index'//分享的页面地址
        }
    },
    saveComment : function(e){
        var comment_content = e.detail.value;
        var post_id         = e.currentTarget.dataset.postId;
        var index           = e.currentTarget.dataset.index;
        var that            = this;
        xihe.post({
            url: "/api/publish/store_comment",
            data: {
                    uid: app.globalData.uid,
                    post_id : post_id,
                    content : comment_content
                },
            callback: function (data) {
                if (data.code == 1003) {
                    wx.showModal({
                        title: '操作提示',
                        showCancel: false,
                        content: data.msg
                    });
                }else{
                    xihe._save_comment_complete(that, data, index);
                }
            }
        });
    },
    previewImage: function (e) {
        var current = e.target.dataset.src;
        var images = e.target.dataset.images;
        images = images.split(';');
        wx.previewImage({
            current: current,
            urls: images
        })
    },

    visitLession: function (e) {
        var lt_id = e.currentTarget.dataset.id;
        wx.setStorageSync("lession_lt_id", lt_id);
        wx.switchTab({
            url: '/pages/lessions/pages/index',
        })
    },

    userFollow: function(e){
        var target     = e.currentTarget.dataset;
        var target_uid = target.uid;
        var follow     = (target.follow == 1)?0:1;
        var that       = this;
        xihe.post({
            url: "/api/user/follow",
            data: {
                user_id: app.globalData.uid,
                target_uid: target_uid,
                follow : follow
            },
            callback: function (data) {
                if( data.code == 0 ){
                    xihe._save_userfollow_complete(that, data);
                }
            }
        });
    },

    userCollect: function(e){
        var target = e.currentTarget.dataset;
        var target_aid = target.aid;
        var post_id = target.postId;
        var index = target.ind;
        var target_uid = target.uid;
        var collect = (target.collect == 1) ? 0 : 1;
        var act_type = target.type;
        var that = this;
        this.setData({
            target_data: {
                user_id: app.globalData.uid,
                target_aid: target_aid,
                collect: collect,
                target_uid: target_uid,
                act_type: act_type,
                post_id: post_id,
                index: index
            }
        });
        if (collect == 0 ){
            xihe._save_user_collect(-1, that)
        }else{

            xihe.get({
                url: "/api/user/folders_index",
                data: {
                    uid: app.globalData.uid
                },
                callback: function (data) {
                    if (data.code == 0) {
                        if (data.data.length > 0 ){
                            xihe._exec_actionsheet(data.data, that);
                        }else{
                            xihe._save_user_collect(-1, that);
                        }
                    }
                }
            });
        }
    },

    followSlideRight: function (e) {
        var that = this;
        if (that.data.follow_current_page < that.data.follow_pages) {
            xihe.get({
                url: "/api/main/get_more_follows",
                data: {
                    uid: app.globalData.uid,
                    page: that.data.follow_current_page
                },
                callback: function (data) {
                    if (data.code == 0) {
                        if (data.data.length > 0) {
                            xihe._set_more_follows(that, data.data, data.page);
                        }
                    }
                }
            });
        }
    },

    collectSlideRight: function(e){
        var that = this;
        if (that.data.collect_current_page < that.data.collect_pages ){
            xihe.get({
                url: "/api/main/get_more_collects",
                data: {
                    uid  : app.globalData.uid,
                    page : that.data.collect_current_page 
                },
                callback: function (data) {
                    if (data.code == 0) {
                        if (data.data.collections.length > 0) {
                            xihe._set_more_collect(that, data.data.collections, data.page, data.data.urls);
                        }
                    }
                }
            });
        }
    }
})
