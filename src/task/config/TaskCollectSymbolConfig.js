/**
 * Created by qinning on 16/1/21.
 */

var TaskCollectSymbolConfig = function () {
    this.subjectId = 0;
    this.symbolId = 0;
    this.iconName = "";
};

TaskCollectSymbolConfig.prototype.unmarshal = function (jsonObj) {
    this.subjectId = jsonObj["subjectId"];
    this.symbolId = jsonObj["symbolId"];
    this.iconName = jsonObj["iconName"];
};

module.exports = TaskCollectSymbolConfig;