/**
 * Created by alanmars on 15/4/16.
 */
var JackpotLine = function (lineIndex, cols, winRate) {
    this.lineIndex = lineIndex;
    this.cols = cols;
    this.winRate = winRate;
};

JackpotLine.prototype = {
    constructor: JackpotLine,
    unmarshal: function (jsonObj) {
        this.lineIndex = jsonObj["lineIndex"];
        this.cols = jsonObj["cols"];
        this.winRate = jsonObj["winRate"];
    }
};

module.exports = JackpotLine;