/**
 * Created by ZenQhy on 16/6/28.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskMan = require("../../task/model/TaskMan");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var PopupMan = require("../../common/model/PopupMan");

var TaskFlagStoneChestController = function() {
    this._openPointItem = null;
    this._starParticle1 = null;
    this._starParticle2 = null;

    this.taskLevelConfig = null;
};

Util.inherits(TaskFlagStoneChestController, BaseCCBController);

TaskFlagStoneChestController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

TaskFlagStoneChestController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

TaskFlagStoneChestController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._starParticle1.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
    this._starParticle2.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
};

TaskFlagStoneChestController.prototype.initWithTaskLevelConfig = function (taskLevelConfig) {
    this.taskLevelConfig = taskLevelConfig;
    this.refreshNode();
};

TaskFlagStoneChestController.prototype.updateTaskConfig = function (taskLevelConfig) {
    this.taskLevelConfig = taskLevelConfig;
    this.refreshNode();
};

TaskFlagStoneChestController.prototype.refreshNode = function () {
    if(this.taskLevelConfig.levelStar <= 0) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
        this._openPointItem.enabled = false;
    }
    else if(this.taskLevelConfig.levelStar > 0 && this.taskLevelConfig.levelStar < 2) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("open");
        this._openPointItem.enabled = true;
    }
    else {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("close");
        this._openPointItem.enabled = false;
    }

    if(this.taskLevelConfig.level == TaskMan.getInstance().getCurTaskLevel() && !TaskMan.getInstance().haveNewTaskCompleted()) {
        this.addSpinArrow();
    }
};

TaskFlagStoneChestController.prototype.setCurTaskAnim = function () {
    if(this.taskLevelConfig.level == TaskMan.getInstance().getCurTaskLevel()) {
        this.addSpinArrow();
    }
};

TaskFlagStoneChestController.prototype.addSpinArrow = function () {
    var arrowNode = Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_arrow.ccbi", null);
    arrowNode.setPosition(cc.p(0, 25));
    this.rootNode.addChild(arrowNode);
};

TaskFlagStoneChestController.prototype.appleClicked = function(sender) {
    if(sender == this._openPointItem) {
        this.showTaskPopup();
    }
};

TaskFlagStoneChestController.prototype.showTaskPopup = function () {
    if (!TaskMan.getInstance().isLobbyFlagStoneCanSpin()) {
        return;
    }
    AudioHelper.playBtnClickSound();

    if (this.taskLevelConfig) {
        var taskList = this.taskLevelConfig.taskList;
        if (taskList.length == 1) {
            var SceneMan = require("../../common/model/SceneMan");
            var SceneType = require("../../common/enum/SceneType");
            var taskConfig = taskList[0];
            ClassicSlotMan.getInstance().taskId = taskConfig.taskId;
            ClassicSlotMan.getInstance().subjectId = taskConfig.subjectId;
            ClassicSlotMan.getInstance().taskLevelId = taskConfig.taskLevelId;
            ClassicSlotMan.getInstance().levelStar = taskConfig.levelStar;
            SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);
        }
        else {
            PopupMan.popupCommonDialog("Error", ["Chest Point Error"], "OK", null, null, false, false);
        }
    }
};

TaskFlagStoneChestController.prototype.showLevelCompletedAnim = function () {
    AudioHelper.playTaskEffect("task-end-anim");
    this.rootNode.animationManager.runAnimationsForSequenceNamed("close");
    this._openPointItem.enabled = false;
};

TaskFlagStoneChestController.prototype.showLevelNewStarAnim = function () {
    AudioHelper.playTaskEffect("task-end-anim");
};

TaskFlagStoneChestController.prototype.showLevelBeginAnim = function () {
    AudioHelper.playTaskEffect("task-start-anim");
    this.rootNode.animationManager.runAnimationsForSequenceNamed("open");
    this._openPointItem.enabled = true;
};

TaskFlagStoneChestController.prototype.setFlagstoneEnabled = function (enabled) {
    this._openPointItem.enabled = enabled;
    if(this.taskLevelConfig.levelStar <= 0 || this.taskLevelConfig.levelStar >= 2) {
        this._openPointItem.enabled = false;
    }
};

TaskFlagStoneChestController.createFromCCB = function(fileName) {
    return Util.loadNodeFromCCB(fileName, null, "TaskFlagStoneChestController", new TaskFlagStoneChestController());
};

module.exports = TaskFlagStoneChestController;