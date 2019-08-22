var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PlayerMan = require("../../common/model/PlayerMan");
var StoreMan = require("../../store/model/StoreMan");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
/**
 * Created by alanmars on 15/8/12.
 */
var StoreDiscountController = function () {
    BaseCCBController.call(this);
    this._bonus1Label = null;
    this._bonus2Label = null;
    this._bonus3Label = null;

    this._coins1Label = null;
    this._coins2Label = null;
    this._coins3Label = null;

    this._price1Label = null;
    this._price2Label = null;
    this._price3Label = null;

    this._bonusLabels = [];
    this._coinsLabels = [];
    this._priceLabels = [];

    this._productList = null;

    this._priceMaxWidth = 120;
};

Util.inherits(StoreDiscountController, BaseCCBController);

StoreDiscountController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

StoreDiscountController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

StoreDiscountController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._bonusLabels = [this._bonus1Label, this._bonus2Label, this._bonus3Label];
    this._coinsLabels = [this._coins1Label, this._coins2Label, this._coins3Label];
    this._priceLabels = [this._price1Label, this._price2Label, this._price3Label];

    var holidayShopInfo = StoreMan.getInstance().getHolidayDiscountShopInfo();
    if (holidayShopInfo) {
        var productList = holidayShopInfo.productList;
        if (productList) {
            for (var i = 0; i < productList.length && i < 3; ++i) {
                var productInfo = productList[i];
                this._bonusLabels[i].setString(Util.getCommaNum(productInfo.quantity - productInfo.originalQuantity));
                this._coinsLabels[i].setString(Util.getCommaNum(productInfo.quantity));
                this._priceLabels[i].setString(productInfo.price);

                Util.scaleCCLabelBMFont(this._priceLabels[i], this._priceMaxWidth);
            }
            this._productList = productList;
        }
    }

};

StoreDiscountController.prototype.acceptClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var tag = sender.getTag();
    var index = tag - 1;
    if (this._productList && index >= 0 && index < this._productList.length) {
        var productInfo = this._productList[index];
        var LogMan = require("../../log/model/LogMan");
        LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, productInfo, 0, 0, ActionType.TAKE_ACTION, 0);
        StoreMan.getInstance().buyProduct(productInfo);
    }
};

StoreDiscountController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

StoreDiscountController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

StoreDiscountController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

StoreDiscountController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/store/casino_store_discount_dialog.ccbi", null, "StoreDiscountController", new StoreDiscountController());
};

module.exports = StoreDiscountController;