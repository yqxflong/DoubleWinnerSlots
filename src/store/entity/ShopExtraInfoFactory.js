/**
 * Created by qinning on 16/7/21.
 */
var ShopType = require("../enum/ShopType");
var BankShopExtraInfo = require("./BankShopExtraInfo");

var ShopExtraInfoFactory = {
    /**
     *
     * @param {PurchaseProductType} type
     */
    create: function (type) {
        var bankShopExtraInfo;
        switch (type) {
            case ShopType.PIGGY_BANK:
                bankShopExtraInfo = new BankShopExtraInfo();
                break;
        }
        return bankShopExtraInfo;
    }
};

module.exports = ShopExtraInfoFactory;