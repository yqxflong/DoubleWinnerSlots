
var BaseCCBController = require("../common/controller/BaseCCBController");
var EventDispatcher = require("../common/events/EventDispatcher");
var LoadingProgressData = require("../common/events/LoadingProgressData");
var Util = require("../common/util/Util");
var CommonEvent = require("../common/events/CommonEvent");
var DialogManager = require("../common/popup/DialogManager");
var Config = require("../common/util/Config");
var CommonDialogController = require("../common/controller/CommonDialogController");

/**
 * Created by alanmars on 15/5/20.
 */
var ASSETS_MANIFEST_PATH = "assets_config/project.manifest";
var PROGRESS_TIME = 1.0;

var LoadingController = function () {
    BaseCCBController.call(this);
    this._bgIcon = null;
    this._loadingBg = null;
    this._loadingIcon = null;
    this._tipsLabel = null;
    this._loadingInfo = null;

    this._loadingProgressTimer = null;

    this.lastLoadingProgress = 0;
};

Util.inherits(LoadingController, BaseCCBController);

LoadingController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.LOADING_PROGRESS, this.onProgressUpdated, this);
    //cc.eventManager.addListener({
    //    event: cc.EventListener.KEYBOARD,
    //    onKeyReleased: function (keyCode, event) {
    //        if (keyCode == cc.KEY.back) {
    //            var commonDialogController = CommonDialogController.createFromCCB();
    //            commonDialogController.controller.initWithYesNoDlg("LEAVE GAME", ["Are you sure you want", "to leave the game?"], "Stay", "Leave", function () {}, function () {
    //                cc.director.end();
    //            });
    //            commonDialogController.controller.popup();
    //        }
    //    }
    //}, this.rootNode);
    this.initAssetsManager();
};

LoadingController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);

    EventDispatcher.getInstance().removeEventListener(CommonEvent.LOADING_PROGRESS, this.onProgressUpdated, this);
};

LoadingController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._loadingProgressTimer = new cc.ProgressTimer(new cc.Sprite("#loading_bar.png"));
    this._loadingProgressTimer.type = cc.ProgressTimer.TYPE_BAR;
    this._loadingProgressTimer.setAnchorPoint(cc.p(0.5, 0.5));
    this._loadingProgressTimer.setPosition(this._loadingIcon.getPosition());
    this._loadingProgressTimer.midPoint = cc.p(0, 0.5);//1, 0);
    this._loadingProgressTimer.barChangeRate = cc.p(1, 0);
    this.rootNode.addChild(this._loadingProgressTimer);

    this._loadingProgressTimer.setPercentage(0);
    this._loadingIcon.visible = false;
    this._loadingInfo.setString("Loading Game...");
};

LoadingController.prototype.initAssetsManager = function() {
    if(Config.isLocal()) {
        this.loadGameJs();
        return;
    }
    LoadingController.dispatchLoadingEvent(0.03);
    this.beginAssetsManager();
};

LoadingController.prototype.beginAssetsManager = function() {
    var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
    var SlotAssetsManager = require("../common/asset/AssetsManager");
    var self = this;
    SlotAssetsManager.getInstance().downloadAssets(ASSETS_MANIFEST_PATH, storagePath, function (percent) {
        cc.log("SlotAssetsManager percent:" + percent);
        self._loadingInfo.setString("Downloading Assets...");
        percent = Math.min(percent / 100 * 97, 97);
        LoadingController.dispatchLoadingEvent(percent / 100);
    }, function (error) {
        cc.log("SlotAssetsManager error:"+error);
        if(error != null) {
            var commonDialogController = CommonDialogController.createFromCCB();
            if (cc.sys.os == cc.sys.OS_IOS) {
                commonDialogController.controller.initWith("NOTICE", ["Retry download resource?"], "OK", function () {
                    SlotAssetsManager.getInstance().retryDownloadAssets();
                }, null, false);
            } else {
                commonDialogController.controller.initWithYesNoDlg("NOTICE", ["Retry download resource?"], "OK", "No", function () {
                    SlotAssetsManager.getInstance().retryDownloadAssets();
                }, function () {
                    SlotAssetsManager.getInstance().purge();
                    cc.director.end();
                });
            }
            commonDialogController.controller.popup();
        } else {
            SlotAssetsManager.getInstance().purge();
            LoadingController.dispatchLoadingEvent(1);
            self._loadingInfo.setString("Loading Game...");
        }
    });
};

LoadingController.prototype.loadGameJs = function() {
    if(cc.sys.isNative) {
        cc.loader.loadJs("", jsb.fileUtils.fullPathForFilename("game.js"), function() {});
    } else {
        cc.loader.loadJs(cc.loader.resPath, "game.js", function() {});
    }
};

LoadingController.prototype.scheduleHalfProgress = function() {
    var loadingProgress = 50;
    var t = (loadingProgress - this._loadingProgressTimer.getPercentage()) / 100 * PROGRESS_TIME;
    this._loadingProgressTimer.runAction(cc.progressTo(t, 50));
};

LoadingController.prototype.scheduleFullProgress = function() {
    var t = 0.2;
    this._loadingProgressTimer.runAction(cc.sequence(cc.progressTo(t, 100),cc.callFunc(this.ready, this)));
};

/**
 * @param {LoadingProgressData} event
 */
LoadingController.prototype.onProgressUpdated = function(event) {
    var userData = event.getUserData();
    var loadingProgress = userData.progress;

    loadingProgress = loadingProgress * 100;
    if(this.lastLoadingProgress >= loadingProgress) {
        return;
    }
    var lastProgress = this._loadingProgressTimer.getPercentage();
    var t = (loadingProgress - lastProgress) / 100 * PROGRESS_TIME;
    cc.log("progress:"+lastProgress);
    if (t < 0.05) {
        t = 0.05;
    }
    if (userData.progress >= 1) {
        this._loadingProgressTimer.runAction(cc.sequence(cc.progressTo(t, loadingProgress), cc.callFunc(this.ready, this)));
    } else {
        //this._loadingProgressTimer.runAction(cc.progressTo(t, loadingProgress));
        this._loadingProgressTimer.setPercentage(loadingProgress);
    }
    this.lastLoadingProgress = loadingProgress;
};

LoadingController.prototype.ready = function() {
    this.loadGameJs();
};

LoadingController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/loading.ccbi", null, "LoadingController", new LoadingController());
    return node;
};

LoadingController.dispatchLoadingEvent = function(progress) {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.LOADING_PROGRESS, new LoadingProgressData(progress));
};

module.exports = LoadingController;