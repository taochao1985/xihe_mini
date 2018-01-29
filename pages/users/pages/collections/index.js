// pages/users/pages/mine/friends/index.js
var xihe = require('../../../../utils/request.js');
var app  = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        collections : [],
        base_url: xihe.config.url,
        folders : [],
        folders_org : [],
        selected_folder : 0,
        folder_name : "",
        collect_images:"" 
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo : app.globalData.userinfo
        });

        xihe._set_user_collections = function (item, data, folder_id) {
            item.setData({
                collections: data.collections,
                folders : data.folders,
                folders_org: data.folders_org,
                selected_folder : folder_id,
                collect_images: data.collect_images
            });
        };

        xihe._get_user_collections = function (item,folder_id) {
            xihe.get({
                url: "/api/user/collections",
                data: { uid: app.globalData.uid , folder_id : folder_id},
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._set_user_collections(item, data, folder_id);
                    }
                }
            });
        };

        xihe._update_user_collect = function(index, that, collect_id){
            xihe.post({
                url: "/api/user/update_collect_image",
                data: { uid: app.globalData.uid, collect_id: collect_id, folder_name: that.data.folders_org[index] },
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._set_user_collections(that, data, 0);
                    }
                }
            });
        };

        xihe._get_user_collections(this,0);
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
        app.globalData.check_user();
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
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    previewImage: function(e) {
        var current = e.target.dataset.src;
        var images = this.data.collect_images;
        images = images.split(';');
        wx.previewImage({
            current: current,
            urls: images
        })
    },

    new_folder: function(e){
        wx.navigateTo({
            url: 'new_folder',
        })
    },

    cancelCollection: function(e){
        var collect_id = e.currentTarget.dataset.id;
        var that = this;
        xihe.post({
            url: "/api/user/delete_collect",
            data: { uid: app.globalData.uid, collect_id: collect_id },
            callback: function (data) {
                if (data.code == 0) {
                    xihe._get_user_collections(that, 0);
                }else{
                    wx.showToast({
                        title: data.msg,
                        icon: 'success',
                        duration: 2000
                    })
                }
            }
        });
    },

    filter_collections: function(e){
        var folder_id = e.currentTarget.dataset.id;
        xihe._get_user_collections(this, folder_id);
    },
    changeData : function(data){
        this.setData({
            folders : data
        })
    },
    changeFolder: function(e) {
        var collect_id = e.currentTarget.dataset.id;
        var that = this;
        xihe.get({
            url: "/api/user/folders_index",
            data: { uid: app.globalData.uid },
            callback: function (data) {
                if (data.code == 0) {
                    if (data.data.length > 0) {
                        wx.showActionSheet({
                            itemList: data.data,
                            success: function (res) {
                                xihe._update_user_collect(res.tapIndex, that, collect_id)
                            },
                            fail: function (res) {
                                console.log(res.errMsg)
                            }
                        })
                    } else {
                        wx.showToast({
                            title: '请添加收藏夹',
                            icon: 'success',
                            duration: 2000
                        })
                    }
                }
            }
        });
    }
})