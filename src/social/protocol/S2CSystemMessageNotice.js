var Util = require("../../common/util/Util");
var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var S2CSystemMessageNotice = function() {
    Protocol.call(this, ProtocolType.Social.S2C_SYSTEM_MESSAGE_NOTICE);
    this.msgMap = null;
};

Util.inherits(S2CSystemMessageNotice, Protocol);

S2CSystemMessageNotice.prototype.execute = function() {
    var SocialMan = require("../model/SocialMan");
    SocialMan.getInstance().onGetSystemMessageNotice(this);
};

S2CSystemMessageNotice.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.msgMap = jsonObj["msgMap"];
};

module.exports = S2CSystemMessageNotice;