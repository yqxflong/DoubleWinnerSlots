var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PlayerMan = require("../../common/model/PlayerMan");
var StoreMan = require("../../store/model/StoreMan");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
/**
 * Created by alanmars on 15/8/12.
 */
var StoreDailyDiscountController = function () {
    BaseCCBController.call(this);

    this._saleEndLabel = null;
    this._discountLabel = null;

    this._coins1Label = null;
    this._coins2Label = null;
    this._coins3Label = null;

    this._price1Label = null;
    this._price2Label = null;
    this._price3Label = null;

    this._originalPrice1Label = null;
    this._originalPrice2Label = null;
    this._originalPrice3Label = null;

    this._coinsLabels = [];
    this._priceLabels = [];
    this._originalPriceLabels = [];

    this._productList = null;

    this._priceMaxWidth = 100;
    this._coinMaxWidth = 180;
    this._bonusMaxWidth = 130;

    this.titleFirstPurchase = null;
    this.titleDailyDiscount = null;

    this.maskLayer2 = null;
    this.clipLayer2 = null;
};

Util.inherits(StoreDailyDiscountController, BaseCCBController);

StoreDailyDiscountController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.DAILY_DISCOUNT_UPDATED, this.dailyDiscountUpdated, this);
};

StoreDailyDiscountController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.DAILY_DISCOUNT_UPDATED, this.dailyDiscountUpdated, this);
    BaseCCBController.prototype.onExit.call(this);
};

StoreDailyDiscountController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.useMaskLayer2();
    this._coinsLabels = [this._coins1Label, this._coins2Label, this._coins3Label];
    this._priceLabels = [this._price1Label, this._price2Label, this._price3Label];
    this._originalPriceLabels = [this._originalPrice1Label, this._originalPrice2Label, this._originalPrice3Label];

    var maxDiscountPercent = 0;
    var productList = StoreMan.getInstance().getRecommendDailyDiscountProductList();
    if (productList) {
        for (var i = 0; i < productList.length && i < 3; ++i) {
            var productInfo = productList[i];
            this._coinsLabels[i].setString(Util.getCommaNum(productInfo.quantity));
            this._priceLabels[i].setString(productInfo.price);
            this._originalPriceLabels[i].setString(productInfo.originalPrice);

            Util.scaleCCLabelBMFont(this._priceLabels[i], this._priceMaxWidth);
            Util.scaleCCLabelBMFont(this._coinsLabels[i], this._coinMaxWidth);
            Util.scaleCCLabelBMFont(this._originalPriceLabels[i], this._priceMaxWidth);

            if (productInfo.presentPercent > maxDiscountPercent) {
                maxDiscountPercent = productInfo.presentPercent;
            }
        }
        this._productList = productList;
    }
   if(StoreMan.getInstance().isFirstPurchaseRecommendProductList())
        this.switchTitleTo("FirstPurchase");
   else
       this.switchTitleTo("DailyDiscount");

  //  this._discountLabel.setString(Util.sprintf("%d%%",maxDiscountPercent));
    this.updateDailyDiscount(StoreMan.getInstance().dailyDiscountEndLocalTime - Date.now());
};
StoreDailyDiscountController.prototype.switchTitleTo = function (titleName)
{
        if(titleName == "DailyDiscount")
        {
            this.titleFirstPurchase.visible = false;
            this.titleDailyDiscount.visible = true;
            this.maskLayer.visible = false;
            this.clipLayer.visible = false;
            this.clipLayer.getParent().visible = false;

            this.maskLayer2.visible = true;
            this.clipLayer2.visible = true;
            this.clipLayer2.getParent().visible = true;
        }
        else
        {
            this.titleFirstPurchase.visible = true;
            this.titleDailyDiscount.visible = false;

            this.maskLayer.visible = true;
            this.clipLayer.visible = true;
            this.clipLayer.getParent().visible = true;

            this.maskLayer2.visible = false;
            this.clipLayer2.visible = false;
            this.clipLayer2.getParent().visible = false;
        }
};

StoreDailyDiscountController.prototype.useMaskLayer2 = function() {
    if(this.maskLayer2 != null && !cc.isUndefined(this.maskLayer2) && this.clipLayer2 != null && !cc.isUndefined(this.clipLayer2)) {
        var clipParentNode = this.clipLayer2.getParent();
        this.clipLayer2.retain();
        this.clipLayer2.removeFromParent(false);

        this.maskLayer2.removeFromParent(false);
        this.maskLayer2.visible = true;

        var clippingNode = new cc.ClippingNode(this.maskLayer2);
        clippingNode.alphaThreshold = 0.5;
        clippingNode.addChild(this.clipLayer2);
        this.clipLayer2.release();

        clipParentNode.addChild(clippingNode);
    }
};
StoreDailyDiscountController.prototype.acceptClicked = function (sender) {
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

StoreDailyDiscountController.prototype.dailyDiscountUpdated = function (event) {
    var leftTime = event.getUserData();
    if (leftTime > 0) {
        this.updateDailyDiscount(leftTime);
    } else {
        this.close();
    }
};

StoreDailyDiscountController.prototype.updateDailyDiscount = function (leftTime) {
    if (leftTime > 0) {

        var time = new Date(0, 0, 0, 0, 0, leftTime / 1000, 0);
        var hh = time.getHours();
        var mm = time.getMinutes() + hh * 60;
        var ss = time.getSeconds()

       this._saleEndLabel.setString(Util.sprintf("%s:%s", Util.getTwoDigit(mm), Util.getTwoDigit(ss)));
    }
};

StoreDailyDiscountController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();

    //var LogMan = require("../../log/model/LogMan");
    //var UIClickId = require("../../log/enum/UIClickId");
    //LogMan.getInstance().uiClickRecord(UIClickId.UI_CLICK_CLOSE_DISCOUNT_DIALOG);

    this.close();
};

StoreDailyDiscountController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

StoreDailyDiscountController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

StoreDailyDiscountController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/store/casino_store_limited_offer.ccbi", null, "StoreDailyDiscountController", new StoreDailyDiscountController());
};

module.exports = StoreDailyDiscountController;