/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");
var TaskDestinyItemController = require("./TaskDestinyItemController");
var TaskMan = require("../model/TaskMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var TaskConfigMan = require("../config/TaskConfigMan");
var LevelStarController = require("./LevelStarController");
var TaskRewardType = require("../enum/TaskRewardType");
var FlagStoneType = require("../../slot/enum/FlagStoneType");
var TaskDestinyController = function() {
    this.CELL_WIDTH_OFFSET = 230;

    this._dlgRootNode = null;

    this._starPoint1 = null;
    this._starPoint2 = null;
    this._starPoint3 = null;

    this._curRewardIcon1 = null;
    this._curRewardLabel1 = null;
    this._curRewardIcon2 = null;
    this._curRewardLabel2 = null;

    this._star1_1 = null;
    this._star2_1 = null;
    this._star2_2 = null;
    this._star3_1 = null;
    this._star3_2 = null;
    this._star3_3 = null;

    this._rewardIcon1_1 = null;
    this._rewardIcon1_2 = null;
    this._rewardIcon2_1 = null;
    this._rewardIcon2_2 = null;
    this._rewardIcon3_1 = null;
    this._rewardIcon3_2 = null;
    this._rewardLabel1_1 = null;
    this._rewardLabel1_2 = null;
    this._rewardLabel2_1 = null;
    this._rewardLabel2_2 = null;
    this._rewardLabel3_1 = null;
    this._rewardLabel3_2 = null;

    this._starPointList = [];

    this._curRewardIconList = [];
    this._curRewardLabelList = [];

    this._rewardStarList = [];
    this._rewardIconList = [];
    this._rewardLabelList = [];

    this._fullRewardItem = null;

    this._bgNormal = null;
    this._bgBoss = null;
    this._bgChest = null;
    //data
    this._taskLevelConfig = [];

    this.hasShownDetailPopup = false;
};


Util.inherits(TaskDestinyController, BaseCCBController);

TaskDestinyController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.CLOSE_TASK_DESTINY_DIALOG, this.close, this);
};

TaskDestinyController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.CLOSE_TASK_DESTINY_DIALOG, this.close, this);
};

TaskDestinyController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._starPointList = [];
    this._starPointList.push(this._starPoint1);
    this._starPointList.push(this._starPoint2);
    this._starPointList.push(this._starPoint3);

    this._curRewardIconList = [];
    this._curRewardIconList.push(this._curRewardIcon1);
    this._curRewardIconList.push(this._curRewardIcon2);

    this._curRewardLabelList = [];
    this._curRewardLabelList.push(this._curRewardLabel1);
    this._curRewardLabelList.push(this._curRewardLabel2);

    this._rewardStarList = [];
    var rewardStarList1 = [];
    rewardStarList1.push(this._star1_1);
    this._rewardStarList.push(rewardStarList1);
    var rewardStarList2 = [];
    rewardStarList2.push(this._star2_1);
    rewardStarList2.push(this._star2_2);
    this._rewardStarList.push(rewardStarList2);
    var rewardStarList3 = [];
    rewardStarList3.push(this._star3_1);
    rewardStarList3.push(this._star3_2);
    rewardStarList3.push(this._star3_3);
    this._rewardStarList.push(rewardStarList3);

    this._rewardIconList = [];
    var rewardIconList1 = [];
    rewardIconList1.push(this._rewardIcon1_1);
    rewardIconList1.push(this._rewardIcon1_2);
    this._rewardIconList.push(rewardIconList1);
    var rewardIconList2 = [];
    rewardIconList2.push(this._rewardIcon2_1);
    rewardIconList2.push(this._rewardIcon2_2);
    this._rewardIconList.push(rewardIconList2);
    var rewardIconList3 = [];
    rewardIconList3.push(this._rewardIcon3_1);
    rewardIconList3.push(this._rewardIcon3_2);
    this._rewardIconList.push(rewardIconList3);

    this._rewardLabelList = [];
    var rewardLabelList1 = [];
    rewardLabelList1.push(this._rewardLabel1_1);
    rewardLabelList1.push(this._rewardLabel1_2);
    this._rewardLabelList.push(rewardLabelList1);
    var rewardLabelList2 = [];
    rewardLabelList2.push(this._rewardLabel2_1);
    rewardLabelList2.push(this._rewardLabel2_2);
    this._rewardLabelList.push(rewardLabelList2);
    var rewardLabelList3 = [];
    rewardLabelList3.push(this._rewardLabel3_1);
    rewardLabelList3.push(this._rewardLabel3_2);
    this._rewardLabelList.push(rewardLabelList3);

    //cc.spriteFrameCache.addSpriteFrames("slot/lobby/flagstone/lobby_flagstone.plist", "slot/lobby/flagstone/lobby_flagstone.png");
    //this._leftArrowItem.visible = false;
    //this._rightArrowItem.visible = false;
};

TaskDestinyController.prototype.initWith = function (taskLevelConfig) {
    this._taskLevelConfig = taskLevelConfig;

    this.showChallengeListView();
    this.prepareAllRewardData();
    this._bgBoss.setVisible(false);
    this._bgChest.setVisible(false);
    this._bgNormal.setVisible(false);
    switch (this._taskLevelConfig.flagStoneType) {
        case FlagStoneType.FLAG_STONE_TYPE_NORMAL:
            this._bgNormal.setVisible(true);
            AudioHelper.playTaskEffect("mission_popup_normal", false);
            break;
        case FlagStoneType.FLAG_STONE_TYPE_BOSS:
            this._bgBoss.setVisible(true);
            AudioHelper.playTaskEffect("mission_popup_boss", false);
            break;
        case FlagStoneType.FLAG_STONE_TYPE_CHEST:
            this._bgChest.setVisible(true);
            AudioHelper.playTaskEffect("mission_popup_ggh", false);
            break;
        case FlagStoneType.FLAG_STONE_TYPE_COMMING_SOON:
            //node = FlagStoneCommingSoonController.createFromCCB(ccbFileName);
            break;
    }
};

TaskDestinyController.prototype.onFullRewardItemClicked = function(sender) {
    if(!this.hasShownDetailPopup) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("down");
        this._fullRewardItem.setNormalSpriteFrame("#mission_b_fullreward_2.png");
    }
    else {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("up");
        this._fullRewardItem.setNormalSpriteFrame("#mission_b_fullreward.png");
    }

    this.hasShownDetailPopup = !this.hasShownDetailPopup;
};

TaskDestinyController.prototype.onCloseClicked = function(sender) {
    this.close();
};

TaskDestinyController.prototype.showChallengeListView = function () {
    var taskLen = this._taskLevelConfig.taskList.length;
    var centerPos = cc.p(0, 0);
    var cellOffsetX = this.CELL_WIDTH_OFFSET;
    for (var i = 0; i < taskLen; ++i) {
        var taskDensityView = TaskDestinyItemController.createFromCCB();
        taskDensityView.controller.initWith(this._taskLevelConfig.taskList[i].taskId);
        var offsetX = (0.5 - taskLen / 2 + i) * cellOffsetX;
        taskDensityView.setPosition(cc.pAdd(centerPos, cc.p(offsetX, 0)));
        this._dlgRootNode.addChild(taskDensityView);
    }
};

TaskDestinyController.prototype.AddLevelStar = function () {
    this.showLevelStar();
};

TaskDestinyController.prototype.showLevelStar = function () {
    if(this._taskLevelConfig.taskList.length > 0) {
        var levelStar = this._taskLevelConfig.levelStar - 1;
        if(levelStar > 0) this.addLevelStarNode(0);
        if(levelStar > 1) this.addLevelStarNode(1);
        if(levelStar > 2) this.addLevelStarNode(2);
    }
};

TaskDestinyController.prototype.addLevelStarNode = function (index) {
    var starNode = LevelStarController.createFromCCB();
    starNode.setPosition(this._starPointList[index].getPosition());
    starNode.animationManager.runAnimationsForSequenceNamed("small");
    this._dlgRootNode.addChild(starNode);
};

TaskDestinyController.prototype.prepareAllRewardData = function () {
    var i = 0;
    for(i = 0; i < this._taskLevelConfig.levelRewardList.length; i++) {
        this.setLevelReward(this._rewardIconList[i], this._rewardLabelList[i], this._taskLevelConfig.levelRewardList[i]);
    }

    var curLevel = this._taskLevelConfig.levelStar - 1;
    if(curLevel < this._taskLevelConfig.levelRewardList.length) {
        this.setLevelReward(this._curRewardIconList, this._curRewardLabelList, this._taskLevelConfig.levelRewardList[curLevel]);
    }

    for(i = 0; i < 3; i++) {
        if(i < curLevel) {
            this.setLevelRewardStar(this._rewardStarList[i], true);
        }
        else {
            this.setLevelRewardStar(this._rewardStarList[i], false);
        }
    }
};

TaskDestinyController.prototype.setLevelReward = function (iconList, rewardLabelList, taskReward) {
    var taskRewardType = taskReward.getTwoRewardType();
    var taskRewardValue = taskReward.getTwoRewardValue();

    for(var i = 0; i < taskRewardType.length; i++) {
        switch(taskRewardType[i]) {
            case TaskRewardType.REWARD_COINS:
                iconList[i].setSpriteFrame("common_icon_coins_s.png");
                break;
            case TaskRewardType.REWARD_GEMS:
                iconList[i].setSpriteFrame("common_icon_gems_s.png");
                break;
            case TaskRewardType.REWARD_STAR:
                iconList[i].setSpriteFrame("common_icon_clover_s.png");
                break;
        }

        rewardLabelList[i].setString(Util.getCommaNum(taskRewardValue[i]));
        Util.scaleCCLabelBMFont(rewardLabelList[i], 130);

        iconList[i].visible = true;
        rewardLabelList[i].visible = true;
    }

    for(; i < 2; i++) {
        iconList[i].visible = false;
        rewardLabelList[i].visible = false;
    }
};

TaskDestinyController.prototype.setLevelRewardStar = function (starList, isLight) {
    for(var i = 0; i < starList.length; i++) {
        if(isLight) {
            starList[i].setSpriteFrame("common_icon_star_s.png");
        }
        else {
            starList[i].setSpriteFrame("common_icon_star_s_dis.png");
        }
    }
};

TaskDestinyController.prototype.closeClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

TaskDestinyController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskDestinyController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskDestinyController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/mission/casino_mission_dialog_01.ccbi", null, "TaskDestinyController", new TaskDestinyController());
};

module.exports = TaskDestinyController;