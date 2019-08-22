/**
 * Created by qinning on 15/4/23.
 */
var ProductType = require("../../common/enum/ProductType");
var ProductChangedData = require("../../common/events/ProductChangedData");
var CommonEvent = require("../../common/events/CommonEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");
var C2SGetShops = require("../protocol/C2SGetShops");
var PurchaseInfo = require("../entity/PurchaseInfo");
var dbController = require("../../common/storage/dbController");
var C2SVerifyPurchase = require("../protocol/C2SVerifyPurchase");
var ErrorCode = require("../../common/enum/ErrorCode");
var PopupMan = require("../../common/model/PopupMan");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var FacebookMan = require("../../social/model/FacebookMan");
var PlayerMan = require("../../common/model/PlayerMan");
var C2SGetProcessingPurchase = require("../protocol/C2SGetProcessingPurchase");
var ShopType = require("../enum/ShopType");
var PurchaseResultController = require("../controller/PurchaseResultController");
var Constants = require("../../common/enum/Constants");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var StoreEvent = require("../events/StoreEvent");
var C2SConsumePurchase = require("../protocol/C2SConsumePurchase");
var Util = require("../../common/util/Util");
var C2SDailyShopPopup = require("../protocol/C2SDailyShopPopup");

var PURCHASE_TITLE_MSG = "PURCHASE";
var PURCHASE_FAIL_MSG = ["Purchase Failed!", "Please try again."];
var PURCHASE_SUCCESS_MSG = ["Purchase Successfully!","You got %s coins!"];

var DAILY_DISCOUNT_STATUS = {
    DAILY_DISCOUNT_STATUS_NON: 0,
    DAILY_DISCOUNT_STATUS_RUNNING: 1,
    DAILY_DISCOUNT_STATUS_COOLING: 2,
    DAILY_DISCOUNT_STATUS_COOLING_END: 3,
    DAILY_DISCOUNT_STATUS_WAITING_SERVER: 4,
    DAILY_DISCOUNT_STATUS_END: 5
};

var StoreMan = cc.Class.extend({
    jsbStoreMan: null,
    MAX_DAILY_DISCOUNT_NUM: 3,
    /**
     * @type {Array.<int,ShopInfo>}
     */
    shopList: null,

    /**
     * @type {long}
     */
    endLocalTime: 0,

    vipRewardInfo: null,
    vipLeftTime: 0,

    /**
     * @type {Object.<string,PurchaseInfo>}
     */
    purchaseInfoMap: null,
    _isMultiPurchase: false,
    _storeMultiplyNode: null,

    _dailyDiscountStatus: 0,

    /**
     * @type {number}
     */
    dailyDiscountEndLocalTime: 0,
    /**
     * @type {number}
     */
    dailyDiscountNextPopTime: 0,

    protoShopListFromServer: null,

    slotLobbyEntered: false,

    ctor: function () {
        if (cc.sys.isNative) {
            this.jsbStoreMan = jsb_wtc.StoreHelper.getInstance();
            this.jsbStoreMan.onGetProductList = this.onGetProductListJsb.bind(this);
            this.jsbStoreMan.onBuyProductCompleted = this.onBuyProductCompletedJsb.bind(this);
            this.jsbStoreMan.onBuyProductFailed = this.onBuyProductFailedJsb.bind(this);
            this.jsbStoreMan.onGetUnverifiedReceiptList = this.onGetUnverifiedReceiptListJsb.bind(this);
        } else {
            cc.log("not native");
        }
        this.purchaseInfoMap = {};
    },

    init: function () {
    },

    reset: function () {
        this.shopList = null;
        this.endLocalTime = 0;
        this.dailyDiscountEndLocalTime = 0;
        this.dailyDiscountNextPopTime = 0;
        //   this._discountResourceLoaded = false;
        //   this._isShowedDiscountDialog = false;

    },

    beginSchedule: function () {
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
    },

    stopSchedule: function () {
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
    },

    update: function (dt) {
        if (this.hasLimitedTime()) {
            var countDownTime = this.endLocalTime - Util.getCurrentTime();
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.LIMITED_TIME_UPDATED, countDownTime);
            if (countDownTime < 0) {
                this.stopSchedule();
                this.onHolidayDiscountEnd();
            }
        }

        if (this.hasDailyDiscount()) {
            switch (this._dailyDiscountStatus) {
                case DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_NON:

                    break;
                case DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_RUNNING:
                    countDownTime = this.dailyDiscountEndLocalTime - Util.getCurrentTime();
                    if (countDownTime < 0) {
                        this.onDailyDiscountEnd();
                    }
                    EventDispatcher.getInstance().dispatchEvent(CommonEvent.DAILY_DISCOUNT_UPDATED, countDownTime);
                    break;
                case DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_COOLING:
                    countDownTime = this.dailyDiscountNextPopTime - Util.getCurrentTime();
                    if (countDownTime < 0) {
                        this.onDailyDiscountCoolingEnd();
                    }
                     break;
                case DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_COOLING_END:
                     break;
                case DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_WAITING_SERVER:

                    break;
                case DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_END:
                     break;
            }
        }
    },

    onShowDailyDiscount: function () {
        if (this.hasDailyDiscount()) {
            if (!this.hasLimitedTime()) {
                if (this.getDailyDiscountShopInfo().todayPopTimes >= this.dailyDiscountConfig.dailyMaxTimes) {
                    this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_END;
                } else {
                    this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_WAITING_SERVER;
                    this.sendDailyShopPopupCmd();
                }
            }
        }
    },
    onHolidayDiscountEnd: function () {
        cc.log("onHolidayDiscountEnd");
        var shopInfo = this.getShopInfo(ShopType.HOLIDAY_DISCOUNT);
        shopInfo.open = false;
        if (this.supportDailyDiscount()) {
            this.onShowDailyDiscount();
        }
    },
    onDailyDiscountCoolingEnd: function () {
        var dailyDiscountShopInfo = this.getDailyDiscountShopInfo();
        if (dailyDiscountShopInfo.todayPopTimes >= this.dailyDiscountConfig.dailyMaxTimes) {
            cc.log("todayPopTimes: " + dailyDiscountShopInfo.todayPopTimes);
            this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_END;
        } else {
            this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_COOLING_END;
        }
    },
    onDailyDiscountEnd: function () {
        this.dailyDiscountEndLocalTime = 0;
        var dailyDiscountShopInfo = this.getDailyDiscountShopInfo();
        dailyDiscountShopInfo.todayPopTimes++;
        if (dailyDiscountShopInfo.todayPopTimes > this.dailyDiscountConfig.dailyMaxTimes) {
            this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_END;
        } else {
            this.dailyDiscountNextPopTime = Util.getCurrentTime() + this.dailyDiscountConfig.coolDownMinutes * Constants.MIN_IN_MILLIS;
            this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_COOLING;
        }
    },
    hasDailyDiscount: function () {
        var dailyDiscountShopInfo = this.getDailyDiscountShopInfo();
        return (dailyDiscountShopInfo && dailyDiscountShopInfo.open);
    },
    hasLimitedTime: function () {
        var holidayShopInfo = this.getShopInfo(ShopType.HOLIDAY_DISCOUNT);
        return (holidayShopInfo && holidayShopInfo.open && holidayShopInfo.shopType == ShopType.HOLIDAY_DISCOUNT);
    },

    getUnverifiedReceiptList: function () {
        if (cc.sys.isNative) {
            this.jsbStoreMan.getUnverifiedReceiptList();
        }
    },

    getShopsFromServer: function () {
        var proto = new C2SGetShops();
        proto.send();
    },
    canShowDailyDiscount: function () {
        var dailyDiscountShopInfo = this.getDailyDiscountShopInfo();
        if (dailyDiscountShopInfo && dailyDiscountShopInfo.open) {
            if (this._dailyDiscountStatus === DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_RUNNING && (this.dailyDiscountEndLocalTime - Util.getCurrentTime() > 0)) {
                return true;
            }
        }
        return false;
    },
    trigerDailyDiscountWhenCoolingEnd: function () {
        if (this._dailyDiscountStatus === DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_COOLING_END) {
            this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_WAITING_SERVER;
            this.sendDailyShopPopupCmd();
            return true;
        }
        return false;
    },
    /**
     * @param {S2CGetShops} proto
     */

    processShopListFromServer:function()
    {
        if(this.protoShopListFromServer)
        {
            this.reset();
            this.shopList = this.protoShopListFromServer.shopList;
            this.vipRewardInfo = this.protoShopListFromServer.vipRewardInfo;

            if (this.vipRewardInfo) {
                var leftVIPTime = this.vipRewardInfo.leftTime;
                if (leftVIPTime > 0) {
                    var self = this;
                    var vipIntervalKey = setInterval(function () {
                        self.vipRewardInfo.leftTime -= Constants.MIN_IN_MILLIS;
                        if (self.vipRewardInfo.leftTime <= 0) {
                            self.vipRewardInfo.leftTime = 0;
                            clearInterval(vipIntervalKey);
                        }
                    }, Constants.MIN_IN_MILLIS);
                    //check if today claimed.
                    if (!this.vipRewardInfo.todayClaimed) {
                        PopupMan.popupVIPRewardDlg();
                    }
                }
            }

            var hasDiscount = this.hasLimitedTime();

            if (hasDiscount) {
                this.popupLimitedTimeStore();
                this.endLocalTime = Util.getCurrentTime() + this.getShopInfo(ShopType.HOLIDAY_DISCOUNT).leftTime;
            }

            this.getProductListJsb(this.getAllProductList());
            this.getUnverifiedReceiptList();


            this.dailyDiscountConfig = this.protoShopListFromServer.dailyDiscountConfig;

            var TaskMan = require("../../task/model/TaskMan");
            var curTaskLevel = TaskMan.getInstance().getCurTaskLevel();

            if (this.supportDailyDiscount()) {
                var dailyDiscountShopInfo = this.getShopInfo(ShopType.DAILY_DISCOUNT);
                if (dailyDiscountShopInfo && dailyDiscountShopInfo.open) {
                    if (!hasDiscount && curTaskLevel >= 2) {
                        if (dailyDiscountShopInfo.leftTime - this.dailyDiscountConfig.allowableErrorTime > 0) {
                            if (dailyDiscountShopInfo.todayPopTimes > this.dailyDiscountConfig.dailyMaxTimes) {
                                cc.log("todayPopTimes: " + dailyDiscountShopInfo.todayPopTimes);
                                this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_END;
                            } else {
                                this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_RUNNING;
                                this.dailyDiscountEndLocalTime = Util.getCurrentTime() + dailyDiscountShopInfo.leftTime - this.dailyDiscountConfig.allowableErrorTime;
                                this.checkAndShowDailyDiscountDialog();
                            }
                        } else {
                            if (dailyDiscountShopInfo.todayPopTimes >= this.dailyDiscountConfig.dailyMaxTimes) {
                                cc.log("todayPopTimes: " + dailyDiscountShopInfo.todayPopTimes);
                                this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_END;
                            } else {
                                if (dailyDiscountShopInfo.nextPopTime > 0) {
                                    this.dailyDiscountNextPopTime = dailyDiscountShopInfo.nextPopTime + Util.getCurrentTime();
                                    this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_COOLING;
                                } else {
                                    this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_WAITING_SERVER;
                                    this.sendDailyShopPopupCmd();
                                }
                            }
                        }
                    }
                }
            }
            this.beginSchedule();

            this.protoShopListFromServer = null;
        }
    },
    onGetShopsListFromServer: function (proto) {

        this.protoShopListFromServer = proto;

        if(this.slotLobbyEntered)
        {
            this.processShopListFromServer();
        }
    },
    onSlotLobbyEntered:function()
    {
        this.slotLobbyEntered = true;
        if(this.protoShopListFromServer)
            this.processShopListFromServer();
    },
    checkAndShowDailyDiscountDialog: function () {
        var dailyDiscountShopInfo = this.getDailyDiscountShopInfo();
        if (dailyDiscountShopInfo && dailyDiscountShopInfo.open && dailyDiscountShopInfo.productList && dailyDiscountShopInfo.productList.length > 0) {
            PopupMan.popupDailyDiscountDlg();
        }
    },
    checkAndShowLimitedTimeStore: function () {
        if (this.hasLimitedTime()) {
            this.popupLimitedTimeStore();
            return true;
        }
        return false;
    },
    getLeftVIPDays: function () {
        var leftTime = this.getLeftVIPTime();
        if (leftTime % Constants.DAY_IN_MILLIS == 0) {
            return Math.floor(leftTime / Constants.DAY_IN_MILLIS);
        } else {
            return Math.floor(leftTime / Constants.DAY_IN_MILLIS) + 1;
        }
    },
    getDailyDiscountShopInfo: function () {
        return this.getShopInfo(ShopType.DAILY_DISCOUNT);
    },
    getAllProductList: function () {
        var productList = [];
        for (var i = 0; i < this.shopList.length; ++i) {
            var shopInfo = this.shopList[i];
            for (var j = 0; j < shopInfo.productList.length; ++j) {
                var productInfo = shopInfo.productList[j];
                if (!this._hasContainProduct(productList, productInfo)) {
                    productList.push(productInfo);
                }
            }
        }
        return productList;
    },
    /**
     * get recommended daily discount product list.
     * @returns {Array}
     */
    isFirstPurchaseRecommendProductList:function () {
        var firstPurchaseInfo = this.getShopInfo(ShopType.FIRST_PURCHASE);
        return (!PlayerMan.getInstance().hasPurchased() && firstPurchaseInfo && firstPurchaseInfo.open);
    },

    getRecommendDailyDiscountProductList: function () {
        var player = PlayerMan.getInstance().player;
        var averageIap = player.recentIapPrice;
        cc.log("averageIap " + averageIap);
        var dailyShopInfo = this.getDailyDiscountShopInfo();
        var productList = dailyShopInfo.productList;
        var recommendProductList = [];

        var firstPurchaseInfo = this.getShopInfo(ShopType.FIRST_PURCHASE);
        if(!PlayerMan.getInstance().hasPurchased() && firstPurchaseInfo.open)
        {
             var pl = firstPurchaseInfo.productList;
            if(pl.length >= 3) {
                recommendProductList.push(pl[0]);
                recommendProductList.push(pl[1]);
                recommendProductList.push(pl[2]);
            }
            recommendProductList.sort(function (product1, product2) {
                return product2.priceUSCent - product1.priceUSCent;
            });
            return recommendProductList;
        }

        var recommendMinIndex = -1;
        var product;
        var maxPriceUSCentDistance = 9999;
        for (var i = productList.length - 1; i >= 0; --i) {
            product = productList[i];
            var priceUSCentDistance = Math.abs(product.priceUSCent - averageIap);
            if (priceUSCentDistance < maxPriceUSCentDistance) {
                maxPriceUSCentDistance = priceUSCentDistance;
                recommendMinIndex = i;
            }
        }
        if (recommendMinIndex === -1) {
            recommendMinIndex = productList.length - 1;
        }
        for (i = recommendMinIndex; i >= 0; --i) {
            product = productList[i];
            if (product) {
                recommendProductList.push(product);
                if (recommendProductList.length >= this.MAX_DAILY_DISCOUNT_NUM) {
                    break;
                }
            }
        }

        if (recommendProductList.length < this.MAX_DAILY_DISCOUNT_NUM) {
            for (i = recommendMinIndex + 1; i < productList.length; ++i) {
                product = productList[i];
                if (product) {
                    recommendProductList.push(product);
                    if (recommendProductList.length >= this.MAX_DAILY_DISCOUNT_NUM) {
                        break;
                    }
                }
            }
        }

        recommendProductList.sort(function (product1, product2) {
            return product2.priceUSCent - product1.priceUSCent;
        });
        return recommendProductList;
    },

    supportDailyDiscount: function () {
        return true;
    },

    _hasContainProduct: function (productList, productInfo) {
        if (!productList) {
            return false;
        }
        for (var i = 0; i < productList.length; ++i) {
            if (productList[i].pid === productInfo.pid) {
                return true;
            }
        }
        return false;
    },

    getShopInfo: function (shopType) {
        for (var i = 0; i < this.shopList.length; ++i) {
            if (this.shopList[i].shopType == shopType) {
                return this.shopList[i];
            }
        }
        return null;
    },
    sendDailyShopPopupCmd: function () {
        var proto = new C2SDailyShopPopup();
        proto.send();
    },

    /**
     * @param {StoreType} storeType
     */
    getProductList: function (storeType) {
        var shopInfo;
        if (this.hasLimitedTime()) {
            shopInfo = this.getShopInfo(ShopType.HOLIDAY_DISCOUNT);
        } else {
            shopInfo = this.getShopInfo(ShopType.NORMAL);
        }
        var productList = [];
        for (var i = 0; i < shopInfo.productList.length; ++i) {
            var product = shopInfo.productList[i];
            if (product.type == storeType) {
                productList.push(product);
            }
        }
        return productList;
    },

    resetToNormal: function () {
        cc.log("resetToNormal");
    },

    /**
     * @param {PurchaseInfo} purchaseInfo
     */
    verifyPurchase: function (purchaseInfo) {
        var verifyPurchase = new C2SVerifyPurchase();
        verifyPurchase.shopType = purchaseInfo.shopType;
        verifyPurchase.productId = purchaseInfo.productId;
        verifyPurchase.receipt = purchaseInfo.receipt;
        verifyPurchase.transactionId = purchaseInfo.purchaseId;
        verifyPurchase.signature = purchaseInfo.signature;
        verifyPurchase.isMultiPurchase = this._isMultiPurchase;
        verifyPurchase.send();
    },

    /**
     *
     * @param {S2CVerifyPurchase} proto
     */
    onVerifyPurchase: function (proto) {
        var LogMan = require("../../log/model/LogMan");

        cc.log("onVerifyPurchase");
        var product = this.getProduct(proto.pid);
        if (proto.errorCode == ErrorCode.SUCCESS) {
            //show purchase success dlg.
            PlayerMan.getInstance().addIapTotal(1, product.priceUS);
            var msgArr = [];
            msgArr.push(PURCHASE_SUCCESS_MSG[0]);
            msgArr.push(Util.sprintf(PURCHASE_SUCCESS_MSG[1], Util.getCommaNum(proto.productCount)));

            if (!proto.isMultiPurchase || !this._storeMultiplyNode) {

                if (proto.productType == ProductType.PRODUCT_TYPE_VIP) {
                    this.consumePurchaseOnServer(proto.transactionId);
                } else {
                    PopupMan.closeIndicator();
                    var purchaseResultDlg = PurchaseResultController.createFromCCB();
                    purchaseResultDlg.controller.initWith(proto.productCount, proto.productType, function () {
                        this.consumePurchaseOnServer(proto.transactionId);
                    }.bind(this));
                    purchaseResultDlg.controller.popup(proto.transactionId);
                }
            } else {
                PopupMan.closeIndicator();
                var StoreMultiPurchaseData = require("../events/StoreMultiPurchaseData");
                var userData = new StoreMultiPurchaseData();
                userData.multiplierIndex = proto.multiplierIndex;
                userData.multiplier = proto.multiplier;
                userData.productCount = proto.productCount;
                userData.transactionId = proto.transactionId;
                EventDispatcher.getInstance().dispatchEvent(StoreEvent.STORE_MULTI_PURCHASE_COMPLETED, userData);
            }

            /**
             * adjust and flurry statistics
             */
            var purchaseInfo = this.purchaseInfoMap[proto.transactionId];
            if (purchaseInfo) {
                this.sendPurchaseTrack(purchaseInfo);
            } else {
                cc.log("purchaseInfo is null");
            }
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.CLOSE_FIRST_CHARGE_DIALOG);


            //market BI log.
            var ClientAppVersion = require("../../common/enum/ClientAppVersion");
            var MarketBIMan = require("../../log/model/MarketBIMan");
            if (cc.sys.isNative) {
                if (ClientAppVersion.supportMarketBI()) {
                    MarketBIMan.getInstance().eventPayment({
                        amount: product.priceUSCent,
                        currency: "USD",
                        product_type: "coins",
                        product_id: product.pid,
                        coins_in: product.quantity,
                        crystals_in: 0,
                        transaction_id: proto.transactionId
                    });
                }
            }
        } else {
            PopupMan.closeIndicator();
            var errorInfo;
            switch (proto.errorCode) {
                case ErrorCode.Social.IAP_DUPLICATED_TRANSACTION:
                    errorInfo = "onVerifyPurchase: " + proto.transactionId + " duplicated transaction";
                    LogMan.getInstance().errorInfo(errorInfo, proto.errorCode);
                    break;
                case ErrorCode.Social.IAP_INVALID_PRODUCT:
                    errorInfo = "onVerifyPurchase: " + proto.transactionId + " invalid product";
                    LogMan.getInstance().errorInfo(errorInfo, proto.errorCode);
                    PopupMan.popupCommonDialog(PURCHASE_TITLE_MSG, PURCHASE_FAIL_MSG, "Ok", null, null, false);
                    break;
                case ErrorCode.Social.IAP_VERIFY_FAILED:
                    errorInfo = "onVerifyPurchase: " + proto.transactionId + " verify failed";
                    LogMan.getInstance().errorInfo(errorInfo, proto.errorCode);
                    PopupMan.popupCommonDialog(PURCHASE_TITLE_MSG, PURCHASE_FAIL_MSG, "Ok", null, null, false);
                    break;
                case ErrorCode.Social.IAP_INVALID_TRANSACTION_ID:
                    errorInfo = "onVerifyPurchase: invalid transaction id";
                    LogMan.getInstance().errorInfo(errorInfo, proto.errorCode);
                    PopupMan.popupCommonDialog(PURCHASE_TITLE_MSG, PURCHASE_FAIL_MSG, "Ok", null, null, false);
                    break;
                case ErrorCode.Social.IAP_NO_PROCESSING_ORDER:
                    break;
                default:
                    errorInfo = "onVerifyPurchase: " + proto.transactionId + " unknown error";
                    LogMan.getInstance().errorInfo(errorInfo, proto.errorCode);
                    break;
            }
        }
        this.consumePurchase(proto.transactionId);
    },
    /**
     * @param {string} transactionId
     */
    consumePurchaseOnServer: function (transactionId) {
        var proto = new C2SConsumePurchase();
        proto.transactionId = transactionId;
        proto.send();
        cc.log("consumePurchaseOnServer: " + transactionId);
    },

    /**
     * @param {S2CConsumePurchase} proto
     */
    onConsumePurchaseOnServer: function (proto) {
        var LogMan = require("../../log/model/LogMan");
        var ProductChangeReason = require("../../log/enum/ProductChangeReason");

        if (proto.errorCode == ErrorCode.SUCCESS) {
            PlayerMan.getInstance().player.recentIapPrice = proto.recentIapPrice;
            if (proto.productType == ProductType.PRODUCT_TYPE_VIP) {
                this.addLeftVIPTime(proto.productCount * Constants.DAY_IN_MILLIS, true);
                PopupMan.closeIndicator();
                PopupMan.popupVIPRewardDlg();
            }
            cc.log("onConsumePurchaseOnServer: " + proto.pid);
            //iap charge
            LogMan.getInstance().userProductRecord(ProductChangeReason.IAP, 0, proto.productCount, 0, 0);
            //add ActionType.FINISH
            LogMan.getInstance().purchaseRecord(PurchaseRecordPage.PURCHAE_RECORD, this.getProduct(proto.pid), this.getShopType(proto.pid), 0, ActionType.FINISH, 0);

            if (this.supportDailyDiscount()) {
                if (this.getShopType(proto.pid) === ShopType.DAILY_DISCOUNT) {
                    if (this.hasDailyDiscount() && this._dailyDiscountStatus === DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_RUNNING) {
                        this.onDailyDiscountEnd();
                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.DAILY_DISCOUNT_UPDATED, -1);
                    }
                }
            }

        } else {
            if (proto.productType == ProductType.PRODUCT_TYPE_VIP) {
                PopupMan.closeIndicator();
            }
            cc.log("Failed to consume: " + proto.pid);
        }
    },

    activateMultiPurchase: function () {
        this._isMultiPurchase = true;
    },

    inactivateMultiPurchase: function () {
        this._isMultiPurchase = false;
    },

    onMultiPurchaseClosed: function () {
        this._storeMultiplyNode = null;
    },

    /**
     * @param {ShopProduct} shopProduct
     */
    buyProduct: function (shopProduct) {
        PopupMan.popupIndicator();
        if (cc.sys.isNative) {
            this.jsbStoreMan.purchase(JSON.stringify(shopProduct));
        } else {
            var pid = shopProduct.pid;
            if (this._isMultiPurchase) {
                pid = shopProduct.multiPid;
            }
            FacebookMan.getInstance().payment(pid, function(error) {
                if(error != zensdk.CODE_SUCCEED) {
                    PopupMan.closeIndicator();
                    PopupMan.popupCommonDialog(PURCHASE_TITLE_MSG, PURCHASE_FAIL_MSG, "Ok", null, null, false);
                    EventDispatcher.getInstance().dispatchEvent(StoreEvent.STORE_PURCHASE_FAILED, null);
                }
            });
            this.inactivateMultiPurchase();
        }
    },

    consumePurchase: function (transactionId) {
        if (cc.sys.isNative) {
            if (transactionId && transactionId.length > 0) {
                this.jsbStoreMan.consume(transactionId);
            } else {
                cc.log("consumePurchase transactionId is null");
            }
        } else {
            cc.log("facebook does not need consume");
        }
    },

    /**
     * update shopList of price
     * @param {Array} iapProducts
     */
    _updateProductList: function (iapProducts) {
        for (var i = 0; i < this.shopList.length; ++i) {
            var shopInfo = this.shopList[i];
            for (var j = 0; j < shopInfo.productList.length; ++j) {
                var shopProduct = shopInfo.productList[j];
                var price = this._getLocalPrice(shopProduct.pid, iapProducts);
                if (price) {
                    shopProduct.price = price;
                }
            }
        }
    },
    /**
     * @param {S2CDailyShopPopup} proto
     */
    onGetDailyShopPopupCmd: function (proto) {

        this.dailyDiscountEndLocalTime = Util.getCurrentTime() + this.dailyDiscountConfig.lastMinutes * Constants.MIN_IN_MILLIS - this.dailyDiscountConfig.allowableErrorTime;
        this._dailyDiscountStatus = DAILY_DISCOUNT_STATUS.DAILY_DISCOUNT_STATUS_RUNNING;
        this.checkAndShowDailyDiscountDialog();

        var LogMan = require("../../log/model/LogMan");
        var dailyDiscountShopInfo = this.getDailyDiscountShopInfo();
        LogMan.getInstance().purchaseRecord(PurchaseRecordPage.DAILY_DISCOUNT, null, ShopType.DAILY_DISCOUNT, 0, ActionType.ENTER, dailyDiscountShopInfo.todayPopTimes);
    },
    /**
     *
     * @param {string} productId
     * @param {Array} localProducts
     * @returns {double}
     * @private
     */
    _getLocalPrice: function (productId, localProducts) {
        for (var i = 0; i < localProducts.length; ++i) {
            var product = localProducts[i];
            if (product.productId === productId) {
                return product.price;
            }
        }
        return null;
    },

    _buyProductCompleted: function (jsonObj) {
        var purchaseInfo = new PurchaseInfo();
        purchaseInfo.purchaseId = jsonObj["purchaseId"];
        purchaseInfo.productId = jsonObj["productId"];
        purchaseInfo.receipt = jsonObj["receipt"];
        purchaseInfo.signature = jsonObj["signature"];
        purchaseInfo.shopType = this.getShopType(purchaseInfo.productId);

        this.purchaseInfoMap[purchaseInfo.purchaseId] = purchaseInfo;
        var LogMan = require("../../log/model/LogMan");
        var product = this.getProduct(purchaseInfo.productId);
        LogMan.getInstance().purchaseRecord(PurchaseRecordPage.PURCHAE_RECORD, product, purchaseInfo.shopType, 0, ActionType.TAKE_ACTION, 0);
        this.verifyPurchase(purchaseInfo);
    },

    getShopType: function (productId) {
        for (var i = 0; i < this.shopList.length; ++i) {
            var shopInfo = this.shopList[i];
            for (var j = 0; j < shopInfo.productList.length; ++j) {
                var shopProduct = shopInfo.productList[j];
                if (shopProduct.pid == productId) {
                    return shopInfo.shopType;
                }
            }
        }
        return -1;
    },

    getProduct: function (productId) {
        var productList = this._getAllProduct();
        for (var j = 0; j < productList.length; ++j) {
            var shopProduct = productList[j];
            if (shopProduct.pid == productId) {
                return shopProduct;
            }
        }
        return null;
    },

    _getAllProduct: function () {
        var productArr = [];
        for (var i = 0; i < this.shopList.length; ++i) {
            var shopInfo = this.shopList[i];
            if (shopInfo) {
                productArr = productArr.concat(shopInfo.productList);
            }
        }
        return productArr;
    },

    sendPurchaseTrack: function (purchaseInfo) {
        cc.log("sendPurchaseTrack");
        var parameters = {};
        var DeviceInfo = require("../../common/util/DeviceInfo");
        var product = this.getProduct(purchaseInfo.productId);
        parameters["productId"] = purchaseInfo.productId;
        parameters["price"] = product.priceUS;
        parameters["productType"] = "Coins";
        parameters["platform"] = DeviceInfo.getTargetPlatform();

        if (cc.sys.isNative) {
            jsb_wtc.EventHelper.getInstance().TrackEvent("purchase", JSON.stringify(parameters));
            var PlayerMan = require("../../common/model/PlayerMan");
            var priceNum = product.priceUS;
            cc.log("priceNum:" + priceNum);
            var facebookId = PlayerMan.getInstance().player.facebookId;
            if (!facebookId) {
                facebookId = "";
            }

            cc.log("adjust track purchaseId:" + purchaseInfo.purchaseId);
            jsb_wtc.EventHelper.getInstance().TrackEventPurchase(facebookId,
                purchaseInfo.productId, purchaseInfo.purchaseId, priceNum, purchaseInfo.receipt);
        }
    },

    getProcessingPurchase: function () {
        var proto = new C2SGetProcessingPurchase();
        proto.send();
    },

    popupLimitedTimeStore: function () {
        var holidayShopInfo = this.getShopInfo(ShopType.HOLIDAY_DISCOUNT);
        PopupMan.popupLimitedTimeStore(holidayShopInfo.leftTime / 1000, holidayShopInfo.ccbiPath, holidayShopInfo.url);
    },

    getLeftVIPTime: function () {
        return this.vipRewardInfo.leftTime;
    },

    /**
     *
     * @param {int} addedLeftTime millionseconds
     * @param {boolean} notify
     */
    addLeftVIPTime: function (addedLeftTime, notify) {
        if (isNaN(addedLeftTime)) throw new Error("addedLeftTime is not allowed to be NaN!");
        if (addedLeftTime == 0) return;
        this.vipRewardInfo.leftTime += addedLeftTime;
        if (notify) {
            var event = new ProductChangedData(ProductType.PRODUCT_TYPE_VIP, addedLeftTime);
            EventDispatcher.getInstance().dispatchEvent(CommonEvent.PRODUCT_CHANGED, event);
        }
    },

    /**
     * claim vip daily reward
     */
    claimVIPDailyReward: function () {
        var C2SClaimVipDailyReward = require("../protocol/C2SClaimVipDailyReward");
        var proto = new C2SClaimVipDailyReward();
        proto.send();
    },

    /**
     * on claim VIP daily reward.
     * @param {S2CClaimVipDailyReward} s2cClaimVipDailyReward
     */
    onClaimVIPDailyReward: function (s2cClaimVipDailyReward) {
        PopupMan.closeIndicator();
        if (s2cClaimVipDailyReward.errorCode == ErrorCode.SUCCESS) {
            PlayerMan.getInstance().addChips(this.vipRewardInfo.rewardChips, true);
            PlayerMan.getInstance().addGems(this.vipRewardInfo.rewardGems, true);
            PlayerMan.getInstance().addStars(this.vipRewardInfo.rewardStars, true);

            var LogMan = require("../../log/model/LogMan");
            var ProductChangeReason = require("../../log/enum/ProductChangeReason");
            LogMan.getInstance().userProductRecord(ProductChangeReason.CLAIM_VIP_REWARD, this.vipRewardInfo.rewardGems, this.vipRewardInfo.rewardChips, 0, this.vipRewardInfo.rewardStars, 0);
        }
    },

    checkAndShowFirstPurchaseAndStoreReward: function () {
        if (!PlayerMan.getInstance().hasPurchased()) {
            var firstChargeShopInfo = this.getShopInfo(ShopType.FIRST_PURCHASE);
            if (firstChargeShopInfo && firstChargeShopInfo.open) {
                if (firstChargeShopInfo.productList && firstChargeShopInfo.productList.length > 0) {
                    var randNum = Util.randomNextInt(10);
                    if (randNum >= 5) {
                        PopupMan.popupSuperSaleDlg(firstChargeShopInfo.productList[0]);
                    } else {
                        if (!this.checkAndShowStoreRewardDlg()) {
                            PopupMan.popupSuperSaleDlg(firstChargeShopInfo.productList[0]);
                        }
                    }
                    return true;
                }
            }
        }
        this.checkAndShowStoreRewardDlg();
        return false;
    },

    checkAndShowStoreRewardDlg: function () {
        var player = PlayerMan.getInstance().player;
        var likeUs = player.likeUs;
        if (player.chips <= Constants.CHIPS_THRESHOLD) {
            if (!this.trigerDailyDiscountWhenCoolingEnd()) {
                if (PlayerMan.getInstance().isGuest()) {
                    if (player.email.length > 0) {
                        PopupMan.popupBindFbDlg();
                        return true;
                    } else {
                        var randNum = Util.randomNextInt(10);
                        if (randNum >= 5) {
                            PopupMan.popupBindFbDlg();
                            return true;
                        } else {
                            PopupMan.popupBindEmailDlg();
                            return true;
                        }
                    }
                } else {
                    if (player.email.length > 0) {
                        if (!likeUs) {
                            PopupMan.popupLikeUsDlg();
                            return true;
                        }
                    } else {
                        if (likeUs) {
                            PopupMan.popupBindEmailDlg();
                            return true;
                        } else {
                            var randNum = Util.randomNextInt(10);
                            if (randNum >= 5) {
                                PopupMan.popupLikeUsDlg();
                                return true;
                            } else {
                                PopupMan.popupBindEmailDlg();
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    },

    ////////////////////////jsb//////////////////////////////

    /**
     * 从渠道处获取商品本地化价格等信息
     * @param {Array} shopsList
     */
    getProductListJsb: function (shopsList) {
        var productIds = [];
        for (var i = 0; i < shopsList.length; ++i) {
            productIds.push(shopsList[i].pid);
        }
        if (cc.sys.isNative) {
            this.jsbStoreMan.getProductList(JSON.stringify(productIds));
        }
    },

    onGetProductListJsb: function (jsonStr) {
        cc.log("JSB Callback onGetProductList:" + jsonStr);
        if (jsonStr) {
            var products = JSON.parse(jsonStr);
            if (products && products.length > 0) {
                this._updateProductList(products);
            }
        }
    },

    onBuyProductCompletedJsb: function (jsonStr) {
        cc.log("JSB Callback onBuyProductComplete" + jsonStr);
        var jsonObj = JSON.parse(jsonStr);
        this._buyProductCompleted(jsonObj);
    },

    onBuyProductFailedJsb: function (jsonStr) {
        cc.log("JSB Callback onBuyProductFailed:" + jsonStr);
        var jsonObj = JSON.parse(jsonStr);
        var shopType = this.getShopType(jsonObj["productId"]);
        var LogMan = require("../../log/model/LogMan");
        LogMan.getInstance().purchaseRecord(PurchaseRecordPage.PURCHAE_RECORD, null, shopType, 1, ActionType.TAKE_ACTION, 0);
        PopupMan.closeIndicator();
        PopupMan.popupCommonDialog(PURCHASE_TITLE_MSG, PURCHASE_FAIL_MSG, "Ok", null, null, false);
    },

    onGetUnverifiedReceiptListJsb: function (jsonStr) {
        cc.log("JSB Callback onGetUnverifiedReceiptList:" + jsonStr);

        if (jsonStr && jsonStr.length > 0) {
            var jsonArr = JSON.parse(jsonStr);
            if (jsonArr && jsonArr.length > 0) {
                for (var i = 0; i < jsonArr.length; ++i) {
                    var jsonObj = jsonArr[i];
                    this._buyProductCompleted(jsonObj);
                }
            }
        }
    }
});

StoreMan._instance = null;
StoreMan._firstUseInstance = true;

/**
 *
 * @returns {StoreMan}
 */
StoreMan.getInstance = function () {
    if (StoreMan._firstUseInstance) {
        StoreMan._firstUseInstance = false;
        StoreMan._instance = new StoreMan();
    }
    return StoreMan._instance;
};

module.exports = StoreMan;
