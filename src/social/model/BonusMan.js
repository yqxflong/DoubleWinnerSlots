/**
 * Created by qinning on 15/5/8.
 */
var GameDirector = require("../../common/model/GameDirector");
var C2SGetDailyBonus = require("../../social/protocol/C2SGetDailyBonus");
var C2SGetHourlyBonus = require("../../social/protocol/C2SGetHourlyBonus");
var C2SClaimHourlyBonus = require("../../social/protocol/C2SClaimHourlyBonus");
var C2SClaimDailyBonus = require("../../social/protocol/C2SClaimDailyBonus");
var C2SGetMultiHourlyBonus = require("../../social/protocol/C2SGetMultiHourlyBonus");
var C2SClaimMultiHourlyBonus = require("../../social/protocol/C2SClaimMultiHourlyBonus");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var PlayerMan = require("../../common/model/PlayerMan");
var ErrorCode = require("../../common/enum/ErrorCode");
var Config = require("../../common/util/Config");
var SocialEvents = require("../events/SocialEvents");
var PopupMan = require("../../common/model/PopupMan");
var SceneMan = require("../../common/model/SceneMan");
var LogMan = require("../../log/model/LogMan");
var ThemeName = require("../../common/enum/ThemeName");
var HourlyBonusType = require("../enum/HourlyBonusType");
var C2SLikeUs = require("../protocol/C2SLikeUs");

var ONE_HOUR_MILLION_SECONDS = 3600 * 1000;

var BonusMan = cc.Class.extend({
    /**
     * @params {long} millionSeconds
     */
    collectEndTime: 0,
    hourlyBonusStage: 0,
    hourlyBonusType: HourlyBonusType.HOURLY_BONUS_SINGLE,
    MAX_STAGE: 0,
    ctor: function () {

    },

    sendBonusCmd: function() {
        if(ThemeName.THEME_WTC === Config.themeName || ThemeName.THEME_DOUBLE_HIT === Config.themeName) {
            this.hourlyBonusType = HourlyBonusType.HOURLY_BONUS_MULTI;
            if (ThemeName.THEME_DOUBLE_HIT === Config.themeName) {
                this.MAX_STAGE = 3;
            } else {
                this.MAX_STAGE = 4;
            }
        } else {
            this.hourlyBonusType = HourlyBonusType.HOURLY_BONUS_SINGLE;
        }
        this.sendGetHourlyBonusCmd();
    },

    beginSchedule: function () {
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
    },

    stopSchedule: function () {
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
    },

    update: function(dt) {
        if (this.collectEndTime - Date.now() >= 0) {
            var leftTime = this.collectEndTime - Date.now();
            if (leftTime >= 0) {
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED, leftTime);
            }else{
                this._updateLeftTime();
            }
        }else{
            this._updateLeftTime();
        }
    },

    _updateLeftTime: function () {
        if(this.hourlyBonusType === HourlyBonusType.HOURLY_BONUS_SINGLE) {
            this.stopSchedule();
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED, 0);
        } else {
            this.hourlyBonusStage++;
            if(this.hourlyBonusStage >= this.MAX_STAGE) {
                this.stopSchedule();
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED, 0);
            } else {
                this.collectEndTime = PlayerMan.getInstance().serverConfig.multiHourlyBonusInterval + Date.now();
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED, this.collectEndTime - Date.now());
            }
        }
    },

    sendGetHourlyBonusCmd: function () {
        if(this.hourlyBonusType == HourlyBonusType.HOURLY_BONUS_MULTI) {
            this._sendGetMultiHourlyBonusCmd();
        } else {
            this._sendGetHourlyBonusCmd();
        }
    },

    _sendGetHourlyBonusCmd: function () {
        var c2sGetHourlyBonus = new C2SGetHourlyBonus();
        c2sGetHourlyBonus.send();
    },

    sendGetDailyBonusCmd: function () {
        var c2sGetDailyBonus = new C2SGetDailyBonus();
        c2sGetDailyBonus.send();
    },

    sendClaimHourlyBonusCmd: function () {
        var c2sClaimHourlyBonus = new C2SClaimHourlyBonus();
        c2sClaimHourlyBonus.send();
    },

    sendClaimDailyBonusCmd: function () {
        var c2sClaimDailyBonus = new C2SClaimDailyBonus();
        c2sClaimDailyBonus.send();
    },

    _sendGetMultiHourlyBonusCmd: function () {
        var c2sGetHourlyBonus = new C2SGetMultiHourlyBonus();
        c2sGetHourlyBonus.send();
    },

    sendClaimMultiHourlyBonusCmd: function () {
        var c2sClaimHourlyBonus = new C2SClaimMultiHourlyBonus();
        c2sClaimHourlyBonus.send();
    },

    _onGetHourlyBonus: function(leftTime) {
        this.collectEndTime = leftTime + Date.now();
        if(leftTime <= 0) {
            this.stopSchedule();
        }else{
            this.beginSchedule();
        }
        EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED,leftTime);
    },

    /**
     * @params {S2CGetHourlyBonus} hourlyBonus
     */
    onGetHourlyBonus: function(hourlyBonus) {
        SceneMan.getInstance().onHourlyBonusReady();
        this._onGetHourlyBonus(hourlyBonus.leftTime);
    },

    /**
     * @params {S2CGetDailyBonus} dailyBonus
     */
    onGetDailyBonus: function (dailyBonus) {
        if (!dailyBonus.todayClaimed) {
            var DailyBonusBgController = require("../controller/DailyBonusBgController");
            var bonusNode = DailyBonusBgController.createFromCCB();
            bonusNode.controller.onGetDailyBonus(dailyBonus);
            bonusNode.controller.popup();
        }
    },

    /**
     * @params {S2CClaimHourlyBonus} claimHourlyBonus
     */
    onClaimHourlyBonus: function(claimHourlyBonus) {
        PopupMan.closeIndicator();
        if (claimHourlyBonus.errorCode == ErrorCode.SUCCESS) {
            PlayerMan.getInstance().addChips(claimHourlyBonus.chipCount, true);
            EventDispatcher.getInstance().dispatchEvent(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS,claimHourlyBonus.chipCount);
            var ProductChangeReason = require("../../log/enum/ProductChangeReason");
            LogMan.getInstance().userProductRecord(ProductChangeReason.GET_HOUR_BONUS, 0, claimHourlyBonus.chipCount, 0, 0, 0);
        }
        this._onGetHourlyBonus(claimHourlyBonus.nextLeftTime);
    },

    /**
     * @params {S2CClaimDailyBonus} claimDailyBonus
     */
    onClaimDailyBonus: function(claimDailyBonus) {
        PopupMan.closeIndicator();
        if(claimDailyBonus.errorCode == ErrorCode.SUCCESS) {
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.DAILY_BONUS_RECEIVED);
        } else {
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.DAILY_BONUS_RECEIVED);
        }
    },

    /**
     *
     * @param {S2CGetMultiHourlyBonus} getMultiHourlyBonus
     */
    onGetMultiHourlyBonus: function(getMultiHourlyBonus) {
        SceneMan.getInstance().onHourlyBonusReady();
        this.hourlyBonusStage = getMultiHourlyBonus.stage;
        //hack,add 1 second
        if (getMultiHourlyBonus.leftTime < ONE_HOUR_MILLION_SECONDS - 1000) {
            getMultiHourlyBonus.leftTime += 1000;
        }
        this._onGetHourlyBonus(getMultiHourlyBonus.leftTime);
    },

    /**
     *
     * @param {S2CClaimMultiHourlyBonus} claimMultiHourlyBonus
     */
    onClaimMultiHourlyBonus: function(claimMultiHourlyBonus) {
        PopupMan.closeIndicator();
        if (claimMultiHourlyBonus.errorCode != ErrorCode.SUCCESS) return;
        this.hourlyBonusStage = 0;
        PlayerMan.getInstance().addChips(claimMultiHourlyBonus.chipCount, true);
        EventDispatcher.getInstance().dispatchEvent(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS,claimMultiHourlyBonus.chipCount);
        this._onGetHourlyBonus(claimMultiHourlyBonus.nextLeftTime);
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");
        LogMan.getInstance().userProductRecord(ProductChangeReason.GET_HOUR_BONUS, 0, claimMultiHourlyBonus.chipCount, 0, 0, 0);
    },

    doLikeUs: function () {
        cc.sys.openURL(Config.fanPageUrl);
        if (!PlayerMan.getInstance().player.likeUs) {
            this.sendLikeUsCmd();
        }
    },

    sendLikeUsCmd: function () {
        var proto = new C2SLikeUs();
        proto.send();
    },

    /**
     * @param {S2CLikeUs} s2cLikeUs
     */
    onLikeUs: function (s2cLikeUs) {
        PlayerMan.getInstance().player.likeUs = true;
    }

});

BonusMan._instance = null;
BonusMan._firstUseInstance = true;

/**
 *
 * @returns {BonusMan}
 */
BonusMan.getInstance = function () {
    if (BonusMan._firstUseInstance) {
        BonusMan._firstUseInstance = false;
        BonusMan._instance = new BonusMan();
    }
    return BonusMan._instance;
};

module.exports = BonusMan;