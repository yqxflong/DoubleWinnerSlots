var CurrencyType = require("../enum/CurrencyType");

/**
 * Created by alanmars on 15/5/11.
 */
var Currency = function(jsonObj) {
    jsonObj = jsonObj || {type: CurrencyType.CHIP, count: 0};
    this.type = jsonObj["type"];
    this.count = jsonObj["count"];
};

module.exports = Currency;