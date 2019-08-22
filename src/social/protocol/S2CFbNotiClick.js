var Util = require("../../common/util/Util");
var Protocol = require("../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var RewardClaim = require("../entity/RewardClaim");
var SocialMan = require("../model/SocialMan");

var S2CFbNotiClick = function() {
    Protocol.call(this, ProtocolType.Social.S2C_FB_NOTI_CLICK);
};

Util.inherits(S2CFbNotiClick, Protocol);

S2CFbNotiClick.prototype.execute = function() {

};

S2CFbNotiClick.prototype.unmarshal = function(jsonObj) {
    if (!Protocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
};


module.exports = S2CFbNotiClick;