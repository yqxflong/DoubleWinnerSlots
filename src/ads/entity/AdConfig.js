/**
 * Created by ZenQhy on 16/2/22.
 */

var AdConfig = function(jsonObj) {
    this.chartboostId = jsonObj["chartboostId"];
    this.chartboostSig = jsonObj["chartboostSig"];
    this.defaultAdmobId = jsonObj["defaultAdmobId"];
    this.defaultAdmobConfig = jsonObj["defaultAdmobConfig"];
    var admobConfig = jsonObj["admobConfig"];
    this.admobIds = jsonObj["admobIds"];
    this.admobConfig = "";
    if (admobConfig && this.admobIds) {
        if (admobConfig.length == this.admobIds.length) {
            this.admobConfig = JSON.stringify(admobConfig);
        } else {
            this.admobConfig = "";
        }
    }
    this.supersonicID = jsonObj["supersonicID"];
};

module.exports = AdConfig;
