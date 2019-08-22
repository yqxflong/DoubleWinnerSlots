/**
 * Created by liuyue on 15-6-5.
 */
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SGetFbIap = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_FB_IAP);
};

Util.inherits(C2SGetFbIap, LogicProtocol);

module.exports = C2SGetFbIap;