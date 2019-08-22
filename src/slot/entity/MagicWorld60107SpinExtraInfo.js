var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60107SpinExtraInfo = function () {
    this.collectCoins = 0;
    this.wildCount = 0;
    this.goalCoin1 = 0;
    this.goalCoin2 = 0;
    this.goalCoin3 = 0;
    this.chooseFreeMod = false;
    this.collectCards = [];

    this.oldGoalCoin1 = 0;
    this.oldGoalCoin2 = 0;
    this.oldGoalCoin3 = 0;
};

Util.inherits(MagicWorld60107SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60107SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    this.collectCoins = jsonObj["collectCoins"];
    this.wildCount = jsonObj["wildCount"];
    this.goalCoin1 = jsonObj["goalCoin1"];
    this.goalCoin2 = jsonObj["goalCoin2"];
    this.goalCoin3 = jsonObj["goalCoin3"];
    this.chooseFreeMod = jsonObj["chooseFreeMod"] || false;
    this.collectCards = jsonObj["collectCards"] || [];

    this.oldGoalCoin1 = jsonObj["oldGoalCoin1"] || 0;
    this.oldGoalCoin2 = jsonObj["oldGoalCoin2"] || 0;
    this.oldGoalCoin3 = jsonObj["oldGoalCoin3"] || 0;
};

module.exports = MagicWorld60107SpinExtraInfo;