var SpinState = require("../enum/SpinState");
var SlotConfigMan = require("../config/SlotConfigMan");
var Direction = require("../enum/Direction");
var DrumMode = require("../enum/DrumMode");
var SymbolId = require("../enum/SymbolId");
var Coordinate = require("../entity/Coordinate");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var SymbolOpType = require("../enum/SymbolOpType");
var Util = require("../../common/util/Util");
var SlotEvent = require("../events/SlotEvent");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var SlotSpinStepEndUserData = require("../events/SlotSpinStepEndUserData");
var SlotOutputUserData = require("../events/SlotOutputUserData");
var EventDispatcher = require("../../common/events/EventDispatcher");
var ThemeName = require("../../common/enum/ThemeName");
var SlotMan = require("../model/SlotMan");
var TaskConfigMan = require("../../task/config/TaskConfigMan");

/**
 * Created by alanmars on 15/4/14.
 * @class
 * @extends cc.Layer
 */
var SpinLayer = cc.Layer.extend({
    DRUM_MODE_EFFECT_NODE_TAG: 9,
    SPIN_ACCEL: 10000 * 2,
    SPIN_SPEED_STEADY: 1600 * 2,
    SPIN_DECEL: -6000 * 2,
    SPIN_SPEED_DECEL: 200 * 2,
    SPIN_EASE_IN_DECEL_DOWN: -50 * 2,
    SPIN_SPEED_EASE_IN_DOWN: 165 * 2,
    SPIN_EASE_IN_DECEL_UP: -80 * 2,
    SPIN_SPEED_EASE_IN_UP: 150 * 2,
    SPIN_SYMBOL_ROWS: 18,

    ZORDER_SYMBOL_NODE: 1,
    ZORDER_REEL_NODE: 5,
    ZORDER_OVERLAY_NODE: 10,
    ZORDER_LINE_NODE: 20,
    ZORDER_FRAMES_BG_NODE: 25,
    ZORDER_ANIMS_NODE: 30,
    ZORDER_CONNECTED_SYMBOL_NODE: 35,
    ZORDER_FRAMES_NODE: 40,
    ZORDER_SYMBOL_UNBATCH_NODE: 50,
    ZORDER_FRONT_NODE: 100,
    ZORDER_BLINK_ALL_LINE: 110,
    ZORDER_DRUM_MODE_NODE: 120,

    LINE_OFFSET: 10,

    /**
     * @type {SubjectTmpl}
     */
    subjectTmpl: null,
    spinPanelId: -1,
    /**
     * @type {SubjectPanel}
     */
    panelConfig: null,
    rowShift: 0,
    colShift: 0,
    gridWidth: 0,
    gridHeight: 0,
    gapWidth: 0,
    maxSymbolSize: 0,
    eachRowCounts: [],

    //UI
    /**
     * @type {cc.Node}
     */
    columnBgNode: null,
    /**
     * @type {cc.Node}
     */
    spinBoardNode: null,
    /**
     * @type {cc.Node}
     */
    linesNode: null,
    /**
     * @type {cc.Node}
     */
    symbolsNodes: null,
    /**
     * @type {cc.Node}
     */
    overlayNode: null,
    /**
     * @type {cc.Node}
     */
    animsNode: null,
    /**
     * @type {cc.Node}
     */
    connectedSymbolNode: null,
    /**
     * @type {cc.Node}
     */
    framesNode: null,
    framesBgNode: null,
    /**
     * @type {cc.Node}
     */
    symbolUnBatchNode: null,
    /**
     * @type {cc.Node}
     */
    frontNode: null,

    //Spin Logic
    viewRowCount: 0,
    activeSymbols: null,           //CCNode[][]    column first
    direction: null,               //-1 from top to bottom; 1 from bottom to top
    accel: null,
    speed: null,
    distance: null,                //has direction
    spinState: null,
    updateEnabled: false,
    spinEnabled: false,

    //Drum Mode
    /**
     * @type {Array.<number>}
     */
    drumModeSpinRows: null,
    hasBonus: false,
    drumModeState: null,
    /**
     * @type {cc.Node}
     */
    drumModeEffectNode: null,

    isInFreeSpin: false,
    isEarlyStop: false,

    /**
     * @type {Array.<cc.DrawNode>}
     */
    lineNodeArray: null,
    /**
     * @type {SpinPanel}
     */
    spinPanel: null,

    /**
     *
     * @param {number} subjectTmplId
     * @param {number} panelId
     */
    ctor: function (subjectTmplId, panelId) {
        this._super();
        this.spinPanelId = panelId;
        this.subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subjectTmplId);

        this.initData();
        this.initUI();
        this.initSymbols();
        this.initLines();
    },

    initData: function () {
        this.panelConfig = this.subjectTmpl.panels[this.spinPanelId];
        this.colShift = this.panelConfig.colShift;
        this.rowShift = this.panelConfig.rowShift;
        this.eachRowCounts = this.panelConfig.eachRowCounts;

        var slotRows = this.panelConfig.slotRows;
        var slotCols = this.panelConfig.slotCols;

        this.gridWidth = this.panelConfig.slotsWidth;
        this.gridHeight = this.panelConfig.spinRegion.height / slotRows;
        if (slotCols > 1) {
            this.gapWidth = (this.panelConfig.spinRegion.width - slotCols * this.gridWidth) / (slotCols - 1);
        } else {
            this.gapWidth = 0;
        }

        this.viewRowCount = slotRows + 1;
        this.activeSymbols = [];
        this.direction = [];
        this.spinState = [];
        this.accel = [];
        this.speed = [];
        this.distance = [];
        this.drumModeSpinRows = [];
        for (var i = 0; i < slotCols; ++i) {
            this.activeSymbols[i] = [];
            this.direction[i] = Direction.DIRECTION_DOWN;
            this.spinState[i] = SpinState.SPIN_STATE_INVALID;
            this.accel[i] = 0;
            this.speed[i] = 0;
            this.distance[i] = 0;
            this.drumModeSpinRows[i] = DrumMode.DRUM_MODE_NULL;
        }
        this.updateEnabled = false;
        this.spinEnabled = true;

        this.isInFreeSpin = false;
        this.isEarlyStop = false;

        this.initExtraData();
    },

    initExtraData: function () {
    },

    initUI: function () {
        cc.spriteFrameCache.addSpriteFrames(this.subjectTmpl.symbolBatchPlistPath, this.subjectTmpl.symbolBatchName);
        cc.spriteFrameCache.addSpriteFrames(this.subjectTmpl.commonSymbolBatchPlistPath, this.subjectTmpl.commonSymbolBatchName);
        var spinRegion = this.panelConfig.spinRegion;

        this.columnBgNode = new cc.Node();
        this.addChild(this.columnBgNode);

        this.spinBoardNode = new cc.Node();
        this.addChild(this.spinBoardNode);

        var whiteColor = cc.color(255, 255, 255, 255);
        this.symbolsNodes = [];
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            var clipStencil = new cc.DrawNode();
            clipStencil.drawRect(cc.p(0, spinRegion.y + this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5),
                                 cc.p(cc.winSize.width + 500, spinRegion.y + spinRegion.height - this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5),
                                 whiteColor, 1, whiteColor);
            var symbolsNode = new cc.ClippingNode(clipStencil);
            this.spinBoardNode.addChild(symbolsNode, this.ZORDER_SYMBOL_NODE);
            this.symbolsNodes.push(symbolsNode);
        }

        var reelNode;
        if(SlotMan.getCurrent().taskId != 0) {
            var taskConfig = TaskConfigMan.getInstance().getTaskConfig(SlotMan.getCurrent().taskId);
            if(taskConfig) {
                var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
                var reelName = Util.sprintf("%s/%s/bg/%s", this.subjectTmpl.resRootDir, this.subjectTmpl.reelDir, themeConfig.wheelFrame);
                reelNode = new cc.Sprite(reelName);
                reelNode.x = spinRegion.x + spinRegion.width * 0.5;
                reelNode.y = spinRegion.y + spinRegion.height * 0.5;
                this.spinBoardNode.addChild(reelNode, this.ZORDER_REEL_NODE);
            }
        }
        else {
            if (this.subjectTmpl.reelName) {
                reelNode = new cc.Sprite(this.subjectTmpl.reelName);
                reelNode.x = spinRegion.x + spinRegion.width * 0.5;
                reelNode.y = spinRegion.y + spinRegion.height * 0.5;
                this.spinBoardNode.addChild(reelNode, this.ZORDER_REEL_NODE);
            }
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
    },

    initSymbols: function () {
    },

    initLines: function () {
        var lineOffsetList = this.genLineOffset();
        var LineDrawNode = require("../../common/view/LineDrawNode");
        this.lineNodeArray = [];
        for (var i = 0; i < this.getLineCount(); ++i) {
            var lineConfig = this.getLine(i);
            var lineNode = new cc.DrawNode();
            var lineWidth = 3;
            //var lineNode = new LineDrawNode();
            //var lineWidth = 3;
            var offsetX = lineOffsetList[i].x * this.LINE_OFFSET;
            var offsetY = lineOffsetList[i].y * this.LINE_OFFSET;

            var pos1 = this.getSymbolPos(0, lineConfig.rows[0]);
            pos1 = cc.p(pos1.x + offsetX, pos1.y + offsetY);
            var pos0 = cc.p(pos1.x - this.gridWidth * 0.5 - offsetX, pos1.y);

            //lineNode.drawSegment(pos0, pos1, lineWidth, lineConfig.color);
            var savePos = pos1;

            var path = [];
            //
            path.push(pos0);
            path.push(pos1);

            for (var col = 0; col < this.panelConfig.slotCols - 1; ++col) {
                var middlePos = this.getSymbolPos(col + 1, lineConfig.rows[col + 1]);
                middlePos = cc.p(middlePos.x + offsetX, middlePos.y + offsetY);
               // lineNode.drawSegment(savePos, middlePos, lineWidth, lineConfig.color);
                savePos = middlePos;
                path.push(middlePos);
            }

            var lastPos = this.getSymbolPos(this.panelConfig.slotCols - 1, lineConfig.rows[this.panelConfig.slotCols - 1]);
            lastPos = cc.p(lastPos.x + this.gridWidth * 0.5, lastPos.y + offsetY);

            //lineNode.drawSegment(savePos, lastPos, lineWidth, lineConfig.color);

            path.push(cc.p(lastPos.x, lastPos.y));

            var lineColor = new cc.Color(0, 228, 255);
            if(SlotMan.getCurrent().taskId != 0) {
               var taskConfig = TaskConfigMan.getInstance().getTaskConfig(SlotMan.getCurrent().taskId);
               if(taskConfig) {
                   lineColor = this.getLineColor(taskConfig.resGroup);
               }
            }
            else {
               lineColor = this.getLineColor(this.subjectTmpl.slotTheme);
            }

            //lineNode.setLineWidth(lineWidth);
            //lineNode.setColor(lineConfig.color);
            //lineNode.setPath(path);
            var AntialiasingLineNode = require("../../common/effect/AntialiasingLineNode");

            var lineNode = new AntialiasingLineNode(path,4,lineConfig.color);
            lineNode.setVisible(false);
            this.lineNodeArray[i] = lineNode;
            this.linesNode.addChild(lineNode);
        }
    },

    genLineOffset: function () {
        var lineOffsetList = [];
        var halfSideLen = 0;
        var lastPos = cc.p(0, 0);

        lineOffsetList.push(cc.p(0, 0));
        while((halfSideLen * 2 + 1) * (halfSideLen * 2 + 1) < this.getLineCount()) {
            halfSideLen++;
            lastPos = cc.p(-(halfSideLen - 1), halfSideLen);
            lineOffsetList.push(lastPos);
            var i = 0;
            for(i = 0; i < (halfSideLen * 2 - 1); i++) {
                lastPos = cc.p(lastPos.x + 1, lastPos.y);
                lineOffsetList.push(lastPos);
            }
            for(i = 0; i < halfSideLen * 2; i++) {
                lastPos = cc.p(lastPos.x, lastPos.y - 1);
                lineOffsetList.push(lastPos);
            }
            for(i = 0; i < halfSideLen * 2; i++) {
                lastPos = cc.p(lastPos.x - 1, lastPos.y);
                lineOffsetList.push(lastPos);
            }
            for(i = 0; i < halfSideLen * 2; i++) {
                lastPos = cc.p(lastPos.x, lastPos.y + 1);
                lineOffsetList.push(lastPos);
            }
        }

        return lineOffsetList;
    },

    getLineColor: function (resGroup) {
        var SlotTheme = require("../enum/SlotTheme");
        var lineColor = new cc.Color(0, 228, 255);
        switch(resGroup) {
            case SlotTheme.SLOT_THEME_CASTLE:
                lineColor = new cc.Color(241, 17, 255);
                break;
            case SlotTheme.SLOT_THEME_FOREST:
                lineColor = new cc.Color(42, 255, 0);
                break;
            case SlotTheme.SLOT_THEME_VILLAGE:
                lineColor = new cc.Color(255, 253, 115);
                break;
            case SlotTheme.SLOT_THEME_SNOW:
                lineColor = new cc.Color(0, 228, 255);
                break;
            case SlotTheme.SLOT_THEME_VOLCANO:
                lineColor = new cc.Color(255, 90, 0);
                break;
            default:
                break;
        }
        return lineColor;

    },

    onEnter: function() {
        this._super();

        this.scheduleUpdate();
    },

    onExit: function() {
        this.unscheduleUpdate();

        this._super();
    },

    /**
     * @param {number} localCol
     * @param {number} localViewRow
     * @returns {{x, y}|cc.Point} the position at given (col, row)
     */
    getSymbolPos: function (localCol, localViewRow) {
        var x = this.panelConfig.spinRegion.x + this.gridWidth * (localCol + 0.5) + this.gapWidth * localCol;
        var y = this.panelConfig.spinRegion.y + this.gridHeight * (localViewRow + 0.5) + this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[localCol]) * 0.5;
        return cc.p(x, y);
    },

    /**
     * @param {number} lineIndex
     * @returns {*|Line}
     */
    getLine: function (lineIndex) {
        return this.subjectTmpl.getLine(0, lineIndex);
    },

    /**
     * @returns {*|Number}
     */
    getLineCount: function () {
        return this.subjectTmpl.getLineCount(0);
    },

    /**
     * @param col
     * @param viewRow
     * @returns {*}
     */
    getPrevModelRow: function (localCol, viewRow) {
        return viewRow;
    },

    /**
     * @param {number} localCol
     * @param {number} viewRow
     * @returns {number} this row in the model at given (col, view row)
     */
    getModelRow: function (localCol, viewRow) {
        return viewRow;
    },

    /**
     * @param localCol
     * @returns {{x, y}|cc.Point}
     */
    getDrumModePos: function (localCol) {
        var x = this.panelConfig.spinRegion.x + (localCol + 0.25) * this.gapWidth + (localCol + 0.5) * this.gridWidth;
        var y = this.panelConfig.spinRegion.y + this.panelConfig.spinRegion.height * 0.5;
        return cc.p(x, y);
    },

    /**
     * @param {number} localCol
     * @param {number} viewRow
     * @param {cc.Sprite} symbolSprite
     */
    setActiveSymbol: function (localCol, viewRow, symbolSprite) {
        var modelRow = this.getModelRow(localCol, viewRow);
        var oldSymbolSprite = this.activeSymbols[localCol][modelRow];
        if (oldSymbolSprite != null) {
            this.givebackSymbolSprite(oldSymbolSprite);
        }
        this.activeSymbols[localCol][modelRow] = symbolSprite;
    },

    getActiveSymbol: function (localCol, localViewRow) {
        var modelRow = this.getModelRow(localCol, localViewRow);
        return this.activeSymbols[localCol][modelRow];
    },

    getActiveConsecutiveSymbol: function (localCol, viewRow) {
        return this.getActiveSymbol(localCol, viewRow);
    },

    /**
     * @param localCol
     * @param viewRow
     * @param symbolId
     * @returns {cc.Sprite}
     */
    getSymbolSprite: function (localCol, viewRow, symbolId) {
        var symbol = this.subjectTmpl.getSymbol(symbolId);
        if (!symbol) {
            cc.log(Util.sprintf("Symbol(%d) is invalid!", symbolId));
            return null;
        }
        var result = null;
        if (cc.path.extname(symbol.imgName) !== ".ccbi") {
            result = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(symbol.imgName));
        }
        else {
            result = Util.loadNodeFromCCB(symbol.imgName, null);
            result = this.setSymbolCCBParam(result, symbolId);
        }

        if (!result) {
            return null;
        }

        if (this.direction[localCol] == Direction.DIRECTION_UP) {
            viewRow = -1;
        }
        var symbolPos = this.getSymbolPos(localCol, viewRow);
        result.setPosition(symbolPos);
        var anchorPointX = 1.0 / symbol.symbolW * 0.5;
        var anchorPointY;
        if (this.direction[localCol] == Direction.DIRECTION_DOWN) {
            anchorPointY = 1.0 - 1.0 / symbol.symbolH * 0.5;
        } else {
            anchorPointY = 1.0 / symbol.symbolH * 0.5;
        }
        result.setAnchorPoint(cc.p(anchorPointX, anchorPointY));
        result.setScale(symbol.sX, symbol.sY);
        result.setVisible(true);
        return result;
    },

    addSymbolSprite: function (localCol, viewRow, symbolId) {
        var symbolSprite = this.getSymbolSprite(localCol, viewRow, symbolId);
        if (symbolSprite) {
            if (symbolSprite.getParent() != this.symbolsNodes[localCol]) {
                symbolSprite.retain();
                symbolSprite.removeFromParent(false);
                this.symbolsNodes[localCol].addChild(symbolSprite);
                symbolSprite.release();
            }
        }
        return symbolSprite;
    },

    setSymbolCCBParam: function (symbolNode, symbolId) {
        return symbolNode;
    },

    /**
     * @param {cc.Sprite} symbolSprite
     */
    givebackSymbolSprite: function (symbolSprite) {
        symbolSprite.removeFromParent(true);
    },

    /**
     * @param {SpinPanel} spinPanel
     */
    onSpinResultReceived: function (spinPanel) {
        this.spinPanel = spinPanel;
    },

    /**
     * @param {Array.<number>} rowCountArray
     */
    setSpinRowCounWhenResultReceived: function (rowCountArray) {
    },

    /**
     * @param {Array.<number>} drum
     * @param {boolean} hasBonus
     */
    setDrumMode: function (drum, hasBonus) {
    },

    /**
     * @param {boolean} value
     */
    setInFreeSpin: function (value) {
        this.isInFreeSpin = value;
    },

    /**
     * @param {boolean} value
     */
    setEarlyStop: function (value) {
        this.isEarlyStop = value;
    },

    /**
     * @param {number} localCol
     * @returns {number}
     */
    getSkipRowCountWhenSpinCompleted: function (localCol) {
        return 0;
    },

    updateReelShift: function (colShift, rowShift) {
        this.colShift = colShift;
        this.rowShift = rowShift;
    },

    resetColumnBg: function (isFreeSpin, isAnimation) {
        var bgName;
        if(SlotMan.getCurrent().taskId != 0) {
            var taskConfig = TaskConfigMan.getInstance().getTaskConfig(SlotMan.getCurrent().taskId);
            if(taskConfig) {
                var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
                bgName = Util.sprintf("%s/%s/bg/%s", this.subjectTmpl.resRootDir, this.subjectTmpl.reelDir, themeConfig.columnNormalBg);
            }
        }
        else {
            if (isFreeSpin) {
                if (this.panelConfig.columnFreeSpinBg) {
                    bgName = this.panelConfig.columnFreeSpinBg;
                }
            } else {
                if (this.panelConfig.columnNormalBg) {
                    bgName = this.panelConfig.columnNormalBg;
                }
            }
        }

        if (bgName) {
            this.removeColumnBgs();
            for (var col = 0; col < this.panelConfig.slotCols; ++col) {
                var columnBg = new cc.Sprite(bgName);
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

    removeColumnBgs: function () {
        this.columnBgNode.removeAllChildren(true);
    },

    cleanBetResultEffects: function () {
        this.stopBetResultEffects();
        this.hideAllLines();
        this.animsNode.removeAllChildren(true);
        this.framesNode.removeAllChildren(true);
        this.framesBgNode.removeAllChildren(true);
    },

    onRoundStart: function () {
    },

    onSubRoundStart: function () {
        this.isEarlyStop = false;
        for (var i = 0; i < this.drumModeSpinRows.length; ++i) {
            this.drumModeSpinRows[i] = DrumMode.DRUM_MODE_NULL;
        }
        this.cleanBetResultEffects();
    },

    onSpinStart: function () {
        this.updateEnabled = true;
    },

    onSpinEnd: function () {
        this.updateEnabled = false;
        for (var i = 0; i < this.drumModeSpinRows.length; ++i) {
            this.drumModeSpinRows[i] = DrumMode.DRUM_MODE_NULL;
        }
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_SPIN_END);
    },

    onSubRoundEnd: function () {
    },

    onRoundEnd: function () {
    },

    onSpecialAnimation: function () {
        this.onSpecialAnimationEnd();
    },

    onSpecialAnimationEnd: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_SPECIAL_ANIMATION_END);
    },

    onShowConnectedArea: function () {
    },

    onShowConnectedAreaEnd: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_SHOW_CONNECTED_AREA_END);
    },

    blinkAllWinLines: function () {
        this.linesNode.zIndex = this.ZORDER_BLINK_ALL_LINE;
        var winLines = this.getNormalWinLines();
        for (var i = 0; i < winLines.length; ++i) {
            var winLine = winLines[i];
            this.lineNodeArray[winLine.lineIndex].setVisible(true);
        }
        this.linesNode.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(this.hideAllLines, this), cc.callFunc(this.onBlinkAllWinLinesCompleted, this)));
    },

    onBlinkAllWinLinesCompleted: function () {
    },

    showSpecialTaskAnimation: function () {
        this.onShowSpecialTaskAnimationEnd();
    },

    onShowSpecialTaskAnimationEnd: function () {
        this.overlayNode.visible = false;
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_SHOW_SPECIAL_TASK_ANIMATION_END);
    },

    blinkWinLineInTurn: function () {
    },

    getMatchSymbolInLine: function (winLineIndex) {
        var winLine = this.getNormalWinLine(winLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);

        var globalCol = 0;
        var globalRow = lineConfig.rows[0];
        var localCol = this.globalColToLocal(globalCol);
        var localRow = this.globalRowToLocal(globalRow);

        var matchSymbolId = this.getGlobalRealSpinResult(globalCol, globalRow);
        var symbolConfig = this.subjectTmpl.getSymbol(matchSymbolId);
        var matchSymbolValue = symbolConfig.symbolValue;
        if (this.isGeneratedSymbol(localCol, localRow)) {
            matchSymbolId = this.getGenSymbol(localCol, localRow);
        }

        for (globalCol = 0; globalCol < winLine.num; ++globalCol) {
            globalRow = lineConfig.rows[globalCol];
            localCol = this.globalColToLocal(globalCol);
            localRow = this.globalRowToLocal(globalRow);
            var curSymbolId = this.getGlobalRealSpinResult(globalCol, globalRow);
            symbolConfig = this.subjectTmpl.getSymbol(curSymbolId);
            if (this.isGeneratedSymbol(localCol, localRow)) {
                curSymbolId = this.getGenSymbol(localCol, localRow);
            }

            if (SymbolId.isWild(matchSymbolValue) && !SymbolId.isWild(symbolConfig.symbolValue) && matchSymbolValue != symbolConfig.symbolValue) {
                matchSymbolId = curSymbolId;
            }
        }

        return matchSymbolId;
    },

    blinkWinFrameInLine: function (winLineIndex) {
        var winLine = this.getNormalWinLine(winLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);
        var symbolNum = 0;
        if (lineConfig) {
            symbolNum = winLine.num;
        }

        for (var globalCol = this.colShift; globalCol < symbolNum && globalCol < (this.colShift + this.panelConfig.slotCols); ++globalCol) {
            var globalRow = lineConfig.rows[globalCol];
            var localCol = this.globalColToLocal(globalCol);
            var localRow = this.globalRowToLocal(globalRow);
            var frameNode = this.getWinFrameNode(localCol, localRow, lineConfig.color);
            if (frameNode) {
                this.framesNode.addChild(frameNode);
                frameNode.runAction(cc.sequence(cc.delayTime(3.0), cc.hide(), cc.removeSelf(true)));
            }
        }
    },

    blinkWinFrameBgInLine: function (winLineIndex) {
        var winLine = this.getNormalWinLine(winLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);
        var symbolNum = 0;
        if (lineConfig) {
            symbolNum = winLine.num;
        }

        for (var globalCol = this.colShift; globalCol < symbolNum && globalCol < (this.colShift + this.panelConfig.slotCols); ++globalCol) {
            var globalRow = lineConfig.rows[globalCol];
            var localCol = this.globalColToLocal(globalCol);
            var localRow = this.globalRowToLocal(globalRow);
            var frameBgNode = this.getWinFrameBgNode(localCol, localRow, lineConfig.color);
            if (frameBgNode) {
                this.framesBgNode.addChild(frameBgNode);
                frameBgNode.runAction(cc.sequence(cc.delayTime(3.0), cc.hide(), cc.removeSelf(true)));
            }
        }
    },

    blinkWinFrameInAllWinLines: function () {
        var result = this.getSymbolsInAllWinLines();
        for (var i = 0; i < result.length; ++i) {
            var localCol = this.globalColToLocal(result[i].col);
            var localRow = this.globalRowToLocal(result[i].row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) continue;

            var frameNode = this.getWinFrameNode(localCol, localRow, cc.color(1.0, 0.0, 0.0, 1.0));
            if (frameNode) {
                this.framesNode.addChild(frameNode);
            }
        }
    },

    blinkWinFrameBgInAllWinLines: function () {
        var result = this.getSymbolsInAllWinLines();
        for (var i = 0; i < result.length; ++i) {
            var localCol = this.globalColToLocal(result[i].col);
            var localRow = this.globalRowToLocal(result[i].row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) continue;

            var frameBgNode = this.getWinFrameBgNode(localCol, localRow, cc.color(1.0, 0.0, 0.0, 1.0));
            if (frameBgNode) {
                this.framesBgNode.addChild(frameBgNode);
            }
        }
    },

    getWinFrameNode: function (localCol, localRow, color) {
        var frameNode = null;
        return frameNode;
    },

    getWinFrameBgNode: function (localCol, localRow, color) {
        return null;
    },

    blinkSymbolsInLine: function (winLineIndex) {
        var winLine = this.getNormalWinLine(winLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);

        var symbolNum = 0;
        if (lineConfig != null) {
            symbolNum = winLine.num;
        }

        for (var globalCol = this.colShift; globalCol < symbolNum && globalCol < (this.colShift + this.panelConfig.slotCols); ++globalCol) {
            var globalRow = lineConfig.rows[globalCol];
            var symbolId = this.getGlobalSpinResult(globalCol, globalRow);
            if (symbolId == SymbolId.SYMBOL_ID_FILL) {
                continue;
            }
            var localCol = this.globalColToLocal(globalCol);
            var localRow = this.globalRowToLocal(globalRow);
            this.blinkSymbol(localCol, localRow);
        }
    },

    /**
     * @param {Array.<number>} cols
     * @param {boolean} showFrame
     */
    blinkSymbolInCols: function (cols, showFrame) {
        for (var i = 0; i < cols.length; ++i) {
            var globalCol = cols[i];
            for (var globalRow = 0; globalRow < this.subjectTmpl.reelRow; ++globalRow) {
                var localCol = this.globalColToLocal(globalCol);
                var localRow = this.globalRowToLocal(globalRow);
                if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) {
                    continue;
                }
                if (showFrame) {
                    var frameNode = this.getWinFrameNode(localCol, localRow, cc.color(1.0, 0.0, 0.0, 1.0));
                    if (frameNode != null) {
                        this.framesNode.addChild(frameNode);
                    }
                }
                this.blinkSymbol(localCol, localRow);
            }
        }
    },

    /**
     * @param {Array.<number>} globalCols
     */
    blinkSymbolInColsEnd: function (globalCols) {
        for (var i = 0; i < globalCols.length; ++i) {
            var globalCol = globalCols[i];
            for (var globalRow = 0; globalRow < this.subjectTmpl.reelRow; ++globalRow) {
                var localCol = this.globalColToLocal(globalCol);
                var localRow = this.globalRowToLocal(globalRow);
                if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) {
                    continue;
                }
                var symbolSprite = this.getActiveSymbol(localCol, localRow);
                if (symbolSprite != null) {
                    symbolSprite.setVisible(true);
                }
            }
        }
    },

    blinkSymbolInAllWinLines: function () {
        var result = this.getSymbolsInAllWinLines();
        for (var i = 0; i < result.length; ++i) {
            var localCol = this.globalColToLocal(result[i].col);
            var localRow = this.globalRowToLocal(result[i].row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) continue;

            this.blinkSymbol(localCol, localRow);
        }
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

        return result;
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

    /**
     * @param {Symbol} symbolConfig
     * @returns {cc.Node}
     */
    getBlinkSymbolNode: function (symbolConfig) {
        var animNode;
        var isCCBAnim = symbolConfig.animName.lastIndexOf("ccbi") != -1;
        if (isCCBAnim) {
            animNode = Util.loadNodeFromCCB(symbolConfig.animName, null);
        } else {
            animNode = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(symbolConfig.imgName));
        }
        return animNode;
    },

    getSpineSymbolNode: function (symbolConfig) {
        var animNode = Util.loadSpineAnim(symbolConfig.animName, symbolConfig.spineSkin, symbolConfig.spineAnim);
        return animNode;
    },

    getJackpotSymbolValue: function () {
        return SymbolId.SYMBOL_ID_JACKPOT;
    },

    blinkAllJackpotSymbol: function () {
        var jackpotSymbolValue = this.getJackpotSymbolValue();
        var symbolId;
        var symbolConfig;
        var hasJackpotSymbol = false;
        for(var localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
            for(var localRow = 0; localRow < this.panelConfig.slotRows; ++localRow) {
                symbolId = this.getSpinResult(localCol, localRow);
                symbolConfig = this.subjectTmpl.getSymbol(symbolId);
                if(symbolConfig.symbolValue === jackpotSymbolValue) {
                    var symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
                    if (!symbolSprite) return;

                    hasJackpotSymbol = true;
                    symbolSprite.setVisible(false);

                    /**
                     * @type {cc.Node}
                     */
                    var animNode;
                    if (symbolConfig.getJackpotAnimName()) {
                        animNode = Util.loadNodeFromCCB(symbolConfig.getJackpotAnimName(), null);
                    } else {
                        animNode = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(symbolConfig.imgName));
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
                    this.animsNode.addChild(animNode);

                    if (!symbolConfig.getJackpotAnimName()) {
                        var animEffectAction = cc.repeatForever(cc.sequence(cc.fadeTo(0.25, 60.0), cc.fadeTo(0.55, 255), cc.delayTime(0.2)));
                        animNode.runAction(animEffectAction);
                    }
                }
            }
        }

        if (hasJackpotSymbol) {
            this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onBlinkAllJackpotSymbolCompleted, this)));
        } else {
            this.onBlinkAllJackpotSymbolCompleted();
        }
    },

    onBlinkAllJackpotSymbolCompleted: function () {
        this.animsNode.removeAllChildren(true);

        var symbolId;
        var symbolSprite;
        for(var localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
            for(var localRow = 0; localRow < this.panelConfig.slotRows; ++localRow) {
                symbolId = this.getSpinResult(localCol, localRow);
                var symbolConfig = this.subjectTmpl.getSymbol(symbolId);
                if(symbolConfig.symbolValue === this.getJackpotSymbolValue()) {
                    symbolSprite = this.getActiveSymbol(localCol, localRow);
                    if (symbolSprite) {
                        symbolSprite.setVisible(true);
                    }
                }
            }
        }

        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_JACKPOT_END);
    },

    blinkAllBonusLines: function () {
        this.blinkAllBonusLinesNormal();
    },

    blinkAllBonusLinesNormal: function () {
        var bonusSymbolConfig = this.subjectTmpl.getSymbol(SymbolId.SYMBOL_ID_BONUS);
        if (!bonusSymbolConfig || !bonusSymbolConfig.animName) {
            this.onBlinkAllBonusLinesCompletedNormal();
            return;
        }

        var bonusLines = this.getBonusLines();
        for (var i = 0; i < bonusLines.length; ++i) {
            var bonusLine = bonusLines[i];
            var lineIndex = bonusLine.lineIndex;
            var lineConfig = this.getLine(lineIndex);
            this.lineNodeArray[lineIndex].setVisible(true);

            for (var j = 0; j < bonusLine.cols.length; ++j) {
                var globalCol = bonusLine.cols[j];
                var globalRow = lineConfig.rows[globalCol];
                var localCol = this.globalColToLocal(globalCol);
                var localRow = this.globalRowToLocal(globalRow);
                if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) {
                    continue;
                }
                //Win frame
                var frameNode = this.getWinFrameNode(localCol, localRow, lineConfig.color);
                if (frameNode != null) {
                    this.framesNode.addChild(frameNode);
                }
                //Hide symbol sprite
                var symbolSprite = this.getActiveSymbol(localCol, localRow);
                if (symbolSprite == null) {
                    continue;
                }

                this.blinkSymbol(localCol, localRow);
            }
        }

        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onBlinkAllBonusLinesCompletedNormal, this)));
    },

    blinkAllBonusLinesColumn: function () {
        var bonusSymbolConfig = this.subjectTmpl.getSymbol(SymbolId.SYMBOL_ID_BONUS);
        if (!bonusSymbolConfig.animName) {
            this.onBlinkAllBonusLinesCompletedColumn();
            return;
        }

        /**
         * @type { BonusSpinExtraInfo }
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo) {
            this.blinkSymbolInCols(spinExtraInfo.bonusCols, true);
            this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onBlinkAllBonusLinesCompletedColumn, this)));
        }
    },

    onBlinkAllBonusLinesCompletedNormal: function () {
        this.stopBetResultEffects();
        this.hideAllLines();
        this.framesNode.removeAllChildren(true);
        this.framesBgNode.removeAllChildren(true);
        this.animsNode.removeAllChildren(true);

        var globalCol;
        var globalRow;
        var symbolSprite;
        var bonusLines = this.getBonusLines();
        for (var i = 0; i < bonusLines.length; ++i) {
            var bonusLine = bonusLines[i];
            var lineIndex = bonusLine.lineIndex;
            var lineConfig = this.getLine(lineIndex);
            for (var j = 0; j < bonusLine.cols.length; ++j) {
                globalCol = bonusLine.cols[j];
                globalRow = lineConfig.rows[globalCol];
                var localCol = this.globalColToLocal(globalCol);
                var localRow = this.globalRowToLocal(globalRow);
                if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) {
                    continue;
                }
                symbolSprite = this.getActiveSymbol(localCol, localRow);
                if (symbolSprite == null) {
                    continue;
                }
                symbolSprite.setVisible(true);
            }
        }

        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END);
    },

    onBlinkAllBonusLinesCompletedColumn: function () {
        this.stopBetResultEffects();
        this.hideAllLines();
        this.framesNode.removeAllChildren(true);
        this.framesBgNode.removeAllChildren(true);
        this.animsNode.removeAllChildren(true);

        /**
         * @type {BonusSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo) {
            this.blinkSymbolInColsEnd(spinExtraInfo.bonusCols);
        }

        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END);
    },

    blinkAllScatters: function () {
        this.blinkAllScattersNormal();
    },

    blinkAllScattersNormal: function () {
        var scatterSymbol = this.subjectTmpl.getSymbol(SymbolId.SYMBOL_ID_SCATTER);
        if (!scatterSymbol.animName) {
            this.onBlinkAllScattersCompletedNormal();
            return;
        }

        var scatters = this.getScatters();
        for (var i = 0; i < scatters.length; ++i) {
            var coord = scatters[i];
            var localCol = this.globalColToLocal(coord.col);
            var localRow = this.globalRowToLocal(coord.row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) continue;
            var symbolSprite = this.getActiveSymbol(localCol, localRow);
            if (symbolSprite) {
                symbolSprite.setVisible(false);
            }

            this.blinkSymbol(localCol, localRow);
        }

        this.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(this.onBlinkAllScattersCompletedNormal, this)));
    },

    blinkAllScattersColumn: function () {
        var scatterSymbol = this.subjectTmpl.getSymbol(SymbolId.SYMBOL_ID_SCATTER);
        if (!scatterSymbol.animName) {
            this.onBlinkAllScattersCompletedColumn();
            return;
        }

        /**
         * @type {ScatterSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo) {
            this.blinkSymbolInCols(spinExtraInfo.scatterCols, true);
            this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onBlinkAllScattersCompletedColumn, this)));
        }
    },

    onBlinkAllScattersCompletedNormal: function () {
        this.animsNode.removeAllChildren(true);
        var scatters = this.getScatters();
        for (var i = 0; i < scatters.length; ++i) {
            var coord = scatters[i];
            var localCol = this.globalColToLocal(coord.col);
            var localRow = this.globalRowToLocal(coord.row);
            if (localCol >= this.panelConfig.slotCols || localCol < 0 || localRow >= this.panelConfig.slotRows || localRow < 0) {
                continue;
            }
            var symbolSprite = this.getActiveSymbol(localCol, localRow);
            if (symbolSprite != null) {
                symbolSprite.setVisible(true);
            }
        }

        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_SCATTER_END);
    },

    onBlinkAllScattersCompletedColumn: function () {
        this.animsNode.removeAllChildren(true);

        /**
         * @type {ScatterSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo) {
            this.blinkSymbolInColsEnd(spinExtraInfo.scatterCols);
        }

        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_SCATTER_END);
    },

    onColDrumMode: function (localCol) {
    },

    onReelStopEffect: function (localCol) {
    },

    hideAllLines: function () {
        for (var i = 0; i < this.lineNodeArray.length; ++i) {
            this.lineNodeArray[i].setVisible(false);
        }
        this.linesNode.setVisible(true);
    },

    stopBetResultEffects: function () {
        this.linesNode.stopAllActions();
        for (var i = 0; i < this.lineNodeArray.length; ++i) {
            this.lineNodeArray[i].stopAllActions();
        }
    },

    getSpinResult: function (localCol, localRow) {
        var globalCol = this.localColToGlobal(localCol);
        var globalRow = this.localRowToGlobal(localRow);
        return this.spinPanel.panel[globalCol][globalRow];
    },

    getGlobalSpinResult: function (globalCol, globalRow) {
        return this.spinPanel.panel[globalCol][globalRow];
    },

    getGlobalRealSpinResult: function (globalCol, globalRow) {
        for (var i = globalCol; i >= 0; --i) {
            var symbolId = this.getGlobalSpinResult(i, globalRow);
            if (symbolId != SymbolId.SYMBOL_ID_FILL) {
                return symbolId;
            }
        }
        return SymbolId.SYMBOL_ID_FILL;
    },

    getNormalWinLine: function (winLineIndex) {
        return this.spinPanel.winLines[winLineIndex];
    },

    /**
     * @returns {Array.<WinLine>|Array}
     */
    getNormalWinLines: function () {
        return this.spinPanel.winLines;
    },

    getBonusLine: function (lineIndex) {
        /**
         * @type {NormalSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        return spinExtraInfo.bonusLines[lineIndex];
    },

    getBonusLines: function () {
        /**
         * @type {NormalSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        return spinExtraInfo.bonusLines;
    },

    getScatters: function () {
        /**
         * @type {NormalSpinExtraInfo}
         */
        var spinExtraInfo = this.spinPanel.extraInfo;
        return spinExtraInfo.scatters;
    },

    getWildGen: function () {
        return null;
    },

    dispatchSpinStepEndEvent: function (eventSubType) {
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_SPIN_STEP_END, new SlotSpinStepEndUserData(eventSubType, this.panelConfig.panelId));
    },

    localColToGlobal: function (localCol) {
        return localCol + this.colShift;
    },

    globalColToLocal: function (globalCol) {
        return globalCol - this.colShift;
    },

    localRowToGlobal: function (localRow) {
        return localRow + this.rowShift;
    },

    globalRowToLocal: function (globalRow) {
        return globalRow - this.rowShift;
    },

    isGeneratedSymbol: function (localCol, localRow) {
        return false;
    },

    getGenSymbol: function (localCol, localRow) {
        return this.getSpinResult(localCol, localRow);
    },

    /**
     * @param {string} output
     */
    dispatchOutputEvent: function (output) {
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_OUTPUT, new SlotOutputUserData(output));
    },

    randomInconsecutiveSymbolId: function (localCol, subjectTmpl, panelId, isInFreeSpin) {
        var symbolId = SymbolId.SYMBOL_ID_INVALID;
        do
        {
            symbolId = this.randomSymbolIdForCol(localCol, subjectTmpl, panelId, isInFreeSpin);
        }
        while (subjectTmpl.isConsecutiveSymbol(symbolId));
        return symbolId;
    },

    randomStackSymbolId: function (localCol, subjectTmpl, panelId, isInFreeSpin) {
        var symbolId;
        var symbol;
        var found = false;
        do
        {
            symbolId = Util.randomSelect(subjectTmpl.stackSymbols);
            symbol = this.subjectTmpl.getSymbol(symbolId);
            if (this.isSymbolValid(symbol.reelMask, this.localColToGlobal(localCol))) {
                found = true;
            }
        }
        while (!found);
        return symbolId;
    },

    randomSymbolIdWithHeightLimit: function (a_col, subjectTmpl, panelId, isInFreeSpin, heightLimit) {
        var symbolId = SymbolId.SYMBOL_ID_INVALID;
        do
        {
            symbolId = this.randomSymbolIdForCol(a_col, subjectTmpl, panelId, isInFreeSpin);
        }
        while (subjectTmpl.getSymbolHeight(symbolId) > heightLimit);
        return symbolId;
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

            var valid = this.isSymbolValid(mask, globalCol);

            if (valid && symbolId >= SymbolId.SYMBOL_ID_NORMAL_BEGIN) {
                if (!symbol.payTables || Object.keys(symbol.payTables).length === 0) {
                    valid = false;
                }
            }

            if (symbolId == SymbolId.SYMBOL_ID_WILD && subjectTmpl.symbolOpType == SymbolOpType.SYMBOL_OP_TYPE_DART_GEN_WILD) {
                valid = false;
            }

            if (valid) {
                return symbolId;
            }
            else {
                index = (index + 1) % symbolCount;
            }

            ++loopCount;
        }
        return SymbolId.SYMBOL_ID_INVALID;
    },

    isSymbolValid: function (mask, globalCol) {
        return ((mask & (1 << globalCol)) != 0);
    },

    onStartBonusGame: function () {
        this.onBonusGameEnd();
    },

    onBonusGameEnd: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BONUS_RESULT_END);
    }
});

module.exports = SpinLayer;