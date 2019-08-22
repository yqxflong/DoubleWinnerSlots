/**
 * Created by alanmars on 15/4/22.
 * @param jsonObj
 */


var PurchaseInfo = function() {
    this.purchaseId = null;
    this.productId = null;
    this.receipt = null;
    this.signature = null;
    this.shopType = 0;
};

PurchaseInfo.prototype.unmarshal = function(jsonObj) {
    //this.transactionId = jsonObj["transactionId"];
    //this.productId = jsonObj["productId"];
    //this.receipt = jsonObj["receipt"];
    //this.dataSignature = jsonObj["dataSignature"];
    //this.shopType = jsonObj["shopType"];
};

module.exports = PurchaseInfo;