/**
 * Created by alanmars on 15/6/29.
 */
var WinLineExtra = function (lineIndex, associatedSymbolId, num) {
    this.lineIndex = lineIndex;
    this.associatedSymbolId = associatedSymbolId;
    this.num = num;
};

WinLineExtra.prototype.unmarshal = function (jsonObj) {
    this.lineIndex = jsonObj["lineIndex"];
    this.associatedSymbolId = jsonObj["associatedSymbolId"];
    this.num = jsonObj["num"];
};

module.exports = WinLineExtra;