var Util = require("../util/Util");
var Protocol = require("./Protocol");
var ProtocolType = require("../enum/ProtocolType");
var Player = require("../entity/Player");
var PlayerMan = require("../model/PlayerMan");
var ErrorCode = require("../enum/ErrorCode");
var ServerConfig = require("../entity/ServerConfig");

/**
 * Created by alanmars on 15/4/23.
 */
var S2CLogin = function() {
    Protocol.call(this, ProtocolType.Common.S2C_LOGIN);
    this.player = null;
    this.appVersion = null;
    this.appVerType = 0;
    this.jsVersion = 0;
    /**
     *
     * @type {ServerConfig}
     */
    this.serverConfig = null;
};

Util.inherits(S2CLogin, Protocol);

S2CLogin.prototype.execute = function() {
    PlayerMan.getInstance().onLogin(this);
};

S2CLogin.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.player = new Player();
    this.appVersion = jsonObj["appVersion"];
    this.jsVersion = jsonObj["jsVersion"];
    this.player.unmarshal(jsonObj["player"]);
    this.serverConfig = new ServerConfig();
    if(jsonObj["serverConfigs"]) {
        this.serverConfig.unmarshal(jsonObj["serverConfigs"]);
    }
    this.appVerType = jsonObj["appVerType"];
};

module.exports = S2CLogin;