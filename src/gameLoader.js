/**
 * Created by alanmars on 15/4/14.
 */


var WTC = {};
var Config = require("./common/util/Config");
var resRootPath = Config.resPath + "/";

/**
 *
 * @param width
 * @param height
 */
function setDesignResolutionByVisibleSize(width, height) {
    var designResolution = cc.size(width, height);
    var visibleSize = cc.director.getVisibleSize();
    var visibleFactor = visibleSize.width / visibleSize.height;
    var designFactor = width / height;
    if (visibleFactor > designFactor) {
        designResolution.width = width;
        designResolution.height = width / visibleFactor;
    } else {
        //always exec this
        designResolution.width = height * visibleFactor;
        designResolution.height = height;
    }
    cc.view.setDesignResolutionSize(designResolution.width, designResolution.height, cc.ResolutionPolicy.SHOW_ALL);
}

function startGame() {
    var GameDirector = require("./common/model/GameDirector");
    var LoadingController = require("./loader/LoadingController");
    var loadingNode = LoadingController.createFromCCB();
    cc.director.runScene(GameDirector.getInstance().getScene());
    GameDirector.getInstance().runWithScene(loadingNode);
}

function loadGameJs() {
    cc.loader.loadJs(resRootPath, "game.js", function() {});
}

function isPad() {
    if (cc.sys.isNative) {
        if (jsb_wtc.DeviceHelper.isIpad()) {
            return true;
        }
        var visibleSize = cc.director.getVisibleSize();
        var ratio = visibleSize.width / visibleSize.height;
        if (ratio < 1.48) {
            return true;
        }
        return false;
    }
    return false;
}

cc.game.onStart = function() {
    cc.log("debugVersion:" + Config.debugVersion);
    cc.view.adjustViewPort(true);
    cc.view.resizeWithBrowserSize(true);
    cc.loader.resPath = resRootPath;

    if (cc.sys.isNative) {
        var width;
        var height;
        if (isPad()) {
            height = 768;
        } else {
            height = 640;
        }
        width = height * cc.winSize.width / cc.winSize.height;
        cc.view.setDesignResolutionSize(width, height, cc.ResolutionPolicy.SHOW_ALL);
    } else {
        setDesignResolutionByVisibleSize(1024, 768);
    }
    if(cc.sys.isNative) {
        var searchPathArr = jsb.fileUtils.getSearchPaths();
        searchPathArr.unshift(jsb.fileUtils.getWritablePath());
        jsb.fileUtils.setSearchPaths(searchPathArr);
    }

    if (cc.sys.isNative) {
        cc.loader.loadJs('', [
            "jsb_zensdk_social.js"
        ], function () {
            startGame();
        });
    } else {
        cc.loader.loadJs('', [
            "./facebook_sdk.js",
            "./zen_facebook.js"
        ], function () {
            loadGameJs();
        });
    }
};
cc.game.run();