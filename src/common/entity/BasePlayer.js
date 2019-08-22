/**
 * Created by alanmars on 15/7/16.
 */
var BasePlayer = function() {
    this.id = null;
    this.facebookId = null;
    this.fbName = null;
};

BasePlayer.prototype.unmarshal = function(jsonObj) {
    this.id = jsonObj.id;
    this.facebookId = jsonObj.facebookId;
    this.fbName = jsonObj.fbName;
};

module.exports = BasePlayer;