var ShopProduct = require("./ShopProduct");
var ShopExtraInfoFactory = require("./ShopExtraInfoFactory");
/**
 * Created by alanmars on 15/4/22.
 */
var ShopInfo = function() {
    this.leftTime = 0;
    this.shopType = 0;
    /**
     *
     * @type {Array.<ShopProduct>}
     */
    this.productList = [];
    this.open = true;
    this.ccbiPath = null;
    this.url = null;

    this.nextPopTime = 0;
    this.todayPopTimes = 0;
    this.extraInfo = null;

};

ShopInfo.prototype.unmarshal = function(jsonObj) {
    this.leftTime = jsonObj["leftTime"];
    this.shopType = jsonObj["shopType"];
    var productArr = jsonObj["productList"];
    this.productList = [];
    for(var i = 0; i < productArr.length; ++i){
        var shopProduct = new ShopProduct();
        shopProduct.unmarshal(productArr[i]);
        this.productList.push(shopProduct);
    }
    this.productList.sort(function(product1, product2){
        return product2.priceUS - product1.priceUS;
    });
    this.open = jsonObj["open"];
    this.ccbiPath = jsonObj["ccbiPath"];
    this.url = jsonObj["url"];
    this.nextPopTime = jsonObj["nextPopTime"];
    this.todayPopTimes = jsonObj["todayPopTimes"];

    this.extraInfo = ShopExtraInfoFactory.create(this.shopType);
    if (this.extraInfo) {
        if (jsonObj["extraInfo"]) {
            this.extraInfo.unmarshal(jsonObj["extraInfo"]);
        }
    }

};

module.exports = ShopInfo;