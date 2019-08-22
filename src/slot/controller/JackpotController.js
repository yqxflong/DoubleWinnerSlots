var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogData = require("../../common/events/MessageDialogData");
var MessageDialogType = require("../../common/events/MessageDialogType");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var ClassicSlotMan = require("../model/ClassicSlotMan");
/**
 * Created by alanmars on 15/7/15.
 */
var JackpotController = function () {
    BaseCCBController.call(this);
    this._winLabel = null;
    this._totalCoinNumAnim = null;
    this.winCount = 0;
};

Util.inherits(JackpotController, BaseCCBController);

JackpotController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);

    this._totalCoinNumAnim.startNum = 0;
    this._totalCoinNumAnim.endNum = this.winCount;
    this._totalCoinNumAnim.start();
};

JackpotController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
};

JackpotController.prototype.initWith = function (winCount) {
    this._totalCoinNumAnim = new NumberAnimation(this._winLabel);
    this._totalCoinNumAnim.tickDuration = 2.0;
    this._totalCoinNumAnim.tickInterval = 0.05;
    this.winCount = winCount;

    var LogMan = require("../../log/model/LogMan");
    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
    LogMan.getInstance().userProductRecord(ProductChangeReason.JACKPOT_WIN, 0, winCount, 0, 0, ClassicSlotMan.getInstance().subjectId);
};

JackpotController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
    PopupMan.popupRate();
};

JackpotController.prototype.onShareItemClicked = function (sender) {
    this.onCloseItemClicked();
};

JackpotController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(MessageDialogType.SLOT_JACKPOT));
    DialogManager.getInstance().close(this.rootNode, true);
};

JackpotController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/popup/casino_popup_jackpot.ccbi", null, "JackpotController", new JackpotController());
};

module.exports = JackpotController;