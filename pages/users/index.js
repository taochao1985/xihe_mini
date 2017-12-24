var xihe = require('../../utils/request.js');
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
            }
        ],
        userInfo: {},
        followTime : 0
    },
    onLoad: function (options) {
        this.setData({
            userInfo: wx.getStorageSync("userinfo"),
            uid: wx.getStorageSync("uid")
        });

        xihe._set_follow_count = function(item, count){
            item.setData({
                followTime : count
            })
        };

        xihe._get_follow_count = function(item ){
            xihe.get({
                url: "/api/user/get_follow_count",
                data: {
                    uid: item.data.uid
                },
                callback: function (data) {
                    xihe._set_follow_count(item, data.count);
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
        wx.setStorageSync("publish_uid", this.data.uid);
        wx.switchTab({
            url: '/pages/users/pages/publishes/index',
        })
    }, 
})
