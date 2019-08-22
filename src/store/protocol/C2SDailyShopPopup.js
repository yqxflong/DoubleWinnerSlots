var Util = require("../../common/util/Util");
var LogicProtocol = require("./../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by qinning on 16/6/8.
 */
var C2SDailyShopPopup = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_DAILY_SHOP_POP_UP);
};

Util.inherits(C2SDailyShopPopup, LogicProtocol);


module.exports = C2SDailyShopPopup;