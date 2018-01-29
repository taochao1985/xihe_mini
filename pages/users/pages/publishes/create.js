var xihe = require('../../../../utils/request.js');
var app  = getApp();
Page({
    data: {
        imageList: [],
        countLimit:9,
        description:"",
        uploadUrls:"",
        stepNum:0
    },
    onLoad: function (options) {
        
        xihe._upload_complete = function (res, that){
            res = JSON.parse(res);
            if (res.errno == 0){
                var img_data = res.data;
                var temp_uploadUrls = that.data.uploadUrls + img_data.final_path + img_data.file_name + ";";
                that.setData({
                    uploadUrls: temp_uploadUrls
                })
            }
        };

        xihe._save_form_complete = function(res, that){
            
            wx.hideToast();
            that.setData({
                stepNum : 0
            });
            if( res.code == 0 ){
                that.setData({
                    imageList: [],
                    description: ""
                });
                wx.navigateTo({
                    url: '/pages/users/pages/publishes/index',
                })
            }else{
                 if (res.code == 1003) {
                    wx.showModal({
                        title: '操作提示',
                        showCancel: false,
                        content: res.msg
                    });
                }else {
                    wx.showModal({
                        title: '操作提示',
                        showCancel: false,
                        content: res.msg,
                        success: function (rese) {
                            if ( res.code == 1002){
                                if (rese.confirm) {
                                    wx.switchTab({
                                        url: '/pages/users/index'
                                    })
                                }
                            }
                        }
                    })
                }
            }
        };

        xihe._save_form = function(e, that){
            wx.showToast({
                title: "上传中",
                icon: "loading",
                duration: 10000
            });
            var submit_data = {
                description : e.detail.value.description,
                image_path  : that.data.uploadUrls,
                user_id     : app.globalData.uid
            };

            xihe.post({
                url : "/api/publish/store",
                data : submit_data,
                callback : function(data){
                    xihe._save_form_complete(data, that);
                }
            })
        };

        xihe._getImage = function (opt) {
            var tempFilePaths = opt.target.data.imageList; 
            for (var i = 0; i < tempFilePaths.length; i++) {
                (function (image_path, opt){ 
                    xihe.upload_image({
                        image_path: image_path,
                        callback: function(res) {
                            xihe._upload_complete(res,opt.target);
                            opt.target.data.stepNum++;
                            opt.target.setData({
                                stepNum: opt.target.data.stepNum
                            })
                            if (opt.target.data.stepNum == tempFilePaths.length){
                                opt.callback(opt.form_item, opt.target);
                            }
                        }
                    });
                })(tempFilePaths[i], opt)
            }
        }
    },
    onShow: function(options){
        app.globalData.check_user();
        var options_url = wx.getStorageSync("img_urls");
        if (options_url != "") {
            var image_urls = options_url.split(";");
            this.setData({
                imageList: image_urls
            });
            wx.setStorageSync("img_urls", "");
        }
        this.setData({
            stepNum : 0,
            uploadUrls : ""
        });
    },
    removeImg: function(e){
        var index = e.currentTarget.dataset.index;
        var imageList = [];
        for (var i = 0; i < this.data.imageList.length; i++) {
            if (i != index ){
                imageList.push(this.data.imageList[i]);
            }
        }
        this.setData({
            imageList: imageList
        }) 
    },
    chooseImage: function () {
        var that = this
        wx.chooseImage({
            count: this.data.countLimit-this.data.imageList.length,
            success: function (res) {
                if( that.data.imageList.length < 9 ){
                    that.data.imageList = res.tempFilePaths.concat(that.data.imageList);
                    that.setData({
                        imageList: that.data.imageList
                    })
                } 
            }
        })
    },
    previewImage: function (e) {
        var current = e.target.dataset.src

        wx.previewImage({
            current: current,
            urls: this.data.imageList
        })
    },

    formSubmit: function(e){
        
        xihe._getImage({
            target : this,
            form_item : e,
            callback : xihe._save_form
        });
    }
})
