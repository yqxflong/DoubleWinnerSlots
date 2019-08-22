/**
 * Created by qinning on 15/12/15.
 */

var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");

var LobbyBottomTimeController = function() {
    this._time2Label = null;
    this._time1Label = null;

    this._oldNum = 0;
};

Util.inherits(LobbyBottomTimeController,BaseCCBController);

LobbyBottomTimeController.prototype.onEnter = function () {

};

LobbyBottomTimeController.prototype.onExit = function () {

};

LobbyBottomTimeController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

LobbyBottomTimeController.prototype.initTime = function (timeNum) {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("normal");
    this._time2Label.setString(timeNum);
    this._time1Label.setString(timeNum);
};

LobbyBottomTimeController.prototype.updateTime = function (timeNum) {
    this._oldNum = this._time2Label.getString();
    if (this._oldNum == timeNum) {
        return;
    }
    this.rootNode.animationManager.runAnimationsForSequenceNamed("effect");
    this._time1Label.setString(this._oldNum);
    this._time2Label.setString(timeNum);
};

LobbyBottomTimeController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/slot_lobby_ui_bottom_time.ccbi", null, "LobbyBottomTimeController", new LobbyBottomTimeController());
};

module.exports = LobbyBottomTimeController;