var Util = require("../../common/util/Util");
var Protocol = require("./Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Player = require("../entity/Player");
var PlayerMan = require("../model/PlayerMan");
var ErrorCode = require("../../common/enum/ErrorCode");

/**
 * Created by alanmars on 15/4/23.
 */
var S2CLogin = function() {
    Protocol.call(this, ProtocolType.Common.S2C_LOGIN);
    this.player = null;
};

Util.inherits(S2CLogin, Protocol);

S2CLogin.prototype.execute = function(udid) {
    PlayerMan.getInstance().addPlayer(this.player.udid, this.player);
    this.player.onLogin();
};

S2CLogin.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.player = new Player();
    this.player.unmarshal(jsonObj["player"]);
};

module.exports = S2CLogin;