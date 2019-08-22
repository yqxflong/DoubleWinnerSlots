var SlotMan = require("./SlotMan");
var SpinPanel = require("../entity/SpinPanel");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var C2SSpin = require("../protocol/C2SSpin");
var SlotConfigMan = require("../config/SlotConfigMan");
var PlayerMan = require("../../common/model/PlayerMan");
var CommonEvent = require("../../common/events/CommonEvent");
var C2SEnterRoom = require("../protocol/C2SEnterRoom");
var SceneMan = require("../../common/model/SceneMan");
var ProductType = require("../../common/enum/ProductType");
var LogMan = require("../../log/model/LogMan");
var ServerType = require("../../common/enum/ServerType");
var ActionType = require("../../log/enum/ActionType");
var SocialMan = require("../../social/model/SocialMan");
var C2SUpdatePrizePoolPlayers = require("../protocol/C2SUpdatePrizePoolPlayers");
var Subject = require("../entity/Subject");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var JackpotStatus = require("../enum/JackpotStatus");
var JackpotType = require("../enum/JackpotType");
var SlotJackpotStatusData = require("../events/SlotJackpotStatusData");
var MessageDialogType = require("../../common/events/MessageDialogType");
var MessageDialogData = require("../../common/events/MessageDialogData");
var SlotOtherWinJackpotData = require("../events/SlotOtherWinJackpotData");
var C2SGetJackpotRecords = require("../protocol/C2SGetJackpotRecords");
var SubjectClassify = require("../enum/SubjectClassify");
var ErrorCode = require("../../common/enum/ErrorCode");
var TaskMan = require("../../task/model/TaskMan");
var TaskType = require("../../task/enum/TaskType");
var TaskEvent = require("../../task/events/TaskEvent");
var TaskStep = require("../../task/enum/TaskStep");
var PopupMan = require("../../common/model/PopupMan");
var SpinStep = require("../enum/SpinStep");
var Config = require("../../common/util/Config");
var StorageController = require("../../common/storage/StorageController");

/**
 * Created by qinning on 15/4/27.
 */
var ClassicSlotMan = SlotMan.extend({
    BET_TOTAL_RATIO: 0.00625,
    TASK_MIN_TIME_BET_RECOMMEND: 10000,

    tableViewOffset: null,
    classifyIndex: SubjectClassify.SUBJECT_CLASSIFY_POPULAR,
    _cachedPrizePoolProto: null,

    /**
     * @type {Array.<JackpotRecord>}
     */
    _jackpotRecords: null,

    limitedTimeTaskEnd: false,

    timeTaskIntervalKey: 0,
    isTimeTaskSchedule: false,

    ctor: function () {
        this._super();
        this.reset();
    },

    /**
     * @return {Array.<number>}
     */
    getBetConfig: function () {
        if(this.isUseServerBets()) {
            return this.jackpotSubInfo.bets;
        } else {
            return SlotConfigMan.getInstance().getBetList(this.subjectId, TaskMan.getInstance().getCurTaskLevel(), !this.isTask());
        }
    },

    setBetLevel: function (betLevel, playSound) {
        if (cc.isUndefined(playSound)) {
            playSound = true;
        }
        this.betLevel = betLevel;
        var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
        if(this.isUseServerBets()) {
            this.bet = this.jackpotSubInfo.bets[this.betLevel];
            LogMan.getInstance().currentBet = this.getCurrentTotalBet();

            if (playSound) {
                AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/change-bet%d", (betLevel % 2 + 1)));
            }

            if (subject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN && subject.jackpotType === JackpotType.JACKPOT_TYPE_BET_ACCU) {
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG,
                    new MessageDialogData(MessageDialogType.SLOT_SELECT_JACKPOT_BET));
                EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UPDATE_JACKPOT, null);
            }
        } else {
            var prevTotalBet = this.getCurrentTotalBet();
            this.bet = SlotConfigMan.getInstance().getBet(this.subjectId, this.betLevel);
            LogMan.getInstance().currentBet = this.getCurrentTotalBet();

            if (playSound) {
                AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/change-bet%d", (betLevel % 2 + 1)));
            }

            if (subject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN && subject.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
                var isOn = this.getCurrentTotalBet() >= subject.jackpotInfoList[0].thresholdBet;
                if (!isOn) {
                    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_JACKPOT_STATUS_CHANGED, new SlotJackpotStatusData(isOn, subject.jackpotInfoList[0].thresholdBet));
                } else {
                    var prevIsOn = prevTotalBet >= subject.jackpotInfoList[0].thresholdBet;
                    if (!prevIsOn) {
                        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_JACKPOT_STATUS_CHANGED, new SlotJackpotStatusData(isOn, subject.jackpotInfoList[0].thresholdBet));
                    }
                }
            }
        }

        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_BET_CHANGED, null);
    },

    changeBetLevel: function (delta) {
        var betLevelCount = 0;
        if(this.isUseServerBets()) {
            betLevelCount = this.jackpotSubInfo.bets.length;
        } else {
            betLevelCount = SlotConfigMan.getInstance().getBetLevelCount(this.subjectId, TaskMan.getInstance().getCurTaskLevel(), !this.isTask());
        }
        var destBetLevel = (this.betLevel + delta + betLevelCount) % betLevelCount;
        this.setBetLevel(destBetLevel);
    },

    changeLineNum: function (delta) {
        this.lineNum = this.lineNum + delta;
        if (this.lineNum > this.maxLineNum) {
            this.lineNum = 1;
        } else if (this.lineNum <= 0) {
            this.lineNum = this.maxLineNum;
        }
    },

    useMaxBetLevel: function () {
        var destBetLevel = 0;
        if(this.isUseServerBets()) {
            destBetLevel = this.jackpotSubInfo.bets.length - 1;
        } else {
            destBetLevel = SlotConfigMan.getInstance().getBetLevelCount(this.subjectId, TaskMan.getInstance().getCurTaskLevel(), !this.isTask()) - 1;
        }
        this.setBetLevel(destBetLevel);
    },

    initBet: function () {
        this.betLevel = 0;
        var recommendBet = PlayerMan.getInstance().player.chips * this.BET_TOTAL_RATIO / this.lineNum;
        if (this.isTask()) {
            //var taskType = this.taskInfo.taskType;
            //if (taskType == TaskType.TASK_WIN_ON_FREE_SPIN || taskType == TaskType.TASK_WIN_IN_LIMITED_TIME) {
            //    if (recommendBet < this.TASK_MIN_TIME_BET_RECOMMEND) {
            //        recommendBet = this.TASK_MIN_TIME_BET_RECOMMEND;
            //    }
            //}
        }

        var betConfig = this.getBetConfig();
        for (var i = 0; i < betConfig.length; ++i) {
            if (recommendBet >= betConfig[i]) {
                this.betLevel = i;
            }
            else {
                break;
            }
        }
        this.bet = betConfig[this.betLevel];
    },

    setBet: function (bet) {
        var tmpBetLevel = 0;
        var betConfig = this.getBetConfig();
        for (var i = 0; i < betConfig.length; ++i) {
            if (betConfig[i] == bet) {
                tmpBetLevel = i;
                break;
            }
        }

        this.setBetLevel(tmpBetLevel, false);
    },

    setJackpotBet: function (bet) {
        this.setBet(bet);
    },

    getSpinResultFromServer: function () {
        this.spinPanelIndex += 1;
        //The local spin result isn't use up.
        if (this.spinResult != null && this.spinPanelIndex < this.spinResult.length) {
            this.handleSpinResult();
            return;
        }

        var proto = new C2SSpin();
        proto.bet = this.bet;
        proto.betIndex = this.betLevel;
        proto.lineNum = this.lineNum;
        proto.isMaxBet = this.isMaxBet();
        proto.taskLevelId = this.taskLevelId;
        proto.taskId = this.taskId;
        proto.levelStar = this.levelStar;
        proto.send();

        this.spinBet = this.bet;
	
	    LogMan.getInstance().logSpinTime();
        this.sendSpinUserStepLog();
    },

    getMaxBetLevel: function () {
        var destBetLevel = 0;
        if(this.isUseServerBets()) {
            destBetLevel = this.jackpotSubInfo.bets.length - 1;
        } else {
            destBetLevel = SlotConfigMan.getInstance().getBetLevelCount(this.subjectId, TaskMan.getInstance().getCurTaskLevel(), !this.isTask()) - 1;
        }
        return destBetLevel;
    },

    isMaxBet: function () {
        if (this.getMaxBetLevel() == this.betLevel) {
            return true;
        }
        return false;
    },

    /**
     * @param {S2CSpin} spinResult
     */
    onGetSpinResult: function (spinResult) {
        if (spinResult.errorCode == ErrorCode.Slot.SPIN_INVALID_TASK) {
            //give back money
            this.updateCurChips();
            EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, null);
            return;
        } else {
            if (spinResult.errorCode != ErrorCode.SUCCESS || spinResult.subjectId != this.subjectId) {
                //send log and disconnect
                var errorInfo = "";
                switch (spinResult.errorCode) {
                    case ErrorCode.Slot.SPIN_BET_NOT_ENOUGH:
                        errorInfo = "spin error: bet not enough";
                        break;
                    case ErrorCode.Slot.SPIN_INVALID_BET:
                        errorInfo = "spin error: invalid bet";
                        break;
                    case ErrorCode.Slot.SPIN_INVALID_SUBJECT:
                        errorInfo = "spin error: invalid subject";
                        break;
                    default:
                        if (spinResult.subjectId != this.subjectId) {
                            errorInfo = "spin success but client subjectId not equal to server subjectId";
                        } else {
                            errorInfo = "spin error: unknown error";
                        }
                        break;
                }
                LogMan.getInstance().errorInfo(errorInfo, spinResult.errorCode);
                var PomeloClient = require("../../common/net/PomeloClient");
                PomeloClient.getInstance().disconnect(true);
                return;
            }
        }
        this.syncExp = spinResult.syncExp;
        this.spinResult = spinResult.result;
        this.spinPanelIndex = 0;
        this.isInFreeSpin = spinResult.isFreeSpin > 0;
        this.taskLevelUp = spinResult.taskLevelUp;
        this.syncDailyTasks = spinResult.syncDailyTasks;
        this.dailyTaskCompleted = spinResult.dailyTaskCompleted;

        if (this.taskLevelUp) {
            TaskMan.getInstance().addNewTaskLevelUp(this.taskLevelUp);
            TaskMan.getInstance().setTaskStarNum(this.taskLevelUp.taskStarNum);
            this.setTaskStep(TaskStep.TASK_STEP_COMPLETED);
        }
        if (this.syncDailyTasks) {
            TaskMan.getInstance().updateDailyTasks(this.syncDailyTasks);
        }
        if (this.dailyTaskCompleted) {
            TaskMan.getInstance().setDailyTaskCompleted(this.dailyTaskCompleted);
            TaskMan.getInstance().setRewardClaimed(false);
        }

        if (!this.isInFreeSpin) {
            if (this.taskInfo) {
                switch (this.taskInfo.taskType) {
                    case TaskType.TASK_WIN_ON_FREE_SPIN:
                        this.taskSpinCount++;
                        break;
                }
            }
        }

        PlayerMan.getInstance().addChips(-this.curSpinCost, false);
        /*
         for (var i = 0; i < this.spinResult.length; ++i) {
         PlayerMan.getInstance().addChips(this.spinResult[i].chips, false);
         }
         */
        this.onChangeJackpotValue();
        this.curSpinCost = 0;
        this.handleSpinResult();

        LogMan.getInstance().addGameRound(1);
        this.sendSpinResultUserStepLog();
    },

    enterRoom: function () {
        var enterRoomProto = new C2SEnterRoom();
        enterRoomProto.subjectId = this.subjectId;
        enterRoomProto.jackpotId = this.jackpotId;
        enterRoomProto.taskId = this.taskId;
        enterRoomProto.taskLevelId = this.taskLevelId;
        enterRoomProto.levelStar = this.levelStar;
        enterRoomProto.send();

        //if(Config.localDebugMode) {
        //    var S2CEnterRoom = require("../protocol/S2CEnterRoom");
        //    var proto = new S2CEnterRoom();
        //    proto.subjectId = 60101;
        //    proto.leftFreeSpin = 0;
        //    proto.freeSpinBet = 0;
        //    proto.freeSpinLineNum = 0;
        //    proto.jackpotSubInfo = null;
        //    proto.roomExtraInfoType = 0;
        //    proto.roomExtraInfo = null;
        //    proto.errorCode = 0;
        //
        //    this.onEnterRoom(proto);
        //
        //    //this.taskProgress = 0;
        //    //this.taskInfo = null;
        //    //
        //    //this.taskLeftTime = 0;
        //    //this.taskSpinCount = 0;
        //}
    },

    onGetSubjects: function (proto) {
        SlotConfigMan.getInstance().initSubjectList(proto);
        SceneMan.getInstance().onGetSubjectReady();
    },

    initSpinWithBetSet: function () {
        if (this.taskInfo) {
            if (TaskType.isSpinMaxBet(this.taskInfo.taskType)) {
                this.betLevel = this.getMaxBetLevel();
                var betConfig = this.getBetConfig();
                this.bet = betConfig[this.betLevel];
            }
            else if(TaskType.isSpinWithBetLimited(this.taskInfo.taskType)) {
                var TaskConfigMan = require("../../task/config/TaskConfigMan");
                var taskConfig = TaskConfigMan.getInstance().getTaskConfig(this.taskInfo.taskId);
                this.betLevel = taskConfig.param2;
                var betConfig = this.getBetConfig();
                this.bet = betConfig[this.betLevel];
            }
        }
    },

    /**
     * @param {S2CEnterRoom} enterResult
     */
    onEnterRoom: function (enterResult) {

        if(enterResult.errorCode != 0) {
            SceneMan.getInstance().onServerError();
            LogMan.getInstance().gameRecord(ServerType.SERVER_SLOT, ActionType.ENTER, this.subjectId);
            return;
        }
        SlotMan.current = this;

        EventDispatcher.getInstance().addEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
        EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_COMPLETED, this.onTaskCompleted, this);

        this.leftAutoSpin = 0;
        this.curChips = PlayerMan.getInstance().player.chips;
        this.curSpinCost = 0;
        this.jackpotSubInfo = enterResult.jackpotSubInfo;

        this.subjectId = enterResult.subjectId;
        this.roomId = enterResult.roomId;
        this.roomExtraInfo = enterResult.roomExtraInfo;

        this.taskInfo = enterResult.taskInfo;
        this.taskProgress = enterResult.taskProgress;
        this.taskLeftTime = enterResult.taskLeftTime;
        this.taskSpinCount = enterResult.taskSpinCount;
        this.taskDetail = enterResult.taskDetail;
        this.hasDownloadAudioRes = false;

        this.setTaskStep(TaskStep.TASK_STEP_START);

        var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);

        //update subject's jackpotValue
        if(subject.jackpotStatus == JackpotStatus.JACKPOT_STATUS_OPEN && subject.jackpotType == JackpotType.JACKPOT_TYPE_BET_ACCU) {
            subject.jackpotInfoList[this.jackpotIndex].jackpotValue = this.jackpotSubInfo.jackpotValue;
        }

        var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
        this.maxLineNum = subjectTmpl.getMaxLineCount();
        this.lineNum = this.maxLineNum;

        this.leftFreeSpinCount = enterResult.leftFreeSpin;
        if (enterResult.leftFreeSpin > 0) {
            this.isInFreeSpin = true;
            this.setBet(enterResult.freeSpinBet);
        } else {
            this.isInFreeSpin = false;
        }

        if (!this.isInFreeSpin) {
            this.setSpinEnabled(true);
            this.initBet();
            this.initSpinWithBetSet();
        }

        SceneMan.getInstance().onServerReady();

        LogMan.getInstance().gameRecord(ServerType.SERVER_SLOT, ActionType.ENTER, this.subjectId);
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");
        LogMan.getInstance().userProductRecord(ProductChangeReason.ENTER_SLOT_SUBJECT, 0, 0, 0, 0, this.subjectId, this.taskId);
        LogMan.getInstance().currentBet = this.getCurrentTotalBet();
    },

    leftRoom: function () {
        EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_COMPLETED, this.onTaskCompleted, this);
        EventDispatcher.getInstance().removeEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
        LogMan.getInstance().gameRecord(ServerType.SERVER_SLOT, ActionType.LEAVE, this.subjectId);
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");
        LogMan.getInstance().userProductRecord(ProductChangeReason.LEAVEL_SLOT_SUBJECT, 0, PlayerMan.getInstance().player.chips - LogMan.getInstance().lastChips, 0, 0, this.subjectId, this.taskId);
	    this.jackpotSubInfo = null;
	    var ResourceMan = require("../../common/model/ResourceMan");
        ResourceMan.getInstance().releaseSlotResource();
        this.unscheduleTimeTask();
        this.taskId = 0;
    },

    onGetPrizePool: function (updatePrizePoolPlayers) {
        if (this.getSpinEnabled()) {
            EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UPDATE_PRIZE_POOL, updatePrizePoolPlayers);
        } else {
            this._cachedPrizePoolProto = updatePrizePoolPlayers;
        }
    },

    /**
     * @param {S2CPrizePoolResult} prizePoolResult
     */
    onPrizePoolResult: function (prizePoolResult) {
        for (var i = 0; i < prizePoolResult.players.length; ++i) {
            //ok, I'm in top 3, then get reward
            if (PlayerMan.getInstance().playerId == prizePoolResult.players[i].playerId) {
                SocialMan.getInstance().getReward();
                break;
            }
        }
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_PRIZE_POOL_RESULT, prizePoolResult);
    },

    updateCurChips: function () {
        this.curChips = PlayerMan.getInstance().player.chips;
    },

    costSpinBet: function (costBet) {
        //Sync chips from PlayerMan, then take spin bet
        this.curChips = PlayerMan.getInstance().player.chips;
        this._super(costBet);
    },

    onProductChanged: function (event) {
        var userData = event.getUserData();
        if (userData.productType == ProductType.PRODUCT_TYPE_CHIP) {
            this.curChips = PlayerMan.getInstance().player.chips;
        }
    },

    getCurrentTotalBet: function () {
        return this.bet * this.maxLineNum;
    },

    sendUpdatePrizePoolPlayersCmd: function () {
        var c2sUpdatePrizePoolPlayers = new C2SUpdatePrizePoolPlayers();
        c2sUpdatePrizePoolPlayers.send();
    },

    resetPrizePoolPlayersCountDownTime: function () {
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_RESET_PRIZE_POOL);
    },

    sendGetSubjectsCmd: function () {
        var C2SGetSubjects = require("../protocol/C2SGetSubjects");
        var getSubjects = new C2SGetSubjects();
        getSubjects.send();
    },

    setSpinEnabled: function (value) {
        this._spinEnabled = value;
        if (this._cachedPrizePoolProto && value) {
            this.onGetPrizePool(this._cachedPrizePoolProto);
            this._cachedPrizePoolProto = null;
        }
    },

    setJackpotIndex: function (jackpotIndex) {
        this.jackpotIndex = jackpotIndex;
        var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
        this.jackpotId = subject.jackpotIdList[this.jackpotIndex];
    },

    getJackpotType: function () {
        var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
        if(subject.jackpotInfoList && subject.jackpotInfoList.length > 0) {
            if(subject.jackpotInfoList[this.jackpotIndex]) {
                return subject.jackpotInfoList[this.jackpotIndex].jackpotType;
            }
            return JackpotType.JACKPOT_TYPE_NONE;
        }
        return JackpotType.JACKPOT_TYPE_NONE;
    },

    onChangeJackpotValue: function () {
        if(this.getJackpotType() === JackpotType.JACKPOT_TYPE_BET_ACCU) {
            var jackpotSubInfo = this.jackpotSubInfo;
            if(jackpotSubInfo) {
                var taxRatio = this.jackpotSubInfo.taxRatios[this.jackpotIndex];
                if(!cc.isUndefined(taxRatio)) {
                    var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
                    subject.jackpotInfoList[this.jackpotIndex].jackpotValue += this.curSpinCost * taxRatio;
                    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UPDATE_JACKPOT, null);
                }
            }
        }
    },

    sendGetSubjectJackpotInfos: function (subjectId) {
        var C2SGetSubjectJackpotInfos = require("../protocol/C2SGetSubjectJackpotInfos");
        var protocol = new C2SGetSubjectJackpotInfos();
        protocol.subjectId = subjectId;
        protocol.send();
    },

    /**
     * @param {S2CGetSubjectJackpotInfos} s2cGetSubjectJackpotInfos
     */
    onGetSubjectJackpotInfos: function (s2cGetSubjectJackpotInfos) {
        cc.log("onGetSubjectJackpotInfos");
        var subjectId = s2cGetSubjectJackpotInfos.subjectId;
        var subject = SlotConfigMan.getInstance().getSubject(subjectId);
        subject.jackpotInfoList = s2cGetSubjectJackpotInfos.jackpotInfoList;
        EventDispatcher.getInstance().dispatchEvent(CommonEvent.UPDATE_JACKPOT_INFO_LIST);
    },

    isUseServerBets: function () {
        return (this.jackpotSubInfo && this.jackpotSubInfo.bets && this.jackpotSubInfo.bets.length > 0);
    },

    getJackpotRecords: function () {
        var proto = new C2SGetJackpotRecords();
        proto.send();
    },

    /**
     * @param {Array.<JackpotRecord>} jackpotRecordArray
     */
    onGetJackpotRecords: function (jackpotRecordArray) {
        this._jackpotRecords = jackpotRecordArray;
    },

    /**
     * @param {JackpotRecord} jackpotRecord
     */
    onOtherWinJackpot: function (jackpotRecord) {
        var subject = SlotConfigMan.getInstance().getSubject(jackpotRecord.subjectId);
        if (jackpotRecord.winner.id != PlayerMan.getInstance().player.id) {
            var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
            if (subjectTmpl) {
                EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_OTHER_WIN_JACKPOT, new SlotOtherWinJackpotData(jackpotRecord.winner, subjectTmpl.displayName, jackpotRecord.winChips));
            }
        }
    },

    _driveJackpotRecords: function () {
        if (this._jackpotRecords && this._jackpotRecords.length > 0) {
            this.onOtherWinJackpot(this._jackpotRecords.shift());
        }
    },

    /**
     * time task is scheduled?
     * @returns {boolean}
     */
    canStartTimeTask: function () {
        if (this.isTimeTaskSchedule) {
            return false;
        }
        if (this.taskStep == TaskStep.TASK_STEP_TIME_TASK_END) {
            return false;
        }
        return true;
    },

    /**
     * schedule time task.
     */
    scheduleTimeTask: function () {
        if (!this.canStartTimeTask()) return;
        if (!this.taskInfo) return;
        var leftTaskTime = 0;
        var intervalTime = 0;
        switch(this.taskInfo.taskType) {
            case TaskType.TASK_FREE_MAX_SPIN:
                var seconds = this.taskInfo.taskData.seconds;
                leftTaskTime = Math.floor(seconds * (100 - this.taskProgress) / 100);
                intervalTime = seconds * 10;
                break;
            case TaskType.TASK_WIN_IN_LIMITED_TIME:
                leftTaskTime = this.taskLeftTime/1000;
                intervalTime = 1000;
                break;
            default:
                throw new Error("scheduleTimeTask : not handled taskType:" + this.taskInfo.taskType);
        }

        if (leftTaskTime > 0) {
            this.timeTaskEndTime = Date.now() + leftTaskTime * 1000;
            var self = this;
            this.timeTaskIntervalKey = setInterval(function () {
                EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_TIME_UPDATE_EVERY_SECOND);
                if (self.timeTaskEndTime <= Date.now()) {
                    self.unscheduleTimeTask();
                    self.onTimeTaskEnded();
                }
            }, intervalTime);
            this.isTimeTaskSchedule = true;
        } else {
            this.timeTaskEndTime = Date.now();
            EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_TIME_UPDATE_EVERY_SECOND);
            this.onTimeTaskEnded();
        }
    },

    /**
     * unschedule time task.
     */
    unscheduleTimeTask: function () {
        if (this.taskInfo && TaskType.isTimeTask(this.taskInfo.taskType)) {
            clearInterval(this.timeTaskIntervalKey);
            this.isTimeTaskSchedule = false;
        }
    },

    /**
     * time task end => (time end or taskProgress is 100)
     */
    onTimeTaskEnded: function () {
        if (!this.taskInfo) {
            return;
        }
        switch (this.taskInfo.taskType) {
            case TaskType.TASK_FREE_MAX_SPIN:
                this.setTaskStep(TaskStep.TASK_STEP_TIME_TASK_END);
                EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_TIME_TASK_COMPLETED);
                TaskMan.getInstance().sendCompleteTaskCmd(this.taskId, this.taskLevelId, this.levelStar);
                break;
            case TaskType.TASK_WIN_IN_LIMITED_TIME:
                if (this.taskProgress >= 100) return;
                this.setTaskStep(TaskStep.TASK_STEP_TIME_TASK_END);
                if (!this.isInFreeSpin) {
                    cc.log("spinStep:" + this.spinStep);
                    if (this.spinStep == SpinStep.SLOT_SPIN_END) {
                        //show failed dialog.
                        this.setTaskStep(TaskStep.TASK_STEP_FAILED);
                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG,
                            new MessageDialogData(MessageDialogType.SLOT_TASK_FAILED));
                    } else {
                        //is requesting data, judge it in SpinEnd.
                    }
                } else {
                    //in free spin, only set task step, judge it in FreeSpinEnd .
                }
                break;
        }
    },

    onTaskCompleted: function (event) {
        this.unscheduleTimeTask();
    },

    resetTask: function () {
        switch (this.taskInfo.taskType) {
            case TaskType.TASK_WIN_ON_FREE_SPIN:
                this.taskSpinCount = 0;
                break;
            case TaskType.TASK_WIN_IN_LIMITED_TIME:
                this.taskLeftTime = this.taskInfo.taskData.seconds * 1000;
                break;
        }
        this.taskProgress = 0;
        EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_REFRESH_TASK_INFO);
        this.setTaskStep(TaskStep.TASK_STEP_START);
    },

    isTimeTaskFailed: function () {
        if (this.taskStep == TaskStep.TASK_STEP_TIME_TASK_END) {
            if (this.taskProgress < 100) {
                return true;
            }
        }
        return false;
    },

    /**
     * if TaskStep == TaskStep.TASK_STEP_COMPLETED || TaskStep == TaskStep.TASK_STEP_FAILED, then can not spin.
     * @returns {boolean}
     */
    getSpinEnabled: function () {
        if (this.taskInfo) {
            switch (this.taskInfo.taskType) {
                case TaskType.TASK_FREE_MAX_SPIN:
                    if (!this.nextIsFreeSpin()) {
                        if (this.taskStep == TaskStep.TASK_STEP_COMPLETED ||
                            this.taskStep == TaskStep.TASK_STEP_FAILED ||
                            this.taskStep == TaskStep.TASK_STEP_TIME_TASK_END) {
                            return false;
                        }
                    }
                default :
                    if (this.taskStep == TaskStep.TASK_STEP_COMPLETED || this.taskStep == TaskStep.TASK_STEP_FAILED) {
                        return false;
                    }
                    break;
            }
        }
        return this._spinEnabled;
    },

    setTaskStep: function (taskStep) {
        this.taskStep = taskStep;
    },

    isFreeTask: function () {
        if (this.taskInfo) {
            var taskType = this.taskInfo.taskType;
            if (TaskType.TASK_FREE_MAX_SPIN == taskType || TaskType.TASK_FREE_MAX_SPIN_TIMES == taskType) {
                if (this.isMaxBet()) {
                    return true;
                }
            }
            if(TaskType.TASK_LIMITED_BET_AND_DURATION == taskType || TaskType.TASK_LIMITED_BET_AND_CHANCE == taskType)
            {
                return true;
            }
        }
        return false;
    },

    /**
     * unlock subject
     * @param {int} subjectId
     */
    unlockSubject: function (subjectId) {
        var C2SUnlockSubject = require("../protocol/C2SUnlockSubject");
        var proto = new C2SUnlockSubject();
        proto.subjectId = subjectId;
        proto.send();
    },

    /**
     * on unlock subject
     * @param {S2CUnlockSubject} s2cUnlockSubject
     */
    onUnlockSubject: function (s2cUnlockSubject) {
        var PopupMan = require("../../common/model/PopupMan");
        PopupMan.closeIndicator();
        if (s2cUnlockSubject.errorCode == ErrorCode.SUCCESS) {
            PlayerMan.getInstance().addGems(-s2cUnlockSubject.costGems, true);
            TaskMan.getInstance().addOpenSubjectId(s2cUnlockSubject.subjectId);
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.UNLOCK_SUBJECT, s2cUnlockSubject.subjectId);
            var ProductChangeReason = require("../../log/enum/ProductChangeReason");
            LogMan.getInstance().userProductRecord(ProductChangeReason.UNLOCK_SUBJECT, -s2cUnlockSubject.costGems, 0, 0, 0, s2cUnlockSubject.subjectId);

        //    var HourlyGameMan = require("../../social/model/HourlyGameMan");
        //    var subject = SlotConfigMan.getInstance().getSubject(s2cUnlockSubject.subjectId);
        //    if (subject.unlockCards && subject.unlockCards.length > 0) {
        //        HourlyGameMan.getInstance().unlockCards(subject.unlockCards);
        //    }
         } else {
            PopupMan.popupCommonDialog("NOTICE", ["Unlock failed."], "Ok");
        }
    },

    showTaskChooseDlg: function (taskLevelConfig) {
        var PopupMan = require("../../common/model/PopupMan");
        if (taskLevelConfig.taskList.length > 0) {
            var taskConfig = taskLevelConfig.taskList[0];
            this.taskLevelId = taskConfig.taskLevelId;
            this.levelStar = taskConfig.levelStar;
            PopupMan.popupTaskDestinyDlg(taskLevelConfig);
        }
    },

    sendSlotParam: function (param1) {
        var C2SSlotParam = require("../protocol/C2SSlotParam");
        var proto = new C2SSlotParam();
        proto.param1 = param1;
        proto.subjectId = this.subjectId;
        proto.send();
    },

    sendSpinUserStepLog: function () {
        var LogMan = require("../../log/model/LogMan");
        var UserStepId = require("../../log/enum/UserStepId");

        var spinTimes = StorageController.getInstance().getItem("spinTimes", 1);
        if(spinTimes <= 6) {
            if(spinTimes == 1) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN1, spinTimes);
            else if(spinTimes == 2) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN2, spinTimes);
            else if(spinTimes == 3) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN3, spinTimes);
            else if(spinTimes == 4) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN4, spinTimes);
            else if(spinTimes == 5) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN5, spinTimes);
            else if(spinTimes == 6) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN6, spinTimes);
        }
    },

    sendSpinResultUserStepLog: function () {
        var LogMan = require("../../log/model/LogMan");
        var UserStepId = require("../../log/enum/UserStepId");

        var spinTimes = StorageController.getInstance().getItem("spinTimes", 1);
        if(spinTimes <= 6) {
            if(spinTimes == 1) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN_SUCCESS1, spinTimes);
            else if(spinTimes == 2) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN_SUCCESS2, spinTimes);
            else if(spinTimes == 3) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN_SUCCESS3, spinTimes);
            else if(spinTimes == 4) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN_SUCCESS4, spinTimes);
            else if(spinTimes == 5) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN_SUCCESS5, spinTimes);
            else if(spinTimes == 6) LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_SPIN_SUCCESS6, spinTimes);

            spinTimes++;
            StorageController.getInstance().setItem("spinTimes", spinTimes);
        }
    }
});

ClassicSlotMan._instance = null;
ClassicSlotMan._firstUseInstance = true;

ClassicSlotMan.getInstance = function () {
    if (ClassicSlotMan._firstUseInstance) {
        ClassicSlotMan._firstUseInstance = false;
        ClassicSlotMan._instance = new ClassicSlotMan();
        setInterval(function () {
            ClassicSlotMan._instance._driveJackpotRecords();
        }, 30000);
    }
    return ClassicSlotMan._instance;
};

module.exports = ClassicSlotMan;