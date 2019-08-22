var IceInfo = function(iceInfoList) {
    if(iceInfoList.length >= 4) {
        this.col = iceInfoList[0];
        this.row = iceInfoList[1];
        this.count = iceInfoList[2];
        this.symbolId = iceInfoList[3];
    }
};

module.exports = IceInfo;