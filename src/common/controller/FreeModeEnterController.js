/**
 * Created by qinning on 16/3/3.
 */
var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var AudioHelper = require("../util/AudioHelper");
var PopupMan = require("../model/PopupMan");
var TaskMan = require("../../task/model/TaskMan");
var EventDispatcher = require("../events/EventDispatcher");
var CommonEvent = require("../events/CommonEvent");

var FreeModeEnterController = function () {
    BaseCCBController.call(this);
    this._curSlotsNumLabel = null;
    //this._allSlotsNumLabel = null;
    this._freeModeItem = null;
};

Util.inherits(FreeModeEnterController, BaseCCBController);

FreeModeEnterController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.UNLOCK_SUBJECT, this.unlockSubject, this);
};

FreeModeEnterController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.UNLOCK_SUBJECT, this.unlockSubject, this);
    BaseCCBController.prototype.onExit.call(this);
};

FreeModeEnterController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.updateUnlockNum();
};

FreeModeEnterController.prototype.updateUnlockNum = function () {
    var openCount = TaskMan.getInstance().getOpenSubjectCount();
    var allCount = TaskMan.getInstance().getAllSubjectCount();
    var countString = Util.sprintf("%d/%d", openCount, allCount);
    this._curSlotsNumLabel.setString(countString);
    //this._allSlotsNumLabel.setString(allCount);
};

FreeModeEnterController.prototype.getContentSize = function () {
    return this._freeModeItem.getContentSize();
};

FreeModeEnterController.prototype.freeModeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupFreeModeDlg();
};

FreeModeEnterController.prototype.unlockSubject = function (event) {
    this.updateUnlockNum();
};

FreeModeEnterController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/free_mode/lobby_free_mode_enter.ccbi", null, "FreeModeEnterController", new FreeModeEnterController());
};

module.exports = FreeModeEnterController;