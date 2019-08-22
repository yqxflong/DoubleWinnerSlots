/**
 * Created by alanmars on 15/4/17.
 */
var SlotConfigMan = require("../config/SlotConfigMan");
var SubjectTmpl = require("../entity/SubjectTmpl");
var SpinPanel = require("../entity/SpinPanel");
var SpinStep = require("../enum/SpinStep");
var DrumMode = require("../enum/DrumMode");
var SymbolId = require("../enum/SymbolId");
var WinLevel = require("../enum/WinLevel");
var SymbolOpType = require("../enum/SymbolOpType");
var SpinLayer = require("./SpinLayer");
var Util = require("../../common/util/Util");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogType = require("../../common/events/MessageDialogType");
var SlotNoticeType = require("../events/SlotNoticeType");
var SlotEvent = require("../events/SlotEvent");
var SlotNoticeUserData = require("../events/SlotNoticeUserData");
var SlotModifyWinRateUserData = require("../events/SlotModifyWinRateUserData");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var SlotSpinStepEndUserData = require("../events/SlotSpinStepEndUserData");
var SlotMan = require("../model/SlotMan");
var SpinLayerFactory = require("./SpinLayerFactory");
var AdControlMan = require("../../ads/model/AdControlMan");
var BigWinController = require("../controller/BigWinController");
var JackpotController = require("../controller/JackpotController");
var PopupMan = require("../../common/model/PopupMan");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var AudioSlotHelper = require("../../common/audio/AudioSlotHelper");
var JackpotType = require("../enum/JackpotType");
var JackpotStatus = require("../enum/JackpotStatus");
var TaskConfigMan = require("../../task/config/TaskConfigMan");
var TaskType = require("../../task/enum/TaskType");
var TaskEvent = require("../../task/events/TaskEvent");
var PlayerMan = require("../../common/model/PlayerMan");

var SlotScene = cc.Layer.extend({
    SPIN_INTERVAL_WITHOUT_WIN: 0.5,
    SPIN_INTERVAL_WITH_WIN: 3.2,

    ZORDER_SPIN_LAYER: 1,
    ZORDER_COLLECT_BAR: 10,
    ZORDER_ANIMATION: 20,
    ZORDER_TITLE: 100,
    ZORDER_SPIN_UI: 101,
    ZORDER_TITLE_UI: 102,
    ZORDER_PRIZE_POOL: 201,

    /**
     * @type {SlotMan}
     */
    slotMan: null,
    /**
     * @type {SubjectTmpl}
     */
    subjectTmpl: null,

    currentSlotStep: 0,
    earlyStop: false,
    /**
     * @type {SpinPanel}
     */
    spinPanel: null,
    /**
     * @type {Array.<SpinLayer>}
     */
    spinLayers: null,

    /**
     * @type {cc.Node}
     */
    animationNode: null,
    hasSpecialAnim: false,

    /**
     * eventSubType=>eventCount
     * @type {Object.<number, number>}
     */
    eventCountMap: null,

    playingBgMusic: false,
    noSpinInterval: 0,
    hasPopupTaskEndDlg: false,

    //facebookFeedCD:Number;

    ctor: function () {
        this._super();

        this.earlyStop = false;
        this.spinLayers = [];
        this.hasSpecialAnim = false;
        this.eventCountMap = {};

        this.playingBgMusic = false;
        this.noSpinInterval = 0;
        this.hasPopupTaskEndDlg = false;
        //this.facebookFeedCD = 0;

        this.initUI();
    },

    initUI: function () {
        this.loadSlotAudioResource();
        this.createBaseUI();
        this.createExtraUI();
        this.onEnterRoomExtraInfo();
    },

    createBaseUI: function () {
        var bgNode;
        if(this.slotMan.taskId != 0) {
            var taskConfig = TaskConfigMan.getInstance().getTaskConfig(this.slotMan.taskId);
            if(taskConfig) {
                var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
                bgNode = new cc.Sprite(themeConfig.slotBg);
            }
        }
        else {
            bgNode = new cc.Sprite(this.subjectTmpl.bgName);
        }

        var winSize = cc.director.getWinSize();
        bgNode.setPosition(winSize.width * 0.5, winSize.height * 0.5);
        this.addChild(bgNode);

        for (var i = 0; i < this.subjectTmpl.panels.length; ++i) {
            var panelConfig = this.subjectTmpl.panels[i];
            var spinLayer = SpinLayerFactory.createSpinLayer(panelConfig.spinLayerType, this.subjectTmpl.subjectTmplId, panelConfig.panelId);
            spinLayer.scaleX = panelConfig.spinRegionScale.x;
            spinLayer.scaleY = panelConfig.spinRegionScale.y;
            this.addChild(spinLayer, this.ZORDER_SPIN_LAYER);
            if (i < this.subjectTmpl.normalSpinPanels) {
                spinLayer.setVisible(true);
            } else {
                spinLayer.setVisible(false);
            }
            this.spinLayers.push(spinLayer);
        }

        this.animationNode = new cc.Node();
        this.addChild(this.animationNode, this.ZORDER_ANIMATION);
    },

    createExtraUI: function () {
    },

    onEnter: function () {
        this._super();

        EventDispatcher.getInstance().addEventListener(CommonEvent.MESSAGE_DIALOG, this.onMessageDialogEvent, this);

        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_SPIN_STEP_END, this.onSpinStepEndEvent, this);

        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_OUTPUT, this.onOutput, this);

        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_NOTICE, this.onNoticeEvent, this);
        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_MODIFY_WIN_RATE, this.handleModifyWinRate, this);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function (keyCode, event) {
                if(keyCode == cc.KEY.back){
                    EventDispatcher.getInstance().dispatchEvent(CommonEvent.BACK_CLICKED);
                }
            }
        },this);

        this.onEnterRoomInit();
    },

    onExit: function () {
        EventDispatcher.getInstance().removeEventListener(CommonEvent.MESSAGE_DIALOG, this.onMessageDialogEvent, this);

        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_SPIN_STEP_END, this.onSpinStepEndEvent, this);

        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_OUTPUT, this.onOutput, this);

        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_NOTICE, this.onNoticeEvent, this);
        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_MODIFY_WIN_RATE, this.handleModifyWinRate, this);

        AudioPlayer.getInstance().stopMusic();
        AudioPlayer.getInstance().stopAllEffects();

        this.slotMan.leftRoom();

        this._super();
    },

    onEnterRoomInit: function () {
        if (this.checkAndShowTaskInfo()) {
        } else {
            this.onShowTaskInfoFinished();
        }
    },

    checkAndShowTaskInfo: function () {
        if (this.slotMan.taskProgress == 0 && this.slotMan.taskInfo) {
            var self = this;
            var taskConfig = TaskConfigMan.getInstance().getTaskConfig(this.slotMan.taskInfo.taskId);
            PopupMan.popupTaskStartDlg(taskConfig, function () {
                self.onShowTaskInfoFinished();
            });
            return true;
        }
        return false;
    },

    onShowTaskInfoFinished: function () {
        if (this.slotMan.isInFreeSpin) {
            this.setSpinEnabled(true);
            this.onShowFreeSpinWelcome();
            AudioPlayer.getInstance().playEffectByKey("slots/bonus-game-appear");
        } else {
            var subject = SlotConfigMan.getInstance().getSubject(this.slotMan.subjectId);
            if (subject.jackpotStatus == JackpotStatus.JACKPOT_STATUS_OPEN && this.slotMan.getJackpotType() == JackpotType.JACKPOT_TYPE_BET_ACCU) {
                PopupMan.popupJackpotSelectBetDlg(this.slotMan.jackpotSubInfo);
            }
        }
    },

    /**
     * when jackpot select bet dlg closed,do this
     */
    onSelectJackpotBet: function () {
    },

    update: function (dt) {
        this.noSpinInterval += dt;
        if (this.noSpinInterval >= 30 && this.noSpinInterval - dt < 30) {
            AudioPlayer.getInstance().pauseMusicSlowly();
        }
        if (this.noSpinInterval >= 120 && this.noSpinInterval - dt < 120) {
            //PopupMan.popupNoSpinWarning();
        }
    },

    onMessageDialogEvent: function (event) {
        /**
         * @type {MessageDialogData}
         */
        var userData = event.getUserData();
        switch (userData.dialogType) {
            case MessageDialogType.SLOT_BIG_WIN:
            case MessageDialogType.SLOT_JACKPOT:
                this.checkDelayEvents();
                break;
            case MessageDialogType.COMMON_LEVEL_UP:
                this.checkDelayEvents();
                break;
            case MessageDialogType.SLOT_AWARD_BONUS:
                this.onAwardBonusEnd();
                break;
            case MessageDialogType.SLOT_START_FREE_SPIN:
                this.onFreeSpinStart();
                break;
            case MessageDialogType.SLOT_FREE_SPIN_END:
                this.onRoundEndInFreeSpin();
                break;
            case MessageDialogType.SLOT_BONUS_END:
                if (this.isInFreeSpin()) {
                    this.onBonusEndInFreeSpin();
                }
                else {
                    this.onBonusEnd();
                }
                break;
            case MessageDialogType.SLOT_SELECT_JACKPOT_BET:
                this.onSelectJackpotBet();
                break;
            case MessageDialogType.SLOT_STOP_AUTO_SPIN:
                if (this.isAutoSpin()) {
                    this.stopAutoSpin();
                    this.setSpinEnabled(true);
                }
                break;
            case MessageDialogType.SLOT_TASK_FAILED:
                this.showTaskFailedDlg();
                break;
        }
    },

    /**
     * @param {cc.EventCustom} event
     */
    onSpinStepEndEvent: function (event) {
        /**
         * @type {SlotSpinStepEndUserData}
         */
        var userData = event.getUserData();
        if (this.eventCountMap[userData.subType] == null) {
            this.eventCountMap[userData.subType] = 0;
        }
        this.eventCountMap[userData.subType] += 1;
        if (this.isInFreeSpin()) {
            this.handleSpinStepEventInFreeSpin(userData.subType, userData.panelId);
        }
        else {
            this.handleSpinStepEvent(userData.subType, userData.panelId);
        }
    },

    handleSpinStepEvent: function (eventSubType, panelId) {
        if (this.eventCountMap[eventSubType] != this.subjectTmpl.normalSpinPanels) return;

        switch (eventSubType) {
            case SlotSpinStepEndType.SLOT_STEP_SPIN_END:
                this.onSpinEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_JACKPOT_END:
                this.onBlinkJackpotEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_ALL_WIN_LINE_END:
                this.onBlinkAllLineEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_WIN_LINE_ROUND_END:
                this.onBlinkEachLineEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END:
                this.onBlinkBonusLineEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_SCATTER_END:
                this.onBlinkScatterEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_SPECIAL_ANIMATION_END:
                this.onSpecialAnimationEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_SHOW_CONNECTED_AREA_END:
                this.onShowConnectedAreaEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BONUS_WELCOME_END:
                this.onStartBonus();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BONUS_RESULT_END:
                this.onBackFromBonus();
                break;
            case SlotSpinStepEndType.SLOT_STEP_SHOW_SPECIAL_TASK_ANIMATION_END:
                this.onShowSpecialTaskAnimationEnd();
                break;
        }

        this.eventCountMap[eventSubType] = 0;
    },

    handleSpinStepEventInFreeSpin: function (eventSubType, panelId) {
        if (this.eventCountMap[eventSubType] != this.subjectTmpl.freeSpinPanels) return;

        switch (eventSubType) {
            case SlotSpinStepEndType.SLOT_STEP_SPIN_END:
                this.onSpinEndInFreeSpin();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_JACKPOT_END:
                this.onBlinkJackpotEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_ALL_WIN_LINE_END:
                this.onBlinkAllLineEndInFreeSpin();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_WIN_LINE_ROUND_END:
                this.onBlinkEachLineEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END:
                this.onBlinkBonusLineEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BLINK_SCATTER_END:
                this.onBlinkScatterEndInFreeSpin();
                break;
            case SlotSpinStepEndType.SLOT_STEP_SPECIAL_ANIMATION_END:
                this.onSpecialAnimationEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_SHOW_CONNECTED_AREA_END:
                this.onShowConnectedAreaEnd();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BONUS_WELCOME_END:
                this.onStartBonus();
                break;
            case SlotSpinStepEndType.SLOT_STEP_BONUS_RESULT_END:
                this.onBackFromBonus();
                break;
            case SlotSpinStepEndType.SLOT_STEP_SHOW_SPECIAL_TASK_ANIMATION_END:
                this.onShowSpecialTaskAnimationEndInFreeSpin();
                break;
        }

        this.eventCountMap[eventSubType] = 0;
    },

    /**
     * @param {cc.EventCustom} event
     */
    onNoticeEvent: function (event) {
        /**
         * @type {SlotNoticeUserData}
         */
        var userData = event.getUserData();
        switch (userData.noticeType) {
            case SlotNoticeType.SLOT_NOTICE_SPIN_RESULT_RECEIVED:
                this.onSpinResultReceived();
                break;
            case SlotNoticeType.SLOT_NOTICE_SPIN_RESULT_START:
            {
                if (this.isInFreeSpin()) {
                    this.onSpinResultShowInFreeSpin();
                }
                else {
                    this.onSpinResultShow();
                }
                break;
            }
            case SlotNoticeType.SLOT_NOTICE_FIVE_OF_KIND:
                this.onShowFiveOfKind();
                break;
            case SlotNoticeType.SLOT_NOTICE_BIG_WIN:
                this.onShowBigWin();
                break;
            case SlotNoticeType.SLOT_NOTICE_MEGA_WIN:
                this.onShowMegaWin();
                break;
            case SlotNoticeType.SLOT_NOTICE_COLOSSAL_WIN:
                this.onShowColossalWin();
                break;
            case SlotNoticeType.SLOT_NOTICE_SPECIAL_ANIMATION:
                this.onSpecialAnimation();
                break;
            case SlotNoticeType.SLOT_NOTICE_SUBJECT_NOTIFY:
                this.onSubjectNotify();
                break;
            case SlotNoticeType.SLOT_NOTICE_BONUS:
                this.onShowBonusWelcome();
                break;
            case SlotNoticeType.SLOT_NOTICE_JACKPOT:
                this.onShowJackpot();
                break;
            case SlotNoticeType.SLOT_NOTICE_LEVEL_UP:
                PopupMan.popupLevelUpDialog(this.slotMan.syncExp.level, this.slotMan.syncExp.rewardChips);
                break;
            case SlotNoticeType.SLOT_NOTICE_SHOW_CONNECTED_AREA:
                this.onShowConnectedArea();
                break;
        }
    },

    onRoundStart: function () {
        if (!this.canStartSpin()) {
            if(this.isAutoSpin()) {
                this.stopAutoSpin();
                this.setSpinEnabled(true);
            }
            return;
        }

        this.takeBet();
        this.slotMan.resetWinChips();
        this.slotMan.resetSpinResult();

        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, null);
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);

        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onRoundStart();
        }
        this.updateOutput("Good Luck!");
        this.onSubRoundStart();
    },

    onSubRoundStart: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_SUB_ROUND_START);
        this.setSpinEnabled(false);
        this.slotMan.isInFreeSpin = false;
        this.earlyStop = false;
        this.hasSpecialAnim = false;
        this.playBgMusic();
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].setInFreeSpin(this.isInFreeSpin());
            this.spinLayers[spinLayerIndices[i]].onSubRoundStart();
        }
        this.updateOutput("");
        this.slotMan.getSpinResultFromServer();
        this.onSpinStart();
    },

    onSpinStart: function () {
        AudioHelper.playSlotEffect("fx-spin");//, this.subjectTmpl.resRootDir);
        this.hasSpecialAnim = false;
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSpinStart();
        }
        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_START);
    },

    onSpinResultReceived: function () {
        this.hasSpecialAnim = false;
        this.spinPanel = this.slotMan.getSpinPanel();
        this.handleSpinResult();
        this.handleWinRate();
        this.handleMegaSymbols(this.spinPanel);
        this.onCheckSpecialInfo();
        this.sendSpinResultToSpinLayers();
        this.onCheckConnectedAreas();
        this.setCurrentSpinStep(SpinStep.SLOT_RESULT_RECEIVED);
    },

    handleSpinResult: function () {
        if (this.spinPanel.jackpotTriggered) {
            this.slotMan.jackpotWinCoins = this.spinPanel.jackpotWin;
            this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_JACKPOT);
        }
        else {
            if (this.spinPanel.winLevel == WinLevel.MEGA_WIN) {
                this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_MEGA_WIN);
            }
            else if (this.spinPanel.winLevel == WinLevel.BIG_WIN) {
                this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_BIG_WIN);
            }
            else {
                /*
                 var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
                 var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
                 if (subject != null && (subjectTmpl.specialPayTables == null || subjectTmpl.specialPayTables.length <= 0)) {
                 for (var i = 0; i < spinPanel.winLines.length; ++i) {
                 var winLine = spinPanel.winLines[i];
                 if (winLine.num == this.FIVE_OF_A_KIND) {
                 this.noticeEventList.push(SlotNoticeType.SLOT_NOTICE_FIVE_OF_KIND);
                 break;
                 }
                 }
                 }
                 */
            }
        }

        this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_SPIN_RESULT_START);
    },

    handleWinRate: function () {
        this.slotMan.updateCurChips();
        this.slotMan.setCurWinChips(this.spinPanel.chips);
    },

    /**
     * @param {cc.EventCustom} event
     */
    handleModifyWinRate: function (event) {
        /**
         * @type {SlotModifyWinRateUserData}
         */
        var userData = event.getUserData();
        this.modifyWinRate(userData.delta);
    },

    modifyWinRate: function (value) {
        this.slotMan.updateCurChips();
        this.slotMan.addCurWinChips(value);
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);
    },

    sendSpinResultToSpinLayers: function () {
        var i;
        var spinLayerIndices = this.getSpinLayerIndices();
        for (i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSpinResultReceived(this.spinPanel);
        }

        var drumState = [];
        var spinRowCounts = this.calSpinRowCountWhenResultReceived(drumState);
        var bonus = this.hasBonus() || this.hasScatter() || this.hasJackpot();
        for (i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].setSpinRowCounWhenResultReceived(spinRowCounts);
            this.spinLayers[spinLayerIndices[i]].setDrumMode(drumState, bonus);
        }
    },

    stopEarly: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_STOP);
        var maxSkipRowCount = this.getMaxSkipRowCountWhenSpinCompleted();
        var spinRowCounts = [];
        for (var col = 0; col < this.subjectTmpl.reelCol; ++col) {
            spinRowCounts[col] = maxSkipRowCount;
        }
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].setEarlyStop(true);
            this.spinLayers[spinLayerIndices[i]].setSpinRowCounWhenResultReceived(spinRowCounts);
        }
        this.earlyStop = false;
    },

    onSpinEnd: function () {
        /*
         if (!this.hasSpecialAnim) {
         this.showTotalWin();
         }
         */
        if(this.checkAndShowJackpot()) {
        }
        else {
            this.onBlinkJackpotEnd();
        }

        this.showAds();
    },

    showAds: function () {
        if (this.slotMan.isTask() && this.slotMan.taskInfo &&
            (this.slotMan.taskInfo.taskType == TaskType.TASK_FREE_MAX_SPIN
              || this.slotMan.taskInfo.taskType == TaskType.TASK_LIMITED_BET_AND_DURATION )) {
            //in task mode, in free max spin task, not show ads.
        } else {
            AdControlMan.getInstance().slotSceneShowAd();
        }
    },

    onSpinResultShow: function () {
        if (!this.hasSpecialAnim) {
            this.showTotalWin();
        }

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        if (this.checkAndShowWinLine()) {
            //if (!this.hasBonus() && !this.hasScatter()) {
            //    if (this.checkTaskProgressCompletedAndShow()) {
            //    }
            //    else {
            //        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_END);
            //        this.setSpinEnabled(true);
            //    }
            //}
        }
        else if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onSubRoundEnd();
        }
    },

    onBonusEnd: function () {
        AudioPlayer.getInstance().playEffectByKey("slots/bonus-cheer");
        this.onSubRoundEnd();
    },

    onFreeSpinStart: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].resetColumnBg(true, true);
        }

        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.startFreeSpin, this)));
        this.onStartTimeTask();
    },

    startFreeSpin: function () {
        this.setSpinEnabled(true);
        this.onRoundStartInFreeSpin();
    },

    onFreeSpinEnd: function () {
        this.onShowFreeSpinResult();
    },

    onSubRoundEnd: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSubRoundEnd();
        }
        this.onRoundEnd();
    },

    onRoundEnd: function () {
        cc.log("onRoundEnd");
        if (this.slotMan.nextIsFreeSpin()) {
            this.onShowFreeSpinWelcome();
        }
        else if (this.checkTaskProgressCompletedAndShow()) {
        }
        else if (this.isAutoSpin()) {
            this.onNextAutoSpin();
            this.setSpinEnabled(true);
        }
        else {
            this.setCurrentSpinStep(SpinStep.SLOT_SPIN_END);
            this.setSpinEnabled(true);
        }
    },

    playSubjectEffect: function (winStr) {
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/{0}/{1}", this.subjectTmpl.resRootDir, winStr));
    },

    onBlinkJackpotEnd: function () {
        this.checkDelayEvents();
    },

    onBlinkAllLineEnd: function () {
        this.showSpecialTaskAnimation();
    },

    onShowSpecialTaskAnimationEnd: function () {
        if (this.checkAndShowBonusOrScatter()) {
        }
        else if (!this.isAutoSpin()) {
            var spinLayerIndices = this.getSpinLayerIndices();
            for (var i = 0; i < spinLayerIndices.length; ++i) {
                this.spinLayers[spinLayerIndices[i]].blinkWinLineInTurn();
            }
            this.onSubRoundEnd();
        }
        else {
            this.onSubRoundEnd();
        }
    },

    onBlinkEachLineEnd: function () {
        if (this.isAutoSpin()) {
            this.onNextAutoSpin();
        }
        else {
            var spinLayerIndices = this.getSpinLayerIndices();
            for (var i = 0; i < spinLayerIndices.length; ++i) {
                this.spinLayers[spinLayerIndices[i]].blinkAllWinLines();
            }
        }
    },

    onBlinkBonusLineEnd: function () {
        this.onShowBonusWelcome();
    },

    onBlinkScatterEnd: function () {
        this.onSubRoundEnd();
    },

    onRoundStartInFreeSpin: function () {
        this.slotMan.resetWinChips();

        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, null);
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);

        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onRoundStart();
        }
        this.onSubRoundStartInFreeSpin();
    },

    onSubRoundStartInFreeSpin: function () {
        if (!this.slotMan.nextIsFreeSpin()) {
            return;
        }
        if (!this.getSpinEnabled()) {
            return;
        }

        this.earlyStop = false;
        this.hasSpecialAnim = false;
        this.playBgMusic();
        this.setCurrentSpinStep(SpinStep.SLOT_SUB_ROUND_START);
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].setInFreeSpin(this.isInFreeSpin());
            this.spinLayers[spinLayerIndices[i]].onSubRoundStart();
        }
        this.setSpinEnabled(false);

        this.slotMan.resetCurWinChips();
        this.slotMan.getSpinResultFromServer();

        this.updateOutput(Util.sprintf("Free spins left: %d", this.slotMan.leftFreeSpinCount > 0 ? this.slotMan.leftFreeSpinCount - 1 : 0));
        this.updateFreeSpin();
        this.onSpinStartInFreeSpin();
    },

    onSpinStartInFreeSpin: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_START);
        AudioHelper.playSlotEffect("fx-spin");//, this.subjectTmpl.resRootDir);
        this.hasSpecialAnim = false;
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSpinStart();
        }
    },

    onSpinEndInFreeSpin: function () {
        this.onSpinEnd();
    },

    onSpinResultShowInFreeSpin: function () {
        if (!this.hasSpecialAnim) {
            this.showTotalWin();
        }

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        if (this.checkAndShowWinLine()) {
        }
        else if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onSubRoundEndInFreeSpin();
        }
    },

    onBonusEndInFreeSpin: function () {
        AudioPlayer.getInstance().playEffectByKey("slots/bonus-cheer");
        this.onSubRoundEndInFreeSpin();
    },

    onSubRoundEndInFreeSpin: function () {
        this.updateOutput("");
        this.setSpinEnabled(false);
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSubRoundEnd();
        }
        this.slotMan.isInFreeSpin = this.slotMan.nextIsFreeSpin();
        if (!this.slotMan.nextIsFreeSpin()) {
            this.onFreeSpinEnd();
        }
        else {
            this.onNextFreeSpin();
            this.setSpinEnabled(true);
        }
    },

    onRoundEndInFreeSpin: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].resetColumnBg(false, true);
        }

        this.updateOutput("");
        if (this.checkTaskProgressCompletedAndShow()) {
        }
        else {
            this.setCurrentSpinStep(SpinStep.SLOT_SPIN_END);
            this.setSpinEnabled(true);
            if (this.isAutoSpin()) {
                this.onNextAutoSpin();
                this.setSpinEnabled(true);
            }
        }
    },

    onBlinkAllLineEndInFreeSpin: function () {
        this.showSpecialTaskAnimation();
    },

    onShowSpecialTaskAnimationEndInFreeSpin: function () {
        if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onSubRoundEndInFreeSpin();
        }
    },

    onBlinkScatterEndInFreeSpin: function () {
        this.onSubRoundEndInFreeSpin();
    },

    onSpecialAnimationEnd: function () {
        if (this.hasSpecialAnim) {
            this.showTotalWin();
        }
        this.checkDelayEvents();
    },

    onSpecialAnimation: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSpecialAnimation();
        }
        this.setCurrentSpinStep(SpinStep.SLOT_SPECIAL_ANIMATION);
    },

    onShowConnectedAreaEnd: function () {
        this.checkDelayEvents();
    },

    onShowConnectedArea: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onShowConnectedArea();
        }
    },

    onSubjectNotify: function () {
    },

    onEnterRoomExtraInfo: function () {
    },

    loadSlotAudioResource: function () {
        var taskConfig = TaskConfigMan.getInstance().getTaskConfig(this.slotMan.taskId);
        if(taskConfig) {
            var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
            AudioSlotHelper.downloadSlotAudioRes(themeConfig.themeAudio);
        }
        else {
            AudioSlotHelper.downloadSlotAudioRes(this.subjectTmpl.musicDownloadDir);
        }
    },

    onCheckConnectedAreas: function () {
    },

    onCheckSpecialInfo: function () {
    },

    onNextFreeSpin: function () {
        this.runAction(cc.sequence(cc.delayTime(this.getNextSpinInterval()), cc.callFunc(this.onSubRoundStartInFreeSpin, this)));
    },

    onNextAutoSpin: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_NEXT_AUTO_SPIN);
        this.runAction(cc.sequence(cc.delayTime(this.getNextSpinInterval()), cc.callFunc(this.onRoundStart, this)));
    },

    getNextSpinInterval: function () {
        var nextInterval;
        if (this.spinPanel.chips > 0) {
            var winLevel = this.spinPanel.winLevel;
            if (winLevel < WinLevel.BIG_WIN) {
                var winEffect = this.subjectTmpl.getWinEffect(winLevel);
                if (winEffect) {
                    nextInterval = winEffect.effectDuration;
                } else {
                    nextInterval = this.SPIN_INTERVAL_WITH_WIN;
                }
            } else {
                nextInterval = this.SPIN_INTERVAL_WITH_WIN;
            }
        } else {
            nextInterval = this.SPIN_INTERVAL_WITHOUT_WIN;
        }
        return nextInterval;
    },

    checkDelayEvents: function () {
        this.slotMan.dispatchNextNoticeEvent();
    },

    onShowBonusWelcome: function () {
    },

    onStartBonus: function () {
    },

    onBackFromBonus: function () {
        //When back from bonus, the background music is stopped by bonus
        this.playingBgMusic = false;
        this.slotMan.curWinChips = this.slotMan.bonusWin;
        this.slotMan.updateCurChips();
        this.slotMan.addCurWinChips(this.slotMan.bonusWin);
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);

        if (this.isInFreeSpin()) {
            this.onBonusEndInFreeSpin();
        }
        else {
            this.onBonusEnd();
        }
    },

    onShowJackpot: function () {
        var jackpotDlg = JackpotController.createFromCCB();
        jackpotDlg.controller.initWith(this.slotMan.jackpotWinCoins);
        jackpotDlg.controller.popup();
        var winEffectName = this.getWinEffectName(this.spinPanel.winLevel);
        AudioSlotHelper.playSlotWinEffect(winEffectName);
    },

    showBonusResult: function () {
    },

    onShowFreeSpinWelcome: function () {
        this.slotMan.isInFreeSpin = true;
        PopupMan.popupFreeSpinDlg(this.slotMan.leftFreeSpinCount, MessageDialogType.SLOT_START_FREE_SPIN);
    },

    onShowFreeSpinResult: function () {
        PopupMan.popupSlotsRewardsDlg(this.slotMan.totalWinChips, MessageDialogType.SLOT_FREE_SPIN_END);
    },

    onShowFiveOfKind: function () {
    },

    onShowBigWin: function () {
        var winEffect = this.subjectTmpl.getWinEffect(this.spinPanel.winLevel);
        var winEffectName = this.getWinEffectName(this.spinPanel.winLevel);
        var bigWinDlg = BigWinController.createFromCCB();
        bigWinDlg.controller.initWith(this.slotMan.curWinChips, winEffectName, winEffect.effectDuration);
        bigWinDlg.controller.popup();
    },

    onShowMegaWin: function () {
        this.onShowBigWin();
    },

    onShowColossalWin: function () {
        this.onShowBigWin();
    },

    onTaskComplete: function () {
    },

    onAwardBonusEnd: function () {
    },

    shareWithFacebook: function (kind) {
    },

    getWinEffectName: function (winLevel) {
        var taskConfig = TaskConfigMan.getInstance().getTaskConfig(this.slotMan.taskId);
        if(taskConfig) {
            var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
            switch(winLevel) {
                case 1:
                    return Util.sprintf("slots/%s/small-win", themeConfig.themeAudio);
                    break;
                case 2:
                    return Util.sprintf("slots/%s/mid-win", themeConfig.themeAudio);
                    break;
                case 3:
                    return Util.sprintf("slots/%s/big-win", themeConfig.themeAudio);
                    break;
                case 4:
                    return Util.sprintf("slots/%s/big-win", themeConfig.themeAudio);
                    break;
                default:
                    break;
            }
        }
        else {
            var winEffect = this.subjectTmpl.getWinEffect(winLevel);
            return winEffect.effectName;
        }

        return "";
    },

    onOutput: function (event) {
        var userData = event.getUserData();
        this.updateOutput(userData.output);
    },

    onShowParticle: function (a_particleTexPath, a_beginPos, a_endPos, a_duration, a_particleNum, a_particleSize) {
    },

    takeBet: function () {
        if (this.slotMan.isFreeTask()) {
            this.slotMan.costSpinBet(0);
        } else {
            this.slotMan.costSpinBet(this.getCurrentTotalBet());
        }
    },

    updateOutput: function (txt) {
    },

    updateFreeSpin: function () {
    },

    canStartSpin: function () {
        if (!this.getSpinEnabled() && !this.isAutoSpin()) {
            return false;
        }
        if (!this.slotMan.isFreeTask()) {
            if (this.getCurrentTotalBet() > this.slotMan.curChips) {
                PopupMan.popupOutOfChipsError();
                cc.log("popupOutOfChipsError");
                return false;
            }
        }

        return true;
    },

    getCurrentBet: function () {
        return this.slotMan.bet;
    },

    getCurrentLineNum: function () {
        return this.slotMan.lineNum;
    },

    getCurrentTotalBet: function () {
        return this.slotMan.bet * this.getCurrentLineNum();
    },

    isAutoSpin: function () {
        return this.slotMan.isAutoSpin();
    },

    setAutoSpin: function () {
        this.slotMan.setAutoSpin(true);
    },

    stopAutoSpin: function () {
        this.slotMan.setAutoSpin(false);
    },

    isInFreeSpin: function () {
        return this.slotMan.isInFreeSpin;
    },

    handleMegaSymbols: function (spinPanel) {
        if (this.subjectTmpl.symbolOpType != SymbolOpType.SYMBOL_OP_TYPE_MEGA_SYMBOL) return;

        for (var row = 0; row < this.subjectTmpl.reelRow; ++row) {
            for (var col = 0; col < this.subjectTmpl.reelCol;) {
                var symbolId = spinPanel.panel[col][row];
                var symbolConfig = this.subjectTmpl.getSymbol(symbolId);
                for (var i = 1; i < symbolConfig.symbolW && (col + i) < this.subjectTmpl.reelCol; ++i) {
                    spinPanel.panel[i + col][row] = SymbolId.SYMBOL_ID_FILL;
                }
                col += symbolConfig.symbolW;
            }
        }
    },

    checkAndShowBonusOrScatter: function () {
        var i;
        var layerIndices;
        if (this.hasBonus()) {
            layerIndices = this.getSpinLayerIndices();
            for (i = 0; i < layerIndices.length; ++i) {
                this.spinLayers[layerIndices[i]].blinkAllBonusLines();
            }
            AudioPlayer.getInstance().playEffectByKey("slots/bonus-game-appear");
            return true;
        }
        else if (this.hasScatter()) {
            layerIndices = this.getSpinLayerIndices();
            for (i = 0; i < layerIndices.length; ++i) {
                this.spinLayers[layerIndices[i]].blinkAllScatters();
            }
            AudioPlayer.getInstance().playEffectByKey("slots/bonus-game-appear");
            return true;
        }
        else {
            return false;
        }
    },

    checkAndShowJackpot: function () {
        var i;
        var layerIndices;
        if (this.hasJackpot()) {
            layerIndices = this.getSpinLayerIndices();
            for (i = 0; i < layerIndices.length; ++i) {
                this.spinLayers[layerIndices[i]].blinkAllJackpotSymbol();
            }
            AudioPlayer.getInstance().playEffectByKey("slots/bonus-game-appear");
            return true;
        }
        return false;
    },

    checkAndShowWinLine: function () {
        if (this.hasWinLine()) {
            var layerIndices = this.getSpinLayerIndices();
            for (var i = 0; i < layerIndices.length; ++i) {
                this.spinLayers[layerIndices[i]].blinkAllWinLines();
            }
            return true;
        }
        return false;
    },

    showSpecialTaskAnimation: function () {
        var layerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < layerIndices.length; ++i) {
            this.spinLayers[layerIndices[i]].showSpecialTaskAnimation();
        }
    },

    showTotalWin: function () {
        if (this.hasWinLine()) {
            this.updateOutput(Util.sprintf("YOU GET %d WIN LINES AND %s COINS", this.getNormalWinLines().length, Util.getCommaNum(this.slotMan.curWinChips)));
        }
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);
    },

    getSpinLayerIndices: function () {
        var panelNum = this.subjectTmpl.normalSpinPanels;
        if (this.isInFreeSpin()) {
            panelNum = this.subjectTmpl.freeSpinPanels;
        }
        var panelIndices = [];
        for (var i = 0; i < this.spinLayers.length && i < panelNum; ++i) {
            panelIndices.push(i);
        }
        return panelIndices;
    },

    hasWinLine: function () {
        return this.getNormalWinLines().length > 0;
    },

    getNormalWinLine: function (winLineIndex) {
        return this.spinPanel.winLines[winLineIndex];
    },

    getNormalWinLines: function () {
        return this.spinPanel.winLines;
    },

    hasBonus: function () {
        return this.slotMan.isBonus;
    },

    hasScatter: function () {
        return this.hasScatterNormal();
    },

    hasScatterNormal: function () {
        /**
         * @type {NormalSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo && spinExtraInfo.scatters) {
            return spinExtraInfo.scatters.length > 0;
        }
        return false;
    },

    hasScatterColumn: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo != null) {
            return spinExtraInfo.scatterCols.length > 0;
        }
        return false;
    },

    isJackpotOn: function () {
        var subject = SlotConfigMan.getInstance().getSubject(this.slotMan.subjectId);
        if (subject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN && subject.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
            return this.getCurrentTotalBet() >= subject.jackpotInfoList[0].thresholdBet;
        }
        return false;
    },

    hasJackpot: function () {
        return this.spinPanel.jackpotTriggered;
    },

    checkDrumMode: function () {
        var drumState = [];
        for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drumState[i] = DrumMode.DRUM_MODE_NULL;
        }
        if (this.getJackpotDrumState(drumState)) {
            return drumState;
        }
        else if (this.getBonusDrumState(drumState)) {
            return drumState;
        }
        else if (this.getScatterDrumState(drumState)) {
            return drumState;
        }
        return drumState;
    },

    getBonusDrumState: function (drumState) {
        return this.getBonusDrumStateNormal(drumState);
    },

    getBonusDrumStateNormal: function (drumState) {
        var i;
        var drum = [];
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }

        var lineCount = this.subjectTmpl.getLineCount(0);
        var isDrum = false;
        for (var lineIndex = 0; lineIndex < lineCount; ++lineIndex) {
            var lineConfig = this.subjectTmpl.getLine(0, lineIndex);
            if (!lineConfig) continue;
            var bonusNum = 0;
            for (var globalCol = 0; globalCol < this.subjectTmpl.reelCol; ++globalCol) {
                if (this.getSpinResult(globalCol, lineConfig.rows[globalCol]) == SymbolId.SYMBOL_ID_BONUS) {
                    ++bonusNum;
                    drum[globalCol] = DrumMode.DRUM_MODE_BLINK_BONUS;
                }
            }

            if (bonusNum >= 2) {
                isDrum = true;
                break;
            }
        }

        if (isDrum) {
            var bonusCol = 0;
            var maxCol = 100;
            for (i = 0; i < drum.length; ++i) {
                if (drum[i] == DrumMode.DRUM_MODE_BLINK_BONUS) {
                    drumState[i] = DrumMode.DRUM_MODE_BLINK_BONUS;
                    ++bonusCol;
                    if (bonusCol == 2) {
                        maxCol = i;
                    }
                }

                if (i > maxCol) {
                    drumState[i] = DrumMode.DRUM_MODE_DRUM;
                }
            }

            if (maxCol == (this.subjectTmpl.reelCol - 1)) {
                for (i = 0; i < drumState.length; ++i) {
                    drumState[i] = DrumMode.DRUM_MODE_NULL;
                }
            }
            return true;
        }

        return false;
    },

    getBonusDrumStateColumn: function (drumState) {
        return this.getDrumStateCol(drumState, SymbolId.SYMBOL_ID_BONUS, DrumMode.DRUM_MODE_BLINK_BONUS);
    },

    getScatterDrumState: function (drumState) {
        return this.getScatterDrumStateNormal(drumState);
    },

    /**
     * @param {Array.<number>} drumState - every element is DrumMode at the given column
     * @returns {boolean}
     */
    getJackpotDrumState: function (drumState) {
        var i;
        var drum = [];
        var hasJackpotSymbol = false;
        var globalCol;
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }
        var spinLayerIndices = this.getSpinLayerIndices();
        for (i = 0; i < spinLayerIndices.length; ++i) {
            var panelConfig = this.subjectTmpl.panels[spinLayerIndices[i]];
            for (var localCol = 0; localCol < panelConfig.slotCols; ++localCol) {
                hasJackpotSymbol = false;
                for (var localRow = 0; localRow < panelConfig.slotRows; ++localRow) {
                    var symbolId = this.getSpinResult(localCol + panelConfig.colShift, localRow + panelConfig.rowShift);
                    if (symbolId == SymbolId.SYMBOL_ID_JACKPOT) {
                        hasJackpotSymbol = true;
                        drum[localCol + panelConfig.colShift] = DrumMode.DRUM_MODE_BLINK_JACKPOT;
                        break;
                    }
                }
                globalCol = localCol + panelConfig.colShift;
                if (globalCol < this.subjectTmpl.reelCol - 1 && !hasJackpotSymbol) {
                    return false;
                } else if (globalCol == this.subjectTmpl.reelCol - 1 && !hasJackpotSymbol) {
                    drum[globalCol] = DrumMode.DRUM_MODE_BLINK_JACKPOT;
                }
            }
        }
        for(i = 0; i < drum.length; ++i) {
            if (i != drum.length - 1 && drum[i] == DrumMode.DRUM_MODE_BLINK_JACKPOT) {
                drumState[i] = DrumMode.DRUM_MODE_BLINK_JACKPOT;
            }
            if (i == drum.length - 1 && drum[i] == DrumMode.DRUM_MODE_BLINK_JACKPOT) {
                drumState[i] = DrumMode.DRUM_MODE_DRUM;
            }
        }
        return true;
    },

    getScatterDrumStateNormal: function (drumState) {
        var i;
        var scatterColCount = 0;
        var drum = [];
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }
        var scatterIndexMap = {};
        var spinLayerIndices = this.getSpinLayerIndices();
        for (i = 0; i < spinLayerIndices.length; ++i) {
            var panelConfig = this.subjectTmpl.panels[spinLayerIndices[i]];
            for (var localCol = 0; localCol < panelConfig.slotCols; ++localCol) {
                for (var localRow = 0; localRow < panelConfig.slotRows; ++localRow) {
                    var symbolId = this.getSpinResult(localCol + panelConfig.colShift, localRow + panelConfig.rowShift);
                    var index = localRow + panelConfig.rowShift + (localCol + panelConfig.colShift) * this.subjectTmpl.reelRow;
                    if (symbolId == SymbolId.SYMBOL_ID_SCATTER && scatterIndexMap[index] == null) {
                        scatterIndexMap[index] = true;
                        ++scatterColCount;
                        drum[localCol + panelConfig.colShift] = DrumMode.DRUM_MODE_BLINK_SCATTER;
                    }
                }
            }
        }

        if (scatterColCount >= 2) {
            var scatterCol = 0;
            var maxCol = this.subjectTmpl.reelCol;
            for (i = 0; i < drum.length; ++i) {
                if (drum[i] == DrumMode.DRUM_MODE_BLINK_SCATTER) {
                    drumState[i] = DrumMode.DRUM_MODE_BLINK_SCATTER;
                    ++scatterCol;
                    //There are two columns which have scatter in the first maxCol columns
                    if (scatterCol == 2) {
                        maxCol = i;
                    }
                }

                if (i > maxCol) {
                    drumState[i] = DrumMode.DRUM_MODE_DRUM;
                }
            }

            /* If there are only two columns which have scatter and the last column has a scatter,
             * then don't show drum mode */
            if (maxCol == (this.subjectTmpl.reelCol - 1)) {
                for (i = 0; i < drumState.length; ++i) {
                    drumState[i] = DrumMode.DRUM_MODE_NULL;
                }
            }
            return true;
        }

        return false;
    },

    getScatterDrumStateColumn: function (drumState) {
        return this.getDrumStateCol(drumState, SymbolId.SYMBOL_ID_SCATTER, DrumMode.DRUM_MODE_BLINK_SCATTER);
    },

    getDrumStateCol: function (drumState, symbolId, drumMode) {
        var i;
        var colCount = 0;
        var drum = [];
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }

        for (var col = 1; col < 4; ++col) {
            var isBreak = false;
            for (var row = 0; row < this.subjectTmpl.reelRow; row++) {
                var tmpSymbolId = this.getSpinResult(col, row);
                if (symbolId != tmpSymbolId) {
                    isBreak = true;
                    break;
                }
            }
            if (isBreak) {
                break;
            }
            ++colCount;
            drum[col] = drumMode;
        }

        if (colCount >= 2) {
            for (i = 0; i < drum.length; ++i) {
                if (drum[i] == drumMode) {
                    drumState[i] = drumMode;
                }
            }
            drumState[3] = DrumMode.DRUM_MODE_DRUM;
            return true;
        }
        return false;
    },

    /**
     * @param {Array.<number>} drumModeState - DrumMode or delta row count between two adjacent columns.
     * @return {Array.<number>} element at given index means the row count the reel should spin before stopping.
     */
    calSpinRowCountWhenResultReceived: function (drumModeState) {
        var spinRowInterval = this.getSpinRowInterval();
        var extraSpinRowInterval = this.getExtraSpinRowInterval();
        var maxSkipRowCount = this.getMaxSkipRowCountWhenSpinCompleted();
        var drumState = this.checkDrumMode();
        var spinRowCounts = [];
        var extraShift = 0;
        for (var col = 0; col < this.subjectTmpl.reelCol; ++col) {
            var multi = col;
            if (drumState[col] == DrumMode.DRUM_MODE_DRUM) {
                extraShift += 5;
            }
            spinRowCounts[col] = 1 * spinRowInterval + 2 * (multi + extraShift) * spinRowInterval + multi * extraSpinRowInterval + maxSkipRowCount;
        }

        if (drumModeState != null) {
            for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
                drumModeState[i] = drumState[i];
                if (drumState[i] == DrumMode.DRUM_MODE_DRUM && i >= 1) {
                    drumModeState[i] = spinRowCounts[i] - spinRowCounts[i - 1];
                }
            }
        }

        return spinRowCounts;
    },

    getSpinRowInterval: function () {
        return this.subjectTmpl.reelRow;
    },

    getExtraSpinRowInterval: function () {
        return 2;
    },

    getMaxSkipRowCountWhenSpinCompleted: function () {
        var result = 0;
        for (var i = 0; i < this.spinLayers.length; ++i) {
            for (var localCol = 0; localCol < this.subjectTmpl.panels[i].slotCols; ++localCol) {
                var skip = this.spinLayers[i].getSkipRowCountWhenSpinCompleted(localCol);
                if (skip > result) {
                    result = skip;
                }
            }
        }
        return result;
    },

    getSpinResult: function (col, row) {
        return this.spinPanel.panel[col][row];
    },

    getSpinEnabled: function () {
        return this.slotMan.getSpinEnabled();
    },

    setSpinEnabled: function (value) {
        this.slotMan.setSpinEnabled(value);
    },

    setCurrentSpinStep: function (value) {
        this.currentSlotStep = value;
        if (this.currentSlotStep == SpinStep.SLOT_SPIN_START) {
            this.noSpinInterval = 0;
        }
        this.slotMan.setSpinStep(value);
    },

    addConnectedAreaAnim: function () {
        this.slotMan.prependNoticeEvent(SlotNoticeType.SLOT_NOTICE_SHOW_CONNECTED_AREA);
    },

    addSpecialAnimation: function () {
        this.slotMan.prependNoticeEvent(SlotNoticeType.SLOT_NOTICE_SPECIAL_ANIMATION);
        this.hasSpecialAnim = true;
    },

    playBgMusic: function () {
        if (!this.playingBgMusic) {
            var bgMusicName = this.getBgMusicName();
            if(AudioSlotHelper.playSlotBgMusic(bgMusicName)) {
                this.playingBgMusic = true;
            }
        }
        else {
            this.resumeBgMusic();
        }
    },

    getBgMusicName: function () {
        var musicName = this.subjectTmpl.spinBgMusic;
        var TaskConfigMan = require("../../task/config/TaskConfigMan");
        var taskConfig = TaskConfigMan.getInstance().getTaskConfig(this.slotMan.taskId);
        if(taskConfig) {
            var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
            musicName = Util.sprintf("slots/%s/spin-bg", themeConfig.themeAudio);
        }
        else {
            musicName = this.subjectTmpl.spinBgMusic;
        }

        return musicName;
    },

    resumeBgMusic: function () {
        //AudioPlayer.getInstance().resumeMusicSlowly(true);
    },

    updateTaskProgress: function () {
    },

    updateDailyTaskProgress: function () {
    },

    checkTaskProgressFailedAndShow: function () {
        var taskInfo = this.slotMan.taskInfo;
        if (taskInfo) {
            if (this.slotMan.taskProgress >= 100) return false;
            switch (taskInfo.taskType) {
                case TaskType.TASK_WIN_ON_FREE_SPIN:
                    if (this.slotMan.taskSpinCount >= taskInfo.taskData.spinLimit) {
                        this.showTaskFailedDlg();
                        return true;
                    }
                    break;
                case TaskType.TASK_WIN_IN_LIMITED_TIME:
                    if (this.slotMan.isTimeTaskFailed()) {
                        this.showTaskFailedDlg();
                        return true;
                    }
                    break;
            }
        }
        return false;
    },

    checkTaskProgressCompletedAndShow: function () {
        this.checkTaskProgressFailedAndShow();
        var taskLevelUp = this.slotMan.taskLevelUp;
        if (taskLevelUp) {
            if (this.isAutoSpin()) {
                this.stopAutoSpin();
            }

            if(!this.hasPopupTaskEndDlg) {
                EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_COMPLETED);
                PopupMan.popupTaskCompletedDlg(taskLevelUp);
                this.hasPopupTaskEndDlg = true;
            }
            return true;
        }
        return false;
    },

    showTaskFailedDlg: function () {
    },

    onStartTimeTask: function () {
    }
});

module.exports = SlotScene;