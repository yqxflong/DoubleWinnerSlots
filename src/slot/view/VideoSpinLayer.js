/**
 * Created by alanmars on 15/4/17.
 */
var NormalSpinLayer = require("./NormalSpinLayer");
var Direction = require("../enum/Direction");
var SymbolId = require("../enum/SymbolId");
var SpinState = require("../enum/SpinState");
var DrumMode = require("../enum/DrumMode");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var Util = require("../../common/util/Util");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var SlotMan = require("../model/SlotMan");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var Coordinate = require("../entity/Coordinate");
var ConnectedColData = require("../entity/ConnectedColData");
var ConnectedAreaData = require("../entity/ConnectedAreaData");
var TaskConfigMan = require("../../task/config/TaskConfigMan");
var SlotTheme = require("../enum/SlotTheme");

var VideoSpinLayer = NormalSpinLayer.extend({

    SHOW_CONNECTED_AREA_TIME: 0.15,
    SHOW_CONNECTED_AREA_STEP_TIME: 0.7,

    ctor: function (subjectTmplId, panelId) {
        this.checkConnectedIds = [];
        this.connectedAreas = {};

        this._super(subjectTmplId, panelId);
    },

    initExtraData: function () {
        this._super();

        this.checkConnectedIds = this.panelConfig.checkConnectedIds;
    },

    onSubRoundStart: function () {
        this._super();

        this.connectedAreas = {};
        this.connectedSymbolNode.removeAllChildren(true);
    },

    onShowDrumJackpot: function (localCol) {
        for (var localRow = 0; localRow < this.panelConfig.slotRows; ++localRow) {
            if (this.getSpinResult(localCol, localRow) == SymbolId.SYMBOL_ID_JACKPOT) {
                var symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
                if (symbolSprite) {
                    symbolSprite.runAction(cc.fadeIn(0.1));
                }
            }
        }

        var globalCol = this.localColToGlobal(localCol);
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/fx-bonus-appear%d", globalCol + 1));
    },

    showBonusAppearAudio: function (localCol) {
        var beforeSpecialSymbolCount = 0;
        var i,j;
        var symbolId;
        var hasSpecialSymbol = false;
        var drumMode = DrumMode.DRUM_MODE_NULL;
        for(i = 0; i < this.drumModeState.length; ++i) {
            var tmpDrumMode = this.drumModeState[i];
            if (tmpDrumMode > DrumMode.DRUM_MODE_NULL && tmpDrumMode < DrumMode.DRUM_MODE_DRUM) {
                drumMode = tmpDrumMode;
                break;
            }
        }
        var globalCol = localCol + this.panelConfig.colShift;
        for (i = 0; i < this.spinPanel.panel.length; ++i) {
            if (i >= globalCol) {
                break;
            }
            for (j = 0; j < this.spinPanel.panel[i].length; ++j) {
                symbolId = this.getGlobalSpinResult(i, j);
                hasSpecialSymbol = false;
                if (symbolId == SymbolId.SYMBOL_ID_BONUS && drumMode == DrumMode.DRUM_MODE_BLINK_BONUS) {
                    hasSpecialSymbol = true;
                } else if (symbolId == SymbolId.SYMBOL_ID_JACKPOT && drumMode == DrumMode.DRUM_MODE_BLINK_JACKPOT) {
                    hasSpecialSymbol = true;
                } else if (symbolId == SymbolId.SYMBOL_ID_SCATTER && drumMode == DrumMode.DRUM_MODE_BLINK_SCATTER) {
                    hasSpecialSymbol = true;
                }
                if (hasSpecialSymbol) {
                    beforeSpecialSymbolCount++;
                    break;
                }
            }
        }
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/fx-bonus-appear%d", beforeSpecialSymbolCount + 1));
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

    onBlinkAllWinLinesCompleted: function () {
        var result = this.getSymbolsInAllWinLines();
        for (var i = 0; i < result.length; ++i) {
            var localCol = this.globalColToLocal(result[i].col);
            var localRow = this.globalRowToLocal(result[i].row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) continue;
            var symbolNode = this.getActiveConsecutiveSymbol(localCol, localRow);
            if (symbolNode) {
                symbolNode.visible = true;
            }
        }
        this.linesNode.zIndex = this.ZORDER_LINE_NODE;
        this.overlayNode.visible = false;
        this.animsNode.removeAllChildren(true);
        this.framesNode.removeAllChildren(true);
        this.framesBgNode.removeAllChildren(true);
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_ALL_WIN_LINE_END);
    },

    getConnectedArea: function () {
        if(!this.checkConnectedIds || this.checkConnectedIds.length <= 0) return 0;

        var hasConnectedArea = false;
        for(var i = 0; i < this.checkConnectedIds.length; i++) {
            var symbolId = this.checkConnectedIds[i];
            var symbolArr = this.getWildSymbolInWinLines(symbolId);
            var areas = this.calConnectedArea(symbolArr);
            var oneConnectedAreas = this.calConnectedAreaShape(areas);
            this.connectedAreas[symbolId] = oneConnectedAreas;
            if(oneConnectedAreas.length > 0) hasConnectedArea = true;
        }
        return hasConnectedArea;
    },

    getWildSymbolInWinLines: function (symbolId) {
        var result = [];
        var posMap = {};

        if(cc.isUndefined(symbolId)) {
            return result;
        }

        var winLines = this.getNormalWinLines();
        for (var i = 0; i < winLines.length; ++i) {
            var lineConfig = this.getLine(winLines[i].lineIndex);
            for (var globalCol = 0; globalCol < winLines[i].num; ++globalCol) {
                var globalRow = lineConfig.rows[globalCol];
                var index = globalRow * this.subjectTmpl.reelCol + globalCol;
                if (!posMap[index] && this.getGlobalSpinResult(globalCol, globalRow) == symbolId) {
                    posMap[index] = true;
                    var coord = new Coordinate();
                    coord.row = globalRow;
                    coord.col = globalCol;
                    result.push(coord);
                }
            }
        }

        return result;
    },

    calConnectedArea: function (symbolArr) {
        if(cc.isUndefined(symbolArr) || symbolArr.length <= 0) {
            return [];
        }

        var index = 0;
        var areaIndex = 0;
        var areaSymbolIndex = 0;
        var symbolAreas = [];

        for(index = 0; index < symbolArr.length; index++) {
            var hasNewArea = true;
            for(areaIndex = 0; areaIndex < symbolAreas.length; areaIndex++) {
                for(areaSymbolIndex = 0; areaSymbolIndex < symbolAreas[areaIndex].length; areaSymbolIndex++) {
                    if(symbolArr[index].col == symbolAreas[areaIndex][areaSymbolIndex].col
                    || symbolArr[index].row == symbolAreas[areaIndex][areaSymbolIndex].row) {
                        symbolAreas[areaIndex].push(symbolArr[index]);
                        hasNewArea = false;
                        break;
                    }
                }

                if(!hasNewArea) break;
            }

            if(hasNewArea) {
                var newSymbolArea = [];
                newSymbolArea.push(symbolArr[index]);
                symbolAreas.push(newSymbolArea);
            }
        }

        var symbolAreasResult = [];
        for(areaIndex = 0; areaIndex < symbolAreas.length; areaIndex++) {
            if(symbolAreas[areaIndex].length >= 2) {
                symbolAreasResult.push(symbolAreas[areaIndex]);
            }
        }

        return symbolAreasResult;
    },

    calConnectedAreaShape: function (areas) {
        if(cc.isUndefined(areas) || areas.length <= 0) {
            return [];
        }

        var oneConnectedAreas = [];
        for(var areaIndex = 0; areaIndex < areas.length; areaIndex++) {
            var oneArea = areas[areaIndex];

            while(oneArea.length > 0) {
                var result = this.calShapeOnce(oneArea);
                if(result.length <= 0) break;
                for(var i = 0; i < result.length; i++) {
                    oneConnectedAreas.push(result[i]);
                }
                oneArea = this.clearArea(oneArea, result);
            }
        }
        return oneConnectedAreas;
    },

    calShapeOnce: function (oneArea) {
        var connectedAreaResult = [];

        // 从下到上，从左到右进行排序
        for(var i = 0; i < oneArea.length; i++) {
            for(var j = i + 1; j < oneArea.length; j++) {
                if(oneArea[i].col > oneArea[j].col
                    || (oneArea[i].col == oneArea[j].col && oneArea[i].row > oneArea[j].row)) {
                    var tmp = oneArea[i];
                    oneArea[i] = oneArea[j];
                    oneArea[j] = tmp;
                }
            }
        }

        var cooIndex = 0;
        var cooFlag = oneArea[0];
        var connectedHeight = 1;

        var connectedColDatas = [];
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            connectedColDatas.push(new ConnectedColData());
        }

        // 找到每列最高的连通区域
        for(cooIndex = 1; cooIndex < oneArea.length; cooIndex++) {
            if(oneArea[cooIndex].col == cooFlag.col && (oneArea[cooIndex].row - cooFlag.row) == connectedHeight) {
                connectedHeight++;
            }
            else {
                if(connectedHeight <= 1) {
                    cooFlag = oneArea[cooIndex];
                    connectedHeight = 1;
                }
                else {
                    var curCol = cooFlag.col;
                    connectedColDatas[curCol].minRow = cooFlag.row;
                    connectedColDatas[curCol].maxRow = oneArea[cooIndex - 1].row;

                    cooFlag = oneArea[cooIndex];
                    connectedHeight = 1;
                }
            }
        }

        if(connectedHeight > 1) {
            var curCol = cooFlag.col;
            connectedColDatas[curCol].minRow = cooFlag.row;
            connectedColDatas[curCol].maxRow = oneArea[oneArea.length - 1].row;
        }

        // 横向找连通区
        var colIndex = 0;
        var curConnectedArea = new ConnectedAreaData();

        for(colIndex = 0; colIndex < this.panelConfig.slotCols; colIndex++) {
            if(connectedColDatas[colIndex].getConnectedHeight() <= 0) {
                if(curConnectedArea.areaWidth != -1) {
                    connectedAreaResult.push(curConnectedArea);
                    curConnectedArea = new ConnectedAreaData();
                }
                continue;
            }

            if(curConnectedArea.areaWidth == -1) {
                curConnectedArea.col = colIndex;
                curConnectedArea.row = connectedColDatas[colIndex].minRow;
                curConnectedArea.areaHeight = connectedColDatas[colIndex].getConnectedHeight();
                curConnectedArea.areaWidth = 1;
            }
            else {
                var crossMinRow = -1;
                var crossMaxRow = -1;
                var crossHeight = -1;

                crossMinRow = curConnectedArea.row > connectedColDatas[colIndex].minRow ? curConnectedArea.row : connectedColDatas[colIndex].minRow;
                crossMaxRow = (curConnectedArea.row + curConnectedArea.areaHeight - 1) < connectedColDatas[colIndex].maxRow ? (curConnectedArea.row + curConnectedArea.areaHeight - 1) : connectedColDatas[colIndex].maxRow;
                crossHeight = crossMaxRow - crossMinRow + 1;

                if(crossHeight >= 2 && curConnectedArea.areaWidth < 3) {
                    curConnectedArea.row = crossMinRow;
                    curConnectedArea.areaHeight = crossHeight;
                    curConnectedArea.areaWidth++;
                }
                else {
                    connectedAreaResult.push(curConnectedArea);

                    curConnectedArea = new ConnectedAreaData();
                    curConnectedArea.col = colIndex;
                    curConnectedArea.row = connectedColDatas[colIndex].minRow;
                    curConnectedArea.areaHeight = connectedColDatas[colIndex].getConnectedHeight();
                    curConnectedArea.areaWidth = 1;
                }
            }
        }

        if(curConnectedArea.areaWidth != -1) {
            connectedAreaResult.push(curConnectedArea);
        }

        return connectedAreaResult;
    },

    clearArea: function (oneArea, connectedAreaResult) {
        var leftCoordinates = [];
        for(var cooIndex = 0; cooIndex < oneArea.length; cooIndex++) {
            var isInConnectedArea = false;
            var curCoordinate = oneArea[cooIndex];
            for(var areaIndex = 0; areaIndex < connectedAreaResult.length; areaIndex++) {
                var curConnectedArea = connectedAreaResult[areaIndex];
                if(curCoordinate.col >= curConnectedArea.col && curCoordinate.col <= (curConnectedArea.col + curConnectedArea.areaWidth)
                && curCoordinate.row >= curConnectedArea.row && curCoordinate.row <= (curConnectedArea.row + curConnectedArea.areaHeight)) {
                    isInConnectedArea = true;
                }
            }

            if(!isInConnectedArea) {
                leftCoordinates.push(curCoordinate);
            }
        }

        return leftCoordinates;
    },

    onShowConnectedArea: function () {
        this.showConnectedSprite();

        this.runAction(cc.sequence(cc.delayTime(this.SHOW_CONNECTED_AREA_STEP_TIME), cc.callFunc(this.onShowConnectedAreaEnd, this)));
    },

    showConnectedSprite: function () {
        for(var i = 0; i < this.checkConnectedIds.length; i++) {
            var symbolId = this.checkConnectedIds[i];
            var oneConnectedAreas = this.connectedAreas[symbolId];
            for(var index = 0; index < oneConnectedAreas.length; index++) {
                this.showConnectedSpriteFromLeftBottom(oneConnectedAreas[index], symbolId);
            }
        }
    },

    showConnectedSpriteFromLeftBottom: function (connectedAreas, symbolId) {
        var whiteColor = cc.color(255, 255, 255, 255);
        var leftBottomSymbolPos = this.getSymbolPos(connectedAreas.col, connectedAreas.row);
        var leftBottomPos = cc.p(leftBottomSymbolPos.x - this.gridWidth * 0.5, leftBottomSymbolPos.y - this.gridHeight * 0.5);
        var rightUpPos = cc.p(leftBottomSymbolPos.x + (connectedAreas.areaWidth - 0.5) * this.gridWidth + (connectedAreas.areaWidth - 1) * this.gapWidth, leftBottomSymbolPos.y + (connectedAreas.areaHeight - 0.5) * this.gridHeight);

        var clipStencil = new cc.DrawNode();
        clipStencil.ignoreAnchorPointForPosition = false;
        clipStencil.setAnchorPoint(cc.p(0, 0));
        clipStencil.setPosition(cc.p(leftBottomPos.x, leftBottomPos.y));
        clipStencil.drawRect(cc.p(0,0), cc.p(rightUpPos.x - leftBottomPos.x, rightUpPos.y - leftBottomPos.y), whiteColor, 1, whiteColor);

        var connectedNode = new cc.ClippingNode(clipStencil);
        connectedNode.getStencil().setScale(0);
        connectedNode.getStencil().runAction(cc.scaleTo(this.SHOW_CONNECTED_AREA_TIME, 1.0));
        this.connectedSymbolNode.addChild(connectedNode);

        var connectedSprite = this.getConnectedNode(symbolId);
        connectedSprite.setAnchorPoint(cc.p(0.5 - (connectedAreas.areaWidth * this.panelConfig.slotsWidth / connectedSprite.width) * 0.5, 1.0 - connectedAreas.areaHeight / this.panelConfig.slotRows));
        connectedSprite.ignoreAnchorPointForPosition = false;
        connectedSprite.setPosition(leftBottomPos);
        connectedSprite.setScale(0);
        connectedSprite.runAction(cc.scaleTo(this.SHOW_CONNECTED_AREA_TIME, 1.0));
        connectedNode.addChild(connectedSprite);

        var framePath = this.getConnectedFramePath(symbolId);
        var connectedFrame = new cc.Scale9Sprite(framePath);
        connectedFrame.setPreferredSize(cc.size(rightUpPos.x - leftBottomPos.x, rightUpPos.y - leftBottomPos.y));
        connectedFrame.ignoreAnchorPointForPosition = false;
        connectedFrame.setAnchorPoint(cc.p(0, 0));
        connectedFrame.setPosition(leftBottomPos);
        connectedFrame.setScale(0);
        connectedFrame.runAction(cc.scaleTo(this.SHOW_CONNECTED_AREA_TIME, 1.0));
        connectedNode.addChild(connectedFrame);
    },

    getConnectedNode: function (symbolId) {
        var resPath = "magic_world/witch/magic_world_witch_l.png";
        var connectedNode = new cc.Sprite(resPath);
        return connectedNode;
    },

    getConnectedFramePath: function (symbolId) {
        return "magic_world/common/symbol/magic_world_kuang_1.png";
    },

    blinkSymbol: function (localCol, localRow) {
        if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) {
            return;
        }

        var curSymbolId = this.getSpinResult(localCol, localRow);
        if (this.isGeneratedSymbol(localCol, localRow)) {
            curSymbolId = this.getGenSymbol(localCol, localRow);
        }

        var symbolConfig = this.subjectTmpl.getSymbol(curSymbolId);
        if (symbolConfig.animName.length > 0 || symbolConfig.animEffect != SymbolAnimEffect.SYMBOL_ANIM_EFFECT_NONE) {
            var symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
            if (symbolSprite == null) return;

            symbolSprite.setVisible(false);

            //Create anim node
            /**
            * @type {cc.Node}
            */
                var animNode = null;
                if(symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_EFFECT_SPINE) {
                    animNode = this.getSpineSymbolNode(symbolConfig);
                }
                else if(symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_COMMON_CCB_BLINK) {
                    animNode = Util.loadNodeFromCCB(symbolConfig.animFile, null);
                    var spriteNode = animNode.getChildByTag(3);
                    var spriteNodeL = animNode.getChildByTag(4);
                    if(spriteNode) {
                        spriteNode.setSpriteFrame(symbolConfig.imgName);
                    }
                    if(spriteNodeL) {
                        spriteNodeL.setSpriteFrame(symbolConfig.imgName);
                    }
            }
            else {
                animNode = this.getBlinkSymbolNode(symbolConfig);
            }

            //Set anim position
            var orgNodeX = symbolSprite.x;
            var orgNodeY = symbolSprite.y;
            if (symbolSprite.getAnchorPoint().x != 0.5) {
                orgNodeX += symbolSprite.getContentSize().width * (0.5 - symbolSprite.getAnchorPoint().x);
            }
            if (symbolSprite.getAnchorPoint().y != 0.5) {
                orgNodeY += symbolSprite.getContentSize().height * (0.5 - symbolSprite.getAnchorPoint().y);
            }
            animNode.setPosition(orgNodeX, orgNodeY);
            animNode.setScale(symbolConfig.sX, symbolConfig.sY);
            animNode.zIndex = this.panelConfig.slotRows - localRow;
            this.animsNode.addChild(animNode);

            //Play anim effect
            var animEffectAction = null;
            if (symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_EFFECT_FLIP) {
                animEffectAction = cc.repeatForever(cc.sequence(cc.scaleTo(0.5, -1.1, 1.1), cc.scaleTo(0.5, 1.0, 1.0)));
            }
            else if (symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_EFFECT_BLINK) {
                animEffectAction = cc.repeatForever(cc.sequence(cc.fadeTo(0.25, 60.0), cc.fadeTo(0.55, 255), cc.delayTime(0.2)));
            }
            else if (symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_EFFECT_SCALE) {
                animEffectAction = cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 0.75, 0.75), cc.scaleTo(0.4, 1.0, 1.0), cc.delayTime(0.2)));
            }
            else if (symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_EFFECT_FLIP_AROUND) {
                animEffectAction = cc.repeatForever(cc.orbitCamera(1.0, 1.0, 0.0, 0.0, 360.0, 0.0, 0.0));
            }
            else if (symbolConfig.animEffect == SymbolAnimEffect.SYMBOL_ANIM_EFFECT_IDLE) {
                var s1 = cc.scaleTo(0.08, 0.980, 1.031);
                var s2 = cc.scaleTo(0.22, 0.987, 1.020);
                var s3 = cc.scaleTo(0.08, 1.020, 0.987);
                var s4 = cc.scaleTo(0.12, 1.013, 0.980);
                var s5 = cc.scaleTo(0.08, 0.980, 1.031);
                var seq = cc.sequence(s1, s2, s3, s4, s5);
                animEffectAction = cc.repeatForever(seq);
            }
            if (animEffectAction != null) {
                animNode.runAction(animEffectAction);
            }
        }
    },

    getWinFrameNode: function (localCol, localRow, color) {
        var frameNode = null;
        var symbolId = this.getSpinResult(localCol, localRow);
        if(!this.isFullGridSymbol(symbolId, localCol, localRow)) return frameNode;

        var frameColor = new cc.Color(0, 228, 255);
        if(SlotMan.getCurrent().taskId != 0) {
            var taskConfig = TaskConfigMan.getInstance().getTaskConfig(SlotMan.getCurrent().taskId);
            if(taskConfig) {
                frameColor = this.getWinFrameNodeColor(taskConfig.resGroup);
            }
        }
        else {
            frameColor = this.getWinFrameNodeColor(this.subjectTmpl.slotTheme);
        }

        if (this.panelConfig.winFrameName) {
            frameNode = new cc.Sprite(this.panelConfig.winFrameName);
            frameNode.setColor(color);
        }
        else if (this.panelConfig.winFrameAnimName) {
            frameNode = Util.loadNodeFromCCB(this.panelConfig.winFrameAnimName, null);
            var bgSprite = frameNode.getChildByTag(3);
            bgSprite.setColor(frameColor);
        }

        if (frameNode) {
            frameNode.setPosition(this.getSymbolPos(localCol, localRow));
            frameNode.setScale(this.panelConfig.winFrameSX, this.panelConfig.winFrameSY);
        }

        return frameNode;
    },


    getWinFrameBgNode: function (localCol, localRow, color) {
        var frameBgNode = null;
        var symbolId = this.getSpinResult(localCol, localRow);
        if(this.isFullGridSymbol(symbolId, localCol, localRow)) return frameBgNode;

        var frameColor = new cc.Color(0, 228, 255);
        if(SlotMan.getCurrent().taskId != 0) {
            var taskConfig = TaskConfigMan.getInstance().getTaskConfig(SlotMan.getCurrent().taskId);
            if(taskConfig) {
                frameColor = this.getWinFrameNodeColor(taskConfig.resGroup);
            }
        }
        else {
            frameColor = this.getWinFrameNodeColor(this.subjectTmpl.slotTheme);
        }

        frameBgNode = Util.loadNodeFromCCB("magic_world/common/winframe/win_frame_2.ccbi", null);
        var bgSprite = frameBgNode.getChildByTag(3);
        bgSprite.setColor(frameColor);

        if (frameBgNode) {
            frameBgNode.setPosition(this.getSymbolPos(localCol, localRow));
            frameBgNode.setScale(this.panelConfig.winFrameSX, this.panelConfig.winFrameSY);
        }

        return frameBgNode;
    },

    isFullGridSymbol: function (symbolId, localCol, localRow) {
        if(symbolId == 1 || symbolId == 2 || (symbolId >= 1000 && symbolId <= 1001)) {
            return true;
        }
        return false;
    },

    getWinFrameNodeColor: function (resGroup) {
        var bgColor = new cc.Color(0, 228, 255);
        switch(resGroup) {
            case SlotTheme.SLOT_THEME_CASTLE:
                bgColor = new cc.Color(255, 192, 0);
                break;
            case SlotTheme.SLOT_THEME_FOREST:
                bgColor = new cc.Color(42, 255, 0);
                break;
            case SlotTheme.SLOT_THEME_VILLAGE:
                bgColor = new cc.Color(255, 253, 115);
                break;
            case SlotTheme.SLOT_THEME_SNOW:
                bgColor = new cc.Color(0, 255, 246);
                break;
            case SlotTheme.SLOT_THEME_VOLCANO:
                bgColor = new cc.Color(255, 133, 59);
                break;
            default:
                break;
        }
        return bgColor;
    }
});

module.exports = VideoSpinLayer;