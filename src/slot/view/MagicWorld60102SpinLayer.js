var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var SlotMan = require("../model/SlotMan");
var Util = require("../../common/util/Util");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var TaskBreakChainController = require("../../task/controller/TaskBreakChainController");
var TaskMeltIceController = require("../../task/controller/TaskMeltIceController");
var TaskFireController = require("../../task/controller/TaskFireController");
var Coordinate = require("../entity/Coordinate");

var MagicWorld60102SpinLayer = SpecialTaskSpinLayer.extend({
    setSymbolCCBParam: function (symbolNode, symbolId) {
        var moneyLabel = symbolNode.getChildByTag(3);
        var totalBet = SlotMan.getCurrent().bet * SlotMan.getCurrent().lineNum;
        var rubyMoney = totalBet;
        switch(symbolId) {
            case 1101:
                rubyMoney = totalBet * 0.25;
                break;
            case 1102:
                rubyMoney = totalBet * 0.5;
                break;
            case 1103:
                rubyMoney = totalBet * 1;
                break;
            case 1104:
                rubyMoney = totalBet * 2;
                break;
            case 1105:
                rubyMoney = totalBet * 5;
                break;
            default:
                break;
        }
        moneyLabel.setString(Util.formatAbbrNum(Math.floor(rubyMoney)));
        return symbolNode;
    },

    getChainSymbolNode: function (chainInfo) {
        var symbolPos = this.getSymbolPos(chainInfo.col, chainInfo.row);
        var chainSymbolNode = TaskBreakChainController.createFromCCB();
        chainSymbolNode.controller.showBreakChainNormal(chainInfo.count);
        chainSymbolNode.setPosition(symbolPos);
        chainSymbolNode.setScale(0.75);
        return chainSymbolNode;
    },

    getIceNode: function (iceInfo) {
        var symbolPos = this.getSymbolPos(iceInfo.col, iceInfo.row);
        var iceNode = TaskMeltIceController.createFromCCB();
        iceNode.controller.showIceNormal(iceInfo.count);
        iceNode.setPosition(symbolPos);
        iceNode.setScale(0.75);
        return iceNode;

    },

    getFireNode: function (fireInfo) {
        var symbolPos = this.getSymbolPos(fireInfo.col, fireInfo.row);
        var fireNode = TaskFireController.createFromCCB();
        fireNode.controller.showFireNormal(fireInfo.count);
        fireNode.setPosition(symbolPos);
        fireNode.setScale(0.73);
        return fireNode;
    },

    getBlinkSymbolNode: function (symbolConfig) {
        var animNode;
        var isCCBAnim = symbolConfig.animName.lastIndexOf("ccbi") != -1;
        if (isCCBAnim) {
            animNode = Util.loadNodeFromCCB(symbolConfig.animName, null, "SymbolController", {});
            if(symbolConfig.symbolId >= 1101 && symbolConfig.symbolId <= 1105) {
                animNode = this.setRubyAnimLabel(animNode, symbolConfig.symbolId);
            }
            var maskLayer;
            var clipNode;
            maskLayer = animNode.controller.maskLayer;
            if (maskLayer) {
                maskLayer.visible = false;
                var bottomNode = animNode.controller.clipNode;
                if (bottomNode) {
                    maskLayer.removeFromParent(false);
                    maskLayer.visible = true;

                    bottomNode.retain();
                    bottomNode.removeFromParent(false);
                    clipNode = new cc.ClippingNode(maskLayer);
                    if (maskLayer instanceof cc.Sprite) {
                        clipNode.alphaThreshold = 0.5;
                    } else {
                        clipNode.alphaThreshold = 1;
                    }
                    clipNode.addChild(bottomNode);
                    bottomNode.release();
                    var symbolNode = new cc.Node();
                    if (this.blinkSymbolBgInBottom()) {
                        symbolNode.addChild(animNode);
                        symbolNode.addChild(clipNode);
                    } else {
                        symbolNode.addChild(clipNode);
                        symbolNode.addChild(animNode);
                    }
                    return symbolNode;
                } else {
                    clipNode = new cc.ClippingNode(maskLayer);
                    clipNode.addChild(animNode);
                    return clipNode;
                }
            } else {
                return animNode;
            }
        } else {
            animNode = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(symbolConfig.imgName));
        }
        return animNode;
    },

    setRubyAnimLabel: function (animNode, symbolId) {
        var coinLabel = animNode.getChildByTag(3);
        var totalBet = SlotMan.getCurrent().bet * SlotMan.getCurrent().lineNum;
        var rubyMoney = totalBet;
        switch(symbolId) {
            case 1101:
                rubyMoney = totalBet * 0.25;
                break;
            case 1102:
                rubyMoney = totalBet * 0.5;
                break;
            case 1103:
                rubyMoney = totalBet * 1;
                break;
            case 1104:
                rubyMoney = totalBet * 2;
                break;
            case 1105:
                rubyMoney = totalBet * 5;
                break;
            default:
                break;
        }
        coinLabel.setString(Util.formatAbbrNum(Math.floor(rubyMoney)));
        return animNode;
    },

    isFullGridSymbol: function (symbolId, localCol, localRow) {
        if(symbolId == 1 || symbolId == 2 || (symbolId >= 1101 && symbolId <= 1105)) {
            return true;
        }
        return false;
    },

    getSymbolsInAllWinLines: function () {
        /**
         * @type {Array.<Coordinate>}
         */
        var result = [];
        var posMap = {};

        var winLines = this.getNormalWinLines();
        for (var i = 0; i < winLines.length; ++i) {
            var lineConfig = this.getLine(winLines[i].lineIndex);
            for (var globalCol = 0; globalCol < winLines[i].num; ++globalCol) {
                var globalRow = lineConfig.rows[globalCol];
                var index = globalRow * this.subjectTmpl.reelCol + globalCol;
                if (!posMap[index]) {
                    posMap[index] = true;
                    var coord = new Coordinate();
                    coord.row = globalRow;
                    coord.col = globalCol;
                    result.push(coord);
                }
            }
        }

        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            for(var row = 0; row < this.panelConfig.slotRows; row++) {
                var symbolId = this.getSpinResult(col, row);
                var index = row * this.subjectTmpl.reelCol + col;
                if(!posMap[index] && (symbolId >= 1101 && symbolId <= 1105)) {
                    posMap[index] = true;
                    var coord = new Coordinate();
                    coord.row = row;
                    coord.col = col;
                    result.push(coord);
                }
            }
        }

        return result;
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
            this.blinkSymbolInAllWinLines();
            this.blinkWinFrameInAllWinLines();
            this.blinkWinFrameBgInAllWinLines();

            this.linesNode.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onBlinkAllWinLinesCompleted, this)));
        }
    },

    onShowDrumScatter: function (localCol) {
        this.showDrumScatterNormal(localCol);
    }
});

module.exports = MagicWorld60102SpinLayer;