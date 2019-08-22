var Util = require("../../common/util/Util");
var LogicProtocol = require("./../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var ErrorCode = require("../../common/enum/ErrorCode");

/**
 * Created by alanmars on 15/5/13.
 */
var C2SVerifyPurchase = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_VERIFY_PURCHASE);
    this.shopType = 0;
    this.productId = null;
    this.receipt = null;
    this.transactionId = null;
    this.signature = null;
    this.isMultiPurchase = false;
};

Util.inherits(C2SVerifyPurchase, LogicProtocol);


module.exports = C2SVerifyPurchase;