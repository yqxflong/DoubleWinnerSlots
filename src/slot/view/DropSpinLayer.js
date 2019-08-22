/**
 * Created by ZenQhy on 16/4/20.
 */

var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");

var DropSpinLayer = SpecialTaskSpinLayer.extend({
    DROP_SYMBOL_TIME: 0.2,
    DROP_DELAY_TIME: 0.3,

    onSpecialAnimation: function () {
        this.dropNewSymbols();
    },

    explodeAllWinLineSymbols: function () {
        var result = this.getSymbolsInAllWinLines();
        for (var i = 0; i < result.length; ++i) {
            var localCol = this.globalColToLocal(result[i].col);
            var localRow = this.globalRowToLocal(result[i].row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) continue;

            this.setActiveSymbol(localCol, localRow, null);

            var explodePos = this.getSymbolPos(localCol, localRow);
            var explodeAnim = Util.loadSpineAnim("magic_world/60103/anim/xiaochu/xiaochu", "default", "xiaochu_baozha", false);
            explodeAnim.setPosition(explodePos);
            explodeAnim.setScale(1.2);
            this.animsNode.addChild(explodeAnim);
        }
    },

    dropNewSymbols: function () {
        var col = 0;
        var row = 0;
        for(col = 0; col < this.panelConfig.slotCols; col++) {
            var dropSymbolCount = 0;
            for(row = 0; row < this.panelConfig.slotRows; row++) {
                if(this.getActiveSymbol(col, row) == null) {
                    var symbolSprite;
                    for(var nextRow = row + 1; nextRow < this.panelConfig.slotRows; nextRow++) {
                        symbolSprite = this.getActiveSymbol(col, nextRow);
                        if(symbolSprite != null) {
                            this.cutActiveSymbol(col, nextRow, col, row);
                            break;
                        }
                    }

                    if(this.getActiveSymbol(col, row) == null) {
                        var symbolId = this.getSpinResult(col, row);
                        symbolSprite = this.addSymbolSprite(col, this.panelConfig.slotRows, symbolId);
                        symbolSprite.setPositionY(this.panelConfig.spinRegion.y + this.panelConfig.spinRegion.height + this.gridHeight * (dropSymbolCount + 0.5)
                                                - this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5);
                        this.setActiveSymbol(col, row, symbolSprite);
                        dropSymbolCount++;
                    }
                }
            }
        }

        for(col = 0; col < this.panelConfig.slotCols; col++) {
            for(row = 0; row < this.panelConfig.slotRows; row++) {
                var symbolSprite = this.getActiveSymbol(col, row);
                symbolSprite.runAction(cc.sequence(cc.delayTime(this.DROP_DELAY_TIME), cc.moveTo(this.DROP_SYMBOL_TIME, this.getSymbolPos(col, row))));
            }
        }

        this.runAction(cc.sequence(cc.delayTime(this.DROP_SYMBOL_TIME + this.DROP_DELAY_TIME), cc.delayTime(0.3), cc.callFunc(this.onSpecialAnimationEnd, this)));
    },

    cutActiveSymbol: function (fromLocalCol, fromLocalRow, toLocalCol, toLocalRow) {
        this.setActiveSymbol(toLocalCol, toLocalRow, null);
        var fromModelRow = this.getModelRow(fromLocalCol, fromLocalRow);
        var toModelRow = this.getModelRow(toLocalCol, toLocalRow);
        this.activeSymbols[toLocalCol][toModelRow] = this.activeSymbols[fromLocalCol][fromModelRow];
        this.activeSymbols[fromLocalCol][fromModelRow] = null;
    },

    blinkAllWinLines: function () {
        var winLines = this.getNormalWinLines();
        if (winLines.length > 0) {
            this.linesNode.zIndex = this.ZORDER_BLINK_ALL_LINE;
            this.overlayNode.visible = true;
            for (var i = 0; i < winLines.length; ++i) {
                var winLine = winLines[i];
                this.lineNodeArray[winLine.lineIndex].setVisible(true);
            }
            var delayTimeLen = 0.5;
            this.linesNode.runAction(cc.sequence(cc.show(), cc.delayTime(delayTimeLen),
                cc.hide(), cc.delayTime(delayTimeLen),
                cc.show(), cc.delayTime(delayTimeLen),
                cc.hide(), cc.delayTime(delayTimeLen),
                cc.callFunc(this.hideAllLines, this), cc.callFunc(this.onBlinkAllWinLinesCompleted, this)));

            this.blinkSymbolInAllWinLines();
            this.blinkWinFrameInAllWinLines();
            this.blinkWinFrameBgInAllWinLines();
        }
        else {
            this.onBlinkAllWinLinesCompleted();
        }
    },

    blinkAllWinLines: function () {
        this.linesNode.zIndex = this.ZORDER_BLINK_ALL_LINE;
        var SlotMan = require("../model/SlotMan");
        if(SlotMan.getCurrent().isFirstSpinPanel()) {
            var winLines = this.getNormalWinLines();
            for (var i = 0; i < winLines.length; ++i) {
                var winLine = winLines[i];
                this.lineNodeArray[winLine.lineIndex].setVisible(true);
            }
            var delayTimeLen = 0.5;
            this.linesNode.runAction(cc.sequence(cc.show(), cc.delayTime(delayTimeLen),
                cc.hide(), cc.delayTime(delayTimeLen),
                cc.show(), cc.delayTime(delayTimeLen),
                cc.hide(), cc.delayTime(delayTimeLen),
                cc.callFunc(this.hideAllLines, this), cc.callFunc(this.onBlinkAllWinLinesCompleted, this)));

            this.blinkSymbolInAllWinLines();
            this.blinkWinFrameInAllWinLines();
            this.blinkWinFrameBgInAllWinLines();
        }
        else {
            this.linesNode.runAction(cc.sequence(cc.delayTime(0.7), cc.callFunc(this.onBlinkAllWinLinesCompleted, this)));
        }
    }
});

module.exports = DropSpinLayer;