var AdSetting = require("./AdSetting");
var AdConfig = require("./AdConfig");
var RewardAdConfig = require("./RewardAdConfig");

/**
 * Created by alanmars on 15/5/18.
 */
var AdControl = function(jsonObj) {
    this.showAds = jsonObj["showAds"];
    this.purchaseShow = jsonObj["purchaseShow"];
    this.showLevel = jsonObj["showLevel"];
    this.adSettings = [];

    this.rewardAdConfig = new RewardAdConfig();
    if (jsonObj["rewardAdConfig"]) {
        this.rewardAdConfig.unmarshal(jsonObj["rewardAdConfig"]);
    }

    var adSettingArray = jsonObj["adSettings"];
    if (adSettingArray) {
        for (var i = 0; i < adSettingArray.length; ++ i) {
            this.adSettings.push(new AdSetting(adSettingArray[i]));
        }
    }

    // get config from server
    if (jsonObj["adConfig"]) {
        this.adConfig = new AdConfig(jsonObj["adConfig"]);
    }

    if(jsonObj["lockscreen"] == 0) {
        this.lockScreenFlag = false;
    }
    else {
        this.lockScreenFlag = true;
    }
};

module.exports = AdControl;
