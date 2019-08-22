var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var StoreMan = require("../model/StoreMan");

/**
 * Created by qinning on 16/6/8.
 */
var S2CDailyShopPopup = function () {
    LogicProtocol.call(this, ProtocolType.Social.S2C_DAILY_SHOP_POP_UP);
};

Util.inherits(S2CDailyShopPopup, LogicProtocol);

S2CDailyShopPopup.prototype.execute = function() {
    StoreMan.getInstance().onGetDailyShopPopupCmd(this);
};

S2CDailyShopPopup.prototype.unmarshal = function(jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this,jsonObj);
};

module.exports = S2CDailyShopPopup;