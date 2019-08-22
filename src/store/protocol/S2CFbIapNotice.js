/**
 * Created by liuyue on 15-6-5.
 */
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var StoreMan = require("../model/StoreMan");

var S2CFbIapNotice = function() {
    LogicProtocol.call(this, ProtocolType.Social.S2C_FB_IAP_NOTICE);
    this.transactionId = null;
};

Util.inherits(S2CFbIapNotice, LogicProtocol);

S2CFbIapNotice.prototype.execute = function () {
    StoreMan.getInstance().onGetFbIapNotice(this);
};

S2CFbIapNotice.prototype.unmarshal = function (jsonObj) {
    if (!LogicProtocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    this.transactionId = jsonObj["transactionId"];
};

module.exports = S2CFbIapNotice;