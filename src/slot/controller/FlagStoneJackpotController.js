/**
 * Created by alanmars on 15/7/14.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var Config = require("../../common/util/Config");
var ThemeName = require("../../common/enum/ThemeName");

var FlagStoneJackpotController = function() {
    this._jackpotLabel = null;
    this.subject = null;
};

Util.inherits(FlagStoneJackpotController, BaseCCBController);

FlagStoneJackpotController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_UPDATE_JACKPOT, this.onUpdateJackpot, this);
};

FlagStoneJackpotController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_UPDATE_JACKPOT, this.onUpdateJackpot, this);
};

/**
 * @param {Subject} subject
 */
FlagStoneJackpotController.prototype.initWith = function (subject) {
    this.subject = subject;
};

FlagStoneJackpotController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FlagStoneJackpotController.prototype.onUpdateJackpot = function (event) {
    if (this._jackpotLabel && this.subject) {
        this._jackpotLabel.setString(Util.getCommaNum(this.subject.jackpotInfoList[0].jackpotValue));
        if (Config.themeName == ThemeName.THEME_DOUBLE_HIT) {
            var maxLabelWidth = 190;
            Util.scaleCCLabelBMFont(this._jackpotLabel, maxLabelWidth);
        }
    }
};

FlagStoneJackpotController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_flagstone_title.ccbi", null, "FlagStoneJackpotController", new FlagStoneJackpotController());
};

FlagStoneJackpotController.createFromCCBig = function() {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_flagstone_title_big.ccbi", null, "FlagStoneJackpotController", new FlagStoneJackpotController());
};

module.exports = FlagStoneJackpotController;