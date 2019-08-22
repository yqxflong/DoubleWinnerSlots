var TunnelOfFearSpecial = require('./TunnelOfFearSpecial');

var TunnelOfFearRoomExtraInfo = function () {
    this.tunnelInfo = new TunnelOfFearSpecial();
};

TunnelOfFearRoomExtraInfo.prototype.unmarshal = function (jsonObj) {
    this.tunnelInfo.unmarshal(jsonObj["tunnelInfo"]);
};

module.exports = TunnelOfFearRoomExtraInfo;