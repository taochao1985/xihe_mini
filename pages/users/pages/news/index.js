var xihe = require('../../../../utils/request.js');

Page({
  data: {
      news   : {},
      webUrl : xihe.config.url
  },
  onLoad: function (options) {
        
      xihe._set_news_data = function(item, data){
            item.setData({
                news     : data.news
            })
        };

        xihe._get_news_data = function(item){
            xihe.get({
                url: "/api/news/list",
                data: {},
                callback: function (data) {
                    xihe._set_news_data(item, data.data);
                }
            });  
        };

        xihe._get_news_data(this);
  }, 
})
