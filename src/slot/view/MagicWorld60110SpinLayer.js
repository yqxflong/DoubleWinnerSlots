var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var Util = require("../../common/util/Util");
var AudioPlayer =  require("../../common/audio/AudioPlayer");
var AudioSlotHelper =  require("../../common/audio/AudioSlotHelper");
var SymbolId = require("../enum/SymbolId");
var DrumMode = require("../enum/DrumMode");
var SlotEvent = require("../events/SlotEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");

BonusController = function(index, callback, target) {
    BaseCCBController.call(this);

    this.index = index;
    this.callback = callback;
    this.target = target;

    this._openItem = null;
};

Util.inherits(BonusController, BaseCCBController);

BonusController.prototype.onOpenClick = function (sender) {
    this.callback.call(this.target, this.index);
};

BonusController.prototype.disabledOpenItem = function () {
    this._openItem.setEnabled(false);
};

var MagicWorld60110SpinLayer = SpecialTaskSpinLayer.extend({

    WILD_ANIMATION: 1,
    BONUS_GAME: 2,
    MORE_FREE_SPIN: 3,

    bonusNodes: [],

    ctor: function (subjectTmplId, panelId) {
        this.charybdisAnimNode = null;
        this.specialAnimationArray = [];
        this.curSpecialAnimation = 0;

        this._super(subjectTmplId, panelId);
    },

    createExtraUI: function() {
        this.charybdisAnimNode = new cc.Node();
        this.spinBoardNode.addChild(this.charybdisAnimNode, 37);

        this._super();
    },

    onSubRoundStart: function () {
        this._super();

        this.animsNode.removeAllChildren(true);
        this.frontNode.removeAllChildren(true);
        this.charybdisAnimNode.removeAllChildren(true);
    },

    onSpecialAnimation: function () {
        var extraInfo = this.spinPanel.extraInfo;
        if(!extraInfo) this.onSpecialAnimationEnd();

        this.specialAnimationArray = [];
        this.curSpecialAnimation = 0;

        if(extraInfo.bonusPos.length > 0) {
            this.specialAnimationArray.push(this.BONUS_GAME);
        }

        if(extraInfo.wildArray.length > 0) {
            this.specialAnimationArray.push(this.WILD_ANIMATION);
        }

        if(extraInfo.moreFreeSpin.length > 0) {
            this.specialAnimationArray.push(this.MORE_FREE_SPIN);
        }

        this.checkNextSpecialAnimation();
    },

    checkNextSpecialAnimation: function () {
        if(this.curSpecialAnimation >= this.specialAnimationArray.length) {
            this.onSpecialAnimationEnd();
        }

        var curAnim = this.specialAnimationArray[this.curSpecialAnimation];
        this.curSpecialAnimation++;
        switch(curAnim) {
            case this.WILD_ANIMATION:
                this.showWildAnimation();
                break;
            case this.BONUS_GAME:
                this.showBonusGame();
                break;
            case this.MORE_FREE_SPIN:
                this.showMoreFreeSpinAnimation();
                break;
            default:
                break;
        }
    },

    showWildAnimation: function () {
        var extraInfo = this.spinPanel.extraInfo;
        for(var i = 0; i < extraInfo.wildArray.length; i++) {
            var wildCoo = extraInfo.wildArray[i];
            var spinRegion = this.panelConfig.spinRegion;
            var wildLargeNode = Util.loadNodeFromCCB("magic_world/60110/symbol/wild.ccbi");
            wildLargeNode.x = this.getSymbolPos(wildCoo.col, 0).x;
            wildLargeNode.y = spinRegion.y + spinRegion.height * 0.5;
            this.animsNode.addChild(wildLargeNode);
        }

        this.animsNode.runAction(cc.sequence(cc.delayTime(1.8), cc.callFunc(this.onWildAnimationEnd, this)));
        AudioPlayer.getInstance().playEffectByKey("slots/magic_world60110/charybdis_appear", false, true);
    },

    onWildAnimationEnd: function () {
        this.animsNode.removeAllChildren(true);

        var extraInfo = this.spinPanel.extraInfo;
        for(var i = 0; i < extraInfo.wildArray.length; i++) {
            var wildCoo = extraInfo.wildArray[i];

            var whiteColor = cc.color(255, 255, 255, 255);
            var spinRegion = this.panelConfig.spinRegion;
            var clipStencil = new cc.DrawNode();
            clipStencil.ignoreAnchorPointForPosition = false;
            clipStencil.setAnchorPoint(cc.p(0.5, 0.5));
            clipStencil.setPosition(cc.p(this.getSymbolPos(wildCoo.col, 0).x, spinRegion.y + spinRegion.height * 0.5));
            clipStencil.drawRect(cc.p(-this.gridWidth * 0.5 + 3, -spinRegion.height * 0.5), cc.p(this.gridWidth * 0.5 - 3, spinRegion.height * 0.5), whiteColor, 1, whiteColor);

            var wildLargeClipNode = new cc.ClippingNode(clipStencil);
            this.charybdisAnimNode.addChild(wildLargeClipNode);

            var wildSpineAnim = Util.loadSpineAnim("magic_world/charybdis/elves/girl_elves", "default", "elves");
            wildSpineAnim.setPosition(cc.p(this.getSymbolPos(wildCoo.col, 0).x, spinRegion.y + spinRegion.height * 0.5));
            wildLargeClipNode.addChild(wildSpineAnim);

            var wildLargeFrame = new cc.Scale9Sprite("magic_world/common/symbol/magic_world_kuang_1.png");
            wildLargeFrame.setPreferredSize(cc.size(this.gridWidth - 4, spinRegion.height));
            wildLargeFrame.ignoreAnchorPointForPosition = false;
            wildLargeFrame.setPosition(cc.p(this.getSymbolPos(wildCoo.col, 0).x, spinRegion.y + spinRegion.height * 0.5));
            wildLargeClipNode.addChild(wildLargeFrame);

            var wildNormal = Util.loadNodeFromCCB("magic_world/60110/symbol/wild_normal.ccbi", false);
            wildNormal.setPosition(cc.p(this.getSymbolPos(wildCoo.col, 0).x, spinRegion.y + spinRegion.height * 0.5));
            wildLargeClipNode.addChild(wildNormal);
        }

        this.checkNextSpecialAnimation();
    },

    showBonusGame: function () {
        var extraInfo = this.spinPanel.extraInfo;

        this.overlayNode.setVisible(true);
        this.bonusNodes = [];
        for(var i = 0; i < extraInfo.bonusPos.length; i++) {
            var oneBonusNode =  Util.loadNodeFromCCB("magic_world/60110/symbol/chest.ccbi", null,
                "BonusController", new BonusController(i, this.onBonusResultShown, this));
            oneBonusNode.setPosition(this.getSymbolPos(extraInfo.bonusPos[i].col, extraInfo.bonusPos[i].row));
            this.bonusNodes.push(oneBonusNode);
            this.frontNode.addChild(oneBonusNode);
        }
        AudioPlayer.getInstance().playEffectByKey("slots/magic_world60110/chest_shake", false, true);
    },

    onBonusResultShown: function (index) {
        var extraInfo = this.spinPanel.extraInfo;

        var i = 0;
        for(i = 0; i < this.bonusNodes.length; i++) {
            this.bonusNodes[i].controller.disabledOpenItem();
        }

        var otherBonusIndex = 0;
        for(i = 0; i < extraInfo.bonusPos.length; i++) {
            var resultLabel = this.bonusNodes[i].getChildByTag(3);
            if(resultLabel) {
                resultLabel.setVisible(true);
                if(i == index) {
                    resultLabel.setString(Util.formatAbbrNum(extraInfo.bonusPay));
                    this.bonusNodes[index].animationManager.runAnimationsForSequenceNamed("effect");
                    AudioPlayer.getInstance().playEffectByKey("slots/magic_world60110/chest_open", false, true);
                }
                else {
                    resultLabel.setString(Util.formatAbbrNum(extraInfo.otherBonusPay[otherBonusIndex]));
                    this.bonusNodes[i].animationManager.runAnimationsForSequenceNamed("dark");
                    otherBonusIndex++;
                }
            }
        }

        this.runAction(cc.sequence(cc.delayTime(3.0), cc.callFunc(this.showCoinCollectPopup, this)));
    },

    showCoinCollectPopup: function () {
        var extraInfo = this.spinPanel.extraInfo;
        var BonusCollectController = require("../controller/BonusCollectController");
        var dlg = BonusCollectController.createFromCCB("magic_world/60110/symbol/chest_collect.ccbi");
        dlg.controller.initWith(extraInfo.bonusPay, this.onBonusGameEnd.bind(this));
        dlg.controller.popup();
        AudioSlotHelper.playSlotEffect("slots/magic_world60110/bonus-game-cheer");
    },

    onBonusGameEnd: function () {
        this.overlayNode.setVisible(false);
        this.animsNode.removeAllChildren(true);
        this.frontNode.removeAllChildren(true);

        this.checkNextSpecialAnimation();
    },

    showMoreFreeSpinAnimation: function () {
        var extraInfo = this.spinPanel.extraInfo;

        for(var i = 0; i < extraInfo.moreFreeSpin.length; i++) {
            var symbolPos = this.getSymbolPos(extraInfo.moreFreeSpin[i].coordinate.col, extraInfo.moreFreeSpin[i].coordinate.row);
            var freeSpinSymbolNode = Util.loadNodeFromCCB("magic_world/60110/symbol/freespin.ccbi", null);
            freeSpinSymbolNode.setPosition(symbolPos);
            this.animsNode.addChild(freeSpinSymbolNode);

            var freeSpinNumberNode = Util.loadNodeFromCCB("magic_world/60110/symbol/freespin_label.ccbi", null);
            var numberLabel = freeSpinNumberNode.getChildByTag(3);
            numberLabel.setString(extraInfo.moreFreeSpin[i].freeSpinCount);
            freeSpinNumberNode.setPosition(symbolPos);
            var flyPos = this.frontNode.convertToNodeSpace(cc.p(cc.winSize.width - 149, 50));
            freeSpinNumberNode.runAction(cc.sequence(cc.delayTime(1.8), cc.moveTo(0.8, flyPos.x, flyPos.y)));
            this.frontNode.addChild(freeSpinNumberNode);
        }

        AudioSlotHelper.playSlotEffect("slots/magic_world60110/free_spin_add");
        this.runAction(cc.sequence(cc.delayTime(2.6), cc.callFunc(this.refreshFreeSpinNumber, this), cc.delayTime(2.4), cc.callFunc(this.onMoreFreeSpinAnimationEnd, this)));
    },

    refreshFreeSpinNumber: function () {
        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_REFRESH_FREE_SPIN, null);
    },

    onMoreFreeSpinAnimationEnd: function () {
        this.animsNode.removeAllChildren(true);

        this.checkNextSpecialAnimation();
    },

    onShowDrumBonus: function (localCol) {
        var i;
        for (i = 0; i < this.panelConfig.slotRows; ++i) {
            if (this.getSpinResult(localCol, i) == SymbolId.SYMBOL_ID_BONUS) {
                var symbolSprite = this.getActiveConsecutiveSymbol(localCol, i);
                if (symbolSprite) {
                    symbolSprite.runAction(cc.fadeIn(0.1));
                }
            }
        }
        var globalCol = this.localColToGlobal(localCol);
        var scatter = 0;
        for (i = 0; i <= globalCol; ++i) {
            if (this.drumModeState[i] != DrumMode.DRUM_MODE_NULL) {
                ++scatter;
            }
        }

        if (scatter == 1) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear1");
        }
        else if (scatter == 2) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear2");
        }
    },

    isFullGridSymbol: function (symbolId, localCol, localRow) {
        var extraInfo = this.spinPanel.extraInfo;
        for(var i = 0; i < extraInfo.wildArray.length; i++) {
            if(extraInfo.wildArray[i].col == localCol) {
                return true;
            }
        }

        if(symbolId == 1 || symbolId == 2 || symbolId == 1000) {
            return true;
        }
        return false;
    },

    blinkAllScatters: function () {
        this.blinkAllScattersColumn();
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
        //var scatterCols = [1,2,3];
        //this.blinkSymbolInCols(scatterCols, true);

        // blink big mages animation
        var centerPos = cc.pAdd(this.getSymbolPos(2, 1), cc.p(0, this.gridHeight * 0.5));
        var areaWidth = this.gridWidth * 3 + this.gapWidth * 2;
        var areaHeight = this.gridHeight * 4;

        var whiteColor = cc.color(255, 255, 255, 255);
        var clipStencil = new cc.DrawNode();
        clipStencil.ignoreAnchorPointForPosition = false;
        clipStencil.setAnchorPoint(cc.p(0.5, 0.5));
        clipStencil.setPosition(centerPos);
        clipStencil.drawRect(cc.p(-areaWidth * 0.5, -areaHeight * 0.5), cc.p(areaWidth * 0.5, areaHeight * 0.5), whiteColor, 1, whiteColor);

        var clipNode = new cc.ClippingNode(clipStencil);
        this.animsNode.addChild(clipNode);

        var scatterNode = Util.loadSpineAnim("magic_world/mages/enchanter/hero_enchanter", "default", "enchanter", true);
        scatterNode.setPosition(centerPos);
        clipNode.addChild(scatterNode);

        var scatterFrame = new cc.Scale9Sprite("magic_world/common/symbol/magic_world_kuang_1.png");
        scatterFrame.setPreferredSize(cc.size(areaWidth, areaHeight));
        scatterFrame.setPosition(centerPos);
        clipNode.addChild(scatterFrame);

        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onBlinkAllScattersCompletedColumn, this)));
    },

    onBlinkAllScattersCompletedColumn: function () {
        this.animsNode.removeAllChildren(true);

        /**
         * @type {ScatterSpinExtraInfo}
         */
        var scatterCols = [1,2,3];
        this.blinkSymbolInColsEnd(scatterCols);

        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_SCATTER_END);
    }
});

module.exports = MagicWorld60110SpinLayer;