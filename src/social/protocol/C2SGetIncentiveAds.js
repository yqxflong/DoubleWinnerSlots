/**
 * Created by JianWang on 7/8/16.
 */
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var Util = require("../../common/util/Util");

var C2SGetIncentiveAds = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_INCENTIVE_AD);
};

Util.inherits(C2SGetIncentiveAds, LogicProtocol);


module.exports = C2SGetIncentiveAds;