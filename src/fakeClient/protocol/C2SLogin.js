var Protocol = require("./Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

/**
 * Created by alanmars on 15/4/22.
 */
var C2SLogin = function() {
    Protocol.call(this, ProtocolType.Common.C2S_LOGIN);
    this.udid = null;
    this.facebookId = null;
};

Util.inherits(C2SLogin, Protocol);

module.exports = C2SLogin;