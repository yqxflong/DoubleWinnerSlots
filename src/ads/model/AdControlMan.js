var AdStruct = require("../entity/AdStruct");
var PlayerMan = require("../../common/model/PlayerMan");
var AdPlace = require("../enum/AdPlace");
var C2SAdControl = require("../protocol/C2SAdControl");
var LogMan = require("../../log/model/LogMan");
var RewardAdConfig = require("../entity/RewardAdConfig");
var ClientAppVersion = require("../../common/enum/ClientAppVersion");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");

/**
 * Created by alanmars on 15/5/18.
 */

var SHOW_AD_INTERVAL_SLOTS = 1200;
var SHOW_AD_INTERVAL_LOBBY = 120;
var UPDATE_INTERVAL = 10;
var ZEN_LOCATION_CROSSPROMOTION = 100001;
var ZEN_AD_SHOW_SUCCEED             = 0;
var AD_MIN_INTERVAL = 5000;

var AdControlMan = cc.Class.extend({
    /**
     * @param {Array.<AdStruct>}
     */
    _adSettings: null,
    /**
     * @param {AdStruct}
     */
    _rewardAd: null,
    _isInited: false,
    _showAd: false,
    _showLevel: 0,
    _showPurchased: false,
    _lastShowAdTime: 0,

    _rewardAdReady: false,
    _lastShowRewardAdTime: 0,
    _rewardAdConfig: null,

    _receiveServerConfig: false,

    rewardVideoTimes: 0,

    _lockScreenFlag: false,

    ctor: function () {
        this._showAd = true;
        this._showLevel = 50;
        this._showPurchased = false;


        this._adSettings = [];
        this._adSettings.push(new AdStruct(1, 0, 0));
        this._adSettings.push(new AdStruct(1, SHOW_AD_INTERVAL_LOBBY, SHOW_AD_INTERVAL_LOBBY));
        this._adSettings.push(new AdStruct(1, SHOW_AD_INTERVAL_SLOTS, 120));
        this._adSettings.push(new AdStruct(1, SHOW_AD_INTERVAL_LOBBY, SHOW_AD_INTERVAL_LOBBY));
        this._adSettings.push(new AdStruct(1, SHOW_AD_INTERVAL_SLOTS, SHOW_AD_INTERVAL_SLOTS));


        this._rewardAd = new AdStruct(1, 0, 0);
        this._rewardAd.isReadyForShow = true;
        this._rewardAd.showInterval = 60;
        this._rewardAd.deltaTime = this._rewardAd.showInterval;
        for (var i = 0; i < this._adSettings.length; ++i) {
            this._adSettings[i].isFirstShow = true;
        }

        this._rewardAdConfig = new RewardAdConfig();

        if (cc.sys.isNative) {
            jsb_wtc.adsHelper.OnAdFinished = this.OnAdFinishedJsb.bind(this);
            jsb_wtc.adsHelper.onRewardedVideoFinished = this.onRewardedVideoFinishedJsb.bind(this);
            jsb_wtc.adsHelper.onRewardedVideoBegin = this.onRewardedVideoBeginJsb.bind(this);
            jsb_wtc.adsHelper.onRewardedVideoEnd = this.onRewardedVideoEndJsb.bind(this);
        }
    },

    beginSchedule: function () {
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.longUpdate, UPDATE_INTERVAL, cc.REPEAT_FOREVER, 0, false);
    },

    stopSchedule: function () {
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.longUpdate);
    },

    longUpdate: function (dt) {
        for (var i = 0; i < this._adSettings.length; ++i) {
            var adSetting = this._adSettings[i];
            if (!adSetting.isReadyForShow) {
                adSetting.deltaTime -= dt;
            }

            if (adSetting.deltaTime <= 0) {
                if (!adSetting.isReadyForShow && i === AdPlace.SLOT_SCENE) {
                   LogMan.getInstance().adRequests[i]++;
                }
                adSetting.isReadyForShow = true;
                adSetting.deltaTime = adSetting.showInterval;
            }
        }
        if(this.shouldShowRewardAdWithoutInterval() && !this._rewardAdReady) {
            var isReady = this.isRewardVideoReady() && !this.isRewardAdCooling();
            cc.log("isReady = " + isReady);
            if(isReady != this._rewardAdReady) {
                this._rewardAdReady = isReady;
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.SOCIAL_REWARD_VIDEO, null);
                cc.log("1 readyTimes = " + LogMan.getInstance().rewardAdReadyTimes);
                if(this._rewardAdReady) {
                   LogMan.getInstance().rewardAdReadyTimes++;
                }
                cc.log("2 readyTimes = " + LogMan.getInstance().rewardAdReadyTimes);
            }
        }
        EventDispatcher.getInstance().dispatchEvent(CommonEvent.SOCIAL_REWARD_VIDEO, null);
    },

    onStart: function () {
        if (this._isInited) {
            return;
        }
        this.beginSchedule();
        this._isInited = true;
        if (cc.sys.isNative) {
            jsb_wtc.adsHelper.SetEnableAD(true);
            jsb_wtc.adsHelper.PrepareAD();
        }
    },

    shouldShowAds: function () {
        if (this.shouldShowAdsWithoutInterval()) {
            if ((Date.now() - this._lastShowAdTime) <= AD_MIN_INTERVAL) {
                return false;
            }
            return true;
        }
        return false;
    },

    shouldShowAdsWithoutInterval: function () {
        if (!this._showAd || (PlayerMan.getInstance().hasPurchased() && !this._showPurchased)) {
            return false;
        }
        var TaskMan = require("../../task/model/TaskMan");
        if (TaskMan.getInstance().getCurTaskLevel() < this._showLevel) {
            return false;
        }
        return true;
    },

    enterSlotSceneShowAd: function () {
        var adSetting = this._adSettings[AdPlace.SLOT_SCENE];
        adSetting.isReadyForShow = false;
        adSetting.deltaTime = adSetting.showFirstInterval;
    },

    slotSceneShowAd: function () {
        this.showAdAtPlace(AdPlace.SLOT_SCENE);
    },

    lobbySceneShowAd: function () {
        this.showAdAtPlace(AdPlace.LOBBY_SCENE);
    },

    enterForeShowAd: function () {
        this.showAdAtPlace(AdPlace.ENTER_FORE);
    },

    enterGameShowAd: function () {
        if (!this.shouldShowAds()) {
            return;
        }
        var place = AdPlace.ENTER_GAME;

        if (!this._adSettings[place].showAds) {
            return;
        }

        if (this._adSettings[place].isFirstShow) {
            this._adSettings[place].isFirstShow = false;
            this._adSettings[place].isReadyForShow = false;

            if (cc.sys.isNative) {
                jsb_wtc.adsHelper.showAdWhenReady(0);
            }
        }
    },

    showAdAtPlace: function (place) {
        if (!this.shouldShowAds()) {
            return;
        }

        if (!this._adSettings[place].showAds) {
            return;
        }

        if (this._adSettings[place].isReadyForShow) {
            cc.log("Show Ads at %d", place);
            if (cc.sys.isNative) {
                if (place !== AdPlace.SLOT_SCENE) {
                   LogMan.getInstance().adRequests[place]++;
                }
                jsb_wtc.adsHelper.showAd(place);
            }
        }
    },

    showEnterGameAd: function () {
        if (cc.sys.isNative) {
            jsb_wtc.adsHelper.showAdWhenReady(0);
        }
    },

    cacheInterstitial: function () {
        if (!this.shouldShowAds()) {
            return;
        }
//    AdsInterface::cacheInterstitial();
    },

    sendGetAdSettingCmd: function () {
        var c2sAdControl = new C2SAdControl();
        c2sAdControl.send();
    },

    /**
     * @param settings {S2CAdControl}
     */
    onGetAdsSettings: function (settings) {
        cc.log("onGetAdsSettings");
        this._showAd = settings.adControl.showAds;
        this._showLevel = settings.adControl.showLevel;
        this._showPurchased = settings.adControl.purchaseShow;
        this._rewardAdConfig = settings.adControl.rewardAdConfig;
        cc.log("_rewardAdConfig" + JSON.stringify(this._rewardAdConfig));
        this._lockScreenFlag = settings.adControl.lockScreenFlag;
        for (var i = 0; i < settings.adControl.adSettings.length; ++i) {
            var set = settings.adControl.adSettings[i];
            var place = set.placeId;
            if (place < 0 || place >= AdPlace.NUM) {
                continue;
            }

            this._adSettings[place].showAds = set.showAd;
            this._adSettings[place].showInterval = set.showInterval;
            this._adSettings[place].showFirstInterval = set.showFirstInterval;
            if (this._adSettings[place].deltaTime > set.showFirstInterval && this._adSettings[place].isFirstShow) {
                this._adSettings[place].deltaTime = set.showFirstInterval;
            }
        }

        this.rewardVideoTimes = settings.rewardVideoClaimTimes;

        var ClientAppVersion = require("../../common/enum/ClientAppVersion");
        if (ClientAppVersion.supportServerAdConfig()) { //native api works after version 3
            if (settings.adControl.adConfig) {
                cc.log(JSON.stringify(settings.adControl.adConfig));
                jsb_wtc.adsHelper.setAdConfigs(JSON.stringify(settings.adControl.adConfig));

                if(ClientAppVersion.supportNewSupersonicAndLockScreen() && !cc.isUndefined(settings.adControl.adConfig.supersonicID)) {
                    jsb_wtc.adsHelper.setSupersonicID(settings.adControl.adConfig.supersonicID);
                }
            }
        }
        this._receiveServerConfig = true;

        if(cc.sys.os === cc.sys.OS_ANDROID
            && !cc.isUndefined(this._lockScreenFlag)
            && !this._lockScreenFlag
            && ClientAppVersion.supportNewSupersonicAndLockScreen()) {
            jsb_wtc.adsHelper.setLockScreenEnabled(false);
        }
    },

    showCrossPromotionAds: function () {
        var place = AdPlace.CROSS_PROMOTION;
        if (!PlayerMan.getInstance().hasPurchased()) {
            return;
        }
        if (!this._adSettings[place].showAds) {
            return;
        }

        if (this._adSettings[place].isReadyForShow) {
            cc.log("Show Ads at %d", place);
            if (cc.sys.isNative) {
                jsb_wtc.adsHelper.showCrossPromoteAd(ZEN_LOCATION_CROSSPROMOTION, place);
            }
        }
    },

    cacheCrossPromotionAds: function () {
        var place = AdPlace.CROSS_PROMOTION;
        if (!PlayerMan.getInstance().hasPurchased()) {
            return;
        }
        if (!this._adSettings[place].showAds) {
            return;
        }
    },

    OnAdFinishedJsb: function (jsonStr) {
        //"iFlag" : 3,
        //"showResult" : 0,
        //"szChannel" : "channel_admob"
        cc.log("OnAdFinishedJsb:" + jsonStr);
        var adFinishData = JSON.parse(jsonStr);
        if (adFinishData.showResult == ZEN_AD_SHOW_SUCCEED) {
            var flag = adFinishData.iFlag;
            this._adSettings[flag].isReadyForShow = false;
            this._adSettings[flag].isFirstShow = false;
            this._adSettings[flag].deltaTime = this._adSettings[flag].showInterval;
            flag = parseInt(adFinishData.iFlag);
            LogMan.getInstance().adImpression[flag]++;
            LogMan.getInstance().adRecord(LogMan.getInstance().PAGE_AD_SHOW, adFinishData.szChannel, adFinishData.iFlag+"");
            this._lastShowAdTime = Date.now();

            //var  = require("../../log/enum/UIClickId");
            //LogMan.getInstance().uiClickRecord(UIClickId.UI_CLICK_CLOSE_AD);
        }
    },

    isRewardAdCooling: function () {
        cc.log("Date.now() - this._lastShowRewardAdTime = " + (Date.now() - this._lastShowRewardAdTime) + " cooling = " + ((Date.now() - this._lastShowRewardAdTime) <= this._rewardAdConfig.interval * 1000));
        return (Date.now() - this._lastShowRewardAdTime) <= this._rewardAdConfig.interval * 1000;
    },

    shouldShowRewardAd: function () {
        cc.log("this._rewardAdConfig.maxTimes" + this._rewardAdConfig.maxTimes);
        cc.log("this.getRewardVideoTimes.maxTimes" + this.getRewardVideoTimes());
        if (this.getRewardVideoTimes() >= this._rewardAdConfig.maxTimes) {
            return false;
        }

        cc.log("shouldShowRewardAd " + (this.shouldShowRewardAdWithoutInterval() && !this.isRewardAdCooling()));
        return this.shouldShowRewardAdWithoutInterval() && !this.isRewardAdCooling();
    },

    shouldShowRewardAdWithoutInterval: function () {
        if (!this._rewardAdConfig.showAd || (PlayerMan.getInstance().hasPurchased() && !this._rewardAdConfig.purchaseShow)) {
            return false;
        }

        var TaskMan = require("../../task/model/TaskMan");
        if (TaskMan.getInstance().getCurTaskLevel() <this._rewardAdConfig.level) {
            return false;
        }
        return true;
    },

    shouldShowRewardIcon: function () {
        cc.log("shouldShowRewardIcon " + (this._receiveServerConfig && this.shouldShowRewardAd() && this.isRewardVideoReady()));
        cc.log("shouldShowRewardAd " + (this.shouldShowRewardAd()));
      //  return this.isRewardVideoReady();
         return this._receiveServerConfig && this.shouldShowRewardAd() && this.isRewardVideoReady();
    },

    isRewardVideoReady: function () {
        if (cc.sys.isNative) {
            if (ClientAppVersion.supportRewardedVideo()) {
                return jsb_wtc.adsHelper.isRewardVideoReady();
            }
        }
        return false;
    },

    showRewardVideo: function () {
        if (cc.sys.isNative && this.isRewardVideoReady()) {
             if (ClientAppVersion.supportRewardedVideo()) {
                this._rewardAdReady = false;
                this._lastShowRewardAdTime = Date.now();
                this._adSettings[AdPlace.ENTER_FORE].isReadyForShow = false;
                this._adSettings[AdPlace.ENTER_FORE].isFirstShow = false;
                this._adSettings[AdPlace.ENTER_FORE].deltaTime = this._adSettings[AdPlace.ENTER_FORE].showInterval;
                jsb_wtc.adsHelper.showRewardVideo();
            }
        }
    },

    onRewardedVideoFinishedJsb: function () {
        cc.log("onRewardedVideoFinishedJsb");
        LogMan.getInstance().rewardAdRecord(LogMan.getInstance().PAGE_REWARD_AD_SHOW);
        var AdControlMan = require("../../ads/model/AdControlMan");
        AdControlMan.getInstance().updateRewardVideoTimes();
        
        EventDispatcher.getInstance().dispatchEvent(CommonEvent.SOCIAL_REWARD_VIDEO);
        
        var C2SClaimVideoAdReward = require("../../ads/protocol/C2SClaimVideoAdReward");
        var protocol = new C2SClaimVideoAdReward();
        protocol.send();
    },

    onRewardedVideoBeginJsb: function () {
        var AudioPlayer = require("../../common/audio/AudioPlayer");
        AudioPlayer.getInstance().pauseMusic();
    },

    onRewardedVideoEndJsb: function () {
        var AudioPlayer = require("../../common/audio/AudioPlayer");
        AudioPlayer.getInstance().resumeMusic();
    },

    getRewardVideoTimes: function () {
        return this.rewardVideoTimes;
    },

    updateRewardVideoTimes: function () {
        this.rewardVideoTimes += 1;
    },

    getRewardVideoAdConfig: function () {
        return this._rewardAdConfig;
    },

    canShowLockScreenAd: function() {
        if(cc.isUndefined(this._lockScreenFlag) || !this._lockScreenFlag) {
            return false;
        }
        return true;
    }
});

AdControlMan._instance = null;
AdControlMan._firstUseInstance = true;

/**
 *
 * @returns {AdControlMan}
 */
AdControlMan.getInstance = function () {
    if (AdControlMan._firstUseInstance) {
        AdControlMan._firstUseInstance = false;
        AdControlMan._instance = new AdControlMan();
    }
    return AdControlMan._instance;
};

module.exports = AdControlMan;
