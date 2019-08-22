var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var StoreMan = require("../model/StoreMan");
var ShopProduct = require("../entity/ShopProduct");
var AudioHelper = require("../../common/util/AudioHelper");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var Config = require("../../common/util/Config");
var ThemeName = require("../../common/enum/ThemeName");

/**
 * Created by qinning on 15/5/6.
 */
var StoreUIItemController = function () {
    BaseCCBController.call(this);
    /**
     * @type {cc.Sprite}
     * @private
     */
    this._bgSprite = null;
    this._bestValueIcon = null;
    this._mostPopularIcon = null;

    this._priceLabel = 0;
    this._discountLabel = 0;

    this._newCoinsLabel = null;
    this._oldCoinsLabel = null;

    this._buyItem = null;
    this._freeIcon = null;

    this._bestValueIcon = null;
    this._mostPopularIcon = null;

    this._lightNode = null;

    this._productInfo = null;

    this.itemHeight = 0;

    this._maxWidth = 100;
};

Util.inherits(StoreUIItemController, BaseCCBController);

StoreUIItemController.prototype.onEnter = function () {
};

StoreUIItemController.prototype.onExit = function () {
};

StoreUIItemController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this.itemHeight = this._buyItem.getContentSize().height + 2;
    this.useMaskLayer();
};

StoreUIItemController.prototype.useMaskLayer = function () {
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

StoreUIItemController.prototype.onBuyItemClicked = function (event) {
    AudioHelper.playBtnClickSound();
    if (!cc.sys.isNative) {
        if(cc.screen.fullScreen()) {
            cc.screen.exitFullScreen();
        }
    }
    var LogMan = require("../../log/model/LogMan");
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, this._productInfo, 0, 0, ActionType.TAKE_ACTION, 0);
    StoreMan.getInstance().buyProduct(this._productInfo);
};

/**
 * @param {ShopProduct} productInfo
 */
StoreUIItemController.prototype.initWith = function (productInfo, index) {
    this._productInfo = productInfo;
    this._discountLabel.setString(productInfo.presentPercent + "%");

    var oldChipCount = Math.floor(productInfo.quantity / (1.0 + productInfo.presentPercent * 0.01));
    this._oldCoinsLabel.setString(Util.getCommaNum(oldChipCount));
    this._newCoinsLabel.setString(Util.getCommaNum(productInfo.quantity));
    this._priceLabel.setString(productInfo.price);

    Util.scaleCCLabelBMFont(this._priceLabel, this._maxWidth);

    if (productInfo.bestValue) {
        this._bestValueIcon.visible = true;
        this._mostPopularIcon.visible = false;
        Util.scaleCCLabelBMFont(this._oldCoinsLabel, 128);
    }

    if (productInfo.mostPopular) {
        this._bestValueIcon.visible = false;
        this._mostPopularIcon.visible = true;
        Util.scaleCCLabelBMFont(this._oldCoinsLabel, 128);
    }

    if (index == 0) {
        this._freeIcon.visible = true;
        this._lightNode.visible = true;
    }
    else {
        this._freeIcon.visible = false;
        this._lightNode.visible = false;
    }
};

StoreUIItemController.createFromCCB = function (fileName) {
    return Util.loadNodeFromCCB(fileName, null, "StoreUIItemController", new StoreUIItemController());
};

module.exports = StoreUIItemController;