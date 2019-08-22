var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by alanmars on 15/12/11.
 */
var C2SConsumePurchase = function () {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CONSUME_PURCHASE);
    this.transactionId = null;
};

Util.inherits(C2SConsumePurchase, LogicProtocol);

module.exports = C2SConsumePurchase;