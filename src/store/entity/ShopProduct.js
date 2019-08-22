/**
 * Created by alanmars on 15/4/22.
 * @param jsonObj
 */
var ShopProduct = function() {
    this.pid = null;
    this.type = 0;
    this.quantity = 0;
    this.presentPercent = 0;
    this.price = null;
    this.originalPrice = null;
    this.priceUS = null;
    this.vipPoints = 0;
    this.bestValue = false;
    this.mostPopular = false;
    this.originalQuantity = 0;
    this.priceUSCent = 0;
    this.multiPid = null;
};

ShopProduct.prototype.unmarshal = function(jsonObj) {
    var dataArray = jsonObj;
    if(dataArray && !cc.isUndefined(dataArray) && dataArray.length >= 13) {
        this.pid = dataArray[0];
        this.type = dataArray[1];
        this.quantity = dataArray[2];
        this.originalQuantity = dataArray[3];
        this.presentPercent = dataArray[4];
        this.price = dataArray[5];
        this.vipPoints = dataArray[6];
        this.bestValue = dataArray[7];
        this.mostPopular = dataArray[8];
        this.originalPrice = dataArray[9];
        this.priceUSCent = dataArray[10];
        this.multiPid = dataArray[11] || "";
        this.priceUS = parseFloat(this.price.substr(1));
    }
    cc.log("ShopProduct unmarshal pid:"+ this.pid +",,priceUS:" + this.priceUS);
};

module.exports = ShopProduct;