var Protocol = require("./Protocol");
var ProtocolType = require("../enum/ProtocolType");
var Util = require("../util/Util");
var StorageController = require("../storage/StorageController");

/**
 * Created by alanmars on 15/4/22.
 */
var C2SLogin = function() {
    Protocol.call(this, ProtocolType.Common.C2S_LOGIN);
    this.udid = null;
    this.facebookId = null;
    this.platformType = null;
    this.clientVer = null;
    this.email = null;
    this.fbName = null;
    this.friendCount = 0;
};

Util.inherits(C2SLogin, Protocol);

module.exports = C2SLogin;