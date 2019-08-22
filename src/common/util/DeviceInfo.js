/**
 * Created by qinning on 15/5/12.
 */

var PlatformType = require("../enum/PlatformType");
var StorageController = require("../storage/storageController");
var Constants = require("../enum/Constants");

var DeviceInfo = {
    getDeviceId : function() {
        if(cc.sys.isNative) {
            var deviceId = StorageController.getInstance().getItem("deviceId", "");
            if (deviceId != "" && deviceId.length > 0) {
                return deviceId;
            }
            deviceId = jsb_wtc.DeviceHelper.getDeviceId();
            if (deviceId == "" || deviceId == Constants.DEFAULT_MAC_ADDRESS || deviceId == Constants.DEFAULT_MAC_ADDRESS_2) {
                var newDeviceId = require("./Util").createShortKeyGenerator() + require("./Util").genRandomCode(10);
                /**getDeviceId is invoked in errorInfo, save deviceId here to prevent too many recursion*/
                StorageController.getInstance().setItem("deviceId", newDeviceId);
                require("../../log/model/LogMan").getInstance().errorInfo("get deviceId error, auto generated", "original deviceId:" + deviceId+ ". new deviceId:" + newDeviceId);
                deviceId = newDeviceId;
            } else {
                StorageController.getInstance().setItem("deviceId", deviceId);
            }
            return deviceId;
        } else {
            return require('udid')(require("./Config").logProjName);
        }
    },

    isAppInstalled : function(scheme) {
        if(cc.sys.isNative) {
            return jsb_wtc.DeviceHelper.isAppInstalled(scheme);
        }
        return false;
    },

    removeCacheDeviceId: function () {
        StorageController.getInstance().removeItem("deviceId");
    },

    getPlatformType : function(){
        if(cc.sys.isNative){
            if(cc.sys.os == cc.sys.OS_ANDROID) {
                var platformName = DeviceInfo.getPlatformName();
                if (platformName == "amazon") {
                    return PlatformType.AMAZON;
                } else {
                    return PlatformType.GOOGLE;
                }
            } else if(cc.sys.os == cc.sys.OS_IOS) {
                return PlatformType.IOS;
            }
        }
        return PlatformType.FACEBOOK;
    },

    /**
     * @returns {cc.Point}
     */
    getPlatformOffset : function () {
        var winSize = cc.director.getWinSize();
        if (winSize.height == 768) {
            return cc.p((winSize.width - 1024)*0.5, (winSize.height - 768)*0.5);
        } else {
            return cc.p((winSize.width - 960)*0.5, (winSize.height - 640)*0.5);
        }
    },

    isIpad : function () {
        if (cc.sys.isNative) {
            return jsb_wtc.DeviceHelper.isIpad();
        }
        return false;
    },

    /**
     * @returns {string}<google|amazon|ios|facebook>
     */
    getPlatformName: function () {
        if (cc.sys.isNative) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                var platformName = "google";
                try {
                    platformName = jsb_wtc.DeviceHelper.getPlatformName();
                } catch (e) {
                    platformName = "google";
                }
                return platformName;
            }
            return "ios";
        }
        return "facebook";
    },

    getTargetPlatform: function () {
        if(cc.sys.isNative) {
            switch(cc.sys.os) {
                case cc.sys.OS_ANDROID:
                    var platformName = DeviceInfo.getPlatformName();
                    if (platformName == "amazon") {
                        return "Amazon";
                    } else {
                        return "Google";
                    }
                    break;
                case cc.sys.OS_IOS:
                    if(DeviceInfo.isIpad()) {
                        return "Ipad";
                    } else {
                        return "Iphone";
                    }
                    break;
                case cc.sys.OS_WP8:
                    return "WP8";
                    break;
            }
        } else {
            return "Facebook";
        }
    },

    getPackageName: function () {
        if (cc.sys.isNative) {
            return jsb_wtc.deviceHelper.getPackageName();
        } else {
            return require("../util/Config").hockeyAppBundleId;
        }
    },
    isHighResolution: function () {
        if (cc.sys.isNative) {
            if (DeviceInfo.isIpad()) {
                return true;
            }
            var visibleSize = cc.director.getVisibleSize();
            var ratio = visibleSize.width / visibleSize.height;
            if (ratio <= 1.48) {
                return true;
            }
            return false;
        } else {
            return true;
        }
    }
};

module.exports = DeviceInfo;
