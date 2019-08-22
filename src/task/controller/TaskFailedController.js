/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");
var LevelStarController = require("./LevelStarController");

var TaskFailedController = function() {
    this.MAX_TASK_WIDTH = 450;

    this._popupRootNode = null;

    this._taskInfoLabel = null;
    this._taskIcon = null;

    this._star1Pos = null;
    this._star2Pos = null;
    this._star3Pos = null;
    this._starList = [];

    /**
     * @type {Function}
     * @private
     */
    this._replayCallback = null;
};

Util.inherits(TaskFailedController,BaseCCBController);

TaskFailedController.prototype.onEnter = function () {
};

TaskFailedController.prototype.onExit = function () {
};

TaskFailedController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    AudioHelper.playTaskEffect("task-failed");

    var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
    var TaskConfigMan = require("../config/TaskConfigMan");
    var taskId = ClassicSlotMan.getInstance().taskInfo.taskId;
    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(taskId);
    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskConfig.taskLevelId);
    if (taskLevelConfig) {
        var taskSpriteFrame = cc.spriteFrameCache.getSpriteFrame(taskConfig.getSlotIconName());
        if (taskSpriteFrame) {
            this._taskIcon.setSpriteFrame(taskSpriteFrame);
        }

        //for(var i = 0; i < (taskLevelConfig.levelStar - 1); i++) {
        //    var starNode = LevelStarController.createFromCCB();
        //    starNode.animationManager.runAnimationsForSequenceNamed("normal");
        //    starNode.setPosition(this._starList[i].getPosition());
        //    this._popupRootNode.addChild(starNode);
        //}
    }
    //var taskSplitMsgArr = Util.getSplitArr(taskConfig.getDescription(), 20, " ");
    //var taskMsg = "";
    //for (var i = 0; i < taskSplitMsgArr.length; ++i) {
    //    taskMsg += taskSplitMsgArr[i] + "\n";
    //}
    this._taskInfoLabel.setString(taskConfig.getDescription());
    Util.scaleCCLabelBMFont(this._taskInfoLabel, this.MAX_TASK_WIDTH);
};

/**
 *
 * @param {Function} replayCallback
 */
TaskFailedController.prototype.initWith = function (replayCallback) {
    this._replayCallback = replayCallback;
};

TaskFailedController.prototype.replayClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
    if (this._replayCallback) {
        this._replayCallback();
    }
};

TaskFailedController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskFailedController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskFailedController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/mission/casino_mission_dialog_04.ccbi", null, "TaskFailedController", new TaskFailedController());
};

module.exports = TaskFailedController;