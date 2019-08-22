var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var SlotMan = require("../model/SlotMan");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var TaskBreakChainController = require("../../task/controller/TaskBreakChainController");
var TaskMeltIceController = require("../../task/controller/TaskMeltIceController");
var TaskFireController = require("../../task/controller/TaskFireController");

var MagicWorld60109SpinLayer = SpecialTaskSpinLayer.extend({
    /**
     * @type {Array.<cc.Node>}
     */
    amazonAppearNodes: null,
    /**
     * @type {Array.<boolean>}
     */
    transparentCols: null,

    initData: function () {
        this._super();

        this.transparentCols = [];
    },

    createExtraUI: function () {
        var spinRegion = this.panelConfig.spinRegion;
        this.amazonAppearNodes = [];
        for (var localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
            var amazonAppearNode = Util.loadNodeFromCCB("magic_world/60109/symbol/magic_world_amazon_s.ccbi", null);
            amazonAppearNode.x = this.getSymbolPos(localCol, 0).x;
            amazonAppearNode.y = spinRegion.y + spinRegion.height * 0.5;
            amazonAppearNode.setVisible(false);
            this.symbolUnBatchNode.addChild(amazonAppearNode);
            this.amazonAppearNodes[localCol] = amazonAppearNode;
        }
    },

    onSpinStart: function () {
        this._super();
        this.spinPanel = null;
        this.transparentCols.length = 0;
        this.hideAmazonAppearAnim();
    },

    onSpinResultReceived: function (spinPanel) {
        this._super(spinPanel);

        this.playAmazonAppearAnim();
    },

    onSpinEnd: function () {
        this.showSprite();
        this.hideAmazonAppearAnim();
        this._super();
    },

    onReelStopEffect: function (localCol) {
        if(!this.isWildColumn(localCol) || this.isEarlyStop) {
            this._super(localCol);
        }
    },

    onColDrumMode: function (localCol) {
        if (this.spinPanel == null || !this.isWildColumn(localCol) || this.isEarlyStop) {
            this._super(localCol);
        }
    },

    addSymbolSprite: function (localCol, viewRow, symbolId) {
        var symbolSprite = this._super(localCol, viewRow, symbolId);
        if (this.transparentCols[localCol]) {
            symbolSprite.setOpacity(0);
        }
        return symbolSprite;
    },

    playAmazonAppearAnim: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo.wildCols) {
            for (var i = 0; i < spinExtraInfo.wildCols.length; ++ i) {
                var amazonAppearNode = this.amazonAppearNodes[spinExtraInfo.wildCols[i]];
                amazonAppearNode.visible = true;
                amazonAppearNode.animationManager.runAnimationsForSequenceNamed("effct");
                amazonAppearNode.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onAmazonAppeared, this)));

                this.hideFireSymbols(spinExtraInfo.wildCols[i]);
            }
        }
    },

    onAmazonAppeared: function (localCol) {
        if (!this.spinPanel) return;
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo && spinExtraInfo.wildCols) {
            if (spinExtraInfo.wildCols.indexOf(localCol) !== -1) {
                this.transparentCols[localCol] = true;
            }
        }
    },

    hideAmazonAppearAnim: function () {
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            var amazonAppearNode = this.amazonAppearNodes[col];
            amazonAppearNode.visible = false;
        }
    },

    showSprite: function () {
        this.transparentCols.length = 0;
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo.wildCols) {
            for (var i = 0; i < spinExtraInfo.wildCols.length; ++ i) {
                var wildCol = spinExtraInfo.wildCols[i];
                for (var row = 0; row < this.viewRowCount; ++ row) {
                    var symbolSprite = this.getActiveSymbol(wildCol, row);
                    if (symbolSprite) {
                        symbolSprite.setOpacity(255);
                    }
                }
            }
        }
    },

    isWildColumn: function (col) {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo.wildCols) {
            return spinExtraInfo.wildCols.indexOf(col) !== -1;
        }
        return false;
    },

    onShowDrumScatter: function (localCol) {
        this.showDrumScatterNormal(localCol);
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

            if(symbolConfig.symbolId == 1) {
                var symbolMissCount = 0;
                for(var row = 0; row < this.panelConfig.slotRows; row++) {
                    if(this.getSpinResult(localCol, row) != 1) {
                        symbolMissCount++;
                    }
                    else break;
                }

                var whiteColor = cc.color(255, 255, 255, 255);
                var spinRegion = this.panelConfig.spinRegion;
                var clipStencil = new cc.DrawNode();
                clipStencil.ignoreAnchorPointForPosition = false;
                clipStencil.setAnchorPoint(cc.p(0.5, 0.5));
                clipStencil.setPosition(cc.p(this.getSymbolPos(localCol, localRow).x, spinRegion.y + spinRegion.height * 0.5));
                clipStencil.drawRect(cc.p(-this.gridWidth * 0.5, -spinRegion.height * 0.5 + this.gridHeight * symbolMissCount), cc.p(this.gridWidth * 0.5, spinRegion.height * 0.5), whiteColor, 1, whiteColor);

                var largeSymbolClipNode = new cc.ClippingNode(clipStencil);
                this.animsNode.addChild(largeSymbolClipNode);

                largeSymbolClipNode.addChild(animNode);

                var largeSymbolFrame = new cc.Scale9Sprite("magic_world/common/symbol/magic_world_kuang_1.png");
                largeSymbolFrame.setPreferredSize(cc.size(this.gridWidth, spinRegion.height + 6));
                largeSymbolFrame.ignoreAnchorPointForPosition = false;
                largeSymbolFrame.setPosition(orgNodeX, orgNodeY);
                largeSymbolClipNode.addChild(largeSymbolFrame, 10);
            }
            else {
                this.animsNode.addChild(animNode);
            }

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

    isFullGridSymbol: function (symbolId) {
        if(symbolId == 1 || symbolId == 2 || (symbolId >= 1000 && symbolId <= 1003)) {
            return true;
        }
        return false;
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
    }
});

module.exports = MagicWorld60109SpinLayer;