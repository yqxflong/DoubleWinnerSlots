/**
 * Created by qinning on 15/5/28.
 */

var Util = require("../util/Util");
var LoadingController = require("../controller/LoadingController");
var Config = require("../util/Config");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var ResourceMan = require("../model/ResourceMan");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var PopupMan = require("../model/PopupMan");

var SlotRoomLoadingController = function () {
    LoadingController.call(this);
};

Util.inherits(SlotRoomLoadingController, LoadingController);

SlotRoomLoadingController.prototype.onEnter = function () {
    LoadingController.prototype.onEnter.call(this);

    //var SceneMan = require("../model/SceneMan");
    //cc.eventManager.addListener({
    //    event: cc.EventListener.KEYBOARD,
    //    onKeyReleased: function (keyCode, event) {
    //        if (keyCode == cc.KEY.back) {
    //            SceneMan.getInstance().onResourceError();
    //        }
    //    }
    //}, this.rootNode);
    this.initResource();
};

SlotRoomLoadingController.prototype.initResource = function () {
    var SceneMan = require("../model/SceneMan");
    var subject = SlotConfigMan.getInstance().getSubject(ClassicSlotMan.getInstance().subjectId);
    var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
    if(cc.sys.isNative) {
        var resRootDir = Util.sprintf("%s_%s", subjectTmpl.resRootDir, subjectTmpl.subjectTmplId);
        this.beginAssetsManager(resRootDir);
    } else {
        jsonResource = Util.sprintf(cc.loader.resPath + "resource_list/%s_%s/resource_list.json", subjectTmpl.resRootDir, subjectTmpl.subjectTmplId);
        cc.loader.loadJson(jsonResource, function(error, resultArr) {
            if(!error) {
                cc.loader.load(resultArr,
                    function (result, count, loadedCount) {
                        var percent = (loadedCount / count * 100) | 0;
                        //percent = Math.min(percent, 90);
                        var LoadingController = require("../controller/LoadingController");
                        percent = parseInt(percent / 100 * 90);
                        LoadingController.dispatchLoadingEvent(percent / 100, true);
                    }, function () {
                        ResourceMan.getInstance().addSlotResource(function () {
                            SceneMan.getInstance().onResourcesReady();
                        });
                    });
            } else {
                SceneMan.getInstance().onResourceError();
                return;
            }
        });
    }
    ClassicSlotMan.getInstance().enterRoom();
};

SlotRoomLoadingController.prototype.beginAssetsManager = function (resRootDir) {
    var SceneMan = require("../model/SceneMan");

    var resRootDirConfig;
    if(cc.sys.os == cc.sys.OS_IOS) {
        resRootDirConfig = resRootDir + "_ios";
    }
    else {
        resRootDirConfig = resRootDir + "_android";
    }

    ResourceMan.getInstance().chapterAssetsBegin(resRootDirConfig, function(error) {
        if(!error) {
            ResourceMan.getInstance().addSlotResource(function () {
                SceneMan.getInstance().onResourcesReady();
            });
        } else {
            SceneMan.getInstance().onResourceError();
        }
    });
};

SlotRoomLoadingController.prototype.onExit = function () {
    LoadingController.prototype.onExit.call(this);
};

SlotRoomLoadingController.prototype.onDidLoadFromCCB  = function() {
    LoadingController.prototype.onDidLoadFromCCB.call(this);

    var TaskConfigMan = require("../../task/config/TaskConfigMan");
    if(ClassicSlotMan.getInstance().taskId != 0) {
        var taskConfig = TaskConfigMan.getInstance().getTaskConfig(ClassicSlotMan.getInstance().taskId);
        if(taskConfig) {
            var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
            this._bgIcon.setTexture(themeConfig.slotBg);

            var SlotTheme = require("../../slot/enum/SlotTheme");
            if(taskConfig.resGroup == SlotTheme.SLOT_THEME_SNOW) {
                this._loadingInfo.setColor(cc.color(0, 46, 176));
            }
        }
    }
};

SlotRoomLoadingController.prototype.ready = function() {
    var SlotSceneFactory = require("../../slot/view/SlotSceneFactory");
    var GameDirector = require("../model/GameDirector");
    GameDirector.getInstance().runWithScene(SlotSceneFactory.create());

    var LogMan = require("../../log/model/LogMan");
    var UserStepId = require("../../log/enum/UserStepId");
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_LOADING_SLOT_RESOURCES_SUCCESS, -1);
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_LOADING_SLOT_SERVER_SUCCESS, -1);
};

SlotRoomLoadingController.ready = function() {
    LoadingController.dispatchLoadingEvent(1);
};

SlotRoomLoadingController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/loading.ccbi", null, "LoadingController", new SlotRoomLoadingController());
    return node;
};

module.exports = SlotRoomLoadingController;