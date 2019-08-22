var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by alanmars on 15/5/18.
 */
var C2SAdControl = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_AD_CONTROL);
};

Util.inherits(C2SAdControl, LogicProtocol);

module.exports = C2SAdControl;