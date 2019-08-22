/**
 * Created by qinning on 15/12/20.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskMan = require("../../task/model/TaskMan");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var PopupMan = require("../../common/model/PopupMan");
var FlagStoneType = require("../enum/FlagStoneType");

var TaskFlagStoneController = function() {
    this._normalNode = null;
    this._lockNode = null;
    this._starNode = null;

    this._star1 = null;
    this._star2 = null;
    this._star3 = null;
    this._starNodeList = [];

    this._pointSprite = null;

    this._normalPointItem = null;

    this._normalLevelLabel = null;
    this._completeSp = null;
    this.taskLevelConfig = null;
};

Util.inherits(TaskFlagStoneController, BaseCCBController);

TaskFlagStoneController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

TaskFlagStoneController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

TaskFlagStoneController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

TaskFlagStoneController.prototype.initWithTaskLevelConfig = function (taskLevelConfig) {
    this.taskLevelConfig = taskLevelConfig;
    this.refreshNode();
};

TaskFlagStoneController.prototype.updateTaskConfig = function (taskLevelConfig) {
    this.taskLevelConfig = taskLevelConfig;
    this.refreshNode();
};

TaskFlagStoneController.prototype.refreshNode = function () {
    this._normalLevelLabel.setString(this.taskLevelConfig.level);
    if(this.taskLevelConfig.isBranchTask) {
        this._normalLevelLabel.visible = false;
    }
    if(this.taskLevelConfig.isBranchTask && this.taskLevelConfig.flagStoneType == FlagStoneType.FLAG_STONE_TYPE_NORMAL) {
        this._pointSprite.setSpriteFrame("lobby_point_purple.png");
        var lockSprite = this._lockNode.getChildByTag(3);
        if(lockSprite) {
            lockSprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("lobby_point_black_2.png"));
        }
    }
    if(this.taskLevelConfig.levelStar > 0) this.setFlagStoneLocked(false);
    else this.setFlagStoneLocked(true);

    if(this.taskLevelConfig.levelStar > 1) this.addStarNode(this._star1);
    if(this.taskLevelConfig.levelStar > 2) this.addStarNode(this._star2);
    if(this.taskLevelConfig.levelStar > 3) {
        this.addStarNode(this._star3);
        this.rootNode.animationManager.runAnimationsForSequenceNamed("complete-no-anim");
        this._normalPointItem.enabled = false;
        //this._normalLevelLabel.visible = false;
        //this._completeSp.setOpacity(255);
    }

    if(this.taskLevelConfig.level == TaskMan.getInstance().getCurTaskLevel() && !TaskMan.getInstance().haveNewTaskCompleted()) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("start_2");
        this.addSpinArrow();
    }
};

TaskFlagStoneController.prototype.setCurTaskAnim = function () {
    if(this.taskLevelConfig.level == TaskMan.getInstance().getCurTaskLevel()) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("start_2");
        this.addSpinArrow();
    }
};

TaskFlagStoneController.prototype.addSpinArrow = function () {
    var arrowNode = Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_arrow.ccbi", null);
    arrowNode.setPosition(cc.p(0, 12));
    this.rootNode.addChild(arrowNode);
};

TaskFlagStoneController.prototype.addStarNode = function (posNode) {
    var starNode = Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_point_star.ccbi", null);
    posNode.addChild(starNode);
    this._starNodeList.push(starNode);
};

TaskFlagStoneController.prototype.setFlagStoneLocked = function(isLocked) {
    if(isLocked) {
        this._lockNode.visible = true;
        this._normalNode.visible = false;
        this._starNode.visible = false;
    }
    else {
        this._lockNode.visible = false;
        this._normalNode.visible = true;
        this._starNode.visible = true;
    }
};

TaskFlagStoneController.prototype.appleClicked = function(sender) {
    if(sender == this._normalPointItem) {
        if(this.taskLevelConfig.needStar > TaskMan.getInstance().getTaskStarNum())
        {
            PopupMan.popupCommonDialog("Notice", ["You need " + this.taskLevelConfig.needStar.toString() + " stars \nto play this level"], "Ok", null, null, false, false);
        }
        else {
            this.showTaskPopup();
        }

        if(this.taskLevelConfig.level == 1) {
            var LogMan = require("../../log/model/LogMan");
            var UserStepId = require("../../log/enum/UserStepId");
            LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_FIRST_LEVEL_POINT, -1);
        }
    }
};

TaskFlagStoneController.prototype.showTaskPopup = function () {
    if (!TaskMan.getInstance().isLobbyFlagStoneCanSpin()) {
        return;
    }
    AudioHelper.playBtnClickSound();

    if (this.taskLevelConfig) {
        var taskList = this.taskLevelConfig.taskList;
        if (taskList.length > 0) {
            ClassicSlotMan.getInstance().showTaskChooseDlg(this.taskLevelConfig);
        } else {
            PopupMan.popupCommonDialog("Notice", ["Comming Soon..."], "Ok", null, null, false, false);
        }
    }
};

TaskFlagStoneController.prototype.showLevelCompletedAnim = function () {
    AudioHelper.playTaskEffect("task-end-anim");
    this.rootNode.animationManager.runAnimationsForSequenceNamed("complete");
};

TaskFlagStoneController.prototype.showLevelNewStarAnim = function () {
    var starNode = this._starNodeList[this.taskLevelConfig.levelStar - 2];
    if(starNode) {
        starNode.animationManager.runAnimationsForSequenceNamed("star_appear");
    }
    AudioHelper.playTaskEffect("task-end-anim");
};

TaskFlagStoneController.prototype.showLevelBeginAnim = function () {
    this.setFlagStoneLocked(false);
    AudioHelper.playTaskEffect("task-start-anim");
    this.rootNode.animationManager.runAnimationsForSequenceNamed("point_start");
};

TaskFlagStoneController.prototype.onPointStartAnimEnd = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
};

TaskFlagStoneController.prototype.setFlagstoneEnabled = function (enabled) {
    this._normalPointItem.enabled = enabled;
    if(this.taskLevelConfig.levelStar <= 0 || this.taskLevelConfig.levelStar > 3) {
        this._normalPointItem.enabled = false;
    }
};

TaskFlagStoneController.createFromCCB = function(fileName) {
    return Util.loadNodeFromCCB(fileName, null, "TaskFlagStoneController", new TaskFlagStoneController());
};

module.exports = TaskFlagStoneController;