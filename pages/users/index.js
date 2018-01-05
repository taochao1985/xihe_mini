var xihe = require('../../utils/request.js');
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
                url: 'publishes/index'
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
        apply_note : ""
    },
    onLoad: function (options) {
        this.setData({
            userInfo : app.globalData.userinfo
        });

        xihe._set_follow_count = function(item, data){
            item.setData({
                followTime   : data.count,
                agent_status : data.agent_status,
                reason       : data.reason,
                apply_note   : data.apply_note
            })
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
    applyAgent: function(e){
        var that = this;
        wx.showModal({
            title: "申请代理",
            content: that.data.apply_note,
            showCancel: false,
            confirmText: "立即申请",
            success: function (res) {
                if (res.confirm) {
                    xihe.post({
                        url: "/api/user/apply_agent",
                        data: {
                            uid: app.globalData.uid
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
                }
            }
        })
    }
})
