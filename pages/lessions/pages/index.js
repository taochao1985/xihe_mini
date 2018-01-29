var xihe = require('../../../utils/request.js');
var app = getApp();

Page({
  data: {
      lessionTypes : {},
      lessions     : {},
      selectedType : 0,
      webUrl       : xihe.config.url
  },
  onLoad: function (options) {
        
        xihe._set_lession_type_data = function(item, data){
            item.setData({
                lessions     : data.lessions,
                lessionTypes : data.types,
                selectedType : data.type_id
            })
        };

        xihe._get_lession_type_data = function(item,id){
            xihe.get({
                url: "/api/lession/list",
                data: {lt_id : id, uid:app.globalData.uid},
                callback: function (data) {
                    xihe._set_lession_type_data(item, data.data);
                }
            });  
        };
  },
  onShow: function () {
      app.globalData.check_user();
      this.setData({
          selectedType: wx.getStorageSync("lession_lt_id")
      })
      xihe._get_lession_type_data(this, this.data.selectedType);
  },

  changeType: function(e){
      var id = e.currentTarget.dataset.id;
      wx.setStorageSync("lession_lt_id", id);
      this.setData({
          selectedType: id
      })
      xihe._get_lession_type_data(this,id);
  }
})
