var config = require('config.js');

function get(opt) {
    console.log(config.url + opt.url);
    console.log(opt.data);
    wx.request({
        url: config.url + opt.url,
        data: opt.data,
        success: function (res) {
            if (opt.callback) {
                return opt.callback(res.data);
            }
        }
    })
}

function post(opt) {
    var json2Form = function (json) {
        var str = [];
        for (var p in json) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
        }
        return str.join("&");
    }
    console.log(config.url + opt.url);
    wx.request({
        url: config.url + opt.url,
        data: json2Form(opt.data),
        method: 'POST',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
            if (opt.callback) {
                return opt.callback(res.data);
            }
        }
    });
}

function upload_image(opt){
    wx.uploadFile({
        url: config.url+'/api/fileupload', //仅为示例，非真实的接口地址
        filePath: opt.image_path,
        name: 'userfile',
        formData: {
            'file_type': 'miniprogram'
        },
        success: function (res) {
            opt.callback(res.data);
        }
    })
}

module.exports = {
    get: get,
    post: post,
    config: config,
    upload_image: upload_image
}