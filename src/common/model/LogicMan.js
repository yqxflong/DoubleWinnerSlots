/**
 * Created by qinning on 15/5/19.
 */

var AdControlMan = require("../../ads/model/AdControlMan");
var Util = require("../util/Util");
var PlayerMan = require("./PlayerMan");
var PomeloClient = require("../net/PomeloClient");
var BonusMan = require("../../social/model/BonusMan");
var EventDispatcher = require("../events/EventDispatcher");
var CommonEvent = require("../events/CommonEvent");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var LogMan = require("../../log/model/LogMan");
var StoreMan = require("../../store/model/StoreMan");
var SocialMan = require("../../social/model/SocialMan");
var Config = require("../../common/util/Config");
var MailMan = require("../../social/model/MailMan");
var HourlyGameMan = require("../../social/model/HourlyGameMan");

var DAY_IN_SECONDS = 24 * 60 * 60;
var HOUR_IN_SECONDS = 60 * 60;
var DAILY_BONUS_TIPS = "Free coins! Collect your daily bonus now.";
var HOURLY_BONUS_TIPS = "Your lucky bonus is ready! Flip the cards for free coins!";

var LogicMan = cc.Class.extend({
    _isRegisterGameEventListener: false,
    _isSendedCmd: false,
    _loginCmdList: null,
    _loginCmdIndex: 0,
    _loginIntervalKey: 0,
    ctor: function() {
        this._loginCmdList = [
            function () {
                BonusMan.getInstance().sendGetDailyBonusCmd();
            },
            function () {
                //Must be called in order
                StoreMan.getInstance().getProcessingPurchase();
                StoreMan.getInstance().getUnverifiedReceiptList();
            },
            function () {
                SocialMan.getInstance().getReward();
            },
            function () {
                SocialMan.getInstance().getSystemMessageNotice();
            },
            function () {
                if(!cc.sys.isNative) {
                    var rkVal = Util.getURLParameter("rk");
                    if (rkVal && rkVal.length > 0) {
                        SocialMan.getInstance().sendClaimKeyReward(rkVal);
                    }
                } else {
                    try{
                        var rewardKey = jsb_wtc.LogicHelper.getInstance().getRewardKey();
                        if (rewardKey && rewardKey.length > 0) {
                            SocialMan.getInstance().sendClaimKeyReward(rewardKey);
                            jsb_wtc.LogicHelper.getInstance().setRewardKey("");
                        }
                    }catch(e) {
                        //no have this function
                    }
                }
            },
            function () {
                if(!cc.sys.isNative) {
                    var notiId = Util.getURLParameter("notiId");
                    if (notiId && notiId.length > 0) {
                        SocialMan.getInstance().sendFbNoticeClick(notiId);
                    }
                }
            },
            function () {
                AdControlMan.getInstance().sendGetAdSettingCmd();
            },
            function () {
                MailMan.getInstance().sendGetMailsCmd();
            }
        ];
    },

    registerGameEventListener: function() {
        if(!this._isRegisterGameEventListener) {
            this._isRegisterGameEventListener = true;
            EventDispatcher.getInstance().addEventListener(cc.game.EVENT_SHOW, this.gameOnShow, this);
            EventDispatcher.getInstance().addEventListener(cc.game.EVENT_HIDE, this.gameOnHide, this);
        }
    },

    purge: function() {
        EventDispatcher.getInstance().removeEventListener(cc.game.EVENT_SHOW, this.gameOnShow, this);
        EventDispatcher.getInstance().removeEventListener(cc.game.EVENT_HIDE, this.gameOnHide, this);
    },

    gameOnShow: function() {
        cc.log("gameOnShow");
        if (cc.sys.isNative) {
            this.unscheduleLocalNotification();
            AdControlMan.getInstance().enterForeShowAd();
        }
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");
        LogMan.getInstance().userProductRecord(ProductChangeReason.ENTER_FOREGROUND, 0, 0, 0, 0, 0);

        var ClientAppVersion = require("../enum/ClientAppVersion");
        var MarketBIMan = require("../../log/model/MarketBIMan");
        if (cc.sys.isNative) {
            if (ClientAppVersion.supportMarketBI()) {
                MarketBIMan.getInstance().eventGameOnShow();
                //retry send log, if exist.
                MarketBIMan.getInstance().retryPostCachedLog();
            }
        }
    },

    gameOnHide: function() {
        cc.log("gameOnHide");
        ClassicSlotMan.getInstance().resetPrizePoolPlayersCountDownTime();
        if (cc.sys.isNative) {
            this.scheduleLocalNotification();
        }
       
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");
        LogMan.getInstance().userProductRecord(ProductChangeReason.ENTER_BACKGROUND, 0, 0, 0, 0, 0);
 	    LogMan.getInstance().flushToServer();
    },

    startGame: function () {
        if (cc.sys.isNative) {
            //jsb_wtc.LogicHelper.getInstance().startGame();
            jsb_wtc.LocalNotification.getInstance().registerNotification();
            this.unscheduleLocalNotification();
        }
        this.registerGameEventListener();
        AdControlMan.getInstance().onStart();
    },

    unscheduleLocalNotification: function () {
        var localNotification = jsb_wtc.LocalNotification.getInstance();
        localNotification.unscheduleNotification();
    },

    scheduleLocalNotification: function () {
        if (!cc.sys.isNative) {
            return;
        }
        //get left daily bonus time
        var leftTime = DAY_IN_SECONDS;

        //get hourly bonus availTime
        var collectLeftTime = HourlyGameMan.getInstance().getHourlyBonusLeftTime();
        var availTime = PomeloClient.getInstance().isConnected() ?  collectLeftTime/ 1000 : HOUR_IN_SECONDS;
        if (availTime < 1800) {
            availTime = 1800;
        }

        //badge num
        //var COMMON_BONUS_BADGE = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
        //var DAILY_BONUS_BADGE = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31];

        var badgeNum = 0;

        jsb_wtc.LocalNotification.getInstance().scheduleNotification(availTime, HOURLY_BONUS_TIPS, "Play", badgeNum++, "");

        var hours = [2, 4, 8, 18];
        var count = hours.length;
        for (var i = 0; i < count; ++i) {
            jsb_wtc.LocalNotification.getInstance().scheduleNotification(availTime + hours[i] * HOUR_IN_SECONDS, HOURLY_BONUS_TIPS, "Play", badgeNum++, "");
        }

        jsb_wtc.LocalNotification.getInstance().scheduleNotification(leftTime, DAILY_BONUS_TIPS, "Collect", badgeNum++, "");

        var days = [2, 5, 8];
        count = days.length;
        for (var i = 0; i < count; ++i) {
            jsb_wtc.LocalNotification.getInstance().scheduleNotification(leftTime + days[i] * DAY_IN_SECONDS, DAILY_BONUS_TIPS, "Collect", badgeNum++, "");
        }
    },


    setIsSendedCmd: function (isSended) {
        this._isSendedCmd = false;
    },

    sendRewardMessageCmd: function () {
        if(!this._isSendedCmd) {
            this._isSendedCmd = true;
            this._loginCmdIndex = 0;
            var self = this;
            this._loginIntervalKey = setInterval(function () {
                if (self._loginCmdIndex < self._loginCmdList.length) {
                    var sendCmdFunc = self._loginCmdList[self._loginCmdIndex];
                    if (sendCmdFunc) {
                        sendCmdFunc();
                    }
                    self._loginCmdIndex ++;
                } else {
                    clearInterval(self._loginIntervalKey);
                }
                cc.log("loginCmdIndex:" + self._loginCmdIndex);
            }, 1000);
        }
    },

    /**
     * send track events, just for test,just work on local version
     */
    sendTestTrackEvent: function () {
        cc.log("sendTestTrackEvent");
        if (Config.isLocal() && cc.sys.isNative) {
            var PurchaseInfo = require("../../store/entity/PurchaseInfo");
            var ShopType = require("../../store/enum/ShopType");
            var purchaseInfo = new PurchaseInfo();
            var info = StoreMan.getInstance().getProduct(ShopType.NORMAL);
            if (info) {
                purchaseInfo.productId = info.productList[0].pid;
                purchaseInfo.purchaseId = "test_purchase_id";
                purchaseInfo.receipt = "test_receipt";
                purchaseInfo.shopType = 0;
                purchaseInfo.signature = "test_signature";
                StoreMan.getInstance().sendPurchaseTrack(purchaseInfo);
            }
            var levelArr = [5, 10, 15, 20, 30, 50, 80, 100];
            for (var i = 0; i < levelArr.length; ++i) {
                jsb_wtc.EventHelper.getInstance().TrackEventLevel("test_fb_id", levelArr[i]);
            }
        }
    },

    requestFullScreen: function (element) {
        cc.screen.requestFullScreen(element, function (event) {
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.FULL_SCREEN_CHANGED, cc.screen.fullScreen());
        });
    }
});

LogicMan._instance = null;
LogicMan._firstUseInstance = true;

/**
 *
 * @returns {LogicMan}
 */
LogicMan.getInstance = function () {
    if (LogicMan._firstUseInstance) {
        LogicMan._firstUseInstance = false;
        LogicMan._instance = new LogicMan();
    }
    return LogicMan._instance;
};

module.exports = LogicMan;