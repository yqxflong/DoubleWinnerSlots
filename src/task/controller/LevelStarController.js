/**
 * Created by ZenQhy on 16/6/17.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");

var LevelStarController = function() {
    this._starParticle = null;
};

Util.inherits(LevelStarController, BaseCCBController);

LevelStarController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

LevelStarController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

LevelStarController.prototype.onDidLoadFromCCB  = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

LevelStarController.prototype.setParticleVisible = function (isVisible) {
    this._starParticle.visible = isVisible;
};

LevelStarController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/mission/casino_mission_dialog_item_star.ccbi", null, "LevelStarController", new LevelStarController());
};

module.exports = LevelStarController;