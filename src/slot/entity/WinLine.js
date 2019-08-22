/**
 * Created by alanmars on 15/4/16.
 */
WinLine = function (a_lineIndex, a_num) {
    this.lineIndex = a_lineIndex;
    this.num = a_num;
    this.winRate = 0;
};

WinLine.prototype = {
    constructor: WinLine,

    unmarshal: function (jsonObj) {
        this.lineIndex = jsonObj["lineIndex"];
        this.num = jsonObj["num"];
        //this.winRate = jsonObj["winRate"];
    }
};

module.exports = WinLine;