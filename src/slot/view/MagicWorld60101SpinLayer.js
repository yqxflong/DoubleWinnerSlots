var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var SlotMan = require("../model/SlotMan");
var SymbolId = require("../enum/SymbolId");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var DrumMode = require("../enum/DrumMode");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SpinState = require("../enum/SpinState");
var Line = require("../entity/Line");
var Coordinate = require("../entity/Coordinate");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var ConnectedAreaData = require("../entity/ConnectedAreaData");
var SlotMan = require("../model/SlotMan");
var TaskType = require("../../task/enum/TaskType");
var AudioHelper = require("../../common/util/AudioHelper");
var Util = require("../../common/util/Util");
var TaskBreakChainController = require("../../task/controller/TaskBreakChainController");
var TaskMeltIceController = require("../../task/controller/TaskMeltIceController");
var TaskFireController = require("../../task/controller/TaskFireController");

var MagicWorld60101SpinLayer = SpecialTaskSpinLayer.extend({
    ctor: function (subjectTmplId, panelId) {
        this.lockedRootNode = null;
        this.lockedSymbolIndices = {};
        this.lockedSymbols = [];

        this._super(subjectTmplId, panelId);
    },

    initUI: function () {
        this._super();

        this.lockedRootNode = new cc.Node();
        this.spinBoardNode.addChild(this.lockedRootNode, this.ZORDER_LINE_NODE + 5);
    },

    onSubRoundStart: function () {
        this.isEarlyStop = false;
        for (var i = 0; i < this.drumModeSpinRows.length; ++i) {
            this.drumModeSpinRows[i] = DrumMode.DRUM_MODE_NULL;
        }
        this.cleanBetResultEffects();

        this.generateSymbols();

        //reset symbol sprite
        var col;
        var row;
        var symbolSprite;
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            for (row = 0; row < this.viewRowCount; ++row) {
                symbolSprite = this.getActiveSymbol(col, row);
                if (symbolSprite != null) {
                    symbolSprite.setVisible(true);
                }
            }
        }

        this.restoreActiveSymbols();
        this.reviseSymbols();
        this.setSpinMoveMode();

        this.spinEndColCount = 0;

        this.showedBreakAnim = false;

        var taskInfo = SlotMan.getCurrent().taskInfo;
        if(taskInfo && !cc.isUndefined(taskInfo) && taskInfo.taskType == TaskType.TASK_BREAK_FIRE) {
            for(var i = 0; i < this.fireSymbolCount; i++) {
                this.moveFireSymbols(i);
            }
        }

        if(SlotMan.getCurrent().getSpinPanelLength() <= 1) {
            this.overlayNode.visible = false;
            this.connectedAreas = {};
            this.connectedSymbolNode.removeAllChildren(true);
        }
    },

    onSpecialAnimation: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo != null && spinExtraInfo.lockedIds.length > 0) {
            var i;
            var lockedCols = [];
            var lockedSymbolIdMap = {};
            for (i = 0; i < spinExtraInfo.lockedIds.length; ++ i) {
                lockedSymbolIdMap[spinExtraInfo.lockedIds[i]] = true;
            }

            for (var localCol = 0; localCol < this.panelConfig.slotCols; ++ localCol) {
                var locked = false;
                for (var localRow = 0; localRow < this.panelConfig.slotRows; ++ localRow) {
                    var symbolId = this.getSpinResult(localCol, localRow);
                    if (lockedSymbolIdMap[symbolId] == null) {
                        continue;
                    }
                    locked = true;
                    var index = localCol * this.panelConfig.slotRows + localRow;
                    if (this.lockedSymbolIndices[index] != null) {
                        continue;
                    }
                    this.lockedSymbolIndices[index] = true;
                    this.addLockedSymbol(localCol, localRow);
                }

                if (locked) {
                    lockedCols.push(localCol);
                }
            }

            for (i = 0; i < lockedCols.length; ++ i) {
                var animNode = Util.loadSpineAnim("magic_world/60101/anim/maohuo/maohuo", "default", "maohuo_D", false);
                animNode.x = this.getSymbolPos(lockedCols[i], 0).x + 10;
                animNode.y = this.panelConfig.spinRegion.y + 10;
                animNode.setScaleY(1.1);
                this.frontNode.addChild(animNode);
            }

            if(!SlotMan.getCurrent().isLastSpinPanel()) {
                AudioPlayer.getInstance().playEffectByKey("slots/magic_world60101/witch_fire", false, true);
            }
        }

        this.overlayNode.visible = true;
        if(!SlotMan.getCurrent().isLastSpinPanel()) {
            this.runAction(cc.sequence(cc.delayTime(1.3), cc.callFunc(this.onSpecialAnimationEnd, this)));
        }
        else {
            this.onSpecialAnimationEnd();
        }

        //if (lockedCols.length > 0) {
        //    this.playSubjectEffect("fire-flush");
        //}

        if(SlotMan.getCurrent().isFirstSpinPanel()) {
            var firstColConnectedArea = new ConnectedAreaData();
            firstColConnectedArea.col = 0;
            firstColConnectedArea.row = 0;
            firstColConnectedArea.areaWidth = 1;
            firstColConnectedArea.areaHeight = this.panelConfig.slotRows;
            var connectedAreas = [];
            connectedAreas.push(firstColConnectedArea);
            this.connectedAreas[1] = connectedAreas;
            this.showConnectedSprite();
        }
    },

    onSpecialAnimationEnd: function () {
        this.animsNode.removeAllChildren(true);
        this.frontNode.removeAllChildren(true);
        //for (var i = 0; i < this.lockedSymbols.length; ++ i) {
        //    this.lockedSymbols[i].setVisible(true);
        //}
        this._super();
    },

    blinkAllBonusLines: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END);
    },

    onRespinFinished: function () {
        this.lockedSymbolIndices = {};
        this.lockedRootNode.removeAllChildren(true);
        this.lockedSymbols.length = 0;
        this.overlayNode.visible = false;

        for (var localCol = 0; localCol < this.panelConfig.slotCols; ++ localCol) {
            for (var localRow = 0; localRow < this.panelConfig.slotRows; ++ localRow) {
                var symbolSprite = this.getActiveSymbol(localCol, localRow);
                if (symbolSprite != null) {
                    symbolSprite.setVisible(true);
                }
            }
        }
    },

    addLockedSymbol: function (localCol, localRow) {
        //this.blinkSymbol(localCol, localRow);

        var symbolId = this.getSpinResult(localCol, localRow);
        var symbolConfig = this.subjectTmpl.getSymbol(symbolId);
        //var lockedNodePos = this.getSymbolPos(localCol, localRow);
        //var lockedWinFrameNode = Util.loadNodeFromCCB("medusa/spin_ui/medusa_fireframe.ccbi", null);
        //lockedWinFrameNode.setPosition(lockedNodePos.x, lockedNodePos.y);
        //this.lockedRootNode.addChild(lockedWinFrameNode);

        var symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
        if (symbolSprite != null) {
            symbolSprite.setVisible(false);
            var orgPosX = symbolSprite.x;
            var orgPosY = symbolSprite.y;

            var lockedSymbol = new cc.Sprite("#" + symbolConfig.imgName);
            if (symbolSprite.anchorX != 0.5 || symbolSprite.anchorY != 0.5) {
                orgPosX += symbolSprite.width * (0.5 - symbolSprite.anchorX);
                orgPosY += symbolSprite.height * (0.5 - symbolSprite.anchorY);
            }
            lockedSymbol.x = orgPosX;
            lockedSymbol.y = orgPosY;
            //lockedSymbol.visible = true;
            this.lockedSymbols.push(lockedSymbol);
            this.lockedRootNode.addChild(lockedSymbol);
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
        connectedSprite.setAnchorPoint(cc.p(0.5 - (connectedAreas.areaWidth * this.panelConfig.slotsWidth / connectedSprite.width) * 0.5 - 0.5,
            this.getSpineConnectedNodeRealHeight() / connectedSprite.height * 0.5 - connectedAreas.areaHeight * this.gridHeight / connectedSprite.height));
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
        var resPath = "";
        var connectedNode = null;
        if(symbolId == 1) {
            resPath = "magic_world/witch/witch/witch";
            connectedNode = Util.loadSpineAnim(resPath, "default", "default", true);
        }
        else {
            resPath = "magic_world/wizard/wizard/wizard";
            connectedNode = Util.loadSpineAnim(resPath, "default", "default", true);
        }

        return connectedNode;
    },

    getSpineConnectedNodeRealWidth: function (symbolId) {
        if(symbolId == 1) {
            return 590;
        }
        else {
            return 590;
        }
    },

    getSpineConnectedNodeRealHeight: function (symbolId) {
        if(symbolId == 1) {
            return 567;
        }
        else {
            return 567;
        }
    },

    getConnectedArea: function () {
        if(SlotMan.getCurrent().isLastSpinPanel()) {
            this.connectedAreas = {};
        }

        return this._super();
    },

    onShowConnectedArea: function () {
        if(SlotMan.getCurrent().isLastSpinPanel()) {
            this.connectedSymbolNode.removeAllChildren(true);
        }

        this.showConnectedSprite();
        this.runAction(cc.sequence(cc.delayTime(this.SHOW_CONNECTED_AREA_STEP_TIME), cc.callFunc(this.onShowConnectedAreaEnd, this)));
    },

    onColDrumMode: function (localCol) {
        if (this.spinRowCountWhenResultReceived[localCol] == 0) return;

        var endSpinRow = this.spinRowCountWhenResultReceived[localCol] + this.panelConfig.slotRows;
        if (this.spinRowShift[localCol] >= endSpinRow) {
            if (this.drumModeSpinRows[localCol] == DrumMode.DRUM_MODE_BLINK_JACKPOT) {
                this.onShowDrumJackpot(localCol);
            } else if (this.drumModeSpinRows[localCol] == DrumMode.DRUM_MODE_BLINK_BONUS) {
                this.onShowDrumBonus(localCol);
            } else if (this.drumModeSpinRows[localCol] == DrumMode.DRUM_MODE_BLINK_SCATTER) {
                this.onShowDrumScatter(localCol);
            } else if (this.drumModeSpinRows[localCol] > DrumMode.DRUM_MODE_DRUM && this.hasScatterBonusJackpotInCol(localCol)) {
                this.showBonusAppearAudio(localCol);
            } else {
                if (this.isEarlyStop) {
                    this.onReelStopEffect(localCol);
                } else {
                    this.playColWitchDropSound(localCol);
                }
            }
        } else if (this.hasDrumMode(localCol)) {
            this.startDrumMode(localCol);
        }
    },

    onReelStopEffect: function (localCol) {
        var destCol = this.subjectTmpl.reelCol - 1;
        if (localCol + this.panelConfig.colShift == destCol) {
            AudioHelper.playSlotEffect("reel-stop");
        }
        else if(localCol + this.panelConfig.colShift == 0) {
            this.playColWitchDropSound(localCol);
        }
    },

    playColWitchDropSound: function (localCol) {
        if(localCol + this.panelConfig.colShift == 0 && SlotMan.getCurrent().getSpinPanelLength() > 1 && SlotMan.getCurrent().isFirstSpinPanel()) {
            AudioPlayer.getInstance().playEffectByKey("slots/magic_world60101/witch_drop", false, true);
        }
        else {
            AudioHelper.playSlotEffect("reel-stop");
        }
    },

    getChainSymbolNode: function (chainInfo) {
        var symbolPos = this.getSymbolPos(chainInfo.col, chainInfo.row);
        var chainSymbolNode = TaskBreakChainController.createFromCCB();
        chainSymbolNode.controller.showBreakChainNormal(chainInfo.count);
        chainSymbolNode.setPosition(symbolPos);
        chainSymbolNode.setScale(0.98, 0.8);
        return chainSymbolNode;
    },

    getIceNode: function (iceInfo) {
        var symbolPos = this.getSymbolPos(iceInfo.col, iceInfo.row);
        var iceNode = TaskMeltIceController.createFromCCB();
        iceNode.controller.showIceNormal(iceInfo.count);
        iceNode.setPosition(symbolPos);
        iceNode.setScale(0.98, 0.8);
        return iceNode;
    },

    getFireNode: function (fireInfo) {
        var symbolPos = this.getSymbolPos(fireInfo.col, fireInfo.row);
        var fireNode = TaskFireController.createFromCCB();
        fireNode.controller.showFireNormal(fireInfo.count);
        fireNode.setPosition(symbolPos);
        fireNode.setScale(0.98, 0.8);
        return fireNode;
    },

    onShowDrumScatter: function (localCol) {
        this.showDrumScatterNormal(localCol);
    }
});

module.exports = MagicWorld60101SpinLayer;