var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var StoreUIItemController = require("./StoreUIItemController");
var DialogManager = require("../../common/popup/DialogManager");
var StoreMan = require("../model/StoreMan");
var AudioHelper = require("../../common/util/AudioHelper");
var LogMan = require("../../log/model/LogMan");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var PopupMan = require("../../common/model/PopupMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var StoreType = require("../enum/StoreType");
var Constants = require("../../common/enum/Constants");
var ProductType = require("../../common/enum/ProductType");
var StoreEarnController = require("./StoreEarnController");

/**
 * Created by qinning on 15/5/6.
 */

var StoreUISceneController = function () {
    BaseCCBController.call(this);
    this._closeItem = null;
    this._startNode = null;
    this._endNode = null;
    this._promotionEditBgNode = null;
    this._bgSpr = null;
    this._vipPriceLabel = null;
    this._rewardCoinsLabel = null;
    this._rewardGemsLabel = null;
    this._rewardStarsLabel = null;
    this._vipRemainLabel = null;
    this._chipItem = null;
    this._gemItem = null;
    this._earnItem = null;

    this._coinUpBg = null;
    this._gemsUpBg = null;

    this._noVIPNode = null;
    this._haveVIPNode = null;
    this._buyVipItem = null;

    this._storeType = StoreType.STORE_TYPE_COINS;

    this._storeNodeMap = {};

    this._promotionEditBox = null;
};

Util.inherits(StoreUISceneController, BaseCCBController);

StoreUISceneController.prototype.onEnter = function () {
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, null, 0, 0, ActionType.ENTER, 0);
    EventDispatcher.getInstance().addEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
};

StoreUISceneController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, null, 0, 0, ActionType.LEAVE, 0);
};

StoreUISceneController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    var coinsProductList = StoreMan.getInstance().getProductList(StoreType.STORE_TYPE_COINS);
    var gemsProductList = StoreMan.getInstance().getProductList(StoreType.STORE_TYPE_GEMS);
    this.initStoreNode(coinsProductList, "casino/store/casino_store_coin.ccbi", "casino/store/casino_store_best.ccbi", StoreType.STORE_TYPE_COINS);
    this.initStoreNode(gemsProductList, "casino/store/casino_store_gem.ccbi", "casino/store/casino_store_best.ccbi", StoreType.STORE_TYPE_GEMS);
    this.initEarnCoins(StoreType.STORE_TYPE_EARN);

    //update price label
    this.onStoreClicked(StoreType.STORE_TYPE_COINS);

    var vipProductList = StoreMan.getInstance().getProductList(StoreType.STORE_TYPE_VIP);
    if (vipProductList && vipProductList.length > 0) {
        var productInfo = vipProductList[0];
        this._vipPriceLabel.setString(productInfo.price);
        var vipRewardInfo = StoreMan.getInstance().vipRewardInfo;
        this._rewardCoinsLabel.setString(Util.getCommaNum(vipRewardInfo.rewardChips));
        this._rewardGemsLabel.setString(Util.getCommaNum(vipRewardInfo.rewardGems));
        this._rewardStarsLabel.setString(Util.getCommaNum(vipRewardInfo.rewardStars));
        this.updateVIPLeftTime();
    }
};

StoreUISceneController.prototype.updateVIPLeftTime = function () {
    var leftVIPDays = StoreMan.getInstance().getLeftVIPDays();
    if (leftVIPDays > 0) {
        //have vip
        this._noVIPNode.visible = false;
        if(this._haveVIPNode) this._haveVIPNode.visible = true;
        this._buyVipItem.setEnabled(false);
        this._vipRemainLabel.setString(Util.sprintf("%d days", leftVIPDays));
    } else {
        //no vip
        this._noVIPNode.visible = true;
        if(this._haveVIPNode) this._haveVIPNode.visible = false;
        this._buyVipItem.setEnabled(true);
    }
};

StoreUISceneController.prototype.initStoreNode = function (productList, storeUIItemCCBFileName, storeUIBestItemCCBFileName, storeType) {
    var storeNode = new cc.Node();
    this._startNode.addChild(storeNode);
    this._storeNodeMap[storeType] = storeNode;

    if (!productList || productList.length == 0) {
        return;
    }
    var storeHeight = Math.abs(this._endNode.y - this._startNode.y);
    var shopItem = StoreUIItemController.createFromCCB(storeUIItemCCBFileName);
    var itemHeight = shopItem.controller.itemHeight;
    var gap = 0;
    if (productList.length > 1) {
        gap = (storeHeight - itemHeight * productList.length) / (productList.length - 1);
    }
    for (var i = 0; i < productList.length; ++i) {
        var productInfo = productList[i];
        if(productInfo.bestValue || productInfo.mostPopular) {
            shopItem = StoreUIItemController.createFromCCB(storeUIBestItemCCBFileName);
        }
        else {
            shopItem = StoreUIItemController.createFromCCB(storeUIItemCCBFileName);
        }
        shopItem.y = -((i + 0.5) * itemHeight + gap * i);
        storeNode.addChild(shopItem);
        if (productList[i]) {
            shopItem.controller.initWith(productList[i], i);
        }
    }
    storeNode.visible = false;
};

StoreUISceneController.prototype.initEarnCoins = function (storeType) {
    var storeNode = new cc.Node();
    this._startNode.addChild(storeNode);
    this._storeNodeMap[storeType] = storeNode;
    storeNode.visible = false;

    var promotionNode = StoreEarnController.createFromCCB();
    storeNode.addChild(promotionNode);
    promotionNode.y = - 130;
};

StoreUISceneController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, null, 0, 0, ActionType.LEAVE, 0);
    this.close();
};

StoreUISceneController.prototype.buyCoinsClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.onStoreClicked(StoreType.STORE_TYPE_COINS);
};

StoreUISceneController.prototype.buyGemsClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.onStoreClicked(StoreType.STORE_TYPE_GEMS);
};

StoreUISceneController.prototype.earnCoinsClicked = function (event) {
   AudioHelper.playBtnClickSound();
   this.onStoreClicked(StoreType.STORE_TYPE_EARN);
};

StoreUISceneController.prototype.buyVipClicked = function (event) {
    AudioHelper.playBtnClickSound();
    if (!cc.sys.isNative) {
        if(cc.screen.fullScreen()) {
            cc.screen.exitFullScreen();
        }
    }
    var vipProductList = StoreMan.getInstance().getProductList(StoreType.STORE_TYPE_VIP);
    if (vipProductList && vipProductList.length > 0) {
        var productInfo = vipProductList[0];
        var LogMan = require("../../log/model/LogMan");
        LogMan.getInstance().purchaseRecord(PurchaseRecordPage.MAIN_STORE, productInfo, 0, 0, ActionType.TAKE_ACTION, 0);
        StoreMan.getInstance().buyProduct(productInfo);
    }
};

StoreUISceneController.prototype.onStoreClicked = function (storeType) {
    this._storeType = storeType;
    for (var localStoreType in this._storeNodeMap) {
        var storeNode = this._storeNodeMap[localStoreType];
        if (storeNode) {
            if (localStoreType == storeType) {
                storeNode.visible = true;
            } else {
                storeNode.visible = false;
            }
        }
    }
    if (storeType == StoreType.STORE_TYPE_COINS) {
        this._chipItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_coin_1.png"));
        this._chipItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_coin_1.png"));
        this._gemItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_gem_2.png"));
        this._gemItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_gem_2.png"));
        this._earnItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_earn_2.png"));
        this._earnItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_earn_2.png"));

        // this._coinUpBg.visible = true;
        // this._gemsUpBg.visible = false;
    }
    else if (storeType == StoreType.STORE_TYPE_GEMS) {
        this._chipItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_coin_2.png"));
        this._chipItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_coin_2.png"));
        this._gemItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_gem_1.png"));
        this._gemItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_gem_1.png"));
        this._earnItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_earn_2.png"));
        this._earnItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_earn_2.png"));
        //
        // this._coinUpBg.visible = false;
        // this._gemsUpBg.visible = true;
    }
    else if (storeType == StoreType.STORE_TYPE_EARN) {
        this._chipItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_coin_2.png"));
        this._chipItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_coin_2.png"));
        this._gemItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_gem_2.png"));
        this._gemItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_gem_2.png"));
        this._earnItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_earn_1.png"));
        this._earnItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("store_tap_earn_1.png"));
    }
};

StoreUISceneController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

StoreUISceneController.prototype.close = function() {
    StoreMan.getInstance().checkAndShowStoreRewardDlg();
    DialogManager.getInstance().close(this.rootNode, true);
};

/**
 * @param {StoreType} storeType
 */
StoreUISceneController.prototype.initWithStoreType = function (storeType) {
    this.onStoreClicked(storeType);
};

StoreUISceneController.prototype.onProductChanged = function (event) {
    var userData = event.getUserData();
    if (userData.productType == ProductType.PRODUCT_TYPE_VIP) {
        this.updateVIPLeftTime();
    }
};

StoreUISceneController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/store/casino_store_bg.ccbi", null, "StoreUISceneController", new StoreUISceneController());
};

module.exports = StoreUISceneController;