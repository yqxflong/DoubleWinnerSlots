var ChainInfo = require("../entity/ChainInfo");

var BreakChainTaskData = function(jsonObj) {
    /**
     * @type {Array.<ChainInfo>}
     */
    this.chainInfos = [];
    var chainInfos = jsonObj["chainInfos"];
    if (chainInfos) {
        for (var i = 0; i < chainInfos.length; ++i) {
            var chainInfo = new ChainInfo(chainInfos[i]);
            this.chainInfos.push(chainInfo);
        }
    }
};

module.exports = BreakChainTaskData;
