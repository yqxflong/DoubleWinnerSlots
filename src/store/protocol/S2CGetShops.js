var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var ShopInfo = require("../entity/ShopInfo");
var StoreMan = require("../model/StoreMan");
var VipRewardInfo = require("../entity/VipRewardInfo");
var DailyDiscountConfig = require("../entity/DailyDiscountConfig");
/**
 * Created by alanmars on 15/4/23.
 */
var S2CGetShops = function () {
    LogicProtocol.call(this, ProtocolType.Social.S2C_GET_SHOPS);
    /**
     *
     * @type {Array.<ShopInfo>}
     */
    this.shopList = null;
    this.vipRewardInfo = null;
};

Util.inherits(S2CGetShops, LogicProtocol);

S2CGetShops.prototype.execute = function () {
    StoreMan.getInstance().onGetShopsListFromServer(this);
};

S2CGetShops.prototype.unmarshal = function (jsonObj) {
    if (!LogicProtocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    this.shopList = [];
    var shopArr = jsonObj["shopList"];
    for (var i = 0; i < shopArr.length; ++i) {
        var shopItem = shopArr[i];
        var shopInfo = new ShopInfo();
        shopInfo.unmarshal(shopItem);
        this.shopList.push(shopInfo);
    }
    this.vipRewardInfo = new VipRewardInfo();
    this.vipRewardInfo.unmarshal(jsonObj["vipRewardInfo"]);

    this.discountVer = jsonObj["discountVer"];
    this.dailyDiscountConfig = new DailyDiscountConfig();
    if (jsonObj["dailyDiscountConfig"]) {
        this.dailyDiscountConfig.unmarshal(jsonObj["dailyDiscountConfig"]);
    }
};

module.exports = S2CGetShops;