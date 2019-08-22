var ClassicSpinLayer = require("./ClassicSpinLayer");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var SymbolId = require("../enum/SymbolId");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var SpinState = require("../enum/SpinState");
var DrumMode = require("../enum/DrumMode");

/**
 * Created by alanmars on 15/10/14.
 */
var ClassicReSpinLayer = ClassicSpinLayer.extend({
    WINLINE_COL: 1,
    WINLINE_ROW: 1,

    isLocked: false,
    isHaveDrumMode: false,

    update: function (dt) {
        if (this.updateEnabled) {
            for (var col = 0; col < this.panelConfig.slotCols; ++col) {
                if (this.isLocked && col === this.WINLINE_COL) {
                    continue;
                }
                switch (this.spinState[col]) {
                    case SpinState.SPIN_STATE_ACCEL:
                        this.updateInAccelState(dt, col);
                        break;
                    case SpinState.SPIN_STATE_STEADY:
                        this.updateInSteadyState(dt, col);
                        break;
                    case SpinState.SPIN_STATE_DECEL:
                        this.updateInDecelState(dt, col);
                        break;
                    case SpinState.SPIN_STATE_EASE_IN:
                        this.updateInEaseInState(dt, col);
                        break;
                    case SpinState.SPIN_STATE_EASE_OUT:
                        break;
                    case SpinState.SPIN_STATE_SHAKE_END:
                        this.updateInShakeEndState(dt, col);
                        break;
                    case SpinState.SPIN_STATE_WAIT:
                        break;
                }
            }
        }
    },

    updateInEaseOutStartState: function () {
        if (this.isLocked) {
            for (var col = 0; col < this.panelConfig.slotCols; ++col) {
                if (col ===  this.WINLINE_COL) continue;

                for (var row = 0; row < this.viewRowCount; ++row) {
                    var node = this.getActiveSymbol(col, row);
                    if (node != null) {
                        node.runAction(cc.moveBy(0.2, 0, 15));
                    }
                }
                this.distance[col] = 15;
            }

            this.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(this.setNormalSpinMoveMode, this)));
        }
        else {
            this._super();
        }
    },

    onSubRoundStart: function () {
        this._super();

        this.spinEndColCount = this.isLocked ? 1 : 0;
    },

    onRespinStart: function () {
        this.isLocked = true;

        //play respin animation:
        /**
         * @type {cc.Node}
         */
        var symbol = this.getActiveSymbol(this.WINLINE_COL, this.WINLINE_ROW);
        symbol.animationManager.runAnimationsForSequenceNamed("effct");
    },

    onRespinFinished: function () {
        if (this.isLocked) {
            this.isLocked = false;
            //Warning: the state of the lock column must be reset.
            this.spinState[this.WINLINE_COL] = SpinState.SPIN_STATE_END;

            var symbol = this.getActiveSymbol(this.WINLINE_COL, this.WINLINE_ROW);
            symbol.animationManager.runAnimationsForSequenceNamed("normal");
        }
    },

    hasDrumMode: function (localCol) {
        if (this.spinEndColCount == 2 && this.drumModeSpinRows[localCol] > 0 && !this.isHaveDrumMode) {
            this.isHaveDrumMode = true;
            return true;
        }
        return false;
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
        if (globalCol === 0) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear1");
        } else if (globalCol === 1) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear2");
        }
    },

    playDrumModeAnim: function (localCol) {
        if (localCol < this.panelConfig.slotCols) {
            this.curDrumCol = localCol;
            if (this.drumModeEffectNode) {
                var drumModePos = this.getDrumModePos(localCol);
                this.drumModeEffectNode.setPosition(drumModePos);
                if (!this.drumModeEffectNode.visible) {
                    this.drumModeEffectNode.setVisible(true);
                }
                this.drumModeEffectNode.animationManager.runAnimationsForSequenceNamed("effct");
            }
        }
    },

    stopDrumModeAnim: function (localCol) {
        this._super(localCol);
        this.isHaveDrumMode = false;
    }
});

module.exports = ClassicReSpinLayer;