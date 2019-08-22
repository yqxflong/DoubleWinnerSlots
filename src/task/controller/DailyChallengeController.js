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
var ArrowTableView = require("../../common/ext/ArrowTableView");

//var DailyChallengeItemView = cc.TableViewCell.extend({
//    /**
//     * @types {cc.Node}
//     */
//    _dailyChallengeItemNode: null,
//
//    ctor: function () {
//        this._super();
//        this._dailyChallengeItemNode = DailyChallengeItemController.createFromCCB();
//        this.addChild(this._dailyChallengeItemNode);
//        var size = this._dailyChallengeItemNode.controller.getContentSize();
//        this._dailyChallengeItemNode.setPosition(cc.p(size.width / 2, size.height / 2));
//    },
//
//    initWith: function (dailyTask, idx) {
//        this._dailyChallengeItemNode.controller.initWith(dailyTask, idx);
//    }
//});


var DailyChallengeController = function() {
    this.DAILY_CHALLENGE_ITEM_WIDTH = 206;
    this.DAILY_CHALLENGE_ITEM_HEIGHT = 178;

    this._challengeIcon = null;
    this._rewardCoinsLabel = null;
    this._rewardGemsLabel = null;
    this._rewardStarsLabel = null;
    this._leftArrowItem = null;
    this._rightArrowItem = null;
    this._contentNode = null;

    //custom
    this._tableView = null;
    this._challengeList = null;
    this._isRunningAnim = null;
    this._dailyChallengeProgressNode = null;

    //data
    this._dailyTaskList = TaskMan.getInstance().getDailyTaskList();

    this._dailyTaskList.sort(function (task1, task2) {
        if (task1.isCompleted() > task2.isCompleted()) {
            return 1;
        } else if (task1.isCompleted() < task2.isCompleted()) {
            return -1;
        } else {
            return (task1.taskId - task2.taskId);
        }
    });
};


Util.inherits(DailyChallengeController,BaseCCBController);

DailyChallengeController.prototype.onEnter = function () {

};

DailyChallengeController.prototype.onExit = function () {

};

DailyChallengeController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._challengeIcon.visible = false;
    this._dailyChallengeProgressNode = DailyChallengeProgressController.createFromCCB();
    this._challengeIcon.getParent().addChild(this._dailyChallengeProgressNode);
    this._dailyChallengeProgressNode.setPosition(this._challengeIcon.getPosition());
    this._dailyChallengeProgressNode.controller.initWith(TaskProgressType.TASK_PROGRESS_TYPE_ICON);

    var dailyTaskReward = TaskMan.getInstance().getDailyTaskReward();
    this._rewardCoinsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardChips));
    this._rewardGemsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardGems));
    this._rewardStarsLabel.setString(Util.getCommaNum(dailyTaskReward.rewardStars));

    this._infoLabel.setString(Util.sprintf("Complete any %d tasks and get:", dailyTaskReward.minFinishCount));
    this.showChallengeTableView();
};

DailyChallengeController.prototype.showChallengeTableView = function () {
    for(var i = 0; i < this._dailyTaskList.length; i++) {
        var itemNode = DailyChallengeItemController.createFromCCB();
        itemNode.controller.initWith(this._dailyTaskList[i]);
        itemNode.setPositionX(Math.floor(i % 4) * this.DAILY_CHALLENGE_ITEM_WIDTH + 0.5 * this.DAILY_CHALLENGE_ITEM_WIDTH);
        if(i < 4) itemNode.setPositionY(1.5 * this.DAILY_CHALLENGE_ITEM_HEIGHT);
        else itemNode.setPositionY(0.5 * this.DAILY_CHALLENGE_ITEM_HEIGHT);
        this._contentNode.addChild(itemNode);
    }

    this._leftArrowItem.visible = false;
    this._rightArrowItem.visible = false;


    //if (!this._tableView) {
    //    this._tableView = new ArrowTableView(this, this._contentNode.getContentSize());
    //    this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
    //    this._tableView.setDelegate(this);
    //    this._contentNode.addChild(this._tableView);
    //    this._tableView.setArrowItem(this._leftArrowItem, this._rightArrowItem);
    //}
    //this._tableView.reloadData();
};

//DailyChallengeController.prototype.leftArrowClicked = function (sender) {
//    this._tableView.leftArrowClicked(sender);
//};
//
//DailyChallengeController.prototype.rightArrowClicked = function (sender) {
//    this._tableView.rightArrowClicked(sender);
//};
//
//DailyChallengeController.prototype.scrollViewDidScroll = function (view) {
//};
//
//DailyChallengeController.prototype.scrollViewDidZoom = function (view) {
//};
//
//DailyChallengeController.prototype.tableCellTouched = function (table, cell) {
//    cc.log("cell touched at index: " + cell.getIdx());
//};
//
//DailyChallengeController.prototype.tableCellSizeForIndex = function (table, idx) {
//    return cc.size(200, 410);
//};
//
//DailyChallengeController.prototype.tableCellAtIndex = function (table, idx) {
//    var cell = table.dequeueCell();
//    if (!cell) {
//        cell = new DailyChallengeItemView();
//    }
//    cell.initWith(this._dailyTaskList[idx], idx + 1);
//    return cell;
//};
//
//DailyChallengeController.prototype.numberOfCellsInTableView = function (table) {
//    return this._dailyTaskList.length;
//};

DailyChallengeController.prototype.closeClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

DailyChallengeController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

DailyChallengeController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

DailyChallengeController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_challenge/daily_challenge.ccbi", null, "DailyChallengeController", new DailyChallengeController());
};

module.exports = DailyChallengeController;