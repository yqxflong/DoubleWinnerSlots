/**
 * Created by qinning on 15/5/28.
 */

var Util = require("../util/Util");
var LoadingController = require("./LoadingController");
var Config = require("../util/Config");
var SelectServerListController = require("./SelectServerListController");
var StorageController = require("../storage/storageController");
var PomeloClient = require("../net/PomeloClient");
var ServerURLType = require("../enum/ServerURLType");
var PlayerMan = require("../model/PlayerMan");
var SocialMan = require("../../social/model/SocialMan");
var PopupMan = require("../model/PopupMan");
var SceneMan = require("../model/SceneMan");
var AudioPlayer = require("../audio/AudioPlayer");
var FaceBookMan = require("../../social/model/FaceBookMan");
var TaskConfigMan = require("../../task/config/TaskConfigMan");

var ResourceLoadingController = function () {
    LoadingController.call(this);
};

Util.inherits(ResourceLoadingController, LoadingController);

ResourceLoadingController.prototype.onEnter = function () {
    LoadingController.prototype.onEnter.call(this);

    //cc.eventManager.addListener({
    //    event: cc.EventListener.KEYBOARD,
    //    onKeyReleased: function (keyCode, event) {
    //        if (keyCode == cc.KEY.back) {
    //            var PopupMan = require("../model/PopupMan");
    //            PopupMan.popupLeaveGameDlg();
    //        }
    //    }
    //}, this.rootNode);

    if (!cc.sys.isNative && document.getElementById("cocosLoading")) {
        var cocosLoading = document.getElementById("cocosLoading");
        cocosLoading.parentElement.removeChild(document.getElementById("cocosLoading"));
    }

    if (!cc.sys.isNative && document.getElementById("cocosLoadingImg")) {
        var cocosLoading = document.getElementById("cocosLoadingImg");
        cocosLoading.parentElement.removeChild(document.getElementById("cocosLoadingImg"));
    }

    this._startLoading();
};

ResourceLoadingController.prototype.onExit = function () {
    LoadingController.prototype.onExit.call(this);
};

ResourceLoadingController.prototype.onDidLoadFromCCB  = function() {
    LoadingController.prototype.onDidLoadFromCCB.call(this);
};

ResourceLoadingController.prototype._startLoading = function () {
    var SceneMan = require("../model/SceneMan");
    var self = this;
    cc.loader.loadJson(cc.loader.resPath + "resource_list/resource_list.json", function(error, resultArr) {
        if(!error) {
            cc.loader.load(resultArr,
                function (result, count, loadedCount) {
                    var percent = (loadedCount / count * 100) | 0;
                    var LoadingController = require("../controller/LoadingController");
                    percent = parseInt(percent / 100 * 90);
                    LoadingController.dispatchLoadingEvent(percent / 100);
                }, function () {
                    //TaskConfigMan.getInstance().generateMapPathPoint();
                    //cc.spriteFrameCache.addSpriteFrames("casino/daily_challenge/dailychallenge_collect_icon.plist",
                    //    "casino/daily_challenge/dailychallenge_collect_icon.png");
                    SceneMan.getInstance().onResourcesReady();
                    self.startGame();
                });
        } else {
            cc.log("load resource error");
        }
    });
};

ResourceLoadingController.prototype.startGame = function () {
    if(Config.isRelease()) {
        this.loginFB();
    } else {
        var node = SelectServerListController.createFromCCB();
        node.controller.initWith(Config.getServerList());
        node.controller.popup();
    }
    this.loadLagLoadResource();
};

ResourceLoadingController.prototype.loginFB = function () {
//html5 Login
    StorageController.getInstance().setItem("host", Config.getServerURL(ServerURLType.LOGIN_SERVER_URL));
    StorageController.getInstance().setItem("port", Config.getServerPort());
    PomeloClient.getInstance().init(Config.getServerURL(ServerURLType.LOGIN_SERVER_URL), Config.getServerPort(), function () {
        if(Config.isRelease() || Config.isDebug()) {
            SocialMan.getInstance().fbLogin(function (type, response) {
                if (type == 0) {
                    FaceBookMan.getInstance().getMyFriendsList(function (error, friendsList) {
                        if (!error) {
                            response["friendCount"] = friendsList.length;
                        } else {
                            response["friendCount"] = 0;
                        }
                        PlayerMan.getInstance().loginWithFacebook(response);
                    });

                } else {
                    PopupMan.popupCommonDialog("WARNING", ["Connect to Facebook failed"], "Ok", null, null, false);
                }
            });
        } else {
            PlayerMan.getInstance().loginWithGuest();
        }
    });
};

ResourceLoadingController.prototype.loadLagLoadResource = function () {
    cc.loader.loadJson(cc.loader.resPath + "resource_list/lag_load_resource_list.json", function(error, resultArr) {
        if(!error) {
            cc.loader.load(resultArr,
                function (result, count, loadedCount) {
                }, function () {
                    cc.log("load lag_load_resource_list completed");
                    if(SceneMan.getInstance().isInLobbyScene) {
                        if (!AudioPlayer.getInstance().isPlayingMusic()) {
                            AudioPlayer.getInstance().playMusicByKey("game-bg", true);
                        }
                    }
                });
        } else {
            cc.log("load lag_load_resource_list error");
        }
    });
};

ResourceLoadingController.prototype.ready = function() {
    var LoginUIController = require("./LoginUIController");
    var SlotLobbyScene = require("../view/SlotLobbyScene");
    var GameDirector = require("../model/GameDirector");
    GameDirector.getInstance().runWithScene(SlotLobbyScene.create());
};

ResourceLoadingController.ready = function() {
    LoadingController.dispatchLoadingEvent(1);
};

ResourceLoadingController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/loading.ccbi", null, "LoadingController", new ResourceLoadingController());
    return node;
};

module.exports = ResourceLoadingController;