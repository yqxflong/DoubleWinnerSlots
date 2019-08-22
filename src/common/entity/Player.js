/**
 * Created by alanmars on 15/4/22.
 * @param jsonObj
 */
var Player = function() {
    this.id = null;
    this.udid = null;
    this.facebookId = null;
    this.fbName = null;
    this.chips = 0;
    this.level = 0;
    this.exp = 0;
    this.levelUpExp = 0;
    this.purchaseCount = 0;
    this.createTime = 0;
    this.iapTotal = 0;
    this.email = null;
    this.likeUs = false;
    this.gems = 0;
    this.stars = 0;
    this.friendCount = 0;
    this.buyShopCount = 0;
    this.g = "";
    this.gV = 0;
    this.recentIapPrice = 0;
};

Player.prototype.unmarshal = function(jsonObj) {
    this.id = jsonObj.id;
    this.facebookId = jsonObj.facebookId;
    this.fbName = jsonObj.fbName;
    this.email = jsonObj.email;
    this.chips = jsonObj.chips;
    //this.gold = jsonObj.gold;
    this.udid = jsonObj.udid;
    this.level = jsonObj.level;
    this.exp = jsonObj.exp;
    this.levelUpExp = jsonObj.levelUpExp;
    this.purchaseCount = jsonObj.purchaseCount;
    this.createTime = jsonObj.createTime;
    this.iapTotal = jsonObj.iapTotal || 0;
    this.likeUs = jsonObj.likeUs || false;
    this.gems = jsonObj.gems || 0;
    this.stars = jsonObj.stars || 0;
    this.friendCount = jsonObj.friendCount || 0;
    this.buyShopCount = jsonObj.buyShopCount || 0;
    this.g = jsonObj["g"] || ""; //abtest group such as 'a', 'b', 'c'
    this.gV = jsonObj["gV"] || 0; //abtest group version 1, 2, 3, 4
    this.recentIapPrice = jsonObj.recentIapPrice;
};

module.exports = Player;