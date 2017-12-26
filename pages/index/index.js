//index.js 
var xihe = require('../../utils/request.js'); 
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
        uid:0,
        collects : [],
        follows: [],
        currentPage : 0,
        totalPages : 0,
        inputTxt : "",
        target_data : {},
        totalImageUrls : "",
        collect_folders:[]
    },
    onLoad: function () {  
        this.setData({
            uid: app.globalData.uid
        });

        xihe._set_index_data = function(item, data){
            item.setData({
                imgUrls      : data.slider_images,
                totalImageUrls: data.slider_images_url,
                lessionTypes : data.lession_type,
                publishes    : data.publishes ,
                collects     : data.collects,
                follows      : data.follows,
                currentPage  : 1,
                totalPages   : data.total_pages
            })
        };
        xihe._get_index_data = function(item){
            xihe.get({
                url: "/api/main/index",
                data: {uid: item.data.uid},
                callback: function(data){
                    xihe._set_index_data(item, data);
                }
            });
        };

        xihe._get_index_data(this);

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

        xihe._get_more_publish = function(that, page){
            xihe.get({
                url: "/api/main/get_more_publish",
                data: {
                    uid  : that.data.uid,
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
    },
    onReachBottom: function (e) {
        var current_page = this.data.currentPage;
        var total_page   = this.data.totalPages;
        if ( current_page < total_page ){
            xihe._get_more_publish(this, current_page);
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
                    uid: this.data.uid,
                    post_id : post_id,
                    content : comment_content
                },
            callback: function (data) {

                xihe._save_comment_complete(that, data, index);
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
                user_id: this.data.uid,
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
                user_id: this.data.uid,
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
                    uid: this.data.uid
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
    }
})
