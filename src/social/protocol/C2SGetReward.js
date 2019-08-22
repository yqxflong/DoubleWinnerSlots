var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by alanmars on 15/5/14.
 */
var C2SGetReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_REWARD);
};

Util.inherits(C2SGetReward, LogicProtocol);

module.exports = C2SGetReward;