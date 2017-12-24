var xihe = require('../../../../utils/request.js');
Page({
    data: {
        uid: 0,
        folders : [],
        folder_name : ""
    },
    onLoad: function (options) {
        this.setData({
            uid: wx.getStorageSync("uid")
        });

        xihe._set_folders = function(data,item){
            var pages = getCurrentPages();
            if (pages.length > 1) {
                //上一个页面实例对象
                var prePage = pages[pages.length - 2]; 
                //关键在这里
                prePage.changeData(data);//修改上一页的值
            }
            item.setData({
                folders : data
            })
        };

        xihe._get_user_folders = function(item){
            xihe.get({
                url: "/api/user/folders",
                data: {
                    uid: item.data.uid
                },
                callback: function (data) {
                    xihe._set_folders(data.data, item);
                }
            })
        };

        xihe._get_user_folders(this);
    },   
    formSubmit: function (e) {
        var folder_name = e.detail.value.folder_name;
        var that = this;
        if( folder_name != ""){
            xihe.post({
                url: "/api/user/create_folder",
                data: {
                    uid : that.data.uid,
                    folder_name : folder_name 
                },
                callback: function (data) {
                    that.setData({
                        folder_name : ""
                    });
                    xihe._get_user_folders(that)
                }
            })
        }
    },

    delete_folder: function(e){
        var folder_id = e.currentTarget.dataset.id;
        var that = this;
        xihe.post({
            url: "/api/user/delete_folder",
            data: {
                uid: that.data.uid,
                folder_id: folder_id
            },
            callback: function (data) {
                xihe._get_user_folders(that)
            }
        })
    }
})