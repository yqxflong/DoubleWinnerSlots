/**
 * Created by liuyue on 15-12-14.
 */
var PlayerTaskInfo = function() {
    this.fbId = 0;
    this.taskLevel = 0;
};

PlayerTaskInfo.prototype.unmarshal = function (jsonObj) {
    this.fbId = jsonObj["fbId"];
    this.taskLevel = jsonObj["taskLevel"] || 0;
};

module.exports = PlayerTaskInfo;