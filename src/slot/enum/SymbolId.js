/**
 * Created by alanmars on 15/4/15.
 */
var SymbolId = {
    SYMBOL_ID_INVALID: -1,
    SYMBOL_ID_BONUS: 0,
    SYMBOL_ID_WILD: 1,
    SYMBOL_ID_WILD2: 1101,
    SYMBOL_ID_WILD3: 1102,
    SYMBOL_ID_WILD4: 1103,
    SYMBOL_ID_WILD5: 1104,
    SYMBOL_ID_SCATTER: 2,
    SYMBOL_ID_EMPTY: 3,
    SYMBOL_ID_GEMS: 4,
    SYMBOL_ID_FILL: 5,
    SYMBOL_ID_JACKPOT: 6,
    SYMBOL_ID_NORMAL_BEGIN: 1000,

    _wildValues: {
        "1": true,
        "1101": true,
        "1102": true,
        "1103": true,
        "1104": true
    },

    /**
     * @param {number} symbolValue
     * @returns {boolean}
     */
    isWild: function (symbolValue) {
        return this._wildValues[symbolValue];
    }
};

module.exports = SymbolId;