var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");

/**
 * Created by qinning on 15/6/26.
 */

var DailyBonusWheelController = function () {
    BaseCCBController.call(this);
    this._wheelNode = null;
    this._spinItem = null;
    this._resultLabels = [];

    this._spinCallFunc = null;
};

Util.inherits(DailyBonusWheelController, BaseCCBController);

DailyBonusWheelController.prototype.onEnter = function () {

};

DailyBonusWheelController.prototype.onExit = function () {

};

DailyBonusWheelController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    for (var i = 1; i <= 18; ++i) {
        var resultLabel = this._wheelNode.getChildByTag(300 + i);
        this._resultLabels.push(resultLabel);
    }
};

DailyBonusWheelController.prototype.getWheelNode = function () {
    return this._wheelNode;
};

DailyBonusWheelController.prototype.getResultLabels = function () {
    return this._resultLabels;
};

DailyBonusWheelController.prototype.spinClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this._spinItem.enabled = false;
    if (this._spinCallFunc) {
        this._spinCallFunc();
    }

    var LogMan = require("../../log/model/LogMan");
    var UserStepId = require("../../log/enum/UserStepId");
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_CLICK_DAILY_BONUS, -1);
};

DailyBonusWheelController.prototype.setSpinCallFunc = function (callFunc) {
    this._spinCallFunc = callFunc;
};

/**
 * @returns {cc.Node|null}
 */
DailyBonusWheelController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_reel.ccbi", null, "DailyBonusWheelController", new DailyBonusWheelController());
};

module.exports = DailyBonusWheelController;