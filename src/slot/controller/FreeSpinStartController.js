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
var PopupMan = require("../../common/model/PopupMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");

/**
 * Created by qinning on 15/10/27.
 */
var FreeSpinStartController = function () {
    BaseCCBController.call(this);

    this._winCoinLabel = null;

    this._totalCoinNumAnim = null;

    this.rewardCount = 0;

    this.messageDialogType = 0;

    this._chipCountMaxWidth = 450;
};

Util.inherits(FreeSpinStartController, BaseCCBController);

FreeSpinStartController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

FreeSpinStartController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
};

FreeSpinStartController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.useMaskLayer();
};

FreeSpinStartController.prototype.useMaskLayer = function () {
    if(this.maskLayer != null && !cc.isUndefined(this.maskLayer) && this.clipLayer != null && !cc.isUndefined(this.clipLayer)) {
        var clipParentNode = this.clipLayer.getParent();
        this.clipLayer.retain();
        this.clipLayer.removeFromParent(false);

        this.maskLayer.removeFromParent(false);
        this.maskLayer.visible = true;

        var clippingNode = new cc.ClippingNode(this.maskLayer);
        clippingNode.alphaThreshold = 0.5;
        clippingNode.addChild(this.clipLayer);
        this.clipLayer.release();

        clipParentNode.addChild(clippingNode);
    }
};

/**
 *
 * @param {int} rewardCount
 * @param {MessageDialogType} messageDialogType
 */
FreeSpinStartController.prototype.initWith = function (rewardCount, messageDialogType) {
    this.rewardCount = rewardCount;
    this._winCoinLabel.setString(rewardCount);
    this.messageDialogType = messageDialogType;
};

FreeSpinStartController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

FreeSpinStartController.prototype.startClicked = function (sender) {
    this.closeClicked();
};

FreeSpinStartController.prototype.shareClicked = function (sender) {
    AudioHelper.playBtnClickSound();
};

FreeSpinStartController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

FreeSpinStartController.prototype.onDialogClosed = function (event) {
    this.close();
};

FreeSpinStartController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(this.messageDialogType));
};

FreeSpinStartController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/popup/casino_popup_freespin.ccbi", null, "FreeSpinStartController", new FreeSpinStartController());
};

module.exports = FreeSpinStartController;