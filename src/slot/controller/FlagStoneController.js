/**
 * Created by qinning on 15/5/20.
 */

var Util = require("../../common/util/Util");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var PlayerMan = require("../../common/model/PlayerMan");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskMan = require("../../task/model/TaskMan");
var TaskEvent = require("../../task/events/TaskEvent");
var CommonEvent = require("../../common/events/CommonEvent");
var PopupMan = require("../../common/model/PopupMan");
var FlagStoneFriendController = require("./FlagStoneFriendController");
var StoreType = require("../../store/enum/StoreType");
var SlotSceneType = require("../enum/SlotSceneType");

var TaskMode = {
    TASK_MODE_TASK: 0,
    TASK_MODE_FREE: 1
};

///////////////////////////////
///FlagStoneCompletedController
///////////////////////////////
var FlagStoneCompletedController = function () {
};

Util.inherits(FlagStoneCompletedController, BaseCCBController);

FlagStoneCompletedController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

///////////////////////////////
///FlagStoneLockController
///////////////////////////////
var FlagStoneLockController = function () {

};

Util.inherits(FlagStoneLockController, BaseCCBController);

FlagStoneLockController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

///////////////////////////////
///FlagStoneSpinController
///////////////////////////////
var FlagStoneSpinController = function () {
    this._spinCallback = null;
};

Util.inherits(FlagStoneSpinController, BaseCCBController);

FlagStoneSpinController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FlagStoneSpinController.prototype.setSpinCallback = function (callback) {
    this._spinCallback = callback;
};

FlagStoneSpinController.prototype.spinClicked = function (sender) {
    if (this._spinCallback) {
        this._spinCallback();
    }
};

///////////////////////////////
///FlagStonePoingController
///////////////////////////////
var FlagStonePoingController = function () {

};

Util.inherits(FlagStonePoingController, BaseCCBController);

FlagStonePoingController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};


///////////////////////////////
///FlagStoneController
///////////////////////////////
var FlagStoneController = function() {
    this.TIME_OUT_INTERVAL = 1000;

    this._slotBg = null;
    this._slotBgBlack = null;

    this._spinItem = null;
    this._buyItem = null;

    this._lockNode = null;

    this._spinLabel = null;
    this._buyLabel = null;
    this._gemIcon = null;

    //this._spinNode = null;
    //this._gemLockNode = null;
    //this._buyItem = null;
    //this._lockNode = null;
    //this._buyLabel = null;
    //this._friendNode = null;
    //
    //this._friendFlagStoneNode = null;
    //
    //this._flagStoneCompleteNode = null;
    //this._flagStoneSpinNode = null;
    //this._flagStoneLockNode = null;
    //
    //this._taskLevelConfig = null;
    this._subject = null;
    //this._friendsTaskInfo = null;

    this._taskMode = 0;

    this.isOpened = false;
};

Util.inherits(FlagStoneController, BaseCCBController);

FlagStoneController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.UNLOCK_SUBJECT, this.unlockSubject, this);
};

FlagStoneController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.UNLOCK_SUBJECT, this.unlockSubject, this);
};

FlagStoneController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    //this._flagStoneCompleteNode = Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_complete.ccbi", null, "FlagStoneCompletedController", new FlagStoneCompletedController());
    //this._flagStoneSpinNode = Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_spin.ccbi", null, "FlagStoneSpinController", new FlagStoneSpinController());
    //this._flagStoneSpinNode.controller.setSpinCallback(this.spinClicked.bind(this));
    //this._flagStoneLockNode = Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_lock.ccbi", null, "FlagStoneLockController", new FlagStoneLockController());
    //
    //this._lockNode.addChild(this._flagStoneLockNode);
    //this._completeNode.addChild(this._flagStoneCompleteNode);
    //this._spinNode.addChild(this._flagStoneSpinNode);
    //
    //this._spinNode.visible = false;
    //this._gemLockNode.visible = false;
    //this._lockNode.visible = false;
};

FlagStoneController.prototype.initWithSubject = function (subject) {
    this._taskMode = TaskMode.TASK_MODE_FREE;
    this._subject = subject;
    var openSubjectIds = TaskMan.getInstance().getOpenSubjectIds();
    this.isOpened = Util.arrContain(openSubjectIds, subject.subjectId);
    this.updateFlagStone(this.isOpened, subject);

    this._starNumLabel.setString(subject.unlockStar.toString());
    //this._flagStoneSpinNode.animationManager.runAnimationsForSequenceNamed("normal");

    cc.spriteFrameCache.addSpriteFrames("slot/lobby/free_mode/lobby_free_mode_icon_1.plist", "slot/lobby/free_mode/lobby_free_mode_icon_1.png");
    cc.spriteFrameCache.addSpriteFrames("slot/lobby/free_mode/lobby_free_mode_icon_2.plist", "slot/lobby/free_mode/lobby_free_mode_icon_2.png");
    this.setSlotSprite(this._subject.subjectId);
};

FlagStoneController.prototype.updateFlagStone = function (opened, subject) {
    if (opened) {
        this._spinItem.visible = true;
        this._buyItem.visible = false;
        this._lockNode.visible = false;
        this._spinLabel.visible = true;
        this._buyLabel.visible = false;
        this._gemIcon.visible = false;
    }
    else {
        this._spinItem.visible = false;
        this._buyItem.visible = true;
        this._lockNode.visible = true;
        this._spinLabel.visible = false;
        this._buyLabel.visible = true;
        this._gemIcon.visible = true;
        this._buyLabel.setString(subject.unlockGems);
    }
};

FlagStoneController.prototype.setSlotSprite = function (subjectId) {
    switch(subjectId) {
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_01:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_witch.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_witch.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_witch.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_02:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_warrior.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_warrior.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_warrior.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_03:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_ziz.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_ziz.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_ziz.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_04:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_master.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_master.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_master.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_05:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_king.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_king.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_king.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_06:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_goblin.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_goblin.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_goblin.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_07:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_mages.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_mages.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_mages.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_08:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_wizard.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_wizard.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_wizard.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_09:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_amazon.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_amazon.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_amazon.png"));
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_10:
            this._slotBg.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_charybdis.png"));
            this._slotBg.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_charybdis.png"));
            this._slotBgBlack.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_free_mode_icon_charybdis.png"));
            break;
        default:
            break;
    }
};

//FlagStoneController.prototype.initWithTaskConfig = function (taskLevelConfig) {
//    this._taskMode = TaskMode.TASK_MODE_TASK;
//    this.updateTaskConfig(taskLevelConfig);
//
//    this._friendFlagStoneNode = FlagStoneFriendController.createFromCCB();
//    this._friendNode.addChild(this._friendFlagStoneNode);
//    this._friendFlagStoneNode.visible = false;
//};
//
//FlagStoneController.prototype.updateTaskConfig = function (taskLevelConfig) {
//    this._taskLevelConfig = taskLevelConfig;
//    var curTaskLevel = TaskMan.getInstance().getCurTaskLevel();
//    var taskLevel = taskLevelConfig.level;
//    this._spinNode.visible = false;
//    this._lockNode.visible = false;
//    this._completeNode.visible = false;
//    if (taskLevel == curTaskLevel) {
//        this._spinNode.visible = true;
//    } else if (taskLevel > curTaskLevel) {
//        this._lockNode.visible = true;
//    } else {
//        this._completeNode.visible = true;
//    }
//};
//
//FlagStoneController.prototype.updateFriendTaskInfo = function (playerTaskInfo) {
//    if (this._friendsTaskInfo && this._friendsTaskInfo.fbId == playerTaskInfo.fbId) {
//        return;
//    }
//    this._friendsTaskInfo = playerTaskInfo;
//    this._friendFlagStoneNode.visible = true;
//    this._friendFlagStoneNode.controller.initWithFBId(this._friendsTaskInfo.fbId);
//};

FlagStoneController.prototype.showLevelCompletedAnim = function () {
    //this._spinNode.visible = false;
    //this._completeNode.visible = true;
    //AudioHelper.playTaskEffect("task-end-anim");
    //this._flagStoneCompleteNode.animationManager.runAnimationsForSequenceNamed("animation");
};

FlagStoneController.prototype.showLevelBeginAnim = function () {
    //this._spinNode.visible = true;
    //this._lockNode.visible = false;
    //AudioHelper.playTaskEffect("task-unlock-anim");
    //this._flagStoneSpinNode.animationManager.runAnimationsForSequenceNamed("animation");
    //var self = this;
    //setTimeout(function () {
    //    self._flagStoneSpinNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
    //}, this.TIME_OUT_INTERVAL);
};

FlagStoneController.prototype.spinClicked = function (sender) {
    if(this.isOpened) {
        var SceneType = require("../../common/enum/SceneType");
        var SceneMan = require("../../common/model/SceneMan");
        ClassicSlotMan.getInstance().taskId = 0;
        ClassicSlotMan.getInstance().subjectId = this._subject.subjectId;
        SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);
        EventDispatcher.getInstance().dispatchEvent(CommonEvent.CLOSE_SUBJECT_FREE_MODE_DIALOG);
    }
};

FlagStoneController.prototype.buyClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (PlayerMan.getInstance().player.gems >= this._subject.unlockGems) {
        ClassicSlotMan.getInstance().unlockSubject(this._subject.subjectId);
        PopupMan.popupIndicator();
    } else {
        PopupMan.popupStoreDialog(StoreType.STORE_TYPE_GEMS);
    }
};

FlagStoneController.prototype.unlockSubject = function (event) {
    if (this._taskMode == TaskMode.TASK_MODE_FREE) {
        var subjectId = event.getUserData();
        if (this._subject) {
            if (subjectId == this._subject.subjectId) {
                var openSubjectIds = TaskMan.getInstance().getOpenSubjectIds();
                this.isOpened = Util.arrContain(openSubjectIds, subjectId);
                this.updateFlagStone(this.isOpened, this._subject);
            }
        }
    }
};

FlagStoneController.createFromCCB = function(fileName) {
    return Util.loadNodeFromCCB(fileName, null, "FlagStoneController", new FlagStoneController());
};

module.exports = FlagStoneController;