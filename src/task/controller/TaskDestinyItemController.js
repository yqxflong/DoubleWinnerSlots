/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskConfigMan = require("../config/TaskConfigMan");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var SceneMan = require("../../common/model/SceneMan");
var SceneType = require("../../common/enum/SceneType");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var TaskType = require("../enum/TaskType");

var TaskDestinyItemController = function() {
    this._taskSlotIcon = null;
    this._taskIcon = null;

    this._taskId = 0;
};


Util.inherits(TaskDestinyItemController,BaseCCBController);

TaskDestinyItemController.prototype.onEnter = function () {

};

TaskDestinyItemController.prototype.onExit = function () {

};

TaskDestinyItemController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * @param {number} taskId
 */
TaskDestinyItemController.prototype.initWith = function (taskId) {
    this._taskId = taskId;

    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(taskId);
    this._taskIcon.setSpriteFrame(taskConfig.getIconName());
    this._taskSlotIcon.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame(taskConfig.getSlotSceneIconName()));
    this._taskSlotIcon.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame(taskConfig.getSlotSceneIconName()));
};

TaskDestinyItemController.prototype.onPlayClicked = function (event) {
    AudioHelper.playBtnClickSound();

    ClassicSlotMan.getInstance().taskId = this._taskId;
    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(ClassicSlotMan.getInstance().taskId);
    ClassicSlotMan.getInstance().subjectId = taskConfig.subjectId;
    SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);
    var CommonEvent = require("../../common/events/CommonEvent");
    var EventDispatcher = require("../../common/events/EventDispatcher");

    EventDispatcher.getInstance().dispatchEvent(CommonEvent.CLOSE_TASK_DESTINY_DIALOG);

    if(taskConfig.taskLevelId == 1) {
        var LogMan = require("../../log/model/LogMan");
        var UserStepId = require("../../log/enum/UserStepId");
        LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_CLICK_LEVEL_PLAY, -1);
    }
};

TaskDestinyItemController.prototype.getContentSize = function () {
    return cc.size(210, 400);
};

TaskDestinyItemController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/mission/casino_mission_dialog_item_icon.ccbi", null, "TaskDestinyItemController", new TaskDestinyItemController());
};

module.exports = TaskDestinyItemController;