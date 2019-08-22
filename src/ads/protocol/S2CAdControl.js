var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var AdControl = require("../entity/AdControl");
var AdControlMan = require("../model/AdControlMan");

/**
 * Created by alanmars on 15/5/18.
 */
var S2CAdControl = function() {
    LogicProtocol.call(this, ProtocolType.Social.S2C_AD_CONTROL);
    this.adControl = null;
    this.rewardVideoClaimTimes = 0;
};

Util.inherits(S2CAdControl, LogicProtocol);

S2CAdControl.prototype.execute = function() {
    AdControlMan.getInstance().onGetAdsSettings(this);
};

S2CAdControl.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.adControl = new AdControl(jsonObj["adControl"]);
    this.rewardVideoClaimTimes = jsonObj["rewardVideoClaimTimes"];
};

module.exports = S2CAdControl;
