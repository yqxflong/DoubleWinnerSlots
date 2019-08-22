/**
 * Created by alanmars on 15/4/15.
 */
var Symbol = function() {
    this.symbolId = 0;
    this.symbolValue = 0;
    this.symbolW = 0;
    this.symbolH = 0;
    this.sX = 1;
    this.sY = 1;
    this.imgName = null;
    this.bgName = null;
    this.animName = null;
    this.name = null;
    this.animEffect = 0;
    this.reelMask = 0;
    this.reelMaskFree = 0;
    this.jackpotAnimName = null;
    this.sound = null;
    /**
     * {number} sequential symbol count => {number} win rate
     * @type {object}
     */
    this.payTables = {};

    this.spineSkin = "";
    this.spineAnim = "";
    this.animFile = "";
};

Symbol.prototype = {
    constructor: Symbol,
    unmarshal: function(jsonObj) {
        this.symbolId = jsonObj["symbolId"];
        this.symbolValue = jsonObj["symbolValue"];
        this.symbolW = jsonObj["symbolW"];
        this.symbolH = jsonObj["symbolH"];
        this.sX = jsonObj["sX"] || 1;
        this.sY = jsonObj["sY"] || 1;
        this.imgName = jsonObj["imgName"];
        this.bgName = jsonObj["bgName"];
        this.animName = jsonObj["animName"] || "";
        this.name = jsonObj["name"];
        this.animEffect = jsonObj["animEffect"];
        this.reelMask = jsonObj["reelMask"];
        this.reelMaskFree = jsonObj["reelMaskFree"];
        this.payTables = jsonObj["payTables"];
        if(jsonObj["jackpotAnimName"]) {
            this.jackpotAnimName = jsonObj["jackpotAnimName"];
        }
        if(jsonObj["sound"]) {
            this.sound = jsonObj["sound"];
        }

        this.spineSkin = jsonObj["spineSkin"] || "default";
        this.spineAnim = jsonObj["spineAnim"] || "";
        this.animFile = jsonObj["animFile"] || "";
    },
    getJackpotAnimName: function () {
        var result = this.jackpotAnimName;
        if (!result) {
            result = this.animName;
        }
        return result;
    }
};

module.exports = Symbol;