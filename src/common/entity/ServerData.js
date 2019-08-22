/**
 * Created by qinning on 15/7/2.
 */
var ServerData = function() {
    this.serverName = null;
    this.serverUrl = null;
    this.serverPort = 0;
};

ServerData.prototype.unmarshal = function(jsonObj) {
    this.serverName = jsonObj["serverName"];
    this.serverUrl = jsonObj["serverUrl"];
    this.serverPort = jsonObj["serverPort"];
};

module.exports = ServerData;