var NormalSpinLayer = require("./NormalSpinLayer");
var SlotMan = require("../model/SlotMan");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var SymbolId = require("../enum/SymbolId");
var Coordinate = require("../entity/Coordinate");
var Util = require("../../common/util/Util");

/**
 * Created by alanmars on 15/4/29.
 */
var EnumPayTableSpinLayer = NormalSpinLayer.extend({
    /**
     * @type {Array.<Coordinate>}
     */
    symbolsInAllWinLines: null,
    /**
     * int=>Vector<Coordinate>
     * @type {object.<number, Array.<Coordinate>>}
     */
    symbolsInWinLineDict: null,
    symbolsFlag: false,

    ctor: function (panelId, subjectTmplId) {
        this._super(panelId, subjectTmplId);
    },

    onSpinStart: function () {
        this._super();
        this.symbolsFlag = false;
    },

    blinkAllWinLines: function () {
        this.getSymbolsInAllWinLines();
        this._super();
    },

    getSymbolsInAllWinLines: function () {
        if (!this.symbolsFlag) {
            this.symbolsInAllWinLines = [];
            this.symbolsInWinLineDict = {};

            var posMap = {};

            var winLines = this.getNormalWinLines();
            for (var i = 0; i < winLines.length; ++i) {
                var symbolCoords = this.getMatchSymbolInLineForEnumPayTable(i);
                this.symbolsInWinLineDict[i] = symbolCoords;

                for (var j = 0; j < symbolCoords.length; ++j) {
                    var index = symbolCoords[j].row * this.subjectTmpl.reelCol + symbolCoords[j].col;
                    if (!posMap[index]) {
                        posMap[index] = true;
                        this.symbolsInAllWinLines.push(symbolCoords[j]);
                    }
                }
            }
            this.symbolsFlag = true;
        }
        return this.symbolsInAllWinLines;
    },

    blinkWinFrameInLine: function (winLineIndex) {
        var winLine = this.getNormalWinLine(winLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);
        var symbols = this.symbolsInWinLineDict[winLineIndex];
        if (symbols) {
            for (var i = 0; i < symbols.length; ++i) {
                var tmpNode = new cc.Node();
                var frameNode = this.getWinFrameNode(this.globalColToLocal(symbols[i].col), this.globalRowToLocal(symbols[i].row), lineConfig.color);
                if (frameNode) {
                    tmpNode.addChild(frameNode);
                }
                this.framesNode.addChild(tmpNode);
                //blinkLine(lineId, 0, node, SYMBOL_BLINK_TIMES, call);
                tmpNode.runAction(cc.sequence(cc.delayTime(3.0), cc.hide(), cc.removeSelf(true)));
            }
        }
    },

    blinkSymbolsInLine: function (winLineIndex) {
        var symbolsInLine = this.symbolsInWinLineDict[winLineIndex];
        if (symbolsInLine) {
            for (var i = 0; i < symbolsInLine.length; ++i) {
                var localCol = this.globalColToLocal(symbolsInLine[i].col);
                var localRow = this.globalRowToLocal(symbolsInLine[i].row);
                this.blinkSymbol(localCol, localRow);
            }
        }
    },

    blinkWinLine: function () {
        var winLine = this.getNormalWinLine(this.curWinLineIndex);
        if (this.lineNodeArray.length > winLine.lineIndex) {
            this.lineNodeArray[winLine.lineIndex].runAction(cc.sequence(cc.show(), cc.delayTime(2.0), cc.hide(), cc.callFunc(this.onBlinkWinLineCompleted, this)));
        }

        this.blinkWinFrameInLine(this.curWinLineIndex);
        this.blinkSymbolsInLine(this.curWinLineIndex);

        if (!this.symbolsInWinLineDict[this.curWinLineIndex]) {
            return;
        }

        var winCount = SlotMan.getCurrent().spinBet * this.subjectTmpl.specialPayTables[winLine.num].pays[SlotMan.getCurrent().activeBetGrade] / this.subjectTmpl.getLineCount(0);
        this.dispatchOutputEvent(Util.sprintf("Line %d WIN %s", winLine.lineIndex + 1, Util.getCommaNum(winCount)));
    },

    onBlinkWinLineCompleted: function () {
        if (this.symbolsInWinLineDict[this.curWinLineIndex] != null) {
            var symbolId;
            var symbolConfig;
            var symbolSprite;
            var symbols = this.symbolsInWinLineDict[this.curWinLineIndex];
            for (var i = 0; i < symbols.length; ++i) {
                var localCol = this.globalColToLocal(symbols[i].col);
                var localRow = this.globalRowToLocal(symbols[i].row);
                symbolId = this.getSpinResult(localCol, localRow);
                symbolConfig = this.subjectTmpl.getSymbol(symbolId);
                if (symbolConfig.animName.length > 0 || symbolConfig.animEffect != SymbolAnimEffect.SYMBOL_ANIM_EFFECT_NONE) {
                    symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
                    if (symbolSprite) {
                        symbolSprite.visible = true;
                    }
                }
            }
        }

        this.animsNode.removeAllChildren(true);
        this.framesNode.removeAllChildren(true);

        ++this.curWinLineIndex;
        if (this.curWinLineIndex < this.getNormalWinLines().length) {
            this.blinkWinLine();
        }
        else {
            this.onBlinkWinLineRoundCompleted();
        }
    },

    getMatchSymbolInLineForEnumPayTable: function (winLineIndex) {
        var winLine = this.getNormalWinLine(winLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);
        var result = [];
        var coord;
        /**
         * symboldId => exists
         * @type {object.<number, boolean>}
         */
        var symbolDict;
        var enumPayTableItem = this.subjectTmpl.specialPayTables[winLine.num];
        var localCol, localRow, globalCol, globalRow;
        var symbolId;
        if (enumPayTableItem.type === 0) {
            for (localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
                globalCol = this.localColToGlobal(localCol);
                globalRow = lineConfig.rows[globalCol];
                localRow = this.localRowToGlobal(globalRow);
                symbolId = this.getSpinResult(localCol, localRow);
                symbolDict = enumPayTableItem.symbols[globalCol];
                if (symbolDict[symbolId] || (SymbolId.isWild(symbolId) && (!enumPayTableItem.wildMap || enumPayTableItem.wildMap[symbolId]))) {
                    coord = new Coordinate();
                    coord.col = globalCol;
                    coord.row = globalRow;
                    result.push(coord);
                }
            }
        }
        else if (enumPayTableItem.type === 1) {
            var posIndexSet = 0;
            for (localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
                globalCol = this.localColToGlobal(localCol);
                globalRow = lineConfig.rows[globalCol];
                localRow = this.globalRowToLocal(globalRow);
                symbolId = this.getSpinResult(localCol, this.globalRowToLocal(globalRow));
                for (var searchPosIndex = 0; searchPosIndex < enumPayTableItem.symbols.length; ++searchPosIndex) {
                    if ((searchPosIndex & (0x1 << posIndexSet)) != 0) {
                        continue;
                    }
                    symbolDict = enumPayTableItem.symbols[searchPosIndex];
                    if (symbolDict[symbolId] && symbolDict[symbolId]) {
                        coord = new Coordinate();
                        coord.col = globalCol;
                        coord.row = globalRow;
                        result.push(coord);
                        posIndexSet |= (0x1 << searchPosIndex);
                        break;
                    }
                }
            }
        }
        return result;
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
    }
});

module.exports = EnumPayTableSpinLayer;