/**
 * Created by qinning on 15/5/27.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");

var FLAG_STONE_DIAMOND_TAG = 1;

var FlagStoneLockController = function() {
    this._lockBg = null;
    this._lockInfo = null;
};


Util.inherits(FlagStoneLockController,BaseCCBController);

FlagStoneLockController.prototype.onEnter = function () {

};

FlagStoneLockController.prototype.onExit = function () {

};

FlagStoneLockController.prototype.initWith = function (unlockLevel) {
    if (ThemeName.THEME_DOUBLE_HIT == Config.themeName) {
        this._lockInfo.setString(Util.sprintf("LEVEL %d",unlockLevel));
    } else {
        this._lockInfo.setString(Util.sprintf("FROM LEVEL %d",unlockLevel));
    }
};

FlagStoneLockController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FlagStoneLockController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_lock.ccbi", null, "FlagStoneLockController", new FlagStoneLockController());
};

module.exports = FlagStoneLockController;