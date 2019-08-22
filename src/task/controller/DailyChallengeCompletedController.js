/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");
var DailyChallengeItemController = require("./DailyChallengeItemController");
var TaskMan = require("../model/TaskMan");
var DailyChallengeProgressController = require("../controller/DailyChallengeProgressController");
var TaskProgressType = require("../enum/TaskProgressType");
var PopupMan = require("../../common/model/PopupMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var TaskEvent = require("../events/TaskEvent");

var DailyChallengeCompletedController = function() {
    this._challengeIcon = null;
    this._rewardCoinsLabel = null;
    this._rewardGemsLabel = null;
    this._rewardStarsLabel = null;

    this._rewardCoinsLabel2 = null;
    this._rewardGemsLabel2 = null;
    this._rewardStarsLabel2 = null;
    this._completeNode = null;
    this._collectNode = null;

    //custom
    this._dailyChallengeProgressNode = null;
};


Util.inherits(DailyChallengeCompletedController,BaseCCBController);

DailyChallengeCompletedController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_DAILY_TASK_REWARD_CLAIMED, this.onDailyTaskRewardClaimed, this);
};

DailyChallengeCompletedController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_DAILY_TASK_REWARD_CLAIMED, this.onDailyTaskRewardClaimed, this);
};

DailyChallengeCompletedController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._challengeIcon.visible = false;
    this._dailyChallengeProgressNode = DailyChallengeProgressController.createFromCCB();
    this._challengeIcon.getParent().addChild(this._dailyChallengeProgressNode);
    this._dailyChallengeProgressNode.setPosition(this._challengeIcon.getPosition());
    this._dailyChallengeProgressNode.controller.initWith(TaskProgressType.TASK_PROGRESS_TYPE_ICON);

    var dailyTaskReward = TaskMan.getInstance().getDailyTaskReward();
    if (TaskMan.getInstance().getRewardClaimed()) {
        this._completeNode.visible = true;
        this._collectNode.visible = false;
        this._rewardCoinsLabel2.setString(Util.getCommaNum(dailyTaskReward.rewardChips));
        this._rewardGemsLabel2.setString(Util.getCommaNum(dailyTaskReward.rewardGems));
        this._rewardStarsLabel2.setString(Util.getCommaNum(dailyTaskReward.rewardStars));
    } else {
        this._completeNode.visible = false;
        this._collectNode.visible = true;
        this._rewardCoinsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardChips));
        this._rewardGemsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardGems));
        this._rewardStarsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardStars));
    }
};

DailyChallengeCompletedController.prototype.onDailyTaskRewardClaimed = function (event) {
    if (TaskMan.getInstance().getRewardClaimed()) {
        this._completeNode.visible = true;
        this._collectNode.visible = false;
    } else {
        this._completeNode.visible = false;
        this._collectNode.visible = true;
    }
};

DailyChallengeCompletedController.prototype.collectClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    TaskMan.getInstance().claimDailyTaskReward();
    PopupMan.popupIndicator();
};

DailyChallengeCompletedController.prototype.closeClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

DailyChallengeCompletedController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

DailyChallengeCompletedController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

DailyChallengeCompletedController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_challenge/daily_challenge_complete.ccbi", null, "DailyChallengeCompletedController", new DailyChallengeCompletedController());
};

module.exports = DailyChallengeCompletedController;