var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var SlotMan = require("../model/SlotMan");
var SymbolId = require("../enum/SymbolId");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var AudioSlotHelper = require("../../common/audio/AudioSlotHelper");
var DrumMode = require("../enum/DrumMode");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SpinState = require("../enum/SpinState");
var Line = require("../entity/Line");
var Coordinate = require("../entity/Coordinate");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var Coordinate = require("../entity/Coordinate");
var TaskBreakChainController = require("../../task/controller/TaskBreakChainController");
var TaskMeltIceController = require("../../task/controller/TaskMeltIceController");
var TaskFireController = require("../../task/controller/TaskFireController");
var AudioHelper = require("../../common/util/AudioHelper");

var MagicWorld60104SpinLayer = SpecialTaskSpinLayer.extend({
    ctor: function (subjectTmplId, panelId) {
        this.MULTIPLEWILD_TIME = 1.33;

        this.multipleWildAnimList = [];
        this.wildLightingAnimList = [];

        this._super(subjectTmplId, panelId);
    },

    onSubRoundStart: function () {
        this._super();

        this.multipleWildAnimList = [];
    },

    onShowDrumScatter: function (localCol) {
        this.showDrumScatterNormal(localCol);
    },

    showDrumScatterNormal: function (localCol) {
        var i;
        for (i = 0; i < this.panelConfig.slotRows; ++i) {
            if (this.getSpinResult(localCol, i) == SymbolId.SYMBOL_ID_SCATTER) {
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
        else if (scatter == 3) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear3");
        }
        else if (scatter == 4) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear4");
        }
        else if (scatter == 5) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear5");
        }
    },

    hasSymbolInCol: function (localCol, symbol) {
        var i;
        for (i = 0; i < this.panelConfig.slotRows; ++i) {
            symbolId = this.getSpinResult(localCol, i);
            if (symbolId == symbol) {
                return true;
            }
        }
        return false;
    },

    showBonusAppearAudio: function (localCol) {
        var globalCol = this.localColToGlobal(localCol);
        var scatter = 0;
        for (var i = 0; i <= globalCol; ++i) {
            if (this.hasSymbolInCol(i,SymbolId.SYMBOL_ID_SCATTER)) {
                ++scatter;
            }
        }
        AudioPlayer.getInstance().stopAllEffects();
        if (scatter == 4) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear4");
        }
        else if (scatter == 5) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear5");
        }
    },

    onSpecialAnimation: function () {
        var extraInfo = this.spinPanel.extraInfo;
        if(!extraInfo) this.onSpecialAnimationEnd();

        if(extraInfo.bonusWild.length > 0) {
            this.showBonusEffect();
        }

        if(extraInfo.multipleWildList.length > 0) {
            this.showMultipleWildEffect();
        }
    },

    showBonusEffect: function () {
        var row = 0;
        var leftBonusCoo = new Coordinate();
        leftBonusCoo.col = 0;
        leftBonusCoo.row = this.panelConfig.slotRows;
        for(row = 0; row < this.panelConfig.slotRows - 1; row++) {
            if(this.spinPanel.panel[leftBonusCoo.col][row] == 0) {
                leftBonusCoo.row = row;
                break;
            }
        }

        var rightBonusCoo = new Coordinate();
        rightBonusCoo.col = 4;
        rightBonusCoo.row = this.panelConfig.slotRows;
        for(row = 0; row < this.panelConfig.slotRows - 1; row++) {
            if(this.spinPanel.panel[rightBonusCoo.col][row] == 0) {
                rightBonusCoo.row = row;
                break;
            }
        }

        if(leftBonusCoo.row >= this.panelConfig.slotRows || rightBonusCoo.row >= this.panelConfig.slotRows) this.onSpecialAnimationEnd();

        var leftBonusPos = this.getSymbolPos(leftBonusCoo.col, leftBonusCoo.row);
        var rightBonusPos = this.getSymbolPos(rightBonusCoo.col, rightBonusCoo.row);
        var magicEffectLeft = Util.loadSpineAnim("magic_world/60104/anim/bonus_fazhang/bonus_fazhang", "default", "left_fazhang", false);
        var magicEffectRight = Util.loadSpineAnim("magic_world/60104/anim/bonus_fazhang/bonus_fazhang", "default", "right_fazhang", false);

        magicEffectLeft.setPosition(leftBonusPos);
        magicEffectRight.setPosition(rightBonusPos);

        this.animsNode.addChild(magicEffectLeft);
        this.animsNode.addChild(magicEffectRight);

        this.animsNode.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.showMagicBallEffect, this)));
        AudioSlotHelper.playSlotEffect("slots/magic_world60104/bonus_light");

        this.overlayNode.visible = true;
    },

    showMagicBallEffect: function () {
        var extraInfo = this.spinPanel.extraInfo;
        this.wildLightingAnimList = [];
        for(var i = 0; i < extraInfo.bonusWild.length; i++) {
            var wildCoo = extraInfo.bonusWild[i];
            var wildSymbol = this.getSymbolSprite(wildCoo.col, wildCoo.row, 1);
            wildSymbol.visible = false;

            var wildLightingAnim = Util.loadSpineAnim("magic_world/60104/anim/bonus_pilei/bonus_pilei", "default", "pilei_1", false);
            wildLightingAnim.setPosition(wildSymbol.getPosition());
            wildLightingAnim.visible = false;

            var delayTime = i * 0.15;
            wildLightingAnim.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(this.showLightingEffect, this, i)));
            this.frontNode.addChild(wildLightingAnim);
            this.wildLightingAnimList.push(wildLightingAnim);
        }

        this.frontNode.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onSpecialAnimationEnd, this)));
    },

    showLightingEffect: function (sender, index) {
        var wildLightingAnim = this.wildLightingAnimList[index];
        wildLightingAnim.visible = true;
        wildLightingAnim.setAnimation(0, "pilei_1", false);
        wildLightingAnim.runAction(cc.sequence(cc.delayTime(1.1), cc.callFunc(this.showMagicBallNormalEffect, this, index)));
        AudioSlotHelper.playSlotEffect("slots/magic_world60104/bonus_light_play");
    },

    showMagicBallNormalEffect: function (sender, index) {
        var wildLightingAnim = this.wildLightingAnimList[index];
        wildLightingAnim.visible = true;
        wildLightingAnim.setAnimation(0, "pilei_2", true);
    },

    showMultipleWildEffect: function () {
        var extraInfo = this.spinPanel.extraInfo;
        this.frontNode.removeAllChildren(true);

        this.multipleWildAnimList = [];
        for(var i = 0; i < extraInfo.multipleWildList.length; i++) {
            var multipleWild = extraInfo.multipleWildList[i];

            var ccbPath = "";
            var effectPath = "";
            if(multipleWild.multiple == 2) {
                ccbPath = "magic_world/60104/symbol/wild_bg_2x.ccbi";
                effectPath = "slots/magic_world60104/wild_appear_2x";
            }
            else if(multipleWild.multiple == 3) {
                ccbPath = "magic_world/60104/symbol/wild_bg_3x.ccbi";
                effectPath = "slots/magic_world60104/wild_appear_3x";
            }
            else {
                ccbPath = "magic_world/60104/symbol/wild_bg_4x.ccbi";
                effectPath = "slots/magic_world60104/wild_appear_4x";
            }

            var multipleWildAnim = Util.loadNodeFromCCB(ccbPath, null);
            var multipleWildPos = cc.pAdd(this.getSymbolPos(multipleWild.wildCol, multipleWild.wildBaseRow), cc.p(0, this.gridHeight * (multipleWild.multiple - 1) * 0.5));
            multipleWildAnim.setPosition(multipleWildPos);
            multipleWildAnim.animationManager.runAnimationsForSequenceNamed("effct");
            AudioSlotHelper.playSlotEffect(effectPath);

            this.connectedSymbolNode.addChild(multipleWildAnim);
            this.multipleWildAnimList.push(multipleWildAnim);
        }

        this.connectedSymbolNode.runAction(cc.sequence(cc.delayTime(this.MULTIPLEWILD_TIME), cc.callFunc(this.onSpecialAnimationEnd, this)));
    },

    onSpecialAnimationEnd: function () {
        if(this.multipleWildAnimList.length > 0) {
            for(var i = 0; i < this.multipleWildAnimList.length; i++) {
                var multipleWildAnim = this.multipleWildAnimList[i];
                multipleWildAnim.animationManager.runAnimationsForSequenceNamed("normal");
            }
        }

        this._super();
    },

    onRespinStart: function () {
    },

    onRespinFinished: function () {
        this.frontNode.removeAllChildren(true);
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
        fireNode.setScale(0.88, 0.72);
        return fireNode;
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

                    //if(this.hasSpecialSymbol(localCol, 0)) {
                    //    AudioSlotHelper.playSlotEffect("slots/magic_world60104/bonus_appear");
                    //}
                    //else if(this.hasSpecialSymbol(localCol, 2)) {
                    //    AudioSlotHelper.playSlotEffect("slots/magic_world60104/mages_appear");
                    //}

                    AudioHelper.playSlotEffect("reel-stop");
                }
            }
        } else if (this.hasDrumMode(localCol)) {
            this.startDrumMode(localCol);
        }
    },

    hasSpecialSymbol: function (localCol, symbolId) {
        var rowCount = this.panelConfig.slotRows;
        if(localCol == 0 || localCol == 4) rowCount = 3;
        for(var row = 0; row < this.panelConfig.slotRows; row++) {
            if(this.getSpinResult(localCol, row) == symbolId) {
                return true;
            }
        }
        return false;
    }
});

module.exports = MagicWorld60104SpinLayer;