/**
 * Created by JianWang on 7/8/16.
 */
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

var Util = require("../../common/util/Util");

var C2SUpdateIncentiveAds = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_UPDATE_INCENTIVE_AD);
    this.cardId = 0;
};

Util.inherits(C2SUpdateIncentiveAds, LogicProtocol);

module.exports = C2SUpdateIncentiveAds;
