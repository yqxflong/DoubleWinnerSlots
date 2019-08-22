var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by Alanmars on 15-12-11.
 */
var C2SGetProcessingPurchase = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_PROCESSING_PURCHASE);
};

Util.inherits(C2SGetProcessingPurchase, LogicProtocol);

module.exports = C2SGetProcessingPurchase;