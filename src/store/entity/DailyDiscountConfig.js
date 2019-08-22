/**
 * Created by qinning on 16/6/8.
 */

var DailyDiscountConfig = function() {
    this.open = false;
    this.dailyMaxTimes = 0;
    this.coolDownMinutes = 0;
    this.lastMinutes = 0;
    this.allowableErrorTime = 0;
};

DailyDiscountConfig.prototype.unmarshal = function(jsonObj) {
    this.open = jsonObj["open"];
    this.dailyMaxTimes = jsonObj["dailyMaxTimes"];
    this.coolDownMinutes = jsonObj["coolDownMinutes"];
    this.lastMinutes = jsonObj["lastMinutes"];
    this.allowableErrorTime = jsonObj["allowableErrorTime"] || 0;
};

module.exports = DailyDiscountConfig;