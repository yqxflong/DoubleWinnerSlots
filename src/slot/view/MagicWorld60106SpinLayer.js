var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var SymbolId = require("../enum/SymbolId");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var AudioSlotHelper = require("../../common/audio/AudioSlotHelper");
var AudioHelper = require("../../common/util/AudioHelper");
var DrumMode = require("../enum/DrumMode");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");

var MagicWorld60106SpinLayer = SpecialTaskSpinLayer.extend({
    blinkAllBonusLines: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END);
    },

    blinkAllScatters: function () {
        this.blinkAllScattersColumn();
    },

    generateSpecialSymbol: function () {
        var globalCol;
        var localCol;
        var leftCol;
        var row;
        var random = Util.randomNextInt(100);
        if (random < 30) {
            leftCol = Util.randomNextInt(2) + 1;
            for (globalCol = 1; globalCol < leftCol; ++ globalCol) {
                localCol = this.globalColToLocal(globalCol);
                if (localCol < 0 || localCol >= this.panelConfig.slotCols) {
                    continue;
                }
                for (row = 0; row < this.SPIN_SYMBOL_ROWS; ++ row) {
                    this.spinSymbols[localCol][row] = SymbolId.SYMBOL_ID_SCATTER;
                }
            }
        }
        else if(random < 60) {
            leftCol = Util.randomNextInt(2) + 1;
            for (globalCol = 1; globalCol < leftCol; ++ globalCol) {
                localCol = this.globalColToLocal(globalCol);
                if (localCol < 0 || localCol >= this.panelConfig.slotCols) {
                    continue;
                }
                for (row = 0; row < this.SPIN_SYMBOL_ROWS; ++ row) {
                    this.spinSymbols[localCol][row] = SymbolId.SYMBOL_ID_SCATTER;
                }
            }
        }
    },

    getScatterDrumState: function (drumState) {
        return this.getScatterDrumStateColumn(drumState);
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
                }
                else {
                    if(this.localColToGlobal(localCol) == this.subjectTmpl.reelCol - 1) {
                        AudioPlayer.getInstance().stopAllEffects();
                    }

                    //if(this.hasKingCol(localCol)) {
                    //    AudioSlotHelper.playSlotEffect("slots/magic_world60106/king_appear");
                    //}
                    //else {
                    //
                    //}
                    AudioHelper.playSlotEffect("reel-stop");
                }
            }
        } else if (this.hasDrumMode(localCol)) {
            this.startDrumMode(localCol);
        }
    },

    hasKingCol: function (localCol) {
        for(var row = 0; row < this.panelConfig.slotRows; row++) {
            if(this.getSpinResult(localCol, row) != 1) {
                return false;
            }
        }
        return true;
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
    }
});

module.exports = MagicWorld60106SpinLayer;