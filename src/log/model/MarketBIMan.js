/**
 * Created by qinning on 16/5/13.
 */

var DeviceInfo = require("../../common/util/DeviceInfo");
var Config = require("../../common/util/Config");
var PlayerMan = require("../../common/model/PlayerMan");
var Util = require("../../common/util/Util");
var HttpClient = require("../../common/net/HttpClient");
var PlatformType = require("../../common/enum/PlatformType");
var MarketLogCacheMan = require("../model/MarketLogCacheMan");

var MarketBIMan = cc.Class.extend({
    TEST_BI_URL: "http://bi-app-analytics.tuanguwen.com:8000",
    RELEASE_BI_URL: "http://bi-app-analytics.tuanguwen.com:8080",
    ctor: function () {
    },

    getStartUrl: function () {
        if (Config.isRelease()) {
            return this.RELEASE_BI_URL;
        } else {
            return this.TEST_BI_URL;
        }
    },

    getLogUrl: function () {
        return this.getStartUrl() + "/bundle/" + jsb_wtc.deviceHelper.getPackageName();
    },

    getBIVersion: function () {
        return "1.1.0";
    },

    _fillCommonBIData: function (data) {
        data.bi_version = this.getBIVersion();
        data.app_id = DeviceInfo.getPackageName();
        data.ts = Math.floor(Date.now() / 1000);
        data.user_id = "";

        var player = PlayerMan.getInstance().player;
        if (player && player.isLogined) {
            data.user_id = "" + player.id;
            data.session_id = "";
            data.client_id = DeviceInfo.getDeviceId();
            data.client_time = Math.floor(Date.now() / 1000);
            data.id = Util.createUniqueId();
        }
    },

    makeBIDataPayment: function () {
        var ret = {};
        this._fillCommonBIData(ret);
        ret.event = "payment";
        return ret;
    },

    makeBIDataSessionStart: function () {
        var ret = {};
        this._fillCommonBIData(ret);
        ret.event = "session_start";

        var prop = {};
        prop.server_id = "";
        prop.app_native_version = "" + Config.getAppVersion();
        prop.app_version = Config.appVersion;
        prop.os = cc.sys.os;
        prop.os_version = jsb_wtc.deviceHelper.getOSVersion();
        prop.device = jsb_wtc.deviceHelper.getDeviceCode();
        prop.region = jsb_wtc.deviceHelper.getRegion();
        prop.ip = jsb_wtc.deviceHelper.getIP();
        prop.lang = jsb_wtc.deviceHelper.getLanguage();

        if (prop.os == cc.sys.OS_IOS) {
            prop.idfa = jsb_wtc.deviceHelper.getIdfa();
            prop.idfv = jsb_wtc.deviceHelper.getIdfv();
        } else {
            prop.android_id = jsb_wtc.deviceHelper.getAndroidId();
        }
        prop.gaid = jsb_wtc.deviceHelper.getGaid();
        prop.mac_address = "";

        ret.properties = prop;

        return ret;
    },

    eventSessionStart: function () {
        cc.log("mktbi:session_start");

        var player = PlayerMan.getInstance().player;
        cc.log("player " + player + " isLogin " + PlayerMan.getInstance().isLoginIn);
        if (!player || !PlayerMan.getInstance().isLoginIn) {
            cc.log("user not logined in, return");
            return;
        }

        var data = this.makeBIDataSessionStart();


        var lv = player.level;
        var vipLevel = player.vipLevel;

        data.properties.vip_level = "" + vipLevel;
        data.properties.level = "" + lv;


        data.properties.social_type = "";
        data.properties.social_id = "";
        data.properties.gender = "";
        data.properties.birthday = "";
        data.properties.email = "";
        data.properties.install_ts = Math.floor(player.createTime / 1000);

        if (player.facebookId) {
            data.properties.social_type = "facebook";
            data.properties.social_id = "" + player.facebookId;
        }
        if (player.email) {
            data.properties.email = "" + player.email;
        }

        cc.log(JSON.stringify(data));

        this.postMarketBIEvent(this.getLogUrl(), data);
    },

    eventPayment: function (data) {
        cc.log("mktbi:eventPayment");

        var player = PlayerMan.getInstance().player;

        if (!player || !player.isLogined) {
            cc.log("user not logined in, return");
            return;
        }

        var lv = player.level;
        var vipLevel = player.vipLevel;

        var bidata = this.makeBIDataPayment();
        var prop = {};
        prop.level = "" + lv;
        prop.vip_level = "" + vipLevel;
        prop.amount = "" + Math.floor(data.amount + 0.5);
        prop.currency = data.currency;

        switch (DeviceInfo.getPlatformType()) {
            case PlatformType.IOS:
                prop.payment_processor = "appstore";
                break;
            case PlatformType.AMAZON:
                prop.payment_processor = "amazon";
                break;
            case PlatformType.GOOGLE:
                prop.payment_processor = "googleplay";
                break;
            case PlatformType.FACEBOOK:
                prop.payment_processor = "facebook";
                break;
            default:
                prop.payment_processor = "unknown:" + DeviceInfo.getPlatformType();
        }

        prop.product_type = data.product_type;
        prop.product_id = data.product_id;
        if (data.product_type == "crystal")
            prop.product_name = "" + data.crystals_in + " " + data.product_type;
        else
            prop.product_name = "" + data.coins_in + " " + data.product_type;
        prop.coins_in = "" + data.coins_in;
        prop.crystals_in = "" + data.crystals_in;
        prop.transaction_id = "" + data.transaction_id;

        bidata.properties = prop;

        cc.log(JSON.stringify(bidata));

        this.postMarketBIEvent(this.getLogUrl(), bidata);
    },

    eventGameOnShow: function () {
        cc.log('ZimTrackingMarketBI eventGameOnShow');
        this.eventSessionStart();
    },

    retryPostCachedLog: function () {
        cc.log('ZimTrackingMarketBI retryPostCachedLog');
        this._postCahcedLogByUrl(this.getLogUrl());
    },

    _postCahcedLogByUrl: function (url) {
        var sessionCachedRecords = MarketLogCacheMan.getInstance().fetchCachedRecords(url, true);
        if (sessionCachedRecords && sessionCachedRecords.length > 0) {
            cc.log("ZimTrackingMarketBI postCahcedLogByUrl:" + JSON.stringify(sessionCachedRecords));
            this._postEvents(url, sessionCachedRecords, function (error) {
                if (!error) {
                    MarketLogCacheMan.getInstance().cleanCahcedRecord(url);
                }
            });
        }
    },

    postMarketBIEvent: function (url, event) {
        MarketLogCacheMan.getInstance().cacheRecord(url, event);
        var events = MarketLogCacheMan.getInstance().fetchCachedRecords(url);

        this._postEvents(url, events, function (error) {
            if (!error) {
                MarketLogCacheMan.getInstance().cleanCahcedRecord(url);
            }
        });
        MarketLogCacheMan.getInstance().persistCachedRecords();
    },

    _postEvents: function (url, events, postCallback) {
        var headers = {};
        headers["Content-Type"] = "application/json;charset=UTF-8";

        HttpClient.doPost(url, JSON.stringify(events), headers, function (error, txt) {
            if (error) {
                cc.log("post market bi event error:" + error + ", " + txt);
            } else {
                cc.log("post market bi event success!");
            }
            if (postCallback) {
                postCallback(error);
            }
        });
    }
});

MarketBIMan._instance = null;
MarketBIMan._firstUseInstance = true;

/**
 *
 * @returns {MarketBIMan}
 */
MarketBIMan.getInstance = function () {
    if (MarketBIMan._firstUseInstance) {
        MarketBIMan._firstUseInstance = false;
        MarketBIMan._instance = new MarketBIMan();
    }
    return MarketBIMan._instance;
};

module.exports = MarketBIMan;
