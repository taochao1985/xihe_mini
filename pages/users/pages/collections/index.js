// pages/users/pages/mine/friends/index.js
var xihe = require('../../../../utils/request.js');
var app  = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        uid : 0,
        collections : [],
        base_url: xihe.config.url,
        folders : [],
        selected_folder : 0 
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo : app.globalData.userinfo,
            uid      : app.globalData.uid
        });

        xihe._set_user_collections = function (item, data, folder_id) {
            item.setData({
                collections: data.collections,
                folders : data.folders,
                selected_folder : folder_id
            });
        };

        xihe._get_user_collections = function (item,folder_id) {
            xihe.get({
                url: "/api/user/collections",
                data: { uid: item.data.uid , folder_id : folder_id},
                callback: function (data) {
                    if (data.code == 0) {
                        xihe._set_user_collections(item, data,folder_id);
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
    new_folder: function(e){
        wx.navigateTo({
            url: 'new_folder',
        })
    },
    filter_collections: function(e){
        var folder_id = e.currentTarget.dataset.id;
        xihe._get_user_collections(this, folder_id);
    },
    changeData : function(data){
        this.setData({
            folders : data
        })
    }
})