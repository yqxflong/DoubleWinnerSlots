/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskConfigMan = require("../config/TaskConfigMan");
var DailyTaskType = require("../enum/DailyTaskType");

var DailyChallengeItemController = function() {
    this._challengeIcon = null;
    this._challengeNameLabel = null;
    //this._challengeNumLabel = null;
    this._challengeProgressLabel = null;
    this._bgSprite = null;
    this._completeNode = null;

    this._maxWidth = 130;
};


Util.inherits(DailyChallengeItemController,BaseCCBController);

DailyChallengeItemController.prototype.onEnter = function () {

};

DailyChallengeItemController.prototype.onExit = function () {

};

DailyChallengeItemController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * @param {DailyTaskInfo} dailyTask
 */
DailyChallengeItemController.prototype.initWith = function (dailyTask) {
    var dailyTaskConfig = TaskConfigMan.getInstance().getDailyTaskConfig(dailyTask.taskType);
    this._challengeNameLabel.setString(dailyTaskConfig.desc);
    if (dailyTask.taskType == DailyTaskType.DAILY_TASK_WIN_CHIPS) {
        this._challengeProgressLabel.setString(Util.sprintf("%s/%s", Util.formatAbbrNumWithoutComma(dailyTask.completeCount),
            Util.formatAbbrNumWithoutComma(dailyTask.needCount)));
    } else {
        this._challengeProgressLabel.setString(Util.sprintf("%d/%d", dailyTask.completeCount, dailyTask.needCount));
    }

    if (dailyTask.isCompleted()) {
        this._completeNode.visible = true;
    } else {
        this._completeNode.visible = false;
    }
    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(dailyTaskConfig.iconName);
    if (spriteFrame) {
        this._challengeIcon.setSpriteFrame(spriteFrame);
    }

    //this._challengeNumLabel.setString(require('roman-numerals').toRoman(idx));

    //if (this._challengeNameLabel) {
    //    Util.scaleCCLabelBMFont(this._challengeNameLabel, this._maxWidth);
    //}
    //if (this._challengeProgressLabel) {
    //    Util.scaleCCLabelBMFont(this._challengeProgressLabel, this._maxWidth);
    //}
};

DailyChallengeItemController.prototype.getContentSize = function () {
    return this._bgSprite.getContentSize();
};

DailyChallengeItemController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_challenge/dailychallenge_item.ccbi", null, "DailyChallengeItemController", new DailyChallengeItemController());
};

module.exports = DailyChallengeItemController;