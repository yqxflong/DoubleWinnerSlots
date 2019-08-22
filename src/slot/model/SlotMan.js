/**
 * Created by alanmars on 15/4/17.
 */
var SlotConfigMan = require("../config/SlotConfigMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotNoticeType = require("../events/SlotNoticeType");
var SlotEvent = require("../events/SlotEvent");
var WinLevel = require("../enum/WinLevel");
var SlotNoticeUserData = require("../events/SlotNoticeUserData");
var PlayerMan = require("../../common/model/PlayerMan");
var TaskStep = require("../../task/enum/TaskStep");

var SlotMan = cc.Class.extend({
    FIVE_OF_A_KIND: 5,

    subjectId: 0,
    jackpotId: 0,
    roomId: 0,

    spinBet: 0,
    bet: 0,
    lineNum: 0,
    maxLineNum: 0,
    betLevel: 0,
    _spinEnabled: true,
    /**
     * @type {Array.<SpinPanel>}
     */
    spinResult: null,
    spinPanelIndex: 0,

    isBonus: false,
    leftFreeSpinCount: 0,
    isInFreeSpin: false,
    curWinChips: 0,
    totalWinChips: 0,
    bonusWin: 0,

    leftAutoSpin: 0,
    /**
     * @type {Array.<number>}
     */
    noticeEventList: null,
    noticeEventIndex: 0,

    curSpinCost: 0,
    curChips: 0,

    /**
     * @type {LevelExp}
     */
    syncExp: null,

    jackpotIndex: 0,
    /**
     * @type {BetAccuJackpotSubInfo}
     */
    jackpotSubInfo: null,
    jackpotWinCoins: 0,

    roomExtraInfo: null,

    taskId: 0,
    taskProgress: 0,

    taskLevelId: 1,
    levelStar: 1,
    /**
     * @type {TaskInfo}
     */
    taskInfo: null,

    /**
     * @type {TaskLevelUp}
     */
    taskLevelUp: null,

    timeTaskIntervalKey: null,
    //leftTimeTaskTime: 0,
    timeTaskEndTime: 0,
    taskStep: TaskStep.TASK_STEP_START,
    dailyTaskCompleted: false,
    /**
     * @type {Array.<DailyTaskUpdate>}
     */
    syncDailyTasks: null,
    taskLeftTime: 0,
    taskSpinCount: 0,
    spinStep: 0,
    taskDetail: null,

    hasDownloadAudioRes: false,

    ctor: function () {
    },

    reset: function () {
        this.subjectId = -1;
        this.jackpotId = 0;
        this.roomId = -1;

        this.bet = 1000;
        this.betLevel = 0;
        this._spinEnabled = true;
        this.spinResult = null;
        this.spinPanelIndex = 0;

        this.leftFreeSpinCount = 0;
        this.isInFreeSpin = false;
        this.curWinChips = 0;
        this.totalWinChips = 0;
        this.bonusWin = 0;
        this.leftAutoSpin = 0;

        this.noticeEventList = [];
        this.noticeEventIndex = 0;

        this.curSpinCost = 0;
        this.curChips = 0;
    },

    getSpinResultFromServer: function () {
    },

    handleSpinResult: function () {
        var currentSpinPanel = this.getSpinPanel();
        PlayerMan.getInstance().addChips(currentSpinPanel.chips, false);

        this.isBonus = currentSpinPanel.isBonus > 0;
        this.leftFreeSpinCount = currentSpinPanel.leftFreeSpin;

        this.noticeEventList.length = 0;
        this.noticeEventIndex = 0;
        this.taskProgress = currentSpinPanel.taskProgress;

        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_NOTICE, new SlotNoticeUserData(SlotNoticeType.SLOT_NOTICE_SPIN_RESULT_RECEIVED));
    },

    resetWinChips: function () {
        this.curWinChips = 0;
        this.totalWinChips = 0;
    },

    resetCurWinChips: function () {
        this.curWinChips = 0;
    },

    resetSpinResult: function () {
        this.spinResult = null;
    },

    onSubjectNotify: function (proto) {
        if (proto.subjectId != this.subjectId) return;

        //_notifyExtraInfo = proto.extraInfo;
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_NOTICE, SlotNoticeType.SLOT_NOTICE_SUBJECT_NOTIFY);
    },

    /**
     * @param {number} slotNoticeType
     */
    prependNoticeEvent: function (slotNoticeType) {
        this.noticeEventList.unshift(slotNoticeType);
    },

    pushNoticeEvent: function (slotNoticeType) {
        this.noticeEventList.push(slotNoticeType);
    },

    dispatchNextNoticeEvent: function () {
        if (this.noticeEventList.length <= 0) return;

        var noticeType = this.noticeEventList.shift();
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_NOTICE, new SlotNoticeUserData(noticeType));
    },

    getSpinPanel: function () {
        return this.spinResult[this.spinPanelIndex];
    },

    isFirstSpinPanel: function () {
        return this.spinPanelIndex === 0;
    },

    isLastSpinPanel: function () {
        return this.spinPanelIndex >= (this.spinResult.length - 1);
    },

    getSpinPanelLength: function () {
        if(this.spinResult != null && !cc.isUndefined(this.spinResult)) {
            return this.spinResult.length;
        }
        else {
            return 0;
        }
    },

    getSpinExtraInfo: function () {
        return this.getSpinPanel().extraInfo;
    },

    updateCurChips: function () {
        this.curChips = PlayerMan.getInstance().player.chips;
    },

    setCurWinChips: function (win) {
        this.curWinChips = win;
        this.totalWinChips += win;
    },

    addCurWinChips: function (delta) {
        this.curWinChips += delta;
        this.totalWinChips += delta;
    },

    nextIsFreeSpin: function () {
        return this.leftFreeSpinCount > 0;
    },

    setFakeFreeSpin: function (freeSpinCount) {
        this.leftFreeSpinCount = freeSpinCount;
    },

    /**
     * @param {boolean} autoSpin
     */
    setAutoSpin: function (autoSpin) {
        if (autoSpin) {
            this.leftAutoSpin = 1;
        } else {
            this.leftAutoSpin = 0;
        }
    },

    isAutoSpin: function () {
        return this.leftAutoSpin > 0;
    },

    costSpinBet: function (costBet) {
        this.curSpinCost = costBet;
        this.curChips -= costBet;
    },

    getSpinEnabled: function () {
        return this._spinEnabled;
    },

    setSpinEnabled: function (value) {
        this._spinEnabled = value;
    },

    setSpinStep: function (spinStep) {
        this.spinStep = spinStep;
    },

    getSpinStep: function (spinStep) {
        return this.spinStep;
    },

    isTask: function () {
        if (this.taskId == 0) {
            return false;
        }
        return true;
    }
});

SlotMan.current = null;

/**
 * @returns {SlotMan}
 */
SlotMan.getCurrent = function() {
    return SlotMan.current;
};

module.exports = SlotMan;