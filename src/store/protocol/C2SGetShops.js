var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by alanmars on 15/4/23.
 */
var C2SGetShops = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_SHOPS);
};

Util.inherits(C2SGetShops, LogicProtocol);

module.exports = C2SGetShops;