var FireInfo = function(fireInfoList) {
    if(fireInfoList.length >= 4) {
        this.col = fireInfoList[0];
        this.row = fireInfoList[1];
        this.count = fireInfoList[2];
        this.symbolId = fireInfoList[3];
    }
};

module.exports = FireInfo;