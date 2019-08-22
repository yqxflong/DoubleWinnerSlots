var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PlayerMan = require("../../common/model/PlayerMan");
var ProductType = require("../../common/enum/ProductType");
var Constants = require("../../common/enum/Constants");
/**
 * Created by alanmars on 15/8/12.
 */
var PurchaseResultController = function () {
    BaseCCBController.call(this);
    this._previousDescLabel = null;
    this._oldBalanceLabel = null;
    this._buyCountLabel = null;
    this._gemsIcon = null;
    this._coinsIcon = null;
    this._newBalanceLabel = 0;
    this.productCount = 0;
    this._productType = 0;

    this._closeCallback = null;

    this._newBalanceLabelWidth = 500;

    this._transactionId = null;
};

Util.inherits(PurchaseResultController, BaseCCBController);

/**
 * Whether the dialog of purchase result with the given transaction id exists,
 * share by all instances.
 * @type {Object.<string, boolean>}
 */
PurchaseResultController.prototype.instanceMap = {};

PurchaseResultController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

PurchaseResultController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

PurchaseResultController.prototype.initWith = function (productCount, productType, closeCallback) {
    this._productType = productType;
    this.productCount = productCount;

    this._closeCallback = closeCallback;

    if(productType == ProductType.PRODUCT_TYPE_CHIP) {
        this._rewardInfo.setString("Your coins have been delivered!");
        this._oldBalanceLabel.setString(Util.getCommaNum(PlayerMan.getInstance().getCoins()));
        this._buyCountLabel.setString(Util.getCommaNum(productCount));
        this._newBalanceLabel.setString(Util.sprintf("NEW BALANCE %s", Util.getCommaNum(PlayerMan.getInstance().getCoins() + productCount)));
        this._gemsIcon.visible = false;
        this._coinsIcon.visible = true;
    } else if (productType == ProductType.PRODUCT_TYPE_GEM) {
        this._rewardInfo.setString("Your gems have been delivered!");
        this._oldBalanceLabel.setString(Util.getCommaNum(PlayerMan.getInstance().getGems()));
        this._buyCountLabel.setString(Util.getCommaNum(productCount));
        this._newBalanceLabel.setString(Util.sprintf("NEW BALANCE %s", Util.getCommaNum(PlayerMan.getInstance().getGems() + productCount)));
        this._gemsIcon.visible = true;
        this._coinsIcon.visible = false;
    } else if (productType == ProductType.PRODUCT_TYPE_VIP) {
        //this._rewardInfo.setString("Your VIP have been delivered!");
        //var StoreMan = require("../model/StoreMan");
        //var oldLeftDays = StoreMan.getInstance().getLeftVIPDays();
        //this._oldBalanceLabel.setString(Util.sprintf("%s days", Util.getCommaNum(oldLeftDays)));
        //this._buyCountLabel.setString(Util.sprintf("%s days", Util.getCommaNum(productCount)));
        //this._newBalanceLabel.setString(Util.sprintf("%s days", Util.getCommaNum(oldLeftDays + productCount)));
        //this._gemsIcon.visible = false;
        //this._coinsIcon.visible = false;
    }

    Util.scaleCCLabelBMFont(this._newBalanceLabel, this._newBalanceLabelWidth);
};

/**
 * @param {string} transactionId
 */
PurchaseResultController.prototype.popup = function (transactionId) {
    if (!this.instanceMap[transactionId]) {
        this._transactionId = transactionId;
        this.instanceMap[transactionId] = true;
        DialogManager.getInstance().popup(this.rootNode);
    }
};

PurchaseResultController.prototype.onOkItemClicked = function (sender) {
    this.onCloseItemClicked();
};

PurchaseResultController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (this._productType == ProductType.PRODUCT_TYPE_CHIP) {
        PlayerMan.getInstance().addChips(this.productCount, true);
    } else if (this._productType == ProductType.PRODUCT_TYPE_GEM) {
        PlayerMan.getInstance().addGems(this.productCount, true);
    } else if (this._productType == ProductType.PRODUCT_TYPE_VIP) {
        //var StoreMan = require("../model/StoreMan");
        //StoreMan.getInstance().addLeftVIPTime(this.productCount * Constants.DAY_IN_MILLIS, true);
    }

    if (this._closeCallback) {
        this._closeCallback();
    }
    this.close();
};

PurchaseResultController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

PurchaseResultController.prototype._hidePreviousBalance = function () {
    if (this._previousDescLabel) {
        this._previousDescLabel.visible = false;
    }
    this._oldBalanceLabel.visible = false;
};

/**
 * @param {number} productCount
 * @param {number} multiplier
 */
PurchaseResultController.prototype.setMultiPurchaseResult = function (productCount, multiplier) {
    this._hidePreviousBalance();
    this._buyCountLabel.setString(Util.getCommaNum(productCount) + " x " + (multiplier + 1));
};

PurchaseResultController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/store/store_purchase_succeed.ccbi", null, "PurchaseResultController", new PurchaseResultController());
};

module.exports = PurchaseResultController;