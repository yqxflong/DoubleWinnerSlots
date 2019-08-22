/**
 * Created by alanmars on 15/4/14.
 */
var ProtocolRegistry = require("./common/protocol/ProtocolRegistry");
var SceneMan = require("./common/model/SceneMan");
var GameDirector = require("./common/model/GameDirector");
var LoginUIController = require("./common/controller/LoginUIController");
var LogicMan = require("./common/model/LogicMan");
var CrashMan = require("./log/model/CrashMan");
var SceneType = require("./common/enum/SceneType");
var LogMan = require("./log/model/LogMan");
var UserStepId = require("./log/enum/UserStepId");

if (cc.sys.isNative) {
    jsb_wtc.deviceHelper = jsb_wtc.DeviceHelper;
    jsb_wtc.dbHelper = jsb_wtc.DBHelper.getInstance();
    jsb_wtc.fileHelper = jsb_wtc.FileHelper;
    jsb_wtc.localNotification = jsb_wtc.LocalNotification.getInstance();
    jsb_wtc.logicHelper = jsb_wtc.LogicHelper.getInstance();
    jsb_wtc.eventHelper = jsb_wtc.EventHelper.getInstance();
    jsb_wtc.adsHelper = jsb_wtc.AdsHelper.getInstance();

    jsb_wtc.logicHelper.startGame();

    jsb_wtc.storeHelper = jsb_wtc.StoreHelper.getInstance();
    jsb_wtc.rateHelper = jsb_wtc.RateHelper.getInstance();
}

CrashMan.getInstance().register();
ProtocolRegistry.register();
cc.BuilderReader.setResourcePath("");

var startGame = function() {
    if(cc.sys.isNative) {
        var searchPathArr = jsb.fileUtils.getSearchPaths();
        searchPathArr.unshift(jsb.fileUtils.getWritablePath());
        jsb.fileUtils.setSearchPaths(searchPathArr);
        GameDirector.getInstance().setRunningScene(LoginUIController.createFromCCB());
        cc.director.runScene(GameDirector.getInstance().getScene());
    } else {
        cc.director.runScene(GameDirector.getInstance().getScene());
        cc.loader.loadJson(cc.loader.resPath + "resource_list/loading_resource_list.json", function(error, resultArr) {
            if(!error) {
                cc.loader.load(resultArr,
                    function (result, count, loadedCount) {
                    }, function () {
                        LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_LOADING_SUCCESS2, -1);
                        SceneMan.getInstance().setCurSceneType(SceneType.LOADING_RESOURCE);
                        SceneMan.getInstance().switchScene(SceneType.SLOT_LOBBY);
                    });
            }
        });
    }

    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_APP_LAUNCH, -1);
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_LOADING_SUCCESS1, -1);

    LogicMan.getInstance().startGame();
};

startGame();

