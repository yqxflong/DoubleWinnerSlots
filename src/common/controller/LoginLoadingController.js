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
var CommonEvent = require("../events/CommonEvent");
var EventDispatcher = require("../events/EventDispatcher");

var LoginLoadingController = function () {
    LoadingController.call(this);
    this._allActionMaskCount = 0;
};

Util.inherits(LoginLoadingController, LoadingController);

LoginLoadingController.prototype.onEnter = function () {
    LoadingController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.MASK_PROGRESS_UPDATE, this.onMaskProgressUpdate, this);

    //cc.eventManager.addListener({
    //    event: cc.EventListener.KEYBOARD,
    //    onKeyReleased: function (keyCode, event) {
    //        if (keyCode == cc.KEY.back) {
    //            var PopupMan = require("../model/PopupMan");
    //            PopupMan.popupLeaveGameDlg();
    //        }
    //    }
    //}, this.rootNode);
    this._startLoading();
};

LoginLoadingController.prototype.onExit = function () {
    LoadingController.prototype.onExit.call(this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.MASK_PROGRESS_UPDATE, this.onMaskProgressUpdate, this);
};

LoginLoadingController.prototype.onDidLoadFromCCB  = function() {
    LoadingController.prototype.onDidLoadFromCCB.call(this);
    var SceneType = require("../../common/enum/SceneType");
    this._allActionMaskCount = SceneMan.getInstance().getAllActionMaskCount(SceneType.LOGIN, SceneType.SLOT_LOBBY);
};

LoginLoadingController.prototype._startLoading = function () {
    setTimeout(function () {
        //generate map path point list.
        //TaskConfigMan.getInstance().generateMapPathPoint();
        setTimeout(function () {
            cc.spriteFrameCache.addSpriteFrames("casino/daily_challenge/dailychallenge_collect_icon.plist",
                "casino/daily_challenge/dailychallenge_collect_icon.png");
            SceneMan.getInstance().onResourcesReady();
        }, 50);
    }, 50);
};

LoginLoadingController.prototype.onMaskProgressUpdate = function (event) {
    var curActionMaskCount = SceneMan.getInstance().getCurActionMaskCount();
    var percent = (this._allActionMaskCount - curActionMaskCount) / this._allActionMaskCount;
    cc.log("allActionMaskCount:" + this._allActionMaskCount);
    cc.log("curActionMaskCount:" + curActionMaskCount);
    cc.log("percent:" + percent);
    LoadingController.dispatchLoadingEvent(percent);
};

LoginLoadingController.prototype.ready = function() {
    var GameDirector = require("../model/GameDirector");
    var SlotLobbyScene = require("../view/SlotLobbyScene");
    GameDirector.getInstance().runWithScene(new SlotLobbyScene());
};

LoginLoadingController.ready = function() {
    LoadingController.dispatchLoadingEvent(1);
};

LoginLoadingController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/loading.ccbi", null, "LoadingController", new LoginLoadingController());
    return node;
};

module.exports = LoginLoadingController;