var xihe = require('../../../../utils/request.js');
Page({
    data: {
        imageList: [],
        countLimit:9,
        description:"",
        uploadUrls:"",
        stepNum:0,
        uid : 0
    },
    onLoad: function (options) {
        var options_url = wx.getStorageSync("img_urls");
        if ( options_url != ""){
            var image_urls = options_url.split(";");
            this.setData({
                imageList: image_urls
            });
            wx.setStorageSync("img_urls", "");
        }
        this.setData({
            uid: wx.getStorageSync("uid")
        });
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

        xihe._save_form_complete = function(res){
            if( res.code == 0 ){
                wx.navigateTo({
                    url: '/pages/users/pages/publishes/index',
                })
            }
        };

        xihe._save_form = function(e, that){
            var submit_data = {
                description : e.detail.value.description,
                image_path  : that.data.uploadUrls,
                user_id     : that.data.uid
            };

            xihe.post({
                url : "/api/publish/store",
                data : submit_data,
                callback : function(data){
                    xihe._save_form_complete(data);
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
    removeImg: function(e){
        var index = e.currentTarget.dataset.index;
        var imageList = [];
        for(var i = 0 ; i < this.data.imageList.length ; i++ ){
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
        // this.setData({
        //     description : e.detail.description.value
        // })
    }
})
