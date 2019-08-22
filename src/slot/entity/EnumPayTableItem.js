/**
 * Created by alanmars on 15/4/15.
 */
var EnumPayTableItem = function() {
    this.type = 0;
    /**
     * Every object has symbolId=>Boolean
     * @type {Array.<object>}
     */
    this.symbols = [];
    /**
     * @type {Array.<int>}
     */
    this.pays = null;
    /**
     * If all symbols in the win line are Wild, whether the line match this
     * pay table item.
     * @type {boolean}
     */
    this.mismatchWildSeq = false;
    /**
     * If null, means Wild can substitute the symbols, if not, only
     * the Wild in this object can substitute the symbols.
     * @type {Object.<number, boolean>}
     */
    this.wildMap = null;
};

EnumPayTableItem.prototype = {
    constructor: EnumPayTableItem,
    unmarshal: function(jsonObj) {
        this.type = jsonObj["type"];
        this.pays = jsonObj["pays"];
        var symbol2D = jsonObj["symbols"];
        for (var i = 0; i < symbol2D.length; ++ i)
        {
            var symbol1D = symbol2D[i];
            var symbolDict = {};
            for (var j = 0; j < symbol1D.length; ++ j)
            {
                symbolDict[symbol1D[j]] = (symbol1D[j] >= 0);
            }
            this.symbols.push(symbolDict);
        }

        if (!cc.isUndefined(jsonObj["mismatchWildSeq"])) {
            this.mismatchWildSeq = jsonObj["mismatchWildSeq"];
        }

        if (!cc.isUndefined(jsonObj["wilds"])) {
            var wilds = jsonObj["wilds"];
            this.wildMap = {};
            for (i = 0; i < wilds.length; ++ i) {
                this.wildMap[wilds[i]] = true;
            }
        }
    }
};

module.exports = EnumPayTableItem;