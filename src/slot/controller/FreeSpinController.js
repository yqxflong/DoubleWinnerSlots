/**
 * Created by alanmars on 15/5/21.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogData = require("../../common/events/MessageDialogData");
var MessageDialogType = require("../../common/events/MessageDialogType");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var PopupMan = require("../../common/model/PopupMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var BonusType = require("../enum/BonusType");

/**
 * Created by qinning on 15/7/3.
 */
var FreeSpinController = function () {
    BaseCCBController.call(this);
    this._congratulationIcon = null;
    this._winnerIcon = null;
    this._chipsIcon = null;
    this._freeSpinIcon = null;
    this._winCoinLabel = null;
    this._btnLabel = null;

    this._totalCoinNumAnim = null;
    this.rewardCount = 0;

    this.bonusType = 0;
    this.messageDialogType = 0;

    this._chipCountMaxWidth = 450;
};

Util.inherits(FreeSpinController, BaseCCBController);

FreeSpinController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

FreeSpinController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
};

/**
 *
 * @param {BonusType} bonuType
 * @param {int} rewardCount
 * @param {MessageDialogType} messageDialogType
 */
FreeSpinController.prototype.initWith = function (bonuType, rewardCount, messageDialogType) {
    this.rewardCount = rewardCount;
    this._winCoinLabel.setString(0);
    this.bonuType = bonuType;
    this.messageDialogType = messageDialogType;
    if (this.bonuType == BonusType.BONUS_FREESPIN) {
        this._congratulationIcon.visible = true;
        this._winnerIcon.visible = false;
        this._chipsIcon.visible = false;
        this._freeSpinIcon.visible = true;
        this._btnLabel.setString("START");
        this._winCoinLabel.setString(rewardCount);
    } else {
        this._congratulationIcon.visible = false;
        this._winnerIcon.visible = true;
        this._chipsIcon.visible = true;
        this._freeSpinIcon.visible = false;
        this._btnLabel.setString("Ok");

        this._totalCoinNumAnim = new NumberAnimation(this._winCoinLabel);
        this._totalCoinNumAnim.tickDuration = 2.0;
        this._totalCoinNumAnim.tickInterval = 0.05;
        this._totalCoinNumAnim.maxWidth = 450;

        this._totalCoinNumAnim.startNum = 0;
        this._totalCoinNumAnim.endNum = rewardCount;
        this._totalCoinNumAnim.start();
        if(rewardCount > 0) {
            AudioPlayer.getInstance().playEffectByKey("slots/bonus-cheer");
        }
    }
};

FreeSpinController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

FreeSpinController.prototype.startClicked = function (sender) {
    this.closeClicked();
};

FreeSpinController.prototype.shareClicked = function (sender) {
    AudioHelper.playBtnClickSound();
};

FreeSpinController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode, true);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(this.messageDialogType));
};

FreeSpinController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("slot/freespin/popup_freespin.ccbi", null, "FreeSpinController", new FreeSpinController());
    return node;
};

module.exports = FreeSpinController;