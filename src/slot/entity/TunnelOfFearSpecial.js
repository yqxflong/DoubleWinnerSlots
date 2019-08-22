var Coordinate = require("./Coordinate");
var SymbolId = require('../enum/SymbolId');

var TunnelOfFearSpecial = function () {
    this.symbolId = SymbolId.SYMBOL_ID_INVALID;
    this.lockedPos = [];
    this.retrigger = false;
};

TunnelOfFearSpecial.prototype.clear = function() {
    this.symbolId = SymbolId.SYMBOL_ID_INVALID;
    this.lockedPos = [];
    this.retrigger = false;
};

TunnelOfFearSpecial.prototype.unmarshal = function (jsonObj) {
    this.symbolId = jsonObj["symbolId"];
    this.retrigger = jsonObj["retrigger"];
    var lockedPos = jsonObj["lockedPos"];
    if (lockedPos) {
        this.lockedPos = [];
        for (var i = 0; i < lockedPos.length; ++ i) {
            var coord = new Coordinate();
            coord.unmarshal(lockedPos[i]);
            this.lockedPos.push(coord);
        }
    }
};

module.exports = TunnelOfFearSpecial;