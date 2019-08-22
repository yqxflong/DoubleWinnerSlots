/**
 * Created by alanmars on 15/4/16.
 */
var BonusLine = function () {
    this.lineIndex = 0;
    this.cols = null;
};

BonusLine.prototype = {
    constructor: BonusLine,
    unmarshal: function (jsonObj) {
        this.lineIndex = jsonObj["lineIndex"];
        this.cols = jsonObj["cols"];
    }
};

module.exports = BonusLine;