/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskMan = require("../model/TaskMan");
var TaskProgressType = require("../enum/TaskProgressType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var TaskEvent = require("../events/TaskEvent");

var TaskDialogType = {
    TASK_DIALOG_TYPE_COMPLETED_ONE: 0,
    TASK_DIALOG_TYPE_COMPLETED_ALL: 1,
    TASK_DIALOG_TYPE_OTHER: 2
};

var DailyChallengeProgressController = function(taskDialogType) {
    this._curProgressLabel = null;
    this._allProgressLabel = null;
    this._dailyChallengeItem = null;
    this._challenge1Node = null;
    this._challenge2Node = null;
    this._challenge3Node = null;
    this._challenge4Node = null;
    this._challenge5Node = null;

    this._rewardStarsLabel = null;
    this._rewardCoinsLabel = null;
    this._rewardGemsLabel = null;

    /**
     * @type {Array.<cc.Node>}
     */
    this._challengeNodeList = null;

    this._isCompletedAllTask = false;

    /**
     * @type {TaskDialogType}
     * @private
     */
    this._taskDialogType = taskDialogType;
};

Util.inherits(DailyChallengeProgressController,BaseCCBController);

DailyChallengeProgressController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_DAILY_TASK_COMPLETED, this.onDailyTaskCompleted, this);
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_DAILY_TASK_REFRESH, this.onDailyTaskRefresh, this);
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_DAILY_TASK_REWARD_CLAIMED, this.onDailyTaskRewardClaimed, this);
};

DailyChallengeProgressController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_DAILY_TASK_REFRESH, this.onDailyTaskRefresh, this);
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_DAILY_TASK_REWARD_CLAIMED, this.onDailyTaskRewardClaimed, this);
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_DAILY_TASK_COMPLETED, this.onDailyTaskCompleted, this);
};

DailyChallengeProgressController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._challengeNodeList = [this._challenge1Node, this._challenge2Node, this._challenge3Node, this._challenge4Node, this._challenge5Node];

    var completedCount = TaskMan.getInstance().getDailyTaskCompletedCount();
    for (var i = completedCount; i < this._challengeNodeList.length; ++i) {
        this._challengeNodeList[i].visible = false;
    }
    var dailyTaskReward = TaskMan.getInstance().getDailyTaskReward();
    this._curProgressLabel.setString(completedCount);
    this._allProgressLabel.setString(dailyTaskReward.minFinishCount);

    if (this._rewardCoinsLabel) {
        this._rewardCoinsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardChips));
    }
    if (this._rewardGemsLabel) {
        this._rewardGemsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardGems));
    }
    if (this._rewardStarsLabel) {
        this._rewardStarsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardStars));
    }
};

/**
 * task progress type.
 * @param {TaskProgressType} taskProgressType
 */
DailyChallengeProgressController.prototype.initWith = function (taskProgressType) {
    if (taskProgressType == TaskProgressType.TASK_PROGRESS_TYPE_BUTTON) {
        this._dailyChallengeItem.enabled = true;
    } else if (taskProgressType == TaskProgressType.TASK_PROGRESS_TYPE_ICON) {
        this._dailyChallengeItem.enabled = false;
    } else if (taskProgressType == TaskProgressType.TASK_PROGRESS_TYPE_POPUP) {
    }
};

/**
 * completed task number.
 * @param {number} completedTaskNum
 * @param {boolean} isCompletedAllTask
 */
DailyChallengeProgressController.prototype.showTaskCompletedAnim = function (completedTaskNum, isCompletedAllTask) {
    this._isCompletedAllTask = isCompletedAllTask;
    if (!isCompletedAllTask) {
        if (completedTaskNum <= 0 || completedTaskNum > 5) {
            return;
        }
        var sequenceName = Util.sprintf("task_anim_0%d", completedTaskNum);
        this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
        setTimeout(function () {
            this.rootNode.removeFromParent();
        }.bind(this), 3500);
    } else {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("down");
    }
};

DailyChallengeProgressController.prototype.dailyChallengeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    var PopupMan = require("../../common/model/PopupMan");
    PopupMan.popupDailyTaskDlg();
};

DailyChallengeProgressController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    TaskMan.getInstance().claimDailyTaskReward();
    var PopupMan = require("../../common/model/PopupMan");
    PopupMan.popupIndicator();
    if (this._isCompletedAllTask) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("up");
        setTimeout(function () {
            this.rootNode.removeFromParent();
        }.bind(this), 550);
    }
};

DailyChallengeProgressController.prototype.onDailyTaskRefresh = function (event) {
    this.onDailyTaskCompleted(event);
};

DailyChallengeProgressController.prototype.onDailyTaskCompleted = function (event) {
    var completedCount = TaskMan.getInstance().getDailyTaskCompletedCount();
    for (var i = 0; i < this._challengeNodeList.length; ++i) {
        if (i < completedCount) {
            this._challengeNodeList[i].visible = true;
        } else {
            this._challengeNodeList[i].visible = false;
        }
    }
    var dailyTaskReward = TaskMan.getInstance().getDailyTaskReward();
    this._curProgressLabel.setString(completedCount);
    this._allProgressLabel.setString(dailyTaskReward.minFinishCount);
};

DailyChallengeProgressController.prototype.onDailyTaskRewardClaimed = function (event) {
    if (this._taskDialogType == TaskDialogType.TASK_DIALOG_TYPE_COMPLETED_ALL) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("up");
        setTimeout(function () {
            this.rootNode.removeFromParent();
        }.bind(this), 550);
    }
};

DailyChallengeProgressController.prototype.getContentSize = function () {
    return this._dailyChallengeItem.getContentSize();
};

DailyChallengeProgressController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_challenge/dailychallenge_progress.ccbi", null, "DailyChallengeProgressController", new DailyChallengeProgressController(TaskDialogType.TASK_DIALOG_TYPE_OTHER));
};

DailyChallengeProgressController.createFromCCBOneCompleted = function() {
    return Util.loadNodeFromCCB("casino/daily_challenge/dailychallenge_progress_2.ccbi", null, "DailyChallengeProgressController", new DailyChallengeProgressController(TaskDialogType.TASK_DIALOG_TYPE_COMPLETED_ONE));
};

DailyChallengeProgressController.createFromCCBAllCompleted = function () {
    return Util.loadNodeFromCCB("casino/daily_challenge/dailychallenge_progress_dialog.ccbi", null, "DailyChallengeProgressController", new DailyChallengeProgressController(TaskDialogType.TASK_DIALOG_TYPE_COMPLETED_ALL));
};

module.exports = DailyChallengeProgressController;