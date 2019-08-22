var NormalSpinLayer = require("./NormalSpinLayer");
var SymbolId = require("../enum/SymbolId");
var SpinState = require("../enum/SpinState");

/**
 * Created by alanmars on 15/4/29.
 */
var ClassicVideoSpinLayer = NormalSpinLayer.extend({
    /**
     * @type {Array.<Array.<number>>}
     */
    cacheSpinPanel: null,    //int[3][6]

    ctor: function (panelId, subjectTmplId) {
        this._super(panelId, subjectTmplId);
    },

    initData: function () {
        this._super();

        this.gridHeight = this.panelConfig.spinRegion.height / (this.panelConfig.slotRows - 1);
        this.viewRowCount = this.panelConfig.slotRows * 2 + 1;
        this.cacheSpinPanel = [];
        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            this.cacheSpinPanel[col] = [];
        }
    },

    initUI: function () {
        this._super();
        this.addPayLine();
    },

    addPayLine: function () {
        if (this.subjectTmpl.getMaxLineCount() === 1) {
            var payLineSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(Util.sprintf("%s_payline.png", this.subjectTmpl.resRootDir)));
            payLineSprite.setAnchorPoint(cc.p(0.5, 0.5));
            var spinRegion = this.panelConfig.spinRegion;
            payLineSprite.x = spinRegion.x + spinRegion.width * 0.5;
            payLineSprite.y = spinRegion.y + spinRegion.height * 0.5;
            this.spinBoardNode.addChild(payLineSprite, 8);
        }
    },

    /**
     * 1.There must be an empty symbol between two consecutive non-empty symbol.
     * 2.The maximum count of consecutive empty symbols is 2.
     */
    generateNormalSymbols: function () {
        var col;
        var row;
        var consecutiveEmptyCount;
        var symbolId;
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            consecutiveEmptyCount = 0;
            for (row = 0; row < this.SPIN_SYMBOL_ROWS; ++row) {
                if (row > 0) {
                    if (consecutiveEmptyCount == 0) {
                        symbolId = SymbolId.SYMBOL_ID_EMPTY;
                    }
                    else if (consecutiveEmptyCount >= 2) {
                        symbolId = this.randomNotEmptySymbolId(col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
                    }
                    else {
                        symbolId = this.randomSymbolIdForCol(col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
                    }
                }
                else {
                    symbolId = this.randomSymbolIdForCol(col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
                }

                this.spinSymbols[col][row] = symbolId;
                if (symbolId == SymbolId.SYMBOL_ID_EMPTY) {
                    ++consecutiveEmptyCount;
                }
                else {
                    consecutiveEmptyCount = 0;
                }
            }
        }
    },

    randomNotEmptySymbolId: function (localCol, subjectTmpl, panelId, isInFreeSpin) {
        var symbolId;
        do
        {
            symbolId = this.randomSymbolIdForCol(localCol, subjectTmpl, panelId, isInFreeSpin);
        }
        while (symbolId == SymbolId.SYMBOL_ID_EMPTY);
        return symbolId;
    },

    randomNextSeqSymbolId: function (symbolIdOne, symbolIdTwo, localCol, subjectTmpl, panelId, isInFreeSpin) {
        var consecutiveEmptyCount = 0;
        if (symbolIdOne == SymbolId.SYMBOL_ID_EMPTY) {
            ++consecutiveEmptyCount;
        }
        else {
            consecutiveEmptyCount = 0;
        }

        if (symbolIdTwo == SymbolId.SYMBOL_ID_EMPTY) {
            ++consecutiveEmptyCount;
        }
        else {
            consecutiveEmptyCount = 0;
        }

        var result;
        if (consecutiveEmptyCount == 0) {
            result = SymbolId.SYMBOL_ID_EMPTY;
        }
        else if (consecutiveEmptyCount == 1) {
            result = this.randomSymbolIdForCol(localCol, subjectTmpl, panelId, isInFreeSpin);
        }
        else {
            result = this.randomNotEmptySymbolId(localCol, subjectTmpl, panelId, isInFreeSpin);
        }

        return result;
    },

    initSymbols: function () {
        var maxSizeSymbol = this.subjectTmpl.getMaxHeightSymbol();
        this.maxSymbolSize = maxSizeSymbol.symbolH;

        this.generateSymbols();

        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            var symbolId = this.spinSymbols[col][0];
            this.setActiveSymbol(col, this.viewRowCount - 1, this.addSymbolSprite(col, this.viewRowCount - 1, symbolId));
            for (var row = 0; row < (this.viewRowCount - 1); ++row) {
                symbolId = this.spinSymbols[col][row + 1];
                this.setActiveSymbol(col, row, this.addSymbolSprite(col, row, symbolId));
            }
        }
    },

    getSymbolPos: function (localCol, localViewRow) {
        if (localViewRow >= this.viewRowCount) return;
        var symbolPosX = this.panelConfig.spinRegion.x + this.gridWidth * (localCol + 0.5) + this.gapWidth * localCol;
        var symbolPosY;
        if (localViewRow < (this.viewRowCount - 1)) {
            symbolPosY = this.panelConfig.spinRegion.y + this.gridHeight * (localViewRow + 1) * 0.5;
        }
        else {
            symbolPosY = this.panelConfig.spinRegion.y;
        }
        return cc.p(symbolPosX, symbolPosY);
    },

    setSpinRowCounWhenResultReceived: function (rowCountArray) {
        for (var localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
            this.spinRowCountWhenResultReceived[localCol] = rowCountArray[this.localColToGlobal(localCol)] + this.spinRowShift[localCol] + 1 - this.getSkipRowCountWhenSpinCompleted(localCol);
            this.spinRowCountWhenResultReceived[localCol] += this.spinRowCountWhenResultReceived[localCol] % 2;
            if (this.spinRowCountWhenResultReceived[localCol] < (this.spinRowShift[localCol] + 4)) {
                this.spinRowCountWhenResultReceived[localCol] = this.spinRowShift[localCol] + 4;
                //must be even number
                this.spinRowCountWhenResultReceived[localCol] += this.spinRowCountWhenResultReceived[localCol] % 2;
            }
        }
    },

    onSpinOneRow: function (col) {
        this.spinRowShift[col] += 2;
        this.onColDrumMode(col);

        var resultRow;
        var resultIndex;
        var nextSymbolIdOne = SymbolId.SYMBOL_ID_INVALID;
        var nextSymbolIdTwo = SymbolId.SYMBOL_ID_INVALID;
        if (this.spinRowCountWhenResultReceived[col] > 0 && this.spinRowShift[col] >= (this.spinRowCountWhenResultReceived[col] + 4)) {
            this.speed[col] = this.SPIN_SPEED_DECEL;
            this.accel[col] = this.SPIN_DECEL;
            this.spinState[col] = SpinState.SPIN_STATE_DECEL;

            resultRow = (this.spinRowShift[col] - this.spinRowCountWhenResultReceived[col]) / 2;
            resultIndex = resultRow * 2;
            nextSymbolIdOne = this.randomNextSeqSymbolId(this.cacheSpinPanel[col][resultIndex - 2], this.cacheSpinPanel[col][resultIndex - 1], col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
            nextSymbolIdTwo = this.randomNextSeqSymbolId(this.cacheSpinPanel[col][resultIndex - 1], nextSymbolIdOne, col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
            this.cacheSpinPanel[col][resultIndex] = nextSymbolIdOne;
            this.cacheSpinPanel[col][resultIndex + 1] = nextSymbolIdTwo;
        }
        else if (this.spinRowCountWhenResultReceived[col] > 0 && this.spinRowShift[col] >= this.spinRowCountWhenResultReceived[col]) {
            resultRow = (this.spinRowShift[col] - this.spinRowCountWhenResultReceived[col]) / 2;
            resultIndex = resultRow * 2;
            if (resultRow == 0) {
                nextSymbolIdOne = this.getSpinResult(col, resultIndex);
                nextSymbolIdTwo = this.getSpinResult(col, resultIndex + 1);
            }
            else if (resultRow == 1) {
                nextSymbolIdOne = this.getSpinResult(col, resultIndex);
                nextSymbolIdTwo = this.randomNextSeqSymbolId(this.cacheSpinPanel[col][resultIndex - 1], nextSymbolIdOne, col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
            }
            else {
                throw new Error("Invalid result row: " + resultRow);
            }
            this.cacheSpinPanel[col][resultIndex] = nextSymbolIdOne;
            this.cacheSpinPanel[col][resultIndex + 1] = nextSymbolIdTwo;
        }
        else if (this.spinRowCountWhenResultReceived[col] > 0 && this.spinRowShift[col] >= (this.spinRowCountWhenResultReceived[col] - 2)) {
            nextSymbolIdTwo = this.randomNextSeqSymbolId(this.getSpinResult(col, 1), this.getSpinResult(col, 0), col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
            nextSymbolIdOne = this.randomNextSeqSymbolId(this.getSpinResult(col, 0), nextSymbolIdTwo, col, this.subjectTmpl, this.spinPanelId, this.isInFreeSpin);
        }
        else {
            var curSpinRowOne = (this.spinRowShift[col] - 1) % this.SPIN_SYMBOL_ROWS;
            var curSpinRowTwo = this.spinRowShift[col] % this.SPIN_SYMBOL_ROWS;
            nextSymbolIdOne = this.spinSymbols[col][curSpinRowOne];
            nextSymbolIdTwo = this.spinSymbols[col][curSpinRowTwo];
        }

        /**
         * @type {cc.Sprite}
         */
        var addedSymbolSprite;
        if (nextSymbolIdOne != SymbolId.SYMBOL_ID_INVALID) {
            addedSymbolSprite = this.addSymbolSprite(col, this.viewRowCount - 3, nextSymbolIdOne);
            if (addedSymbolSprite) {
                addedSymbolSprite.y += this.distance[col];
            }
            this.setActiveSymbol(col, this.viewRowCount - 3, addedSymbolSprite);
        }

        if (nextSymbolIdTwo != SymbolId.SYMBOL_ID_INVALID) {
            addedSymbolSprite = this.addSymbolSprite(col, this.viewRowCount - 2, nextSymbolIdTwo);
            if (addedSymbolSprite != null) {
                addedSymbolSprite.y += this.distance[col];
            }
            this.setActiveSymbol(col, this.viewRowCount - 2, addedSymbolSprite);
        }
    },

    randomSymbolIdForCol: function (localCol, subjectTmpl, panelId, isInFreeSpin) {
        var globalCol = localCol + subjectTmpl.panels[panelId].colShift;
        var symbolCount = subjectTmpl.symbolIds.length;
        var index = Util.randomNextInt(symbolCount);
        var loopCount = 0;
        while (loopCount < symbolCount) {
            var symbolId = subjectTmpl.symbolIds[index];
            var symbol = subjectTmpl.getSymbol(symbolId);
            var mask = symbol.reelMask;
            if (isInFreeSpin) {
                mask = symbol.reelMaskFree;
            }

            if (this.isSymbolValid(mask, globalCol)) {
                return symbolId;
            }
            else {
                index = (index + 1) % symbolCount;
            }

            ++loopCount;
        }
        return SymbolId.SYMBOL_ID_INVALID;
    },

    blinkWinLine: function () {
        var winLine = this.getNormalWinLine(this.curWinLineIndex);
        if (this.lineNodeArray.length > winLine.lineIndex) {
            this.lineNodeArray[winLine.lineIndex].runAction(cc.sequence(cc.show(), cc.delayTime(2.0), cc.hide(), cc.callFunc(this.onBlinkWinLineCompleted, this)));
        }

        this.blinkWinFrameInLine(this.curWinLineIndex);
        this.blinkSymbolsInLine(this.curWinLineIndex);
    }
});

module.exports = ClassicVideoSpinLayer;