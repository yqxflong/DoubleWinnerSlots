/**
 * Created by qinning on 15/12/31.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var PlayerMan = require("../../common/model/PlayerMan");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var HourlyGameMan = require("../model/HourlyGameMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var PopupMan = require("../../common/model/PopupMan");
var HourlyBonusCardInfoController = require("./HourlyBonusCardInfoController");


var HourlyBonusUnlockCardController = function () {
    HourlyBonusCardInfoController.call(this);
};

Util.inherits(HourlyBonusUnlockCardController, HourlyBonusCardInfoController);

HourlyBonusUnlockCardController.prototype.onEnter = function () {
};

HourlyBonusUnlockCardController.prototype.onExit = function () {
};

HourlyBonusUnlockCardController.prototype.onDidLoadFromCCB = function () {
    HourlyBonusCardInfoController.prototype.onDidLoadFromCCB.call(this);
    AudioHelper.playCardEffect("card-unlock");
};

HourlyBonusUnlockCardController.prototype.updateNextLevelConfig = function () {
};

HourlyBonusUnlockCardController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

HourlyBonusUnlockCardController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_newcard.ccbi", null, "HourlyBonusUnlockCardController", new HourlyBonusUnlockCardController());
};

module.exports = HourlyBonusUnlockCardController;