/**
 * Created by qinning on 15/5/12.
 */

var LogType = require("../enum/LogType");
var ActionType = require("../enum/ActionType");
var PlayerMan = require("../../common/model/PlayerMan");
var Util = require("../../common/util/Util");
var Config = require("../../common/util/Config");
var ServerURLType = require("../../common/enum/ServerURLType");
var HttpClient = require("../../common/net/HttpClient");
var DeviceInfo = require("../../common/util/DeviceInfo");
var StorageController = require("../../common/storage/StorageController");

/**
 * log send interval
 * @type {number}
 */
var SEND_LOG_TIME = 60;

var LogMan = cc.Class.extend({

    PAGE_AD_SHOW : 0,
    PAGE_AD_STATISTIC : 1,
    PAGE_REWARD_AD_SHOW : 2,
    PAGE_REWARD_AD_STATISTIC : 3,
    _countDownTime : 0,
    _netWorkBufArr : null,

    lastChips: 0,
    lastGems: 0,
    lastLevel: 0,
    lastStars: 0,
    lastTime: 0,
    lastRound: 0,
    currentBet: 0,
    totalBet: 0,
    bonusRecordTime: 0,
    wholeGameRunningTime: 0,
    /**
     * @type {number} - the maximum spin latency during the player in the slots.
     */
    _maxSpinLatency: 0,
    /**
     * @type {number} - the average spin latency during the player in the slots.
     */
    _totalSpinLatency: 0,
    _spinTime: 0,

    _sendUserStepMap: null,

    adRequests:null,
    adImpression: null,
    rewardAdReadyTimes: 0,

    ctor : function() {
        if (cc.sys.isNative) {
            this.beginSchedule();
        }
        this._countDownTime = 0;
        this._netWorkBufArr = [];
        this._sendUserStepMap = {};
        this.clearAdData();
    },
    clearAdData: function() {
        this.rewardAdReadyTimes = 0;
        this.adRequests = [0, 0, 0, 0, 0];
        this.adImpression = [0, 0, 0, 0, 0];
    },
    beginSchedule: function() {
        cc.director.getScheduler().scheduleCallbackForTarget(this,this.update,1, cc.REPEAT_FOREVER, 0, false);
    },

    stopSchedule: function () {
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
    },

    update : function(dt) {
        this._countDownTime += dt;
        var player = PlayerMan.getInstance().player;
        if (player && player.iapTotal <= 0) {
            if(this._countDownTime > SEND_LOG_TIME) {
                this._countDownTime = 0;
                this.flushToServer();
            }
        } else {
            this.flushToServer();
        }
    },

    loginRecord: function (loginPage, loginResult, loginType, actionType, fbId, arg1) {
        var logContent = {};
        logContent["login_page"] = loginPage;
        logContent["loginResult"] = loginResult;
        logContent["loginType"] = loginType;
        logContent["user_action"] = actionType;
        logContent["FBID"] = fbId;
        logContent["arg1"] = arg1;
        logContent["platform"] = "Facebook";
        this.enqueue(LogType.LOG_LOGIN_RECORD, logContent);
    },

    /**
     *
     * @param {int} purchasePage
     * @param {ShopProduct} product
     * @param {int} shopType
     * @param {int} purchaseRetCode
     * @param {int} userAction
     * @param {int} arg1
     */
    purchaseRecord: function(purchasePage,product,shopType,purchaseRetCode,userAction,arg1) {

        var logContent = {};
        logContent["purchase_page"] = purchasePage;
        logContent["purchase_retCode"] = purchaseRetCode;
        logContent["user_action"] = userAction;
        logContent["arg1"] = arg1;
        if (product) {
            logContent["pid"] = product.pid;
            logContent["productType"] = product.type;
            logContent["productCount"] = product.quantity;
            logContent["price"] = product.price;
            logContent["priceUS"] = product.priceUS;
            //logContent["vipPoints"] = product.vipPoints;
        }
        logContent["discountType"] = shopType;
        var player = PlayerMan.getInstance().player;
        logContent["cur_coin"] = player.chips;
        logContent["cur_gem"] = player.gems;
        var TaskMan = require("../../task/model/TaskMan");
        var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
        logContent["cur_level"] = TaskMan.getInstance().getCurTaskLevel();
        logContent["cur_star"] = player.stars;

        logContent["task_level"] = TaskMan.getInstance().getCurTaskLevel();
        logContent["task_id"] = ClassicSlotMan.getInstance().taskId;

        this.enqueue(LogType.LOG_PURCHASE_RECORD, logContent);

    },

    socialRecord: function(curPage,userAction){
        var logContent = {};
        logContent["cur_page"] = curPage;
        logContent["user_action"] = userAction;
        this.enqueue(LogType.LOG_SOCIAL, logContent);
    },
/*
    bonusRecord: function(bonusPage,userAction,ret,arg1) {
        var logContent = {};
        logContent["bonus_page"] = bonusPage;
        logContent["user_action"] = userAction;
        logContent["ret"] = ret;
        logContent["arg1"] = arg1;
        logContent["cur_coin"] = PlayerMan.getInstance().player.chips;
        //logContent["cur_gem"] = arg1;
        logContent["cur_level"] = PlayerMan.getInstance().player.level;
        //logContent["cur_vipLevel"] = PlayerMan.getInstance().level;

        if (userAction == ActionType.ENTER) {
            this.bonusRecordTime = Util.getCurrentTime();
            logContent["c_time"] = 0;
        }
        else if (userAction == ActionType.LEAVE) {
            logContent["c_time"] = parseInt((Util.getCurrentTime() - this.bonusRecordTime)/1000);
            this.bonusRecordTime = 0;
        }
        this.enqueue(LogType.LOG_BONUS, logContent);
    },
*/
    incentiveAdRecord:function (recordType, appID) {

        var logContent = {};
        logContent["recordType"] = recordType;

        if(!appID)
            logContent["appID"] = appID;

        this.enqueue(LogType.LOG_INCENTIVE_AD_INFO,logContent);
    },
    gameStatusRecord: function(action){
        var logContent = {};
        logContent["action"] = action;
        if (action == ActionType.ENTER)
        {
            this.wholeGameRunningTime = Util.getCurrentTime();
            logContent["begin_time"] = this.wholeGameRunningTime;
            logContent["c_time"] = 0;
            logContent["spinTotal"] = 0;
            this.clearAdData();
        }
        if (action == ActionType.ENTER)
        {
            logContent["begin_time"] = this.wholeGameRunningTime;
            logContent["c_time"] = parseInt((Util.getCurrentTime() - this.wholeGameRunningTime)/1000);
            //logContent["spinTotal"] = PlayerMan.getInstance().getSlotsSpinTotal();
            this.wholeGameRunningTime = Util.getCurrentTime();
        }

        //if (PlayerMan.getInstance().getChangeTime() != 0 && action == ActionType.LEAVE)
        //{
        //    GameRecord(PlayerMan::getInstance().getGameType(), RecordSystem_UserAction_Quit, static_cast<int32_t>(PlayerMan::getInstance().getGameRoomId()), PlayerMan::getInstance().getGameSujectId(), 0, 0, 0, 0);
        //}
        this.enqueue(LogType.LOG_GAME_STATUS, logContent);
    },

    faceBookRecord: function(action,message,returnMsg,arg1){
        var logContent = {};
        logContent["action"] = action;
        logContent["message"] = message;
        logContent["returnmsg"] = returnMsg;
        logContent["arg1"] = arg1;
        this.enqueue(LogType.LOG_FACE_BOOK_RECORD,logContent);
    },

    userProductRecord: function(reason,gem,coin,level,star,arg1,arg2) {
        var TaskMan = require("../../task/model/TaskMan");
        var player = PlayerMan.getInstance().player;
        if (player) {
            var logContent = {};
            logContent["reason"] = reason;
            logContent["c_gem"] = gem;
            logContent["c_coin"] = coin;
            logContent["c_level"] = level > 0 ? (level - TaskMan.getInstance().getCurTaskLevel()) : 0;
            logContent["c_star"] = star;
            logContent["arg1"] = arg1;
            logContent["arg2"] = arg2;

            logContent["cur_coin"] = player.chips;
            logContent["cur_gem"] = player.gems;
            logContent["cur_level"] = level > 0 ? level : TaskMan.getInstance().getCurTaskLevel();
            logContent["cur_star"] = player.stars;
            this.enqueue(LogType.LOG_USER_PRODUCT_RECORD, logContent);
        }

    },

    playerRecord: function(profile){
        /*
        var logContent = {};
        logContent["id"] = profile._id;
        logContent["gender"] = profile.gender;
        logContent["location"] = profile.hometown;
        logContent["nickname"] = profile.name);
        logContent["facebookId"] = profile.fbId);
        logContent["level"] = profile.level);
        logContent["exp"] = profile.exp);
        logContent["gold"] = profile.gems);
        logContent["chips"] = profile.coins);
        logContent["vipLevel"] = profile.vipLevel);
        logContent["vipPoints"] = profile.vipPoints);
        logContent["purchaseCount"] = PlayerMan::getInstance().getPlayerDetail().purchaseCount);
        logContent["iapTotal"] = PlayerMan::getInstance().getPlayerDetail().iapTotal);
        */
    },

    slotRecord: function(record){
        var logContent = {};
        logContent["spin"] = record.spin;
        logContent["maxWin"] = record.maxWin;
        logContent["totalWin"] = record.totalWin;
        logContent["wins"] = record.wins;
        this.enqueue(LogType.LOG_SLOT_RECORD, logContent);
    },

    /**
     * @param {number} gameType - game type, there is only slots currently
     * @param {number} userAction - what is the player doing
     * @param {number} subjectId
     */
    gameRecord: function (gameType, userAction, subjectId) {
        var TaskMan = require("../../task/model/TaskMan");
        var logContent = {};
        logContent["cur_game"] = gameType;
        logContent["user_action"] = userAction;
        logContent["subjectId"] = subjectId;

        /**
         * @type {number} avgSpin - the average spin latency
         */
        var avgSpin = 0;
        if (this.lastRound > 0) {
            avgSpin = this._totalSpinLatency / this.lastRound;
        }

        logContent["avg_spin"] = avgSpin;
        logContent["max_spin"] = this._maxSpinLatency;

	    var player = PlayerMan.getInstance().player;

        logContent["cur_coin"] = player.chips;
        logContent["cur_gem"] = player.gems;
        logContent["cur_level"] = TaskMan.getInstance().getCurTaskLevel();
        logContent["cur_star"] = player.stars;

        if (userAction == ActionType.ENTER) {
            this.resetRecord();

            logContent["c_coin"] = 0;
            logContent["c_gem"] = 0;
            logContent["c_level"] = 0;
            logContent["c_time"] = 0;
            logContent["c_star"] = 0;
            logContent["c_round"] = 0;
            logContent["avg_bets"] = 0;
            return;
        }
        else if (userAction == ActionType.LEAVE) {
            logContent["c_coin"] = player.chips - this.lastChips;
            logContent["c_gem"] = player.gems - this.lastGems;
            logContent["c_level"] = TaskMan.getInstance().getCurTaskLevel() - this.lastLevel;
            logContent["c_star"] = player.stars - this.lastStars;
            logContent["c_time"] = parseInt((Util.getCurrentTime() - this.lastTime) * 0.001);
            logContent["c_round"] = this.lastRound;
            logContent["avg_bets"] = (this.lastRound != 0) ? (this.totalBet / this.lastRound) : 0;
        }
        this.enqueue(LogType.LOG_GAME_RECORD, logContent);
    },

    resourceUpdateRecord: function (errorType,info) {
        var logContent = {};
        logContent["type"] = errorType;
        logContent["info"] = info;
        this.enqueue(LogType.LOG_RESOURCE_UPDATE_RECORD, logContent);
    },

    errorInfo: function (errorType, info) {
        var logContent = {};
        logContent["type"] = errorType;
        logContent["info"] = info;
        this.enqueue(LogType.LOG_ERROR_INFO, logContent);
    },

    helpMsg: function (content) {
        var logContent = {};
        logContent["user_message"] = content;
        this.enqueue(LogType.LOG_HELP_MSG, logContent);
    },
    rewardAdRecord: function(curPage, para1) {
        if(!cc.sys.isNative){
            return;
        }
        var logContent = {};
        var AdControlMan = require("../../ads/model/AdControlMan");
        var showAd = AdControlMan.getInstance().shouldShowRewardAdWithoutInterval();
        if(!showAd){
            cc.log("adRecord return false");
            return;
        }
        logContent["cur_page"] = curPage;
        cc.log("rewardAdRecord para1 = " + para1);
        if(!cc.isUndefined(para1) && curPage == this.PAGE_REWARD_AD_STATISTIC) {
            logContent["readyTimes"] = para1;
        }
        else if(!cc.isUndefined(para1) && curPage == this.PAGE_REWARD_AD_SHOW) {
            logContent["placement"] = para1;
        }
        this.enqueue(LogType.LOG_AD_INFO, logContent);
    },
    adRecord: function(curPage, channel, location, request, impression){
        if(!cc.sys.isNative){
            return;
        }
        cc.log("adRecord " +curPage);
        var logContent = {};
        var AdControlMan = require("../../ads/model/AdControlMan");
        var showAd = AdControlMan.getInstance().shouldShowAdsWithoutInterval();
        if(!showAd){
            cc.log("adRecord return false");
            return;
        }
        logContent["cur_page"] = curPage;
        if(channel.length > 0){
            logContent["channel"] = channel;
        }
        if(location.length > 0){
            logContent["location"] = location;
        }
        if( request !== undefined && request &&  request.length > 0){
            for(var i = 0; i < request.length; i++){
                logContent["req"+i] = request[i];
            }
        }
        if( impression !== undefined && impression &&  impression.length > 0){
            for(var i = 0; i < impression.length; i++){
                logContent["imp"+i] = impression[i];
            }
        }

        this.enqueue(LogType.LOG_AD_INFO, logContent);
    },
    addGameRound: function (delta) {
        this.lastRound += delta;

        this.totalBet += this.currentBet;
        var currentSpinLatency = Date.now() - this._spinTime;
        if (currentSpinLatency > this._maxSpinLatency) {
            this._maxSpinLatency = currentSpinLatency;
        }
        this._totalSpinLatency += currentSpinLatency;
    },

    resetRecord: function () {
        var TaskMan = require("../../task/model/TaskMan");
        var player = PlayerMan.getInstance().player;
        this.lastChips = player.chips;
        this.lastGems = player.gems;
        this.lastLevel = TaskMan.getInstance().getCurTaskLevel();
        this.lastStars = player.stars;
        this.lastTime = Util.getCurrentTime();
        this.lastRound = 0;
        this.currentBet = 0;
        this.totalBet = 0;
        this._maxSpinLatency = 0;
        this._totalSpinLatency = 0;
        this._spinTime = 0;
    },

    userStepRecord: function (stepId, arg1) {
        if (this._sendUserStepMap[stepId]) {
            return;
        }
        this._sendUserStepMap[stepId] = true;

        var logContent = {};
        logContent["step"] = stepId;
        logContent["arg1"] = arg1;
        logContent["clientVer"] = Config.getAppVersion();
        logContent["installTs"] = parseInt(StorageController.getInstance().getItem("firstOpenTime"));
        if (PlayerMan.getInstance() && PlayerMan.getInstance().isLoginIn) {
            var player = PlayerMan.getInstance().player;
            logContent["FBID"] = player.facebookId;
            logContent["createTs"] = player.createTime;
            logContent["getData"] = true;
        } else {
            logContent["FBID"] = "";
            logContent["createTs"] = "";
            logContent["getData"] = false;
        }
        logContent["cliTs"] = Date.now();

        this.enqueue(LogType.LOG_USER_STEP, logContent, true);
    },

    shareRecord: function (curPage, userAction) {
        var logContent = {};
        logContent["cur_page"] = curPage;
        logContent["user_action"] = userAction;
        this.enqueue(LogType.LOG_SHARE_RECORD, logContent);
    },

    /**
     *
     */
    logSpinTime: function () {
        this._spinTime = Date.now();
    },
    enqueue: function (logType, logContent) {
        var player = PlayerMan.getInstance().player;
        logContent["UDID"] = DeviceInfo.getDeviceId();
        logContent["PT"] = DeviceInfo.getTargetPlatform();
        if (player) {
            logContent["PID"] = player.id;
            logContent["IAP"] = player.iapTotal;
            logContent["g"] = player.g;
            logContent["gV"] = player.gV;
        } else {
            logContent["IAP"] = 0;
        }

        var logObj = {};
        logObj["type"] = LogType.description(logType);
        logObj["value"] = logContent;

        this.send(logObj);
    },

    send: function (data) {
        this._netWorkBufArr.push(data);
        if(!cc.sys.isNative) {
            this.flushToServer();
        }
    },

    flushToServer : function() {
        if(this._netWorkBufArr.length == 0) {
            return;
        }
        var content = {};
        content["projName"] = Config.logProjName;
        content["actions"] = this._netWorkBufArr;

        var sendObj = {};
        sendObj["content"] = content;

        var url = Config.getServerURL(ServerURLType.LOG_SERVER_URL);

        cc.log("logMan send:"+JSON.stringify(sendObj));

        var headers = {};
        headers["Content-Type"] = "application/json;charset=UTF-8";

        HttpClient.doPost(url, JSON.stringify(sendObj), headers, function (error, txt) {
            if (error) {
                cc.log("HttpClient doPost error:" + error + ", " + txt);
            }
        });

        this._netWorkBufArr = [];
    }
});

LogMan._instance = null;
LogMan._firstUseInstance = true;

/**
 *
 * @returns {LogMan}
 */
LogMan.getInstance = function () {
    if (LogMan._firstUseInstance) {
        LogMan._firstUseInstance = false;
        LogMan._instance = new LogMan();
    }
    return LogMan._instance;
};

module.exports = LogMan;