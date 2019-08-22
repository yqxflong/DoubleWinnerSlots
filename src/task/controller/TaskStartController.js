/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");
var TaskConfigMan = require("../config/TaskConfigMan");

var TaskStartController = function() {
    this._taskTitleLabel = null;
    this._taskInfoLabel = null;
    this._taskIcon = null;

    this._callback = null;
    this._taskConfig = null;

    this._taskInfoMaxWidth = 500;
};

Util.inherits(TaskStartController, BaseCCBController);

TaskStartController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

TaskStartController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

TaskStartController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    AudioHelper.playTaskEffect("task-start-appear");

    var LogMan = require("../../log/model/LogMan");
    var UserStepId = require("../../log/enum/UserStepId");
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_POPUP_TASK_AIM, -1);
};

TaskStartController.prototype.initWith = function (taskConfig, callback) {
    this._callback = callback;
    this._taskConfig = taskConfig;
    var taskIconSpriteFrame = cc.spriteFrameCache.getSpriteFrame(this._taskConfig.getSlotIconName());
    if (taskIconSpriteFrame) {
        this._taskIcon.setSpriteFrame(taskIconSpriteFrame);
    }
    this._taskInfoLabel.setString(taskConfig.getDescription());
    Util.scaleCCLabelBMFont(this._taskInfoLabel, this._taskInfoMaxWidth);
    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskConfig.taskLevelId);
    this._taskTitleLabel.setString("LEVEL " + taskLevelConfig.showName);

    //var levelConfig = TaskConfigMan.getInstance().getLevelConfig(taskConfig.taskLevelId);
    //if(!levelConfig.isBranchTask) {
    //    this._taskTitleLabel.setString("LEVEL " + taskConfig.taskLevelId);
    //}
    //else {
    //    this._taskTitleLabel.visible = false;
    //}
};

TaskStartController.prototype.onDialogClosed = function (event) {
    if (this._callback) {
        this._callback();
    }
    this.close();
};

TaskStartController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskStartController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskStartController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/mission/casino_mission_dialog_02.ccbi", null, "TaskStartController", new TaskStartController());
};

module.exports = TaskStartController;