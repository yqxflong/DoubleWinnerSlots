/**
 * Created by qinning on 15/4/23.
 */
var StorageController = require("../storage/StorageController");
var ProductType = require("../enum/ProductType");
var ProductChangedData = require("../events/ProductChangedData");
var CommonEvent = require("../events/CommonEvent");
var EventDispatcher = require("../events/EventDispatcher");
var ExpChangedData = require("../events/ExpChangedData");
var ActionType = require("../../log/enum/ActionType");
var DeviceInfo = require("../util/DeviceInfo");
var PopupMan = require("../model/PopupMan");
var SceneMan = require("../model/SceneMan");
var ProgressTipsIndicatorController = require("../controller/ProgressTipsIndicatorController");
var Config = require("../util/Config");
var AppVerType = require("../enum/AppVerType");
var ErrorCode = require("../enum/ErrorCode");
var Constants = require("../enum/Constants");

var PlayerMan = cc.Class.extend({
    playerId: 0,
    connectedId: 0,
    player: null,
    appVersion: 0,
    isLoginIn: false,
    mapPosition: null,
    serverConfig: null,
    protocolSenderList: [],
    isFBLoginFlag: true,

    _login: function (deviceId, facebookId, name, email, friendCount) {
        var C2SLogin = require("../protocol/C2SLogin");
        var c2slogin = new C2SLogin();
        c2slogin.udid = deviceId;
        c2slogin.facebookId = facebookId;
        c2slogin.fbName = name;
        c2slogin.platformType = DeviceInfo.getPlatformType();
        c2slogin.clientVer = Config.getAppVersion();
        c2slogin.email = email;
        if (friendCount) {
            c2slogin.friendCount = friendCount;
        } else {
            c2slogin.friendCount = 0;
        }
        c2slogin.send();
    },

    loginWithFBId: function (fbId) {
        this._login("", fbId, "", "", 0);
    },

    loginWithFacebook: function (response) {
        this._login("", response["id"], response["name"], response["email"], response["friendCount"]);
    },

    loginWithGuest: function () {
        this.isFBLoginFlag = false;
        this._login(DeviceInfo.getDeviceId(), "", "", "", 0);
    },

    reLogin: function () {
        var StoreMan = require("../../store/model/StoreMan");

        StoreMan.getInstance().slotLobbyEntered = false;

        var facebookId = StorageController.getInstance().getItem("facebookId", "");
        var isGuestLogin = StorageController.getInstance().getItem("isGuestLogin", "false");
        if (facebookId && facebookId.length > 0 && isGuestLogin != "true") {
            var response = {};
            response["id"] = facebookId;
            this.loginWithFacebook(response);
            return true;
        }
        var udid = StorageController.getInstance().getItem("udid", "");
        if (udid && udid.length > 0) {
            this.loginWithGuest();
            return true;
        }
        return false;
    },

    bindFacebook: function (response) {
        this._login(DeviceInfo.getDeviceId(), response["id"], response["name"], response["email"], response["friendCount"]);
    },

    onLogin: function (s2cLogin) {
        var Config = require("../util/Config");
        var ClientAppVersion = require("../enum/ClientAppVersion");
        var isSoftUpdate = false;
        if(cc.sys.isNative) {
            if (Config.getAppVersion() == 0 && cc.sys.os == cc.sys.OS_IOS) {
                //old ios version will not be upgraded!!! because it not have native code to jump to appstore
            } else {
                if (s2cLogin.appVerType == AppVerType.APP_UPDATE_HARD) {
                    if(s2cLogin.appVersion > Config.getAppVersion()) {
                        PopupMan.closeIndicator();
                        PopupMan.popupCommonDialog("GET UPDATE", ["Good news! New version", "is availabe for free now."], "Update", function() {
                            jsb_wtc.LogicHelper.getInstance().openAppLink();
                        }, null, false);
                        return;
                    }
                } else if (s2cLogin.appVerType == AppVerType.APP_UPDATE_SOFT) {
                    if(s2cLogin.appVersion > Config.getAppVersion()) {
                        isSoftUpdate = true;
                        PopupMan.closeIndicator();
                        var self = this;
                        PopupMan.popupCommonYesNoDialog("GET UPDATE", ["Good news! New version", "is availabe for free now."], "Update", "Cancel", function() {
                            jsb_wtc.LogicHelper.getInstance().openAppLink();
                        }, function () {
                            PopupMan.popupIndicator();
                            self.goOnLogin();
                        }, false);
                    }
                }
            }

            if (s2cLogin.jsVersion > Config.jsVersion) {
                cc.game.restart();
                return;
            }
        }
        if(s2cLogin.errorCode > 0) {
            if (s2cLogin.errorCode == ErrorCode.Common.SERVER_MAINTAIN) {
                PopupMan.popupServerMaintence();
            }
            return;
        }
        var player = s2cLogin.player;
        player.isLogined = true;
        this.playerId = player.id;
        this.player = player;
        this.serverConfig = s2cLogin.serverConfig;
        this.isLoginIn = true;
        if (cc.sys.isNative) {
            if(this.isFBLogin()) {
                var oldFacebookId = StorageController.getInstance().getItem("facebookId","");
                if (oldFacebookId !== player.facebookId) {
                    jsb_wtc.EventHelper.getInstance().TrackEventLogin(player.facebookId);
                }
            }
        }

        //facebookId
        StorageController.getInstance().setItem("facebookId", player.facebookId);
        StorageController.getInstance().setItem("udid", player.udid);

        if (cc.sys.isNative) {
            jsb_wtc.RateHelper.getInstance().init(3, 1, 0.5, 0.5, true);

            if(this.player.iapTotal > 0 && ClientAppVersion.supportNewSupersonicAndLockScreen()) {
                jsb_wtc.adsHelper.setLockScreenEnabled(false);
            }
        }

        var LogMan = require("../../log/model/LogMan");
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");
        LogMan.getInstance().userProductRecord(ProductChangeReason.SOCIAL_LOGIN, 0, 0, 0, 0, 0);

        var UserStepId = require("../../log/enum/UserStepId");
        LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_FACEBOOK_AUTHORIZE_SUCCESS, -1);

        //LogMan.getInstance().loginRecord(0, 0, 2, ActionType.FINISH, player.facebookId, player.createTime);
        //market BI log.
        var MarketBIMan = require("../../log/model/MarketBIMan");
        if (cc.sys.isNative) {
            if (ClientAppVersion.supportMarketBI()) {
                MarketBIMan.getInstance().eventSessionStart();
            }
        }
        if (!isSoftUpdate) {
            this.goOnLogin();
        }
    },

    goOnLogin: function () {
        SceneMan.getInstance().onServerReady();
        this.afterLogin();
    },

    afterLogin: function () {
        var HourlyGameMan = require("../../social/model/HourlyGameMan");
        var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
        var LogicMan = require("./LogicMan");
        var StoreMan = require("../../store/model/StoreMan");
        var TaskMan = require("../../task/model/TaskMan");
        var FaceBookMan = require("../../social/model/FaceBookMan");
        var IncentiveAdMan = require("../../incentive_ad/IncentiveAdMan");
 
        this.protocolSenderList = [];

        // this.protocolSenderList.push(function () {
        //     IncentiveAdMan.getInstance().getIncentiveAdsFromServer();
        // });
        this.protocolSenderList.push(function () {
            HourlyGameMan.getInstance().getHourlyGame();
        });

        this.protocolSenderList.push(function () {
            ClassicSlotMan.getInstance().sendGetSubjectsCmd();
        });

        this.protocolSenderList.push(function () {
            StoreMan.getInstance().getShopsFromServer();
        });

        this.protocolSenderList.push(function () {
            TaskMan.getInstance().sendGetCurTaskCmd();
        });

        this.protocolSenderList.push(function () {
            TaskMan.getInstance().sendGetDailyTask();
        });
        cc.director.getScheduler().schedule(this.update, this, 0.3, cc.REPEAT_FOREVER, 0, false, "PlayerMan");

        if (this.isFBLogin()) {
            FaceBookMan.getInstance().getMyFriendsList(function (error, friendsList) {
                if (!error) {
                    var fbIds = [];
                    for (var i = 0; i < friendsList.length; ++i) {
                        fbIds.push(friendsList[i].id);
                    }
                    TaskMan.getInstance().getFriendsTask(fbIds);
                }
            });
        }
        LogicMan.getInstance().setIsSendedCmd(false);
    },

    update : function (dt) {
        cc.log(Util.getCurrentTime());
        if(this.protocolSenderList.length > 0) {
            var callback = this.protocolSenderList.pop();
            callback();
        }
        else {
            cc.director.getScheduler().unschedule("PlayerMan", this);
        }
    },

    /**
     * @param delta
     * @param notify - if true, dispatch ProductChangedEvent
     */
    addChips: function (delta, notify) {
        if (isNaN(delta)) throw new Error("Chips is not allowed to be NaN!");
        if (delta == 0) return;
        this.player.chips += delta;
        if (notify) {
            var event = new ProductChangedData(ProductType.PRODUCT_TYPE_CHIP, delta);
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.PRODUCT_CHANGED, event);
        }
    },

    getCoins: function () {
        if (this.player) {
            return this.player.chips;
        }
        return 0;
    },

    /**
     * @param delta
     * @param notify - if true, dispatch ProductChangedEvent
     */
    addGems: function (delta, notify) {
        if (isNaN(delta)) throw new Error("Gems is not allowed to be NaN!");
        if (delta == 0) return;
        this.player.gems += delta;
        if (notify) {
            var event = new ProductChangedData(ProductType.PRODUCT_TYPE_GEM, delta);
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.PRODUCT_CHANGED, event);
        }
    },

    getGems: function () {
        if (this.player) {
            return this.player.gems;
        }
        return 0;
    },

    /**
     * @param delta
     * @param notify - if true, dispatch ProductChangedEvent
     */
    addStars: function (delta, notify) {
        if (isNaN(delta)) throw new Error("Stars is not allowed to be NaN!");
        if (delta == 0) return;
        this.player.stars += delta;
        if (notify) {
            var event = new ProductChangedData(ProductType.PRODUCT_TYPE_STAR, delta);
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.PRODUCT_CHANGED, event);
        }
    },

    getStars: function () {
        if (this.player) {
            return this.player.stars;
        }
        return 0;
    },


    syncExp: function (levelExp) {
        this.player.level = levelExp.level;
        this.player.exp = levelExp.exp;
        this.player.levelUpExp = levelExp.levelUpExp;

        EventDispatcher.getInstance().dispatchEvent(CommonEvent.EXP_CHANGED, new ExpChangedData(levelExp.isLevelUp));
        if (levelExp.isLevelUp) {
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.LEVEL_UP, null);
        }
    },

    hasPurchased: function () {
        if (this.player) {
            return this.player.purchaseCount > 0;
        }
        return false;
    },

    isFBLogin: function () {
        if (this.player && this.player.facebookId && this.player.facebookId.length > 0 && (!cc.sys.isNative || this.isFBLoginFlag)) {
            return true;
        }
        return false;
    },

    isGuest: function () {
        return !this.isFBLogin();
    },

    addIapTotal: function (purchaseCount,iapAdded) {
        this.player.purchaseCount += purchaseCount;
        this.player.iapTotal += iapAdded * 100;
    }
});

PlayerMan._instance = null;
PlayerMan._firstUseInstance = true;

/**
 *
 * @returns {PlayerMan}
 */
PlayerMan.getInstance = function () {
    if (PlayerMan._firstUseInstance) {
        PlayerMan._firstUseInstance = false;
        PlayerMan._instance = new PlayerMan();
    }
    return PlayerMan._instance;
};

module.exports = PlayerMan;
