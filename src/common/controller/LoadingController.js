var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../util/AudioHelper");
var AudioPlayer = require("../audio/AudioPlayer");
var CommonEvent = require("../events/CommonEvent");
var EventDispatcher = require("../events/EventDispatcher");
var LoadingProgressData = require("../events/LoadingProgressData");
var PopupMan = require("../model/PopupMan");
var DeviceInfo = require("../../common/util/DeviceInfo");
var Config = require("../util/Config");

/**
 * Created by alanmars on 15/5/20.
 */
var PROGRESS_TIME = 1.0;

var LoadingController = function () {
    BaseCCBController.call(this);
    this._bgIcon = null;
    this._loadingBg = null;
    this._loadingIcon = null;
    this._loadingInfo = null;
    this._versionInfo = null;

    this._loadingProgressTimer = null;

    this.lastLoadingProgress = 0;
};

Util.inherits(LoadingController, BaseCCBController);

LoadingController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.LOADING_PROGRESS, this.onProgressUpdated, this);

    cc.sys.garbageCollect();

    if(cc.sys.isNative) {
        cc.sys.garbageCollect();
        cc.spriteFrameCache.removeUnusedSpriteFrames();
        cc.textureCache.removeUnusedTextures();
    }
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

    if(this._versionInfo) {
        if(Config.isLocal() || Config.isDebug()) {
            this._versionInfo.setString(Config.debugVersion);
        }
        else {
            this._versionInfo.setVisible(false);
        }
    }
};

LoadingController.prototype.scheduleHalfProgress = function() {
    cc.log("loadingProgressTimer:"+this._loadingProgressTimer);
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

    var isLoadingResource = userData.isLoadingResource;
    if (isLoadingResource) {
        this._loadingInfo.setString("Downloading Assets...");
    } else {
        this._loadingInfo.setString("Loading Game...");
    }

    loadingProgress = loadingProgress * 100;
    if(this.lastLoadingProgress >= loadingProgress) {
        return;
    }
    this._loadingProgressTimer.stopAllActions();
    var lastProgress = this._loadingProgressTimer.getPercentage();
    var t = (loadingProgress - lastProgress) / 100 * PROGRESS_TIME;
    if (t < 0.05) {
        t = 0.05;
    }
    if (userData.progress >= 1) {
        this._loadingProgressTimer.runAction(cc.sequence(cc.progressTo(t, loadingProgress), cc.callFunc(this.ready, this)));
    } else {
        this._loadingProgressTimer.runAction(cc.progressTo(t, loadingProgress));
    }
    this.lastLoadingProgress = loadingProgress;
};

LoadingController.prototype.ready = function() {

};

LoadingController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/loading.ccbi", null, "LoadingController", new LoadingController());
    return node;
};

LoadingController.dispatchLoadingEvent = function(progress, isLoadingResource) {
    if(cc.isUndefined(isLoadingResource)) {
        isLoadingResource = false;
    }
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.LOADING_PROGRESS, new LoadingProgressData(progress, isLoadingResource));
};

module.exports = LoadingController;