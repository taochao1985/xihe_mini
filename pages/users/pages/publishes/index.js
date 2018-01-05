// pages/users/pages/mine/friends/index.js
var xihe = require('../../../../utils/request.js');
var app  = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        imageList: [],
        pubList: [],
        originList : [],
        today: "",
        targetUid: 0,
        currentUid: 0,
        coverImage: "",
        currentPage: 0,
        totalPages: 0,
        followCount :0,
        firstDay :""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        xihe._regroup_data = function (publish, item){
            var new_publish = {};
            for (var i = 0; i < publish.length; i++) {
                if( i == 0 ){
                    item.setData({
                        firstDay: publish[i].date
                    })
                }
                if (!new_publish[publish[i].date]) {
                    new_publish[publish[i].date] = {};
                }
                if (!new_publish[publish[i].date].data) {
                    new_publish[publish[i].date].data = [];
                }
                new_publish[publish[i].date].date_day = publish[i].date_day;
                new_publish[publish[i].date].date_month = publish[i].date_month;
                new_publish[publish[i].date].data.push(publish[i].data);
            }
            return new_publish;
        };

        xihe._set_publish_data = function (item, data) {
            var publish = data.data;
            var new_publish = xihe._regroup_data(publish, item); 
            var userinfo = wx.getStorageSync("userinfo");
            item.setData({
                pubList: new_publish,
                today: data.today,
                currentPage: 1,
                originList: publish,
                totalPages: data.total_pages
            });
        };

        xihe._get_publish_data = function (item) {
            xihe.get({
                url: "/api/publish/list/" + item.data.targetUid,
                data: {},
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._set_publish_data(item, data);
                    }
                }
            });
        };

        xihe._set_userinfo_data = function (item, data) {
            var userinfo = JSON.parse(data.data.userinfo);
            if ( !data.cover ){
                data.cover = userinfo.avatar;
            }
            var setData = {
                coverImage : data.cover,
                followCount: data.follow_count
            }
            item.setData(setData);
        };

        xihe._get_userinfo = function (item) {
            xihe.get({
                url: "/api/user/show/" + item.data.targetUid,
                data: {},
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._set_userinfo_data(item, data);
                    }
                }
            });
        };
 

        xihe._set_more = function (that, data, page) {
           
            var originList = that.data.originList.concat(data);
            var pubList = xihe._regroup_data(originList, that);
            that.setData({
                currentPage: ++page,
                originList: originList,
                pubList: pubList
            });
        };

        xihe._get_more = function (that, page) {
            xihe.get({
                url: "/api/publish/get_more_publish",
                data: {
                    uid: that.data.targetUid,
                    page: page
                },
                callback: function (data) {
                    xihe._set_more(that, data.data, page);
                }
            });
        }; 

        xihe._update_userinfo = function(item, image_path){
            xihe.post({
                url: "/api/user/update_avatar",
                data: {
                    uid: item.data.currentUid,
                    image_path: image_path
                },
                callback: function (data) {
                    if( data.code == 0 ){
                        item.setData({
                            coverImage: data.cover
                        });
                        wx.setStorageSync("publish_uid",0);
                    }
                }
            });
        };

        this.setData({
            targetUid  : app.globalData.uid,
            currentUid : app.globalData.uid,
            userInfo   : app.globalData.userinfo
        });
        var option_uid = options.uid; 
        if (option_uid > 0) {
            this.setData({
                targetUid: option_uid
            })
        }
        xihe._get_publish_data(this, 0);
        xihe._get_userinfo(this);
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function (e) { 
        var current_page = this.data.currentPage;
        var total_page = this.data.totalPages;
        if (current_page < total_page) {
            xihe._get_more(this, current_page);
        }
    },

    longPress: function(){
        console.log('long pressed');

        wx.showModal({
            title: '提示',
            content: '这是一个模态弹窗',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    changeCover: function(){
        var that = this;
        if ( that.data.currentUid == that.data. targetUid ){
            wx.chooseImage({
                count: 1,
                success: function (res) {
                    var url = res.tempFilePaths[0];
                    xihe.upload_image({
                        image_path: url,
                        callback: function (res) {
                            res = JSON.parse(res);
                            if( res.errno == 0){
                                xihe._update_userinfo(that,res.data.final_path + res.data.file_name);
                            }
                        }
                    });
                }
            })
        }
    },

    chooseImage: function () {
        var that = this
        wx.chooseImage({
            count: 9,
            success: function (res) {
                var url = res.tempFilePaths.join(';');
                wx.setStorageSync("img_urls", url);
                wx.switchTab({
                    url: '/pages/users/pages/publishes/create'
                });
            }
        })
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
}) 