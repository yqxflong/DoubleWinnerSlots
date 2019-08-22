/**
 * Created by qinning on 15/5/28.
 */

var Util = require("../util/Util");
var ProgressIndicatorController = require("./ProgressIndicatorController");

var SlotLobbyProgressIndicatorController = function () {
    ProgressIndicatorController.call(this);
};

Util.inherits(SlotLobbyProgressIndicatorController, ProgressIndicatorController);

SlotLobbyProgressIndicatorController.prototype.onEnter = function () {
    ProgressIndicatorController.prototype.onEnter.call(this);
};

SlotLobbyProgressIndicatorController.prototype.onExit = function () {
    ProgressIndicatorController.prototype.onExit.call(this);
};

SlotLobbyProgressIndicatorController.prototype.onDidLoadFromCCB  = function() {
    ProgressIndicatorController.prototype.onDidLoadFromCCB.call(this);
};

SlotLobbyProgressIndicatorController.ready = function() {
    ProgressIndicatorController.close();
    var GameDirector = require("../model/GameDirector");
    var SlotLobbyScene = require("../view/SlotLobbyScene");
    GameDirector.getInstance().runWithScene(new SlotLobbyScene());
};

SlotLobbyProgressIndicatorController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/progress_indicator.ccbi", null, "ProgressIndicatorController", new SlotLobbyProgressIndicatorController());
    return node;
};

module.exports = SlotLobbyProgressIndicatorController;