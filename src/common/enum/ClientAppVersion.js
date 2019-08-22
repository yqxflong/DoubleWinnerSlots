/**
 * Created by qinning on 16/5/9.
 */

var Config = require("../util/Config");

var ClientAppVersion = {
    CLIENT_APP_VERSION_SUPPORT_SERVER_AD_CONFIG: 3,
    CLIENT_APP_VERSION_SUPPORT_REWARD_VIDEO: 4,
    CLIENT_APP_VERSION_SUPPORT_NEW_FACEBOOK: 4,
    CLIENT_APP_VERSION_SUPPORT_MARKET_BI: 5,
    CLIENT_APP_VERSION_SUPPORT_NEW_SUPERSONIC_AD_AND_LOCKSCREEN: 6
};

ClientAppVersion.supportServerAdConfig = function () {
    if (Config.getAppVersion() >= ClientAppVersion.CLIENT_APP_VERSION_SUPPORT_SERVER_AD_CONFIG) {
        return true;
    }
    return false;
};

ClientAppVersion.supportRewardedVideo = function () {
    if (Config.getAppVersion() >= ClientAppVersion.CLIENT_APP_VERSION_SUPPORT_REWARD_VIDEO) {
        return true;
    }
    return false;
};

ClientAppVersion.supportNewFacebook = function () {
    if (Config.getAppVersion() >= ClientAppVersion.CLIENT_APP_VERSION_SUPPORT_NEW_FACEBOOK) {
        return true;
    }
    return false;
};

ClientAppVersion.supportMarketBI = function () {
    if (Config.getAppVersion() >= ClientAppVersion.CLIENT_APP_VERSION_SUPPORT_MARKET_BI) {
        return true;
    }
    return false;
};

ClientAppVersion.supportNewSupersonicAndLockScreen = function () {
    if (Config.getAppVersion() >= ClientAppVersion.CLIENT_APP_VERSION_SUPPORT_NEW_SUPERSONIC_AD_AND_LOCKSCREEN) {
        return true;
    }
    return false;
};

module.exports = ClientAppVersion;