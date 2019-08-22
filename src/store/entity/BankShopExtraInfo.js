/**
 * Created by qinning on 16/7/21.
 */

var BankShopExtraInfo = function () {
    this.bankLevel = 0;
    this.bankBalance = 0;
    this.bankFull = false;
};

BankShopExtraInfo.prototype.unmarshal = function (jsonObj) {
    this.bankLevel = jsonObj["bankLevel"];
    this.bankBalance = jsonObj["bankBalance"];
    this.bankFull = jsonObj["bankFull"];
};

module.exports = BankShopExtraInfo;