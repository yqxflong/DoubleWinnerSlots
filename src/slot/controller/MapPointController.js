/**
 * Created by qinning on 15/12/20.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");

var MapPointController = function() {
    this._completedIcon = null;
    this._unCompletedIcon = null;
};

Util.inherits(MapPointController,BaseCCBController);

MapPointController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

MapPointController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

MapPointController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.setCompleted(false);
};

/**
 * isCompleted
 * @param {boolean} isCompleted
 */
MapPointController.prototype.setCompleted = function (isCompleted) {
    if (isCompleted) {
        this._completedIcon.visible = true;
        this._unCompletedIcon.visible = false;
    } else {
        this._completedIcon.visible = false;
        this._unCompletedIcon.visible = true;
    }
};

MapPointController.prototype.showCompletedAnimation = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("levelup");
};

MapPointController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_map_point.ccbi", null, "MapPointController", new MapPointController());
};

module.exports = MapPointController;