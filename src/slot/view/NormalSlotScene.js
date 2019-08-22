var SlotScene = require("./SlotScene");
var SpinStep = require("../enum/SpinStep");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var Util = require("../../common/util/Util");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var SlotUIType = require("../events/SlotUIType");
var AudioHelper = require("../../common/util/AudioHelper");
var SceneMan = require("../../common/model/SceneMan");
var SlotTitleController = require("../controller/SlotTitleController");
var PrizePoolController = require("../controller/PrizePoolController");
var DeviceInfo = require("../../common/util/DeviceInfo");
var CommonEvent = require("../../common/events/CommonEvent");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var JackpotStatus = require("../enum/JackpotStatus");
var SlotFunctionControllerFactory = require("../controller/SlotFunctionControllerFactory");
var TaskType = require("../../task/enum/TaskType");
var TaskMan = require("../../task/model/TaskMan");
var PopupMan = require("../../common/model/PopupMan");
var MessageDialogType = require("../../common/events/MessageDialogType");
var TaskEvent = require("../../task/events/TaskEvent");
var MessageDialogData = require("../../common/events/MessageDialogData");

/**
 * Created by alanmars on 15/4/20.
 */
var NormalSlotScene = SlotScene.extend({
    //private static const FACEBOOK_FEED_INTERVAL:Number = 300000;


    /** only for subject has collection task, the value is used to share with facebook friends */
    //collectionReward:Number;

    /**
     * @type {ClassicSlotTitleNode}
     */
    titleNode: null,
    functionNode: null,

    ctor: function () {
        this.slotMan = ClassicSlotMan.getInstance();
        var subject = SlotConfigMan.getInstance().getSubject(this.slotMan.subjectId);
        this.subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);

        this._super();
    },

    createBaseUI: function () {
        this._super();
        this.createTitleNode();
        this.createFunctionNode();
    },

    createTitleNode: function () {
        var subject = SlotConfigMan.getInstance().getSubject(this.slotMan.subjectId);
        var titleCCBName = this.subjectTmpl.spinUiTitleName;
        if (DeviceInfo.isHighResolution()) {
            titleCCBName += "_ipad.ccbi";
        } else {
            titleCCBName += "_iphone.ccbi";
        }
        this.titleNode = SlotTitleController.createFromCCB(titleCCBName);
        this.titleNode.setPosition(cc.winSize.width * 0.5, cc.winSize.height);
        this.addChild(this.titleNode, this.ZORDER_TITLE_UI);
        this.titleNode.controller.showBackItem();
    },

    createFunctionNode: function () {
        if (DeviceInfo.isHighResolution()) {
            this.functionNode = SlotFunctionControllerFactory.create(Util.sprintf("%s.ccbi", this.subjectTmpl.spinUiBottomName), this.subjectTmpl.functionType);
            this.functionNode.setScale(cc.winSize.width / 1024);
        } else {
            this.functionNode = SlotFunctionControllerFactory.create(Util.sprintf("%s.ccbi", this.subjectTmpl.spinUiBottomNameIphone), this.subjectTmpl.functionType);
            this.functionNode.setScale(cc.winSize.width / 1136);
        }
        this.functionNode.setPosition(cc.winSize.width * 0.5, 0);
        this.addChild(this.functionNode, this.ZORDER_SPIN_UI);

        if (this.slotMan.isInFreeSpin) {
            this.functionNode.controller.enableStop();
            this.titleNode.controller.disableButton();
        }
    },

    createExtraUI: function() {
    },

    onEnter: function () {
        this._super();
        this.functionNode.controller.updateBet(this.getCurrentBet());
        this.functionNode.controller.updateLineNum(this.getCurrentLineNum());
        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_UI, this.onUIItemTriggered, this);
    },

    onExit: function () {
        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_UI, this.onUIItemTriggered, this);
        this._super();
    },

    onUIItemTriggered: function (event){
        var slotUIData = event.getUserData();
        switch (slotUIData.uiType){
            case SlotUIType.SLOT_MAP_ITEM_TRIGGERED:
                //this.onMapItemTriggered();
                break;
            case SlotUIType.SLOT_CHAT_ITEM_TRIGGERED:
                //this.onChatItemTriggered();
                break;
            case SlotUIType.SLOT_SPIN_ITEM_TRIGGERED:
                this.onSpinItemTriggered();
                break;
            case SlotUIType.SLOT_STOP_ITEM_TRIGGERED:
                this.onStopItemTriggered();
                break;
            case SlotUIType.SLOT_AUTO_SPIN_ITEM_TRIGGERED:
                this.onAutoSpinItemTriggered();
                break;
            case SlotUIType.SLOT_AUTO_SPIN_STOP_ITEM_TRIGGERED:
                this.onAutoSpinStopItemTriggered();
                break;
            case SlotUIType.SLOT_ADD_BET_ITEM_TRIGGERED:
                this.onAddBetItemTriggered();
                break;
            case SlotUIType.SLOT_MINUS_BET_ITEM_TRIGGERED:
                this.onMinusBetItemTriggered();
                break;
            case SlotUIType.SLOT_MAX_BET_ITEM_TRIGGERED:
                this.onMaxBetItemTriggered();
                break;
            case SlotUIType.SLOT_CHANGE_BET_ITEM_TRIGGERED:
                this.onChangeBetItemTriggered(slotUIData.betLevel);
                break;
            case SlotUIType.SLOT_ADD_LINE_NUM_ITEM_TRIGGERED:
                this.onAddLineNumTriggered();
                break;
            case SlotUIType.SLOT_MINUS_LINE_NUM_ITEM_TRIGGERED:
                this.onMinusLineNumTriggered();
                break;
            case SlotUIType.SLOT_FREE_SPIN_ITEM_TRIGGERED:
                this.onFreeSpinItemTriggered();
                break;
            default:
                break;
        }
    },

    onSpinItemTriggered: function (event) {
        if (!this.slotMan.isAutoSpin()) {
            AudioPlayer.getInstance().stopAllEffects();
        }
        if (this.getSpinEnabled()) {
            if (this.slotMan.nextIsFreeSpin()) {
                this.onSubRoundStartInFreeSpin();
            }
            else {
                this.onRoundStart();
            }
            this.onStartTimeTask();
        }
    },

    onStopItemTriggered: function (event) {
        if (this.isAutoSpin()) {
            this.stopAutoSpin();
            if (this.currentSlotStep == SpinStep.SLOT_SHOW_RESULT || this.currentSlotStep == SpinStep.SLOT_SPIN_END) {
                this.setSpinEnabled(true);
            }
            return;
        }
        if (this.getSpinEnabled()) {
            return;
        }
        if (this.currentSlotStep == SpinStep.SLOT_RESULT_RECEIVED) {
            this.stopEarly();
        }
        else if (this.currentSlotStep < SpinStep.SLOT_RESULT_RECEIVED) {
            this.earlyStop = true;
            this.setCurrentSpinStep(SpinStep.SLOT_SPIN_STOP);
        }
    },

    onAutoSpinStopItemTriggered: function (event) {
        this.onStopItemTriggered(event);
    },

    onAutoSpinItemTriggered: function () {
        this.functionNode.controller.enableAutoSpin();
        this.titleNode.controller.disableButton();
        this.setAutoSpin();
        this.onSpinItemTriggered();
    },

    onAddBetItemTriggered: function () {
        ClassicSlotMan.getInstance().changeBetLevel(1);
        this.functionNode.controller.updateBet(this.getCurrentBet());
    },

    onMinusBetItemTriggered: function () {
        ClassicSlotMan.getInstance().changeBetLevel(-1);
        this.functionNode.controller.updateBet(this.getCurrentBet());
    },

    onAddLineNumTriggered: function () {
        ClassicSlotMan.getInstance().changeLineNum(1);
        this.functionNode.controller.updateLineNum(this.getCurrentLineNum());
    },

    onMinusLineNumTriggered: function () {
        ClassicSlotMan.getInstance().changeLineNum(-1);
        this.functionNode.controller.updateLineNum(this.getCurrentLineNum());
    },

    onMaxBetItemTriggered: function () {
         ClassicSlotMan.getInstance().useMaxBetLevel();
         this.functionNode.controller.updateBet(this.getCurrentBet());
    },

    onChangeBetItemTriggered: function (betLevel) {
         ClassicSlotMan.getInstance().setBetLevel(betLevel);
         this.functionNode.controller.updateBet(this.getCurrentBet());
    },

    onFreeSpinItemTriggered: function () {
        if (this.getSpinEnabled()) {
            this.onSpinItemTriggered();
        } else {
            this.onStopItemTriggered();
        }
    },

    canStartSpin: function () {
        if (this.currentSlotStep !== SpinStep.SLOT_NEXT_AUTO_SPIN && !this.functionNode.controller.hasWinAnimStopped()) {
            this.functionNode.controller.stopWinAnim();
            return false;
        } else if (this.currentSlotStep === SpinStep.SLOT_NEXT_AUTO_SPIN && !this.functionNode.controller.hasWinAnimStopped()) {
            this.functionNode.controller.stopWinAnim();
        }
        return this._super();
    },

    onShowFreeSpinWelcome: function () {
        this.functionNode.controller.enableFreeSpin();
        this.slotMan.isInFreeSpin = true;
        PopupMan.popupFreeSpinDlg(this.slotMan.leftFreeSpinCount, MessageDialogType.SLOT_START_FREE_SPIN);
    },

    onShowFreeSpinResult: function () {
        this.functionNode.controller.stopFreeSpin();
        if(this.slotMan.totalWinChips > 0) {
            PopupMan.popupSlotsRewardsDlg(this.slotMan.totalWinChips, MessageDialogType.SLOT_FREE_SPIN_END);
        }
        else {
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(MessageDialogType.SLOT_FREE_SPIN_END));
        }
    },

    updateOutput: function (txt) {
        this.functionNode.controller.updateOutput(txt);
    },

    updateFreeSpin: function () {
        if (this.isInFreeSpin()) {
            this.functionNode.controller.updateFreeSpin();
        }
    },

    setSpinEnabled: function (value) {
        this._super(value);
        if (value && !this.isAutoSpin() && !this.slotMan.nextIsFreeSpin()) {
            this.functionNode.controller.enableSpin();
            this.titleNode.controller.enableButton();
        }
    },

    setCurrentSpinStep: function (value) {
        this._super(value);
        switch (value) {
            case SpinStep.SLOT_RESULT_RECEIVED:
            {
                if (this.earlyStop) {
                    this.stopEarly();
                }
            }
                break;
        }

        if (!this.isAutoSpin()) {
            switch (value) {
                case SpinStep.SLOT_SPIN_START:
                    this.functionNode.controller.enableStop();
                    this.titleNode.controller.disableButton();
                    break;
                case SpinStep.SLOT_SPIN_STOP:
                    this.functionNode.controller.disableStop();
                    break;
            }
        }
    },

    stopAutoSpin: function () {
        this._super();
        this.functionNode.controller.stopAutoSpin();
    },

    onSelectJackpotBet: function () {
        this._super();
        this.functionNode.controller.updateCurrentBet();
    },

    updateTaskProgress: function () {
        this._super();
        var taskInfo = this.slotMan.taskInfo;
        if (taskInfo) {
            this.functionNode.controller.updateTaskProgress(this.spinPanel.taskProgress);
        }
        if (this.spinPanel.taskProgress == 100) {
            this.slotMan.unscheduleTimeTask();
        }
    },

    updateDailyTaskProgress: function () {
        this._super();
        var syncDailyTasks = this.slotMan.syncDailyTasks;
        var haveCompletedDailyTask = false;
        if (syncDailyTasks && syncDailyTasks.length > 0) {
            for (var i = 0; i < syncDailyTasks.length; ++i) {
                var isCompleted = syncDailyTasks[i].completed;
                if (isCompleted) {
                    haveCompletedDailyTask = true;
                    break;
                }
            }
        }
        if (haveCompletedDailyTask) {
            EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_DAILY_TASK_COMPLETED);
        }
    },

    onStartTimeTask: function () {
        var taskInfo = this.slotMan.taskInfo;
        if (taskInfo) {
            if (TaskType.isTimeTask(taskInfo.taskType)) {
                if (this.slotMan.canStartTimeTask()) {
                    this.functionNode.controller.beginScheduleTimeTask(this.slotMan.taskLeftTime);
                    this.slotMan.scheduleTimeTask();
                }
            }
        }
    },

    showTaskFailedDlg: function () {
        if (this.slotMan.taskProgress >= 100) return;
        if (this.isAutoSpin()) {
            this.stopAutoSpin();
            this.setSpinEnabled(true);
        }

        if(!this.hasPopupTaskEndDlg) {
            PopupMan.popupTaskFailedDlg(function () {
                try {
                    this.slotMan.resetTask();
                    this.functionNode.controller.setWin(0);
                    this.hasPopupTaskEndDlg = false;
                }
                catch (e) {
                }
            }.bind(this));

            this.hasPopupTaskEndDlg = true;
        }
    }
});

NormalSlotScene.create = function () {
    return new NormalSlotScene();
};

module.exports = NormalSlotScene;