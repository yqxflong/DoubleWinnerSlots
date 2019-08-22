/**
 * Created by qinning on 15/5/5.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var dateFormat = require("dateformat");
var HourlyGameMan = require("../model/HourlyGameMan");

var HourlyBonusTimeController = function() {
    this._time1Label = null;
    this._time2Label = null;
    this._time3Label = null;
    this._time4Label = null;

    //custom
    this._timeLabels = null;
};

Util.inherits(HourlyBonusTimeController,BaseCCBController);

HourlyBonusTimeController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.HOURLY_BONUS_CHANGED, this.onUpdateCollectTime, this);
};

HourlyBonusTimeController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HOURLY_BONUS_CHANGED, this.onUpdateCollectTime, this);
};

HourlyBonusTimeController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._timeLabels = [this._time1Label, this._time2Label, this._time3Label, this._time4Label];
    this._onUpdateCollectTime(HourlyGameMan.getInstance().getHourlyBonusLeftTime());
};

HourlyBonusTimeController.prototype.onUpdateCollectTime = function(event) {
    var leftTime = event.getUserData();
    this._onUpdateCollectTime(leftTime);
};

HourlyBonusTimeController.prototype._onUpdateCollectTime = function (leftTime) {
    if (leftTime > 0) {
        this.rootNode.visible = true;
        leftTime = Math.round(leftTime / 1000);
        var dateTime;
        if (leftTime > 0) {
            dateTime = dateFormat(leftTime * 1000, "MMss", true);
        } else {
            dateTime = "0000";
        }
        for (var i = 0; i < this._timeLabels.length; ++i) {
            this._timeLabels[i].setString(dateTime[i]);
        }
    } else {
        this.rootNode.visible = false;
    }
};

HourlyBonusTimeController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_time.ccbi", null, "HourlyBonusTimeController", new HourlyBonusTimeController());
};

module.exports = HourlyBonusTimeController;