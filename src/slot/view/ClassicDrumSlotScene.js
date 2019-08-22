var ClassicSlotScene = require("./ClassicSlotScene");
var DrumMode = require("../enum/DrumMode");
var SymbolId = require("../enum/SymbolId");

var ClassicDrumSlotScene = ClassicSlotScene.extend({

    _drumModeHighSymbols: null,

    ctor: function () {
        this._super();
        this._drumModeHighSymbols = [];
    },

    checkDrumMode: function () {
        var drumState = [];
        for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drumState[i] = DrumMode.DRUM_MODE_NULL;
        }
        if (this.getJackpotDrumState(drumState)) {
            return drumState;
        }
        else if (this.getBonusDrumState(drumState)) {
            return drumState;
        }
        else if (this.getScatterDrumState(drumState)) {
            return drumState;
        }
        else if (this.getHighSymbolsDrumState(drumState)) {
            return drumState;
        }
        return drumState;
    },

    getHighSymbolsDrumState: function (drumState) {
        var isContainDrumMode = false;
        var lineCount = this.subjectTmpl.getLineCount(0);
        for (var lineIndex = 0; lineIndex < lineCount; ++lineIndex) {
            var winLine = this.subjectTmpl.getLine(0, lineIndex);
            var rows = winLine.rows;
            var symbolIds = [];
            var endSymbolId = 0;
            for (var localCol = 0; localCol < this.subjectTmpl.reelCol; ++localCol) {
                var localRow = rows[localCol];
                var symbolId = this.getSpinResult(localCol, localRow);
                if (localCol == this.subjectTmpl.reelCol - 1) {
                    endSymbolId = symbolId;
                } else {
                    symbolIds.push(symbolId);
                }
            }
            isContainDrumMode = this.judgeIsHighSymbolsDrumMode(symbolIds, endSymbolId);
            if (isContainDrumMode) {
                break;
            }
        }

        if (isContainDrumMode) {
            for (var i = 0; i < this.subjectTmpl.reelCol - 1; ++i) {
                drumState[i] = DrumMode.DRUM_MODE_BLINK_BONUS;
            }
            drumState[this.subjectTmpl.reelCol - 1] = DrumMode.DRUM_MODE_DRUM;
            cc.log("drumState:" + JSON.stringify(drumState));
            return true;
        }
        return false;
    },

    judgeIsHighSymbolsDrumMode: function (symbolIds, endSymbolId) {
        var isContainDrumMode = true;
        for (var i = 0; i < symbolIds.length; ++i) {
            if (!SymbolId.isWild(symbolIds[i])) {
                isContainDrumMode = false;
                break;
            }
        }
        if (isContainDrumMode) {
            return true;
        }
        isContainDrumMode = true;
        var lastSymbolId = 0;
        for (var i = 0; i < symbolIds.length; ++i) {
            if (i == 0) {
                lastSymbolId = symbolIds[i];
                if (!Util.arrContain(this._drumModeHighSymbols, symbolIds[i])) {
                    isContainDrumMode = false;
                    break;
                }
            } else {
                if (lastSymbolId != symbolIds[i]) {
                    isContainDrumMode = false;
                    break;
                }
            }
        }
        if (isContainDrumMode) {
            return true;
        }
        isContainDrumMode = true;
        var lastHighSymbol = -1;
        for (var i = 0; i < symbolIds.length; ++i) {
            if (SymbolId.isWild(symbolIds[i])) {
                continue;
            } else if (Util.arrContain(this._drumModeHighSymbols, symbolIds[i])) {
                if (lastHighSymbol == -1) {
                    lastHighSymbol = symbolIds[i];
                } else {
                    if (lastHighSymbol != symbolIds[i]) {
                        isContainDrumMode = false;
                        break;
                    }
                }
            } else {
                isContainDrumMode = false;
                break;
            }
        }
        if (isContainDrumMode) {
            return true;
        }
        return false;
    }
});

module.exports = ClassicDrumSlotScene;