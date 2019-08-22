var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");
var DrumMode = require("../enum/DrumMode");
var SymbolId = require("../enum/SymbolId");

var MagicWorld60109SlotScene = SpecialTaskSlotScene.extend({
    ctor: function () {

        this._super();
    },

    /**
     * @param {Array.<number>} drumModeState - DrumMode or delta row count between two adjacent columns.
     * @return {Array.<number>} element at given index means the row count the reel should spin before stopping.
     */
    calSpinRowCountWhenResultReceived: function (drumModeState) {
        var spinRowInterval = this.getSpinRowInterval();
        var maxSkipRowCount = this.getMaxSkipRowCountWhenSpinCompleted();
        var drumState = this.checkDrumMode();
        var spinRowCounts = [];
        var col;

        var maxNotWildColumn = 3;

        var extraShift = 0;
        var notWildIndex = 0;
        var multi;
        for (col = 0; col < this.subjectTmpl.reelCol; ++col) {
            if (!this.isWildColumn(col)) {
                multi = notWildIndex;
                ++ notWildIndex;
            } else {
                multi = maxNotWildColumn;
            }

            if (drumState[col] == DrumMode.DRUM_MODE_DRUM) {
                extraShift += 5;
            }
            spinRowCounts[col] = spinRowInterval + 2 * (multi + extraShift) * spinRowInterval + maxSkipRowCount + 8;
        }

        if (drumModeState != null) {
            for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
                drumModeState[i] = drumState[i];
                if (drumState[i] == DrumMode.DRUM_MODE_DRUM && i >= 1) {
                    drumModeState[i] = spinRowCounts[i] - spinRowCounts[i - 1];
                }
            }
        }

        return spinRowCounts;
    },

    /**
     * @param drumState {Array.<number>}
     * @returns {boolean}
     */
    getScatterDrumState: function (drumState) {
        return this.getScatterDrumStateNormal(drumState);
    },

    /**
     * @param drumState {Array.<number>}
     * @returns {boolean}
     */
    getScatterDrumStateNormal: function (drumState) {
        var scatterColCount = 0;
        var drum = [];
        for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }

        var col, row, drumStartCol = -1;
        for (col = 0; col < this.subjectTmpl.reelCol; ++ col) {
            for (row = 0; row < this.subjectTmpl.reelRow; ++ row) {
                if (this.getSpinResult(col, row) === SymbolId.SYMBOL_ID_SCATTER) {
                    ++ scatterColCount;
                    drum[col] = DrumMode.DRUM_MODE_BLINK_SCATTER;
                    if (scatterColCount === 2) {
                        drumStartCol = col + 1;
                    }
                    break;
                }
            }
        }

        if (scatterColCount >= 2) {
            var drumColCount = 0;
            for (col = drumStartCol; col < this.subjectTmpl.reelCol; ++ col) {
                if (!this.isWildColumn(col)) {
                    ++ drumColCount;
                }
            }

            if (drumColCount > 0) {
                for (col = 0; col < drum.length; ++ col)
                {
                    if (drum[col] === DrumMode.DRUM_MODE_BLINK_SCATTER) {
                        drumState[col] = DrumMode.DRUM_MODE_BLINK_SCATTER;
                    }

                    if (col >= drumStartCol && !this.isWildColumn(col)) {
                        drumState[col] = DrumMode.DRUM_MODE_DRUM;
                    }
                }

                return true;
            }
        }

        return false;
    },

    isWildColumn: function (col) {
        /**
         * @type {DragonRisingSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo.wildCols) {
            return spinExtraInfo.wildCols.indexOf(col) !== -1;
        }
        return false;
    }
});

module.exports = MagicWorld60109SlotScene;