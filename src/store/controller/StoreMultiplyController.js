var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var WheelController = require("../../common/controller/WheelController");
var DialogManager = require("../../common/popup/DialogManager");
var StoreMan = require("../model/StoreMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var EventDispatcher = require("../../common/events/EventDispatcher");
var StoreEvent = require("../events/StoreEvent");
var PurchaseResultController = require("../controller/PurchaseResultController");

/**
 * Created by alanmars on 15/12/9.
 * @param {string} pid
 * @param {number} productCount
 */
var StoreMultiplyController = function (pid, productCount) {
    BaseCCBController.call(this);
    this._shopProduct = StoreMan.getInstance().getProduct(pid);
    this._productCount = productCount;

    this._spinItem = null;
    this._closeItem = null;
    this._itemLabel = null;
    this._wheelAnchorNode = null;
    this._isCollect = false;

    this._beforePurchaseNode = null;
    this._maxMultiplierLabel = null;
    this._priceLabel = null;

    this._afterPurchaseNode = null;
    this._productLabel = null;
    this._multiplierLabel = null;
    this._totalLabel = null;
    this._totalCoinNumAnim = null;

    /**
     * @param {StoreMultiPurchaseData}
     */
    this._multiPurchaseData = null;

    this._wheelNode = null;
};

Util.inherits(StoreMultiplyController, BaseCCBController);

StoreMultiplyController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._wheelNode = WheelController.createFromCCB("casino/store/store_multiply_reel.ccbi", 18);
    this._wheelNode.controller.initUI([
        "10x", "6x", "5x", "8x", "4x", "4x",
        "5x", "2x", "2x", "8x", "3x", "3x",
        "2x", "3x", "4x", "6x", "10x", "2x"
    ]);
    this._wheelAnchorNode.addChild(this._wheelNode);

    this._beforePurchaseNode.visible = true;
    this._priceLabel.setString(this._shopProduct.price);

    this._afterPurchaseNode.visible = false;
    this._productLabel.setString(Util.getCommaNum(this._productCount));
    this._multiplierLabel.setString("");
    this._totalLabel.setString("");
    this._totalCoinNumAnim = new NumberAnimation(this._totalLabel);
    this._totalCoinNumAnim.tickDuration = 3.0;
    this._totalCoinNumAnim.tickInterval = 0.05;
};

StoreMultiplyController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(StoreEvent.STORE_MULTI_PURCHASE_COMPLETED, this.onMultiPurchaseCompleted, this);
    EventDispatcher.getInstance().addEventListener(StoreEvent.STORE_PURCHASE_FAILED, this.onMultiPurchaseFailed, this);
};

StoreMultiplyController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(StoreEvent.STORE_MULTI_PURCHASE_COMPLETED, this.onMultiPurchaseCompleted, this);
    EventDispatcher.getInstance().removeEventListener(StoreEvent.STORE_PURCHASE_FAILED, this.onMultiPurchaseFailed, this);
};

StoreMultiplyController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

StoreMultiplyController.prototype.close = function() {
    StoreMan.getInstance().onMultiPurchaseClosed();
    DialogManager.getInstance().close(this.rootNode, true);
};

StoreMultiplyController.prototype.onSpinTriggered = function (sender) {
    if (!this._isCollect) {
        this._closeItem.setEnabled(false);
        this._spinItem.setEnabled(false);
        this._itemLabel.setString("WAIT");
        StoreMan.getInstance().activateMultiPurchase();
        StoreMan.getInstance().buyProduct(this._shopProduct);
    } else {
        var purchaseResultDlg = PurchaseResultController.createFromCCB();
        purchaseResultDlg.controller.initWith(this._multiPurchaseData.productCount, function () {
            StoreMan.getInstance().consumePurchaseOnServer(this._multiPurchaseData.transactionId);
        }.bind(this));
        purchaseResultDlg.controller.setMultiPurchaseResult(this._productCount, this._multiPurchaseData.multiplier);
        purchaseResultDlg.controller.popup(this._multiPurchaseData.transactionId);

        this.close();
    }
};

StoreMultiplyController.prototype.onCloseItemClicked = function (sender) {
    this.close();
};

/**
 * @param {cc.EventCustom} event
 */
StoreMultiplyController.prototype.onMultiPurchaseCompleted = function (event) {
    this._multiPurchaseData = event.getUserData();
    this._beforePurchaseNode.visible = false;
    this._afterPurchaseNode.visible = true;
    this._itemLabel.setString("SPIN");
    this._wheelNode.controller.rotate(this._multiPurchaseData.multiplierIndex, this.onWheelRotateCompleted.bind(this), this.onShowResultCompleted.bind(this));
};

StoreMultiplyController.prototype.onMultiPurchaseFailed = function (event) {
    this._closeItem.setEnabled(true);
    this._spinItem.setEnabled(true);
    this._itemLabel.setString("SPIN");
};

StoreMultiplyController.prototype.onWheelRotateCompleted = function () {
    this._wheelAnchorNode.addChild(Util.loadNodeFromCCB("casino/store/store_multiply_reel_afterspin.ccbi", null));

    this._multiplierLabel.setString("" + (this._multiPurchaseData.multiplier + 1));
    this._totalCoinNumAnim.startNum = 0;
    this._totalCoinNumAnim.endNum = this._productCount*(this._multiPurchaseData.multiplier + 1);
    this._totalCoinNumAnim.start();
};

StoreMultiplyController.prototype.onShowResultCompleted = function () {
    this._itemLabel.setString("COLLECT");
    this._spinItem.setEnabled(true);
    this._isCollect = true;
};

/**
 * @param {string} pid
 * @param {number} productCount
 * @returns {cc.Node}
 */
StoreMultiplyController.createFromCCB = function (pid, productCount) {
    return Util.loadNodeFromCCB("casino/store/store_multiply_bg.ccbi", null, "StoreMultiplyController", new StoreMultiplyController(pid, productCount));
};

module.exports = StoreMultiplyController;