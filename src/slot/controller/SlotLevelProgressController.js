/**
 * Created by ZenQhy on 16/5/18.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var SceneMan = require("../../common/model/SceneMan");
var SceneType = require("../../common/enum/SceneType");

var SlotLevelProgressController = function () {
    this._playItem = null;
};

Util.inherits(SlotLevelProgressController, BaseCCBController);

SlotLevelProgressController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

SlotLevelProgressController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

SlotLevelProgressController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

SlotLevelProgressController.prototype.playClicked = function (sender) {
    SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);
    this.close();
};

SlotLevelProgressController.prototype.closeClicked = function (sender) {
    this.close();
};

SlotLevelProgressController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

SlotLevelProgressController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

SlotLevelProgressController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/lobby/level_progress_dlg.ccbi", null, "levelProgressController", new SlotLevelProgressController());
};

module.exports = SlotLevelProgressController;