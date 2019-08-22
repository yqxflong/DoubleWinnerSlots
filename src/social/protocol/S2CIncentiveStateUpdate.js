/**
 * Created by JianWang on 7/8/16.
 */

var LogicProtocol = require("../../common/protocol/LogicProtocol");
var IncentiveAdMan = require("../../incentive_ad/IncentiveAdMan");
var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
/**
 * Created by alanmars on 15/5/7.
 */
var S2CIncentiveStateUpdate = function() {
    Protocol.call(this, ProtocolType.Social.S2C_INCENTIVE_STATE_UPDATE);

    this.appId = "";
    this.status = 0
    this.rewardType = 0;
    this.rewardValue = 0;
};


Util.inherits(S2CIncentiveStateUpdate, LogicProtocol);

S2CIncentiveStateUpdate.prototype.execute = function() {
    IncentiveAdMan.getInstance().onUpdateAdsState(this);
};

S2CIncentiveStateUpdate.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.appId = jsonObj["appId"];
    this.status = jsonObj["status"];
    this.rewardType = jsonObj["rewardType"];
    this.rewardValue = jsonObj["rewardValue"];
};
module.exports = S2CIncentiveStateUpdate;