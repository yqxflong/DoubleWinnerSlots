/**
 * Created by qinning on 15/12/20.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var FlagStoneController = require("./FlagStoneController");

var FlagStoneCommingSoonController = function() {
};

Util.inherits(FlagStoneCommingSoonController, FlagStoneController);


FlagStoneCommingSoonController.prototype.onEnter = function () {
};

FlagStoneCommingSoonController.prototype.onExit = function () {
};

FlagStoneCommingSoonController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FlagStoneCommingSoonController.prototype.initWithSubject = function (subject) {
};

FlagStoneCommingSoonController.prototype.initWithTaskConfig = function (taskLevelConfig) {
};

FlagStoneCommingSoonController.prototype.updateFriendTaskInfo = function (playerTaskInfo) {
};

FlagStoneCommingSoonController.prototype.showLevelCompletedAnim = function () {
};

FlagStoneCommingSoonController.prototype.showLevelBeginAnim = function () {
};

FlagStoneCommingSoonController.prototype.spinClicked = function (sender) {
};

FlagStoneCommingSoonController.prototype.buyClicked = function (sender) {
};

FlagStoneCommingSoonController.prototype.checkTaskLevelUpCompleted = function (event) {
};

FlagStoneCommingSoonController.prototype.unlockSubject = function (event) {
};

FlagStoneCommingSoonController.createFromCCB = function(fileName) {
    return Util.loadNodeFromCCB(fileName, null, "FlagStoneCommingSoonController", new FlagStoneCommingSoonController());
};

module.exports = FlagStoneCommingSoonController;