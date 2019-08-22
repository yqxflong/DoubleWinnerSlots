/**
 * Created by qinning on 15/11/9.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PlayerMan = require("../../common/model/PlayerMan");
var StoreMan = require("../model/StoreMan");
var ActionType = require("../../log/enum/ActionType");
var Config = require("../../common/util/Config");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var PageType = require("../../log/enum/PageType");
var LogMan = require("../../log/model/LogMan");

var StoreSuperSaleController = function () {
    BaseCCBController.call(this);
    this._balanceLabel = null;
    this._newPriceLabel = null;
    this._oldPriceLabel = null;

    this._shopProduct = null;
};

Util.inherits(StoreSuperSaleController, BaseCCBController);

StoreSuperSaleController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.CLOSE_FIRST_CHARGE_DIALOG, this.close, this);
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_FIRST_PURCHASE, ActionType.ENTER);
};

StoreSuperSaleController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.CLOSE_FIRST_CHARGE_DIALOG, this.close, this);
    BaseCCBController.prototype.onExit.call(this);
};

StoreSuperSaleController.prototype.initWith = function (shopProduct) {
    this._shopProduct = shopProduct;
    this._balanceLabel.setString(Util.getCommaNum(shopProduct.quantity));
    if (shopProduct.originalPrice) {
        this._oldPriceLabel.setString(shopProduct.originalPrice);
    }
    this._newPriceLabel.setString(Util.sprintf("$%f", shopProduct.priceUS));
};

StoreSuperSaleController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

StoreSuperSaleController.prototype.acceptClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_FIRST_PURCHASE, ActionType.TAKE_ACTION);
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, this._shopProduct, 0, 0, ActionType.TAKE_ACTION, 0);
    StoreMan.getInstance().buyProduct(this._shopProduct);
};

StoreSuperSaleController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

StoreSuperSaleController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

StoreSuperSaleController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/store/casino_store_supersale_dialog.ccbi", null, "StoreSuperSaleController", new StoreSuperSaleController());
};

module.exports = StoreSuperSaleController;