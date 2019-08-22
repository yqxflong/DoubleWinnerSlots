var IceInfo = require("../entity/IceInfo");

var BreakIceTaskData = function(jsonObj) {
    /**
     * @type {Array.<ChainInfo>}
     */
    this.iceInfos = [];
    var iceInfosArray = jsonObj["chainInfos"];
    if (iceInfosArray) {
        for (var i = 0; i < iceInfosArray.length; ++i) {
            var oneIceInfo = new IceInfo(iceInfosArray[i]);
            this.iceInfos.push(oneIceInfo);
        }
    }
};

module.exports = BreakIceTaskData;
