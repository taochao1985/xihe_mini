var xihe = require('../../../../utils/request.js');
var app = getApp();
Page({
    data: {
        records: {},
        webUrl: xihe.config.url,
        member_count : 0,
        metal_count : 0,
    },
    onLoad: function (options) {

        xihe._set_records_data = function (item, data) {
            item.setData({
                records: data.records,
                member_count: data.member_count,
                metal_count: data.metal_count
            })
        };

        xihe._get_news_data = function (item) {
            xihe.get({
                url: "/api/user/agent_record/" + app.globalData.uid,
                data: {},
                callback: function (data) {
                    xihe._set_records_data(item, data.data);
                }
            });
        };

        xihe._get_news_data(this);
    },
})
