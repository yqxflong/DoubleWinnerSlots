/**
 * Created by alanmars on 15/5/18.
 */
var AdSetting = function(jsonObj) {
    this.showAd = jsonObj["showAd"];
    this.placeId = jsonObj["placeId"];
    this.showInterval = jsonObj["showInterval"];
    this.showFirstInterval = jsonObj["showFirstInterval"];
};

module.exports = AdSetting;