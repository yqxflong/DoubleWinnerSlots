var Util = require("../../common/util/Util");
var LogicProtocol = require("./../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var BonusMan = require("../model/BonusMan");

var S2CLikeUs = function() {
    LogicProtocol.call(this, ProtocolType.Social.S2C_LIKE_US);
};

Util.inherits(S2CLikeUs, LogicProtocol);

S2CLikeUs.prototype.execute = function() {
    BonusMan.getInstance().onLikeUs(this);
};

S2CLikeUs.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
};

module.exports = S2CLikeUs;