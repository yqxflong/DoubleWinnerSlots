var ChainInfo = function(chainInfoList) {
    if(chainInfoList.length >= 3) {
        this.col = chainInfoList[0];
        this.row = chainInfoList[1];
        this.count = chainInfoList[2];
    }
};

module.exports = ChainInfo;