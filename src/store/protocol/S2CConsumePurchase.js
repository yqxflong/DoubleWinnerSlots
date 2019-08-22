var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var StoreMan = require("../model/StoreMan");

/**
 * Created by alanmars on 15/12/11.
 */
var S2CConsumePurchase = function () {
    LogicProtocol.call(this, ProtocolType.Social.S2C_CONSUME_PURCHASE);
    this.productType = 0;
    this.productCount = 0;
    this.pid = null;
    this.transactionId = null;

    this.isMultiPurchase = false;
    this.multiplier = 0;
    this.multiplierIndex = 0;
    this.purchaseTime = 0;
    this.recentIapPrice = 0;
};

Util.inherits(S2CConsumePurchase, LogicProtocol);

S2CConsumePurchase.prototype.execute = function() {
    StoreMan.getInstance().onConsumePurchaseOnServer(this);
};

S2CConsumePurchase.prototype.unmarshal = function(jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this,jsonObj);
    this.productType = jsonObj["productType"];
    this.productCount = jsonObj["productCount"];
    this.pid = jsonObj["pid"];
    this.transactionId = jsonObj["transactionId"];

    this.isMultiPurchase = jsonObj["isMultiPurchase"];
    this.multiplier = jsonObj["multiplier"];
    this.multiplierIndex = jsonObj["multiplierIndex"] || 0;
    this.purchaseTime = jsonObj["purchaseTime"];
    this.recentIapPrice = jsonObj["recentIapPrice"];
};

module.exports = S2CConsumePurchase;