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
var S2CIncentiveAd = function() {
    Protocol.call(this, ProtocolType.Social.S2C_INCENTIVE_AD);
    this.ads = [];
    this.adStatus = {};
    this.resPath = "";
    this.isActive = false;
    this.maxVersion = 0;
};


Util.inherits(S2CIncentiveAd, LogicProtocol);

S2CIncentiveAd.prototype.execute = function() {
    IncentiveAdMan.getInstance().onIncentiveAds(this);
};

S2CIncentiveAd.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.ads = jsonObj["ads"];
    this.adStatus = jsonObj["adStatus"];
    this.resPath = jsonObj["resPath"];
    this.isActive = jsonObj["isActive"];
    this.maxVersion = jsonObj["maxVersion"];
};

module.exports = S2CIncentiveAd;