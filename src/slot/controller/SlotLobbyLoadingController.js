/**
 * Created by qinning on 15/5/28.
 */

var Util = require("../../common/util/Util");
var LoadingController = require("../../common/controller/LoadingController");
var ResourceMan = require("../../common/model/ResourceMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");

var SlotLobbyLoadingController = function () {
    LoadingController.call(this);
};

Util.inherits(SlotLobbyLoadingController, LoadingController);

SlotLobbyLoadingController.prototype.onEnter = function () {
    LoadingController.prototype.onEnter.call(this);
    //cc.eventManager.addListener({
    //    event: cc.EventListener.KEYBOARD,
    //    onKeyReleased: function (keyCode, event) {
    //        if (keyCode == cc.KEY.back) {
    //            var SceneMan = require("../../common/model/SceneMan");
    //            SceneMan.getInstance().onResourceError();
    //        }
    //    }
    //}, this.rootNode);
};

SlotLobbyLoadingController.prototype.onExit = function () {
    LoadingController.prototype.onExit.call(this);
};

SlotLobbyLoadingController.prototype.onDidLoadFromCCB  = function() {
    LoadingController.prototype.onDidLoadFromCCB.call(this);
    ResourceMan.getInstance().stopResourceDownload();
    this.scheduleFullProgress();
};

SlotLobbyLoadingController.prototype.ready  = function() {
    var SlotLobbyScene = require("../../common/view/SlotLobbyScene");
    var GameDirector = require("../../common/model/GameDirector");
    GameDirector.getInstance().runWithScene(SlotLobbyScene.create());
};

SlotLobbyLoadingController.ready = function() {
    LoadingController.dispatchLoadingEvent(1);
};

SlotLobbyLoadingController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/loading.ccbi", null, "LoadingController", new SlotLobbyLoadingController());
    return node;
};

module.exports = SlotLobbyLoadingController;