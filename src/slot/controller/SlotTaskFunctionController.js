/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var PlayerMan = require("../../common/model/PlayerMan");
var CommonEvent = require("../../common/events/CommonEvent");
var ProductType = require("../../common/enum/ProductType");
var PayTableController = require("./PaytableController");
var Config = require("../../common/util/Config");
var PopupMan = require("../../common/model/PopupMan");
var LongTouchButton = require("../../common/ext/LongTouchButton");
var SlotFunctionController = require("./SlotFunctionController");
var TaskConfigMan = require("../../task/config/TaskConfigMan");
var TaskEvent = require("../../task/events/TaskEvent");
var TaskType = require("../../task/enum/TaskType");
var dateFormat = require("dateFormat");
var numeral = require('numeral');
var AudioHelper = require("../../common/util/AudioHelper");

var SlotTaskFunctionController = function () {
    SlotFunctionController.call(this);

    this.MAX_ICON_WIDTH = 100;

    this._taskProgressFrame = null;
    this._taskProgressBg = null;
    this._taskProgressLabel = null;
    this._taskProgressNode = null;
    this._taskInfoLabel = null;
    this._taskTimeLabel = null;
    this._missionDisIcon = null;
    this._freeSpinItem = null;
    this._freeSpinLabel = null;
    this._taskTimeBg = null;
    this._taskIcon = null;
    this._taskIconBg = null;

    this._taskProgressTimer = null;
    this._autoSpinAnimNode = null;
};

Util.inherits(SlotTaskFunctionController, SlotFunctionController);

SlotTaskFunctionController.prototype.onEnter = function () {
    SlotFunctionController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_TIME_UPDATE_EVERY_SECOND, this.updateTimeTaskEverySecond, this);
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_REFRESH_TASK_INFO, this.refreshTaskInfo, this);
};

SlotTaskFunctionController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_TIME_UPDATE_EVERY_SECOND, this.updateTimeTaskEverySecond, this);
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_REFRESH_TASK_INFO, this.refreshTaskInfo, this);
    SlotFunctionController.prototype.onExit.call(this);
};

SlotTaskFunctionController.prototype.onDidLoadFromCCB = function () {
    SlotFunctionController.prototype.onDidLoadFromCCB.call(this);

    this._autoSpinStopItem.visible = false;
    this._autoSpinSprite.visible = false;
    this._spinButton = new LongTouchButton("magic_world_bottom_b_spin_ipad.png", "magic_world_bottom_b_spin_select_ipad.png",
        this.onSpinButtonClicked.bind(this), this.onSpinButtonLongTouchClicked.bind(this),
        this.onSpinButtonLongTouchBeginClicked.bind(this), 1.0);
    this._spinButton.setAnchorPoint(cc.p(0.5, 0.5));
    this.rootNode.addChild(this._spinButton);
    this._spinButton.setPosition(this._spinItem.getPosition());
    this._spinItem.visible = false;
    this._spinItem = this._spinButton;

    this._spinItem.visible = true;

    this._freeSpinItem.visible = false;
    this._freeSpinLabel.visible = false;
    this.initTaskInfo();
};

SlotTaskFunctionController.prototype.onSpinButtonClicked = function (sender) {
    if (this._autoSpinAnimNode) {
        this._autoSpinAnimNode.removeFromParent();
        this._autoSpinAnimNode = null;
    }
    this.onSpinItemClicked(sender);
};

SlotTaskFunctionController.prototype.onSpinButtonLongTouchBeginClicked = function (sender) {
    if (this._autoSpinAnimNode) {
        this._autoSpinAnimNode.removeFromParent();
        this._autoSpinAnimNode = null;
    }
    this._autoSpinAnimNode = Util.loadNodeFromCCB("magic_world/common/spinui/spinui_spin_animation.ccbi", null);
    this.rootNode.addChild(this._autoSpinAnimNode);
    this._autoSpinAnimNode.setPosition(this._autoSpinStopItem.getPosition());
    this._autoSpinAnimNode.runAction(cc.sequence(cc.delayTime(1.0), cc.removeSelf()));
    AudioHelper.playSlotEffect("hold-auto-spin", false);
};

SlotTaskFunctionController.prototype.onSpinButtonLongTouchClicked = function (sender) {
    if (this._autoSpinAnimNode) {
        this._autoSpinAnimNode.removeFromParent();
        this._autoSpinAnimNode = null;
    }
    if (!this.hasWinAnimStopped()) {
        this.stopWinAnim();
    }
    this._spinItem.visible = false;
    this.onAutoSpinItemClicked(sender);
};

SlotTaskFunctionController.prototype.enableSpin = function () {
    SlotFunctionController.prototype.enableSpin.call(this);
    if (ClassicSlotMan.getInstance().isInFreeSpin) {
        this._freeSpinItem.visible = true;
        this._freeSpinLabel.visible = true;
        this._spinItem.visible = false;
        this._autoSpinSprite.visible = false;
    }
    this.updateBetItem();
};

SlotTaskFunctionController.prototype.enableStop = function () {
    SlotFunctionController.prototype.enableStop.call(this);
    if (ClassicSlotMan.getInstance().isInFreeSpin) {
        this._stopItem.visible = false;
        this._freeSpinLabel.visible = true;
        this._freeSpinItem.visible = true;
        this._autoSpinSprite.visible = false;
    }
};

SlotTaskFunctionController.prototype.updateFreeSpinFirstTime = function () {
    var leftFreeSpinCount = ClassicSlotMan.getInstance().leftFreeSpinCount;
    this._freeSpinLabel.setString(leftFreeSpinCount > 0 ? leftFreeSpinCount: 0);
    Util.scaleCCLabelBMFont(this._freeSpinLabel, 50);
    this._freeSpinLabel.visible = true;
    this._freeSpinItem.visible = true;
    this._autoSpinSprite.visible = false;
};

SlotTaskFunctionController.prototype.updateFreeSpin = function () {
    var leftFreeSpinCount = ClassicSlotMan.getInstance().leftFreeSpinCount;
    this._freeSpinLabel.setString(leftFreeSpinCount > 0 ? leftFreeSpinCount - 1: 0);
    Util.scaleCCLabelBMFont(this._freeSpinLabel, 50);
    this._freeSpinLabel.visible = true;
    this._freeSpinItem.visible = true;
    this._autoSpinSprite.visible = false;
};

SlotTaskFunctionController.prototype.refreshFreeSpin = function () {
    var leftFreeSpinCount = ClassicSlotMan.getInstance().leftFreeSpinCount;
    this._freeSpinLabel.setString(leftFreeSpinCount > 0 ? leftFreeSpinCount: 0);
    Util.scaleCCLabelBMFont(this._freeSpinLabel, 50);
    this._freeSpinLabel.visible = true;
    this._freeSpinItem.visible = true;
    this._autoSpinSprite.visible = false;
};

SlotTaskFunctionController.prototype.enableAutoSpin = function () {
    this.enableStop();
    this._autoSpinStopItem.visible = true;
    this._autoSpinStopItem.enabled = true;
    this._autoSpinSprite.visible = true;
    this._stopItem.visible = false;
    this._spinItem.visible = false;
    this._spinItem.enabled = false;

    if (this._changeBetItem) {
        this._changeBetItem.enabled = false;
    }
    if (this._maxBetItem) {
        this._maxBetItem.enabled = false;
    }
};

SlotTaskFunctionController.prototype.stopAutoSpin = function () {
    this._autoSpinStopItem.enabled = false;
    this._autoSpinSprite.visible = false;
    this._stopItem.visible = false;
};

SlotTaskFunctionController.prototype.enableFreeSpin = function () {
    this.updateFreeSpinFirstTime();
};

SlotTaskFunctionController.prototype.stopFreeSpin = function () {
    this._freeSpinItem.visible = false;
    this._freeSpinLabel.visible = false;

    if(ClassicSlotMan.getInstance().isAutoSpin()) {
        this._autoSpinSprite.visible = true;
    }
};

//SlotTaskFunctionController.prototype.onPaysItemClicked = function (sender) {
//    Config.testIndex++;
//    //Config.testForSoundMode = true;
//    Config.testForSoundSubjectId = ClassicSlotMan.getInstance().subjectId;
//    this.initTaskInfo();
//    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(ClassicSlotMan.getInstance().taskInfo.taskId);
//    PopupMan.popupTaskFailedDlg( function () {
//
//    });
//};

SlotTaskFunctionController.prototype.initTaskInfo = function () {
    if (ClassicSlotMan.getInstance().isTask()) {
        var missionSprite = new cc.Sprite("#magic_world_bottom_loading_progress.png");
        this._taskProgressTimer = new cc.ProgressTimer(missionSprite);
        this._taskProgressTimer.type = cc.ProgressTimer.TYPE_BAR;
        this._taskProgressTimer.setAnchorPoint(cc.p(0.0, 0.5));
        this._taskProgressTimer.setPosition(this._taskProgressBg.getPosition());
        this._taskProgressTimer.midPoint = cc.p(0, 0.5);
        this._taskProgressTimer.barChangeRate = cc.p(1, 0);
        this._taskProgressNode.addChild(this._taskProgressTimer);
        this._taskProgressBg.visible = false;

        var taskConfig = TaskConfigMan.getInstance().getTaskConfig(ClassicSlotMan.getInstance().taskId);
        if (taskConfig) {
            //var taskSplitMsgArr = Util.getSplitArr(taskConfig.getDescription(), 20, " ");
            //var taskMsg = "";
            //for (var i = 0; i < taskSplitMsgArr.length; ++i) {
            //    taskMsg += taskSplitMsgArr[i];
            //    if (i != taskSplitMsgArr.length - 1) {
            //        taskMsg += "\n";
            //    }
            //}
            this._taskInfoLabel.setString(taskConfig.getDescription());
        }
        this._missionDisIcon.visible = false;
        this.refreshTaskInfo();
    } else {
        this._taskInfoLabel.setString("");
        this._taskTimeLabel.setString("");
        this._taskTimeLabel.visible = false;
        this._taskTimeBg.visible = false;
        this._missionDisIcon.visible = true;
        this._taskProgressFrame.visible = false;
        this._taskProgressNode.visible = false;
        this._taskProgressLabel.visible = false;
    }
};

SlotTaskFunctionController.prototype.updateBetItem = function ()
{
    if(ClassicSlotMan.getInstance().isTask())
    {
        var taskInfo = ClassicSlotMan.getInstance().taskInfo;
        switch (taskInfo.taskType) {
            case TaskType.TASK_FREE_MAX_SPIN:
            case TaskType.TASK_SPIN_MAX_BET:
            case TaskType.TASK_LIMITED_BET_AND_DURATION:
            case TaskType.TASK_LIMITED_BET_AND_CHANCE:
                if (this._addBetItem) {
                    this._addBetItem.enabled = false;
                }
                if (this._minusBetItem) {
                    this._minusBetItem.enabled = false;
                };
                break;
            default :
                break;
        }
    }

};

SlotTaskFunctionController.prototype.refreshTaskInfo = function () {
    var slotMan = ClassicSlotMan.getInstance();
    if (slotMan.isTask()) {
        this._taskProgressTimer.setPercentage(slotMan.taskProgress);
        this.showTaskProgress(slotMan.taskProgress);

        var taskInfo = slotMan.taskInfo;
        var taskDetail = slotMan.taskDetail;
        if (!taskInfo) return;
        var taskConfig = TaskConfigMan.getInstance().getTaskConfig(taskInfo.taskId);
        if (taskConfig) {
            cc.spriteFrameCache.addSpriteFrames("casino/mission/dailychallenge_icon.plist",
                "casino/mission/dailychallenge_icon.png");
            var taskSpriteFrame = cc.spriteFrameCache.getSpriteFrame(taskConfig.getSlotIconName());
            if (taskSpriteFrame) {
                this._taskIcon.setSpriteFrame(taskSpriteFrame);
            }
            Util.scaleNode(this._taskIcon, this.MAX_ICON_WIDTH, this.MAX_ICON_WIDTH);
            //Util.scaleCCLabelBMFont(this._taskIcon, this.MAX_ICON_WIDTH);
            this.updateBetItem();
        }
        this._taskIconBg.visible = false;
        switch (taskInfo.taskType) {
            case TaskType.TASK_WIN_IN_LIMITED_TIME:
                this.setTaskTimeLabel(slotMan.taskLeftTime);
                break;
            case TaskType.TASK_WIN_ON_FREE_SPIN:
                var leftSpinCount = taskInfo.taskData.spinLimit - slotMan.taskSpinCount;
                if (leftSpinCount >= 0 && leftSpinCount <= taskInfo.taskData.spinLimit) {
                    this._taskTimeLabel.setString(Util.sprintf("%d Spins", leftSpinCount));
                }
                break;
            case TaskType.TASK_CONSECUTIVE_WIN:
                var consecutiveWinCount = taskDetail.consecutiveWinCount;
                var needConsecutiveWinCount = taskInfo.taskData.needConsecutiveWinCount;
                this._taskTimeLabel.setString(Util.sprintf("%d/%d", consecutiveWinCount, needConsecutiveWinCount));
                break;
            case TaskType.TASK_COLLECT_SYMBOL:
            case TaskType.TASK_COLLECT_SYMBOL_ON_WIN:
            case TaskType.TASK_COLLECT_STACK:
            case TaskType.TASK_WIN_WITH_LISTED_SYMBOLS:
            case TaskType.TASK_COLLECT_LISTED_SYMBOLS:
            case TaskType.TASK_COLLECT_LISTED_SYMBOLS_ON_WINLINE:
            case TaskType.TASK_COLLECT_SYMBOL_ONE_SPIN:
            case TaskType.TASK_COLLECT_SYMBOL_FREE_SPIN:
                this._taskIconBg.visible = false;
            default:
                this._taskTimeLabel.visible = false;
                this._taskTimeBg.visible = false;
                break;
        }
    }
};

/**
 * update task progress from server value
 * @param progressValue
 */
SlotTaskFunctionController.prototype.updateTaskProgress = function (progressValue) {
    if (progressValue < 0 || progressValue > 100) {
        return;
    }
    var taskInfo = ClassicSlotMan.getInstance().taskInfo;
    switch (taskInfo.taskType) {
        case TaskType.TASK_FREE_MAX_SPIN:
            //not update taskProgress from server.
            //this.updateTaskFreeMaxSpin(progressValue);
            break;
        default:
            this._taskProgressTimer.runAction(cc.progressTo(0.5, progressValue));
            this.showTaskProgress(progressValue);
            break;
    };
    this.updateExtraTaskInfoEverySpin();
};

/**
 * schedule left time by client.
 * @param leftTime
 */
SlotTaskFunctionController.prototype.beginScheduleTimeTask = function (leftTime) {
    var taskInfo = ClassicSlotMan.getInstance().taskInfo;
    switch (taskInfo.taskType) {
        case TaskType.TASK_FREE_MAX_SPIN:
            this._taskProgressTimer.runAction(cc.progressTo(leftTime, 100));
            break;
        case TaskType.TASK_WIN_IN_LIMITED_TIME:
            this._taskTimeLabel.visible = true;
            this._taskTimeBg.visible = true;
            this.setTaskTimeLabel(leftTime);
            break;
    }
};

SlotTaskFunctionController.prototype.updateExtraTaskInfoEverySpin = function () {
    var slotMan = ClassicSlotMan.getInstance();
    var taskInfo = ClassicSlotMan.getInstance().taskInfo;
    var taskNewDetail = slotMan.spinResult[0].taskNewDetail;
    switch (taskInfo.taskType) {
        case TaskType.TASK_WIN_ON_FREE_SPIN:
            this._taskTimeLabel.visible = true;
            this._taskTimeBg.visible = true;
            var leftSpinCount = taskInfo.taskData.spinLimit - slotMan.taskSpinCount;
            if (leftSpinCount >= 0 && leftSpinCount <= taskInfo.taskData.spinLimit) {
                this._taskTimeLabel.setString(Util.sprintf("%d Spins", leftSpinCount));
            }
            break;
        case TaskType.TASK_CONSECUTIVE_WIN:
            var consecutiveWinCount = taskNewDetail.consecutiveWinCount;
            var needConsecutiveWinCount = taskInfo.taskData.needConsecutiveWinCount;
            this._taskTimeLabel.setString(Util.sprintf("%d/%d", consecutiveWinCount, needConsecutiveWinCount));
            break;
    };
};

/**
 * update left time by interval time.
 * @param event
 */
SlotTaskFunctionController.prototype.updateTimeTaskEverySecond = function (event) {
    var taskInfo = ClassicSlotMan.getInstance().taskInfo;
    var timeTaskEndTime = ClassicSlotMan.getInstance().timeTaskEndTime;

    switch (taskInfo.taskType) {
        case TaskType.TASK_FREE_MAX_SPIN:
            var leftSecTime = (timeTaskEndTime - Date.now()) / 1000;
            var progressValue = Math.floor((taskInfo.taskData.seconds - leftSecTime) / taskInfo.taskData.seconds * 100);
            this.updateTaskFreeMaxSpin(progressValue);
            break;
        case TaskType.TASK_WIN_IN_LIMITED_TIME:
            var leftTime = timeTaskEndTime - Date.now();
            this.setTaskTimeLabel(leftTime);
            break;
    }
};

/**
 * free max spin update progress.
 * @param realProgressPercentage
 */
SlotTaskFunctionController.prototype.updateTaskFreeMaxSpin = function (realProgressPercentage) {
    this.showTaskProgress(realProgressPercentage);
    var progressPercentage = this._taskProgressTimer.getPercentage();

    if (Math.abs(progressPercentage - realProgressPercentage) > 3) {
        var taskInfo = ClassicSlotMan.getInstance().taskInfo;
        var taskData = taskInfo.taskData;
        var leftTime = Math.floor(taskData.seconds * (100 - realProgressPercentage) / 100);
        this._taskProgressTimer.stopAllActions();
        this._taskProgressTimer.setPercentage(realProgressPercentage);
        this._taskProgressTimer.runAction(cc.progressTo(leftTime, 100));
    }
};

/**
 * @param {Number} leftTime - millionsecond
 */
SlotTaskFunctionController.prototype.setTaskTimeLabel = function (leftTime) {
    if (Math.round(leftTime/1000) >= 1) {
        this._taskTimeLabel.setString(dateFormat(leftTime, "HH:MM:ss", true));
    } else {
        this._taskTimeLabel.setString("00:00:00");
    }
};

SlotTaskFunctionController.prototype.showTaskProgress = function (progressValue) {
    this._taskProgressLabel.setString(Util.sprintf("%s%%", Util.formatAbbrNum(progressValue)));
};

SlotTaskFunctionController.createFromCCB = function (filePath) {
    return Util.loadNodeFromCCB(filePath, null, "SlotFunctionController", new SlotTaskFunctionController());
};

module.exports = SlotTaskFunctionController;
