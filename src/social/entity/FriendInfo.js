/**
 * Created by alanmars on 15/5/6.
 */
var FriendInfo = function() {
    this.id = null;
    this.name = null;
    this.url = null;
    this.isSelected = true;
};

FriendInfo.prototype.unmarshal = function(jsonObj) {
    this.id = jsonObj["id"];
    this.name = jsonObj["name"];
    this.url = jsonObj["picture"]["data"]["url"];
};

module.exports = FriendInfo;