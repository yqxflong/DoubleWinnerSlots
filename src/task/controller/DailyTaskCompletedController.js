/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");

var DailyTaskCompletedController = function() {
    this._taskInfoLabel = null;
    this._taskIcon = null;

    this._callback = null;
    this._taskConfig = null;
};


Util.inherits(DailyTaskCompletedController,BaseCCBController);

DailyTaskCompletedController.prototype.onEnter = function () {

};

DailyTaskCompletedController.prototype.onExit = function () {

};

DailyTaskCompletedController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

DailyTaskCompletedController.prototype.initWith = function (taskConfig, callback) {

};

DailyTaskCompletedController.prototype.onCollectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    if (this._callback) {
        this._callback();
    }
    this.close();
};

DailyTaskCompletedController.prototype.close = function () {
    this.rootNode.runAction(cc.sequence(cc.moveTo(2, cc.winSize.width/2, cc.winSize.height), cc.removeSelf()));
};

/**
 * @params {boolean} isStay
 */
DailyTaskCompletedController.prototype.popup = function (isStay) {
    DialogManager.getInstance().attachScene(this.rootNode);
    this.rootNode.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height));
    if (isStay) {
        this.rootNode.runAction(cc.sequence(cc.moveTo(2, cc.winSize.width/2, cc.winSize.height/2)));
    } else {
        this.rootNode.runAction(cc.sequence(cc.moveTo(2, cc.winSize.width/2, cc.winSize.height/2), cc.delayTime(5),
            cc.moveTo(2, cc.winSize.width/2, cc.winSize.height), cc.removeSelf()));
    }
};

DailyTaskCompletedController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/popup/casino_mission_start.ccbi", null, "DailyTaskCompletedController", new DailyTaskCompletedController());
};

module.exports = DailyTaskCompletedController;