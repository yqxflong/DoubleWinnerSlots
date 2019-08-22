/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var DialogManager = require("../../common/popup/DialogManager");
var LevelStarController = require("./LevelStarController");
var StorageController = require("../../common/storage/StorageController");
var SocialMan = require("../../social/model/SocialMan");
var PlayerMan = require("../../common/model/PlayerMan");

var TaskCompletedController = function() {
    this._taskIcon = null;

    this._popupRootNode = null;

    this._rewardCoinsLabel = null;
    this._rewardGemsLabel = null;
    this._rewardStarsLabel = null;

    this._rewardIcon1 = null;
    this._rewardIcon2 = null;
    this._rewardLabel1 = null;
    this._rewardLabel2 = null;

    this._rewardIconList = [];
    this._rewardLabelList = [];
    this._rewardCount = 0;

    this._star1Pos = null;
    this._star2Pos = null;
    this._star3Pos = null;
    this._starList = [];

    this._starCount = 0;

    this._taskLevelUp = null;

    this._shareCheckSprite = null;
    this._canShare = true;
};

Util.inherits(TaskCompletedController,BaseCCBController);

TaskCompletedController.prototype.onEnter = function () {
};

TaskCompletedController.prototype.onExit = function () {
};

TaskCompletedController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    StorageController.getInstance().setItem("isNewUser", "false");

    AudioPlayer.getInstance().stopMusic();
    //AudioPlayer.getInstance().stopAllEffects();
    AudioHelper.playTaskEffect("task-completed");

    this._rewardIconList.push(this._rewardIcon1);
    this._rewardIconList.push(this._rewardIcon2);
    this._rewardLabelList.push(this._rewardLabel1);
    this._rewardLabelList.push(this._rewardLabel2);
    this._rewardCount = 0;

    this._starList.push(this._star1Pos);
    this._starList.push(this._star2Pos);
    this._starList.push(this._star3Pos);

    var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
    var TaskConfigMan = require("../config/TaskConfigMan");
    var taskInfo = ClassicSlotMan.getInstance().taskInfo;
    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(taskInfo.taskId);
    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskConfig.taskLevelId);
    this._starCount = taskLevelConfig.levelStar - 1;
    for(var i = 0; i < (this._starCount - 1); i++) {
        var starNode = LevelStarController.createFromCCB();
        starNode.animationManager.runAnimationsForSequenceNamed("normal");
        starNode.setPosition(this._starList[i].getPosition());
        starNode.controller.setParticleVisible(false);
        this._popupRootNode.addChild(starNode);
    }

    this._canShare = true;
};

TaskCompletedController.prototype.initWith = function (taskLevelUp) {
    this._taskLevelUp = taskLevelUp;

    var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
    var TaskConfigMan = require("../config/TaskConfigMan");
    var taskId = ClassicSlotMan.getInstance().taskInfo.taskId;
    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(taskId);
    if (taskConfig) {
        var taskSpriteFrame = cc.spriteFrameCache.getSpriteFrame(taskConfig.getSlotIconName());
        if (taskSpriteFrame) {
            this._taskIcon.setSpriteFrame(taskSpriteFrame);
        }
    }

    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskConfig.taskLevelId);
    var curLevel = taskLevelConfig.levelStar - 2;
    var reward = taskLevelConfig.levelRewardList[curLevel];

    if(reward.coins > 0) {
        this._rewardIconList[this._rewardCount].setSpriteFrame("common_icon_coins_s.png");
        this._rewardLabelList[this._rewardCount].setString(Util.getCommaNum(reward.coins));
        this._rewardCount++;
    }

    if(reward.gems > 0) {
        this._rewardIconList[this._rewardCount].setSpriteFrame("common_icon_gems_s.png");
        this._rewardLabelList[this._rewardCount].setString(Util.getCommaNum(reward.gems));
        this._rewardCount++;
    }

    if(reward.stars > 0 && this._rewardCount < 2) {
        this._rewardIconList[this._rewardCount].setSpriteFrame("common_icon_clover_s.png");
        this._rewardLabelList[this._rewardCount].setString(Util.getCommaNum(reward.stars));
        this._rewardCount++;
    }

    if(this._rewardCount == 1) {
        this._rewardIcon2.visible = false;
        this._rewardLabel2.visible = false;

        this._rewardIcon1.setPosition(cc.p(this._rewardIcon1.x, this._rewardIcon1.y - 25));
        this._rewardLabel1.setPosition(cc.p(this._rewardLabel1.x, this._rewardLabel1.y - 25));
    }
};

TaskCompletedController.prototype.starDrop = function () {
    if(this._starCount > 0 && this._starCount <= 3) {
        var starNode = LevelStarController.createFromCCB();
        starNode.animationManager.runAnimationsForSequenceNamed("drop");
        starNode.setPosition(this._starList[this._starCount - 1].getPosition());
        this._popupRootNode.addChild(starNode);
    }
};

TaskCompletedController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();

    if(!PlayerMan.getInstance().isGuest() && this._canShare) {
        var SharePosType = require("../../social/enum/SharePosType");
        SocialMan.getInstance().shareWithPermission(SharePosType.SHARE_TASK_FINISH, function (errorCode) {
            if (errorCode === 0) {
                this.sendShareRecordLog(true);
            }
            else {
                this.sendShareRecordLog(false);
            }
        }.bind(this), this._taskLevelUp.newTaskLevel);
    }
    else {
        this.sendShareRecordLog(false);
    }

    var SceneMan = require("../../common/model/SceneMan");
    SceneMan.getInstance().backSwitchScene();

    var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
    var TaskConfigMan = require("../config/TaskConfigMan");
    var taskId = ClassicSlotMan.getInstance().taskInfo.taskId;
    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(taskId);
    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskConfig.taskLevelId);
    var curLevel = taskLevelConfig.levelStar - 2;
    var reward = taskLevelConfig.levelRewardList[curLevel];

    var LogMan = require("../../log/model/LogMan");
    PlayerMan.getInstance().addChips(reward.coins, true);
    PlayerMan.getInstance().addGems(reward.gems, true);
    PlayerMan.getInstance().addStars(reward.stars, true);
    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
    LogMan.getInstance().userProductRecord(ProductChangeReason.COMPLETE_TASK, reward.gems, reward.coins, 0, reward.stars, 0);

    this.close();

    var HourlyGameMan = require("../../social/model/HourlyGameMan");
    if(this._taskLevelUp.newCards && this._taskLevelUp.newCards.length > 0)
    {
        HourlyGameMan.getInstance().unlockCards(this._taskLevelUp.newCards);
    }

    if(this._taskLevelUp.newSubjects && this._taskLevelUp.newSubjects.length > 0)
    {
        var PopupMan = require("../../common/model/PopupMan");
        PopupMan.popupCommonDialog("NOTICE", ["New slot game unlocked !"], "Ok");
    }
};

TaskCompletedController.prototype.sendShareRecordLog = function (canShare) {
    //guest does not need send share record log.
    if (PlayerMan.getInstance().isGuest()) {
        return;
    }
    var LogMan = require("../../log/model/LogMan");
    var SharePosType = require("../../social/enum/SharePosType");
    var ActionType = require("../../log/enum/ActionType");
    if (canShare) {
        LogMan.getInstance().shareRecord(SharePosType.SHARE_TASK_FINISH, ActionType.TAKE_ACTION);
    } else {
        LogMan.getInstance().shareRecord(SharePosType.SHARE_TASK_FINISH, ActionType.LEAVE);
    }
};

TaskCompletedController.prototype.shareClicked = function (sender) {
    this._canShare = !this._canShare;
    if(this._canShare) {
        this._shareCheckSprite.visible = true;
    }
    else {
        this._shareCheckSprite.visible = false;
    }
};

TaskCompletedController.prototype.popupFinished = function (event) {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("normal");
};

TaskCompletedController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskCompletedController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskCompletedController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/mission/casino_mission_dialog_03.ccbi", null, "TaskCompletedController", new TaskCompletedController());
};

module.exports = TaskCompletedController;