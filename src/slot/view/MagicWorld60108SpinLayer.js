var ClassicSpinLayer = require("./ClassicSpinLayer");
var SymbolId = require("../enum/SymbolId");
var SpinState = require("../enum/SpinState");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var Coordinate = require("../entity/Coordinate");
var DrumMode = require("../enum/DrumMode");
var DeviceInfo = require("../../common/util/DeviceInfo");

var MagicWorld60108SpinLayer = ClassicSpinLayer.extend({
    DRUM_BEFORE_LAST_COL_RATIO: 1,

    drumModeColMap: null,
    isHaveDrumMode: false,

    _winNode: null,
    _bigWinNode: null,

    hasRollBack: false,
    hasRollForward: false,
    multiSymbolsRatioMap: null,

    initData: function () {
        this._super();

        this.initialSymbolSeq = [
            [
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_NORMAL_BEGIN,
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_EMPTY
            ],
            [
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_NORMAL_BEGIN,
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_EMPTY
            ],
            [
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_NORMAL_BEGIN,
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_EMPTY
            ],
            [
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_NORMAL_BEGIN + 7,
                SymbolId.SYMBOL_ID_EMPTY,
                SymbolId.SYMBOL_ID_EMPTY
            ]
        ];

        this.multiSymbolsRatioMap = {
            "1007": 20,
            "1008": 10,
            "1009": 5,
            "1010": 2
        };
    },

    initUI: function () {
        cc.spriteFrameCache.addSpriteFrames(this.subjectTmpl.symbolBatchPlistPath, this.subjectTmpl.symbolBatchName);
        cc.spriteFrameCache.addSpriteFrames(this.subjectTmpl.commonSymbolBatchPlistPath, this.subjectTmpl.commonSymbolBatchName);
        var spinRegion = this.panelConfig.spinRegion;

        this.columnBgNode = new cc.Node();
        this.addChild(this.columnBgNode);

        this.spinBoardNode = new cc.Node();
        this.addChild(this.spinBoardNode);

        var spinLayerPath = "magic_world/60108/bg/magic_world_wheel_castle.png";
        var spinLayerBg = new cc.Sprite(spinLayerPath);
        if(spinLayerBg) {
            if(DeviceInfo.isHighResolution()) {
                spinLayerBg.setPosition(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinLayerBg.height * 0.5 - 15);
            }
            else {
                spinLayerBg.setPosition(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinRegion.height * 0.5);
            }
            this.spinBoardNode.addChild(spinLayerBg, 0);
        }

        var winSize = cc.director.getWinSize();
        var whiteColor = cc.color(255, 255, 255, 255);
        this.symbolsNodes = [];
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            var clipStencil = new cc.DrawNode();
            clipStencil.drawRect(cc.p(0, spinRegion.y + this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5),
                cc.p(winSize.width, spinRegion.y + spinRegion.height - this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5),
                whiteColor, 1, whiteColor);
            var symbolsNode = new cc.ClippingNode(clipStencil);
            this.spinBoardNode.addChild(symbolsNode, this.ZORDER_SYMBOL_NODE);
            this.symbolsNodes.push(symbolsNode);
        }

        this.overlayNode = new cc.Node();
        this.spinBoardNode.addChild(this.overlayNode, this.ZORDER_OVERLAY_NODE);
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            var oneColOverlayNode = new cc.LayerColor(cc.color.BLACK, this.gridWidth, this.gridHeight * this.eachRowCounts[col]);
            oneColOverlayNode.ignoreAnchorPointForPosition(false);
            oneColOverlayNode.setPositionX(this.panelConfig.spinRegion.x + (col + 0.5) * this.gridWidth + col * this.gapWidth);
            oneColOverlayNode.setPositionY(this.panelConfig.spinRegion.y + this.panelConfig.spinRegion.height * 0.5);
            oneColOverlayNode.setOpacity(150);
            this.overlayNode.addChild(oneColOverlayNode);
        }
        this.overlayNode.setVisible(false);

        this.linesNode = new cc.Node();
        this.spinBoardNode.addChild(this.linesNode, this.ZORDER_LINE_NODE);
        this.framesBgNode = new cc.Node();
        this.spinBoardNode.addChild(this.framesBgNode, this.ZORDER_FRAMES_BG_NODE);
        this.animsNode = new cc.Node();
        this.spinBoardNode.addChild(this.animsNode, this.ZORDER_ANIMS_NODE);
        this.connectedSymbolNode = new cc.Node();
        this.spinBoardNode.addChild(this.connectedSymbolNode, this.ZORDER_CONNECTED_SYMBOL_NODE);
        this.framesNode = new cc.Node();
        this.spinBoardNode.addChild(this.framesNode, this.ZORDER_FRAMES_NODE);
        this.symbolUnBatchNode = new cc.Node();
        this.spinBoardNode.addChild(this.symbolUnBatchNode, this.ZORDER_SYMBOL_UNBATCH_NODE);
        this.frontNode = new cc.Node();
        this.addChild(this.frontNode, this.ZORDER_FRONT_NODE);

        var spinLayerShadowPath = "magic_world/60108/bg/magic_world_wheel_castle_shadow.png";
        var spinLayerShadowSprite = new cc.Sprite(spinLayerShadowPath);
        if(spinLayerShadowSprite) {
            spinLayerShadowSprite.setPosition(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinRegion.height * 0.5);
            this.spinBoardNode.addChild(spinLayerShadowSprite, this.ZORDER_FRONT_NODE);
        }

        this.drumModeEffectNode = Util.loadNodeFromCCB("slot/drummode/drummode.ccbi", null);
        if (this.drumModeEffectNode) {
            this.drumModeEffectNode.setVisible(false);
            this.addChild(this.drumModeEffectNode, this.ZORDER_DRUM_MODE_NODE, this.DRUM_MODE_EFFECT_NODE_TAG);
            this.drumModeEffectNode.setScaleX(this.gridWidth / 156);
            this.drumModeEffectNode.setScaleY(this.panelConfig.spinRegion.height / 468.0 * 0.99);
        }

        this.resetColumnBg(false, false);
        this.createExtraUI();
    },

    createExtraUI: function() {
        this._super();

        this.addMultipleMask();
        this.addPayLine();
    },

    resetColumnBg: function (isFreeSpin, isAnimation) {
        var bgName;
        if (isFreeSpin) {
            if (this.panelConfig.columnFreeSpinBg) {
                bgName = this.panelConfig.columnFreeSpinBg;
            }
        } else {
            if (this.panelConfig.columnNormalBg) {
                bgName = this.panelConfig.columnNormalBg;
            }
        }

        if (bgName) {
            this.removeColumnBgs();
            for (var col = 0; col < this.panelConfig.slotCols; ++col) {
                var columnBg = new cc.Sprite(bgName);
                if(col == this.panelConfig.slotCols - 1) {
                    columnBg = new cc.Sprite("magic_world/60108/bg/magic_world_reels_volcano_s.png");
                }
                columnBg.setPositionX(this.panelConfig.spinRegion.x + (col + 0.5) * this.gridWidth + col * this.gapWidth);
                columnBg.setPositionY(this.panelConfig.spinRegion.y + this.panelConfig.spinRegion.height * 0.5);
                columnBg.setScaleY(this.eachRowCounts[col] / this.panelConfig.slotRows);
                this.columnBgNode.addChild(columnBg, 0, col);
                if (isAnimation) {
                }
            }
        }
        else if (!isFreeSpin) {
            if (isAnimation) {
                var totalTime = 0.7;
                this.runAction(cc.sequence(cc.delayTime(totalTime + 0.2), cc.callFunc(this.removeColumnBgs, this)));
            }
            else {
                this.removeColumnBgs();
            }
        }
    },

    createExtraMask: function () {
        var spinRegion = this.panelConfig.spinRegion;
        var maskSprite = new cc.Sprite("lucky_star/reels/bg/lucky_star_background_mask.png");
        this.frontNode.addChild(maskSprite, 1);
        maskSprite.x = spinRegion.x + 614;
        maskSprite.y = spinRegion.y + 128;
    },

    addPayLine: function () {
        var payLineSprite = new cc.Sprite("magic_world/60108/bg/magic_world_wheel_payline.png");
        payLineSprite.setAnchorPoint(cc.p(0.5, 0.5));
        var spinRegion = this.panelConfig.spinRegion;
        payLineSprite.x = spinRegion.x + spinRegion.width * 0.5;
        payLineSprite.y = spinRegion.y + spinRegion.height * 0.5;
        this.frontNode.addChild(payLineSprite, 3);
    },

    addMultipleMask: function () {
        var maskSprite = new cc.Sprite("magic_world/60108/bg/magic_world_wheel_castle_2.png");
        maskSprite.setPosition(cc.pAdd(this.getSymbolPos(3, 1), cc.p(0, 2)));
        this.frontNode.addChild(maskSprite);
    },

    onSpinStart: function () {
        this._super();
        //this._winNode.visible = false;
        //this._bigWinNode.visible = false;
        this.hasRollBack = false;
        this.hasRollForward = false;
    },

    randomNotEmptySymbolId: function (localCol, subjectTmpl, panelId, isInFreeSpin) {
        if(localCol != this.panelConfig.slotCols-1) {
            return this._super(localCol, subjectTmpl, panelId, isInFreeSpin);
        }
        return Math.floor(Math.random() * 4) + 1007;
    },

    hideWinAnims: function () {
        //this._bigWinNode.visible = false;
        //this._winNode.visible = false;
    },

    showTotalWin: function () {
        var lastSymbolId = this.getSpinResult(this.subjectTmpl.reelCol - 1, 1);
        var multiRatio = this.multiSymbolsRatioMap[lastSymbolId];
        var beforeRatio = 0;
        if (multiRatio > 0) {
            beforeRatio = this.spinPanel.winRate / multiRatio / 100;
        }

        if(beforeRatio >= this.DRUM_BEFORE_LAST_COL_RATIO) {
            //this._bigWinNode.visible = true;
            //this._winNode.visible = false;
        }
        else {
            //this._bigWinNode.visible = false;
            //this._winNode.visible = true;
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
        var hasWinLine = false;
        if (enumPayTableItem.type === 0) {
            for (localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
                globalCol = this.localColToGlobal(localCol);
                globalRow = lineConfig.rows[globalCol];
                localRow = this.localRowToGlobal(globalRow);
                symbolId = this.getSpinResult(localCol, localRow);
                if (localCol != this.panelConfig.slotCols - 1) {
                    symbolDict = enumPayTableItem.symbols[globalCol];
                    if (symbolDict[symbolId] || (SymbolId.isWild(symbolId))) {
                        coord = new Coordinate();
                        coord.col = globalCol;
                        coord.row = globalRow;
                        result.push(coord);
                        hasWinLine = true;
                    }
                } else {
                    if (hasWinLine) {
                        coord = new Coordinate();
                        coord.col = globalCol;
                        coord.row = globalRow;
                        result.push(coord);
                    }
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
                if (localCol != this.panelConfig.slotCols - 1) {
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
                            hasWinLine = true;
                            posIndexSet |= (0x1 << searchPosIndex);
                            break;
                        }
                    }
                } else {
                    if (hasWinLine) {
                        coord = new Coordinate();
                        coord.col = globalCol;
                        coord.row = globalRow;
                        result.push(coord);
                    }
                }

            }
        }
        return result;
    }
});

module.exports = MagicWorld60108SpinLayer;