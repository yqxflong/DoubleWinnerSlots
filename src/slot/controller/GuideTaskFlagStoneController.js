/**
 * Created by qinning on 15/12/20.
 */

var Util = require("../../common/util/Util");
var TaskFlagStoneController = require("./TaskFlagStoneController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskMan = require("../../task/model/TaskMan");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var PopupMan = require("../../common/model/PopupMan");

var GuideTaskFlagStoneController = function() {
    TaskFlagStoneController.call(this);

    this._cbHideGuideMan = null;
    this._animNode = null;
};

Util.inherits(GuideTaskFlagStoneController, TaskFlagStoneController);

GuideTaskFlagStoneController.prototype.onEnter = function () {
    TaskFlagStoneController.prototype.onEnter.call(this);
};

GuideTaskFlagStoneController.prototype.onExit = function () {
    TaskFlagStoneController.prototype.onExit.call(this);

    if(this._cbHideGuideMan) {
        this._cbHideGuideMan = null;
    }
};

GuideTaskFlagStoneController.prototype.onDidLoadFromCCB = function() {
    TaskFlagStoneController.prototype.onDidLoadFromCCB.call(this);

    this._animNode = new cc.Node();
    this.rootNode.addChild(this._animNode);
};

GuideTaskFlagStoneController.prototype.setClickCallback = function(cb1) {
    this._cbHideGuideMan = cb1;
};

GuideTaskFlagStoneController.prototype.showTaskPopup = function () {
    if (!TaskMan.getInstance().isLobbyFlagStoneCanSpin()) {
        return;
    }

    AudioHelper.playBtnClickSound();

    if(this._cbHideGuideMan) {
        this._cbHideGuideMan();
    }
};

GuideTaskFlagStoneController.createFromCCB = function(fileName) {
    return Util.loadNodeFromCCB(fileName, null, "TaskFlagStoneController", new GuideTaskFlagStoneController());
};

module.exports = GuideTaskFlagStoneController;