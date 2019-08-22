/**
 * Created by alanmars on 15/4/17.
 */
var SpinLayer = require("./SpinLayer");
var Direction = require("../enum/Direction");
var SymbolOpType = require("../enum/SymbolOpType");
var SymbolId = require("../enum/SymbolId");
var SymbolMoveMode = require("../enum/SymbolMoveMode");
var SpinState = require("../enum/SpinState");
var DrumMode = require("../enum/DrumMode");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var Util = require("../../common/util/Util");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var SlotMan = require("../model/SlotMan");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");

var DRUM_MODE_SOUND = "slots/fx-reel-stop-drum-roll";
var DRUM_MODE_SOUND_SLOW = "slots/drum-mode-slow";

var NormalSpinLayer = SpinLayer.extend({

    spinSymbols: null,             //int[][]       column first
    /**
     * @type {Array.<number>}
     */
    prevDirection: null,
    spinEndColCount: 0,

    /**
     * @type {Array.<number>}
     */
    spinRowShift: null,
    /**
     * @type {Array.<number>}
     */
    spinRowCountWhenResultReceived: null,
    /**
     * @type {Array.<number>}
     */
    skipRowCounts: null,
    curWinLineIndex: 0,

    curDrumCol: 0,


    ctor: function (subjectTmplId, panelId) {
        this._super(subjectTmplId, panelId);
        this.curDrumCol = -1;
    },

    initData: function () {
        this._super();
        this.spinSymbols = [];
        this.prevDirection = [];
        this.spinEndColCount = 0;
        this.spinRowShift = [];
        this.spinRowCountWhenResultReceived = [];
        this.skipRowCounts = [];
        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            this.spinSymbols[col] = [];
            this.prevDirection[col] = Direction.DIRECTION_DOWN;
            this.spinRowShift[col] = 0;
            this.spinRowCountWhenResultReceived[col] = 0;
            this.skipRowCounts[col] = 0;
        }
    },

    generateSymbols: function () {
        switch (this.subjectTmpl.symbolOpType) {
            case SymbolOpType.SYMBOL_OP_TYPE_STACK_SYMBOL:
                this.generateStackedSymbols();
                break;
            case SymbolOpType.SYMBOL_OP_TYPE_MEGA_SYMBOL:
                this.generateMegaSymbols();
                break;
            default:
                this.generateNormalSymbols();
                break;
        }
        this.generateSpecialSymbol();
    },

    generateNormalSymbols: function () {
        var col;
        var row;
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            for (row = 0; row < this.SPIN_SYMBOL_ROWS;) {
                var symbolId = SymbolId.SYMBOL_ID_INVALID;
                if (row <= (this.maxSymbolSize) || row >= (this.SPIN_SYMBOL_ROWS - (this.maxSymbolSize + 1))) {
                    symbolId = this.randomInconsecutiveSymbolId(col, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
                }
                else {
                    symbolId = this.randomSymbolIdForCol(col, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
                }

                var symbolSize = this.subjectTmpl.getSymbolHeight(symbolId);
                for (var i = 0; i < symbolSize && (row + i) < this.SPIN_SYMBOL_ROWS; ++i) {
                    this.spinSymbols[col][row + i] = symbolId;
                }
                row += symbolSize;
            }
        }
    },

    generateMegaSymbols: function () {
        var col;
        var row;
        var c;
        var r;
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            for (row = 0; row < this.SPIN_SYMBOL_ROWS; ++row) {
                this.spinSymbols[col][row] = SymbolId.SYMBOL_ID_INVALID;
            }
        }

        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            for (row = 0; row < this.SPIN_SYMBOL_ROWS;) {
                while (this.spinSymbols[col][row] != SymbolId.SYMBOL_ID_INVALID && row < this.SPIN_SYMBOL_ROWS) {
                    ++row;
                }

                var availableRowCount = 0;
                for (r = row; r < this.SPIN_SYMBOL_ROWS; ++r) {
                    if (this.spinSymbols[col][r] == SymbolId.SYMBOL_ID_INVALID) {
                        ++availableRowCount;
                    }
                    else {
                        break;
                    }
                }

                var symbolId;
                if (row <= (this.maxSymbolSize) || row >= (this.SPIN_SYMBOL_ROWS - (this.maxSymbolSize + 1))) {
                    symbolId = this.randomInconsecutiveSymbolId(col, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
                }
                else {
                    symbolId = this.randomSymbolIdWithHeightLimit(col, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin, availableRowCount);
                }

                var symbolW = this.subjectTmpl.getSymbolWidht(symbolId);
                var symbolH = this.subjectTmpl.getSymbolHeight(symbolId);
                for (r = 0; r < symbolH; ++r) {
                    this.spinSymbols[col][row + r] = symbolId;
                }
                for (c = col + 1; c < this.panelConfig.slotCols && c < (col + symbolW); ++c) {
                    for (r = row; r < (row + symbolH) && r < this.SPIN_SYMBOL_ROWS; ++r) {
                        this.spinSymbols[c][r] = SymbolId.SYMBOL_ID_FILL;
                    }
                }

                row += symbolH;
            }
        }
    },

    generateStackedSymbols: function () {
        this.generateNormalSymbols();
        var col;
        /**
         * @type {Array.<number>}
         */
        var stackedSymbolIds = [];
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            if (col != 0) {
                if (Util.randomNextInt(100) < 70) {
                    stackedSymbolIds[col] = stackedSymbolIds[0];
                }
                else {
                    stackedSymbolIds[col] = this.randomStackSymbolId(col, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
                }
            }
            else {
                stackedSymbolIds[col] = this.randomStackSymbolId(col, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
            }
        }
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            if (Util.randomNextInt(100) < 80) {
                for (var i = 0; i < this.spinSymbols[col].length; ++i) {
                    this.spinSymbols[col][i] = stackedSymbolIds[col];
                }
            }
        }
    },

    generateSpecialSymbol: function () {
        if (!this.subjectTmpl.stackSymbols || Object.keys(this.subjectTmpl.stackSymbols).length === 0) return;

        if (Util.randomNextInt(100) < 10) {
            for (var globalCol = 1; globalCol < 4; ++globalCol) {
                var localCol = this.globalColToLocal(globalCol);
                if (localCol < 0 || localCol >= this.panelConfig.slotCols) {
                    continue;
                }

                for (var row = 0; row < this.SPIN_SYMBOL_ROWS; ++row) {
                    this.spinSymbols[localCol][row] = SymbolId.SYMBOL_ID_SCATTER;
                }
            }
        }
    },

    initSymbols: function () {
        var maxSizeSymbol = this.subjectTmpl.getMaxHeightSymbol();
        this.maxSymbolSize = maxSizeSymbol.symbolH;

        this.generateSymbols();

        var i;
        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            var symbolId = this.spinSymbols[col][this.panelConfig.slotRows];
            var symbolSize = this.subjectTmpl.getSymbolHeight(symbolId);
            //fix bug by qinning,when have consecutive symbol may cause overlap
            if (symbolSize == 1) {
                this.setActiveSymbol(col, this.panelConfig.slotRows, this.addSymbolSprite(col, this.panelConfig.slotRows, symbolId));
            }
            var row = this.panelConfig.slotRows - 1;
            var rowStep = -1;
            if (this.direction[col] == Direction.DIRECTION_UP) {
                row = 0;
                rowStep = 1;
            }
            for (; row >= 0 && row <= (this.panelConfig.slotRows - 1); /*-- row*/) {
                symbolId = this.spinSymbols[col][row];
                var symbolSize = this.subjectTmpl.getSymbolHeight(symbolId);
                this.setActiveSymbol(col, row, this.addSymbolSprite(col, row, symbolId));
                for (i = 0; i < symbolSize && row >= 0 && row <= (this.panelConfig.slotRows - 1); ++i) {
                    row += rowStep;
                }
            }
        }
    },

    restoreActiveSymbols: function () {
        //adjust model row to keep consistent with view row
        var col;
        var row;
        var symbolSpriteArr = [];
        for (col = 0; col < this.panelConfig.slotCols; ++col) {
            for (row = 0; row < this.viewRowCount; ++row) {
                symbolSpriteArr[row] = this.getActiveSymbol(col, row);
            }
            this.spinRowShift[col] = 0;
            for (row = 0; row < this.viewRowCount; ++row) {
                var modelRow = this.getModelRow(col, row);
                this.activeSymbols[col][modelRow] = symbolSpriteArr[row];
            }
        }
    },

    setSpinMoveMode: function () {
        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            this.spinRowCountWhenResultReceived[col] = 0;
        }

        var moveStartMode = (this.subjectTmpl.symbolMoveMode & 0xff);
        if (this.isInFreeSpin) {
            moveStartMode = ((this.subjectTmpl.symbolMoveMode >> 16) & 0xff);
        }
        if (moveStartMode == SymbolMoveMode.SYMBOL_MOVE_MODE_DOWNWARD_EASE_OUT) {
            this.setEaseoutSpinMoveMode();
        }
        else {
            this.setNormalSpinMoveMode();
        }
    },

    setEaseoutSpinMoveMode: function () {
        this.updateInEaseOutStartState();
    },

    setNormalSpinMoveMode: function () {
        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            this.prevDirection[col] = Direction.DIRECTION_DOWN;
            this.direction[col] = Direction.DIRECTION_DOWN;
            this.accel[col] = this.SPIN_ACCEL;
            this.speed[col] = 0;
            this.distance[col] = 0;
            this.spinState[col] = SpinState.SPIN_STATE_ACCEL;
        }
    },

    update: function (dt) {
        this._super(dt);
        if (this.updateEnabled) {
            for (var col = 0; col < this.panelConfig.slotCols; ++col) {
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
                }
            }
        }
    },

    onSpinResultReceived: function (spinPanel) {
        this._super(spinPanel);
    },

    /**
     * @param {Array.<number>} rowCountArray
     */
    setSpinRowCounWhenResultReceived: function (rowCountArray) {
        for (var localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
            this.spinRowCountWhenResultReceived[localCol] = rowCountArray[this.localColToGlobal(localCol)] + this.spinRowShift[localCol] + 1 - this.getSkipRowCountWhenSpinCompleted(localCol);
        }
    },

    /**
     *
     * @param {Array.<number>} drum
     * @param {boolean} hasBonus
     */
    setDrumMode: function (drum, hasBonus) {
        this.hasBonus = hasBonus;
        this.drumModeState = drum;
        for (var localCol = 0; localCol < this.panelConfig.slotCols; ++localCol) {
            var globalCol = this.localColToGlobal(localCol);
            this.drumModeSpinRows[localCol] = drum[globalCol];
            if (drum[globalCol] != DrumMode.DRUM_MODE_NULL && this.subjectTmpl.symbolOpType == SymbolOpType.SYMBOL_OP_TYPE_STACK_SYMBOL) {
                var symbolId = SymbolId.SYMBOL_ID_SCATTER;
                if (drum[globalCol] == DrumMode.DRUM_MODE_BLINK_BONUS || (globalCol >= 1 && drum[globalCol - 1] == DrumMode.DRUM_MODE_BLINK_BONUS)) {
                    symbolId = SymbolId.SYMBOL_ID_BONUS;
                }
                if (drum[globalCol] == DrumMode.DRUM_MODE_BLINK_JACKPOT || (globalCol >= 1 && drum[globalCol - 1] == DrumMode.DRUM_MODE_BLINK_JACKPOT)) {
                    symbolId = SymbolId.SYMBOL_ID_JACKPOT;
                }
                var symbolArray = this.spinSymbols[localCol];
                for (var i = 0; i < symbolArray.length; ++i) {
                    this.spinSymbols[localCol][i] = symbolId;
                }
            }
        }
    },

    getSkipRowCountWhenSpinCompleted: function (localCol) {
        if (this.maxSymbolSize <= 1) {
            return 0;
        }

        var resultRow = this.direction[localCol] == Direction.DIRECTION_DOWN ? 0 : (this.panelConfig.slotRows - 1);
        var rowStep = this.direction[localCol] == Direction.DIRECTION_DOWN ? 1 : -1;
        var nextSymbolId = this.getSpinResult(localCol, resultRow);
        var realNextSymbolId = this.getGlobalRealSpinResult(this.localColToGlobal(localCol), this.localRowToGlobal(resultRow));
        if (this.subjectTmpl.isConsecutiveSymbol(realNextSymbolId)) {
            var skipRowCount = this.subjectTmpl.getSymbolHeight(realNextSymbolId);
            var tmpSymbolId;
            var tmpRealSymbolId;
            for (var localRow = resultRow; localRow < this.panelConfig.slotRows && localRow >= 0; localRow += rowStep) {
                tmpSymbolId = this.getSpinResult(localCol, localRow);
                tmpRealSymbolId = this.getGlobalRealSpinResult(this.localColToGlobal(localCol), this.localRowToGlobal(localRow));
                if (tmpSymbolId != nextSymbolId || tmpRealSymbolId != realNextSymbolId) {
                    break;
                }
                --skipRowCount;
            }
            if (skipRowCount < 0) {
                skipRowCount = 0;
            }
            return skipRowCount;
        }
        return 0;
    },

    reviseSymbols: function () {
        /* The pattern moving upward first then moving downward is permitted
         * only when there isn't consecutive symbols. Reset the position of
         * the invisible symbol.
         */
        var col;
        var symbolSprite;
        if (this.maxSymbolSize == 1) {
            var symbolPos;
            for (col = 0; col < this.panelConfig.slotCols; ++col) {
                if (this.prevDirection[col] != this.direction[col]) {
                    symbolSprite = this.getActiveSymbol(col, this.panelConfig.slotRows);
                    if (symbolSprite != null) {
                        if (this.direction[col] == Direction.DIRECTION_DOWN) {
                            symbolPos = this.getSymbolPos(col, this.panelConfig.slotRows);
                        }
                        else {
                            symbolPos = this.getSymbolPos(col, -1);
                        }
                        symbolSprite.setPosition(symbolPos);
                    }
                }
            }
        }
    },

    onSubRoundStart: function () {
        this._super();
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

        this.overlayNode.visible = false;

        this.spinEndColCount = 0;
    },

    getPrevModelRow: function (col, viewRow) {
        var modelRow = (viewRow - ((this.spinRowShift[col] - 1) % this.viewRowCount) * this.direction[col] + this.viewRowCount) % this.viewRowCount;
        return modelRow;
    },

    getModelRow: function (col, viewRow) {
        var modelRow = (viewRow - (this.spinRowShift[col] % this.viewRowCount) * this.direction[col] + this.viewRowCount) % this.viewRowCount;
        return modelRow;
    },

    getActiveConsecutiveSymbol: function (localCol, viewRow) {
        var symbolId = this.getSpinResult(localCol, viewRow);
        var result = this.getActiveSymbol(localCol, viewRow);
        if (result == null && this.subjectTmpl.isConsecutiveSymbol(symbolId)) {
            var size = this.subjectTmpl.getSymbolHeight(symbolId);
            var tmpSymbolId;
            var rowStep = this.direction[localCol] == Direction.DIRECTION_DOWN ? 1 : -1;
            for (var i = viewRow; i < this.panelConfig.slotRows && i >= 0; i += rowStep) {
                tmpSymbolId = this.getSpinResult(localCol, i);
                if (tmpSymbolId != symbolId) {
                    break;
                }
                --size;
                result = this.getActiveSymbol(localCol, i);
                if (result != null) {
                    return result;
                }
            }
            if (size > 0) {
                result = this.getActiveSymbol(localCol, this.panelConfig.slotRows);
            }
        }
        return result;
    },

    updateInEaseOutStartState: function () {
        for (var col = 0; col < this.panelConfig.slotCols; ++col) {
            for (var row = 0; row < this.viewRowCount; ++row) {
                var node = this.getActiveSymbol(col, row);
                if (node != null) {
                    node.runAction(cc.moveBy(0.2, 0, 15));
                }
            }
            this.distance[col] = 15;
        }

        this.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(this.setNormalSpinMoveMode, this)));
    },

    updateInAccelState: function (dt, localCol) {
        var hasSpinOneRow = false;
        if (this.speed[localCol] > 0.001) {
            var deltaDistance = this.speed[localCol] * dt * this.direction[localCol];
            //Prevent fast move
            if (Math.abs(deltaDistance) >= this.gridHeight * 0.9) {
                deltaDistance = this.gridHeight * 0.9 * this.direction[localCol];
            }
            this.distance[localCol] += deltaDistance;
            if (Math.abs(this.distance[localCol]) >= this.gridHeight) {
                this.distance[localCol] -= this.gridHeight * this.direction[localCol];
                hasSpinOneRow = true;
            }
            for (var viewRow = 0; viewRow < this.viewRowCount; ++viewRow) {
                var symbolSprite = this.getActiveSymbol(localCol, viewRow);
                if (symbolSprite != null) {
                    symbolSprite.setPositionY(symbolSprite.getPositionY() + deltaDistance);
                    symbolSprite.zIndex = this.panelConfig.slotRows - viewRow;
                }
            }
        }
        this.speed[localCol] += this.accel[localCol] * dt;
        if (this.speed[localCol] >= this.SPIN_SPEED_STEADY) {
            this.speed[localCol] = this.SPIN_SPEED_STEADY;
            this.accel[localCol] = 0;
            this.spinState[localCol] = SpinState.SPIN_STATE_STEADY;
        }
        if (hasSpinOneRow) {
            this.onSpinOneRow(localCol);
        }
    },

    updateInSteadyState: function (dt, localCol) {
        var hasSpinOneRow = false;
        var deltaDistance = this.speed[localCol] * dt * this.direction[localCol];
        //Prevent fast move
        if (Math.abs(deltaDistance) >= this.gridHeight * 0.9) {
            deltaDistance = this.gridHeight * 0.9 * this.direction[localCol];
        }
        this.distance[localCol] += deltaDistance;
        if (Math.abs(this.distance[localCol]) >= this.gridHeight) {
            this.distance[localCol] -= this.gridHeight * this.direction[localCol];
            hasSpinOneRow = true;
        }
        for (var viewRow = 0; viewRow < this.viewRowCount; ++viewRow) {
            var symbolSprite = this.getActiveSymbol(localCol, viewRow);
            if (symbolSprite != null) {
                symbolSprite.setPositionY(symbolSprite.getPositionY() + deltaDistance);
                symbolSprite.zIndex = this.panelConfig.slotRows - viewRow;
            }
        }
        if (hasSpinOneRow) {
            this.onSpinOneRow(localCol);
        }
    },

    updateInDecelState: function (dt, localCol) {
        var deltaDistance = this.speed[localCol] * dt * this.direction[localCol];
        //Prevent fast move
        if (Math.abs(deltaDistance) >= this.gridHeight * 0.9) {
            deltaDistance = this.gridHeight * 0.9 * this.direction[localCol];
        }
        this.distance[localCol] += deltaDistance;
        this.speed[localCol] += this.accel[localCol] * dt;
        var isCompleted = false;
        var moveEndMode = (this.subjectTmpl.symbolMoveMode & 0xff00) >> 8;
        if (this.isInFreeSpin) {
            moveEndMode = ((this.subjectTmpl.symbolMoveMode >> 16) & 0x0ff00) >> 8;
        }
        var maxDistance;
        if (moveEndMode == SymbolMoveMode.SYMBOL_MOVE_MODE_SHAKE_END) {
            maxDistance = this.gridHeight * 0.15 * this.panelConfig.slotRows / 3.0;
        }
        else {
            maxDistance = this.gridHeight * 0.35 * this.panelConfig.slotRows / 3.0;
        }
        cc.log("maxDistance:" + maxDistance);
        var symbolSprite;
        if (Math.abs(this.distance[localCol]) >= maxDistance) {
            isCompleted = true;
        }

        if (this.speed[localCol] <= 0 || isCompleted) {
            for (var row = 0; row < this.viewRowCount; ++row) {
                symbolSprite = this.getActiveSymbol(localCol, row);
                if (symbolSprite != null) {
                    var curY = symbolSprite.y;
                    var targetY = this.getSymbolPos(localCol, row).y;
                    this.distance[localCol] = targetY - curY;
                    break;
                }
            }
            this.spinState[localCol] = (moveEndMode != SymbolMoveMode.SYMBOL_MOVE_MODE_SHAKE_END) ? SpinState.SPIN_STATE_EASE_IN : SpinState.SPIN_STATE_SHAKE_END;
            if (this.direction[localCol] == Direction.DIRECTION_DOWN) {
                this.speed[localCol] = this.SPIN_SPEED_EASE_IN_DOWN;
                this.accel[localCol] = this.SPIN_EASE_IN_DECEL_DOWN;
            }
            else {
                this.speed[localCol] = this.SPIN_SPEED_EASE_IN_UP;
                this.accel[localCol] = this.SPIN_EASE_IN_DECEL_UP;
            }

            return;
        }

        for (var viewRow = 0; viewRow < this.viewRowCount; ++viewRow) {
            symbolSprite = this.getActiveSymbol(localCol, viewRow);
            if (symbolSprite != null) {
                symbolSprite.setPositionY(symbolSprite.getPositionY() + deltaDistance);
                symbolSprite.zIndex = this.panelConfig.slotRows - viewRow;
            }
        }
    },

    updateInEaseInState: function (dt, localCol) {
        var deltaDistance = this.speed[localCol] * dt * this.direction[localCol];
        //Prevent fast move
        if (Math.abs(deltaDistance) >= this.gridHeight * 0.9) {
            deltaDistance = this.gridHeight * 0.9 * this.direction[localCol];
        }
        this.distance[localCol] += deltaDistance;    //now, the distance is in the opposite direction.
        this.speed[localCol] += this.accel[localCol] * dt;

        var symbolSprite;
        var row;
        if (this.distance[localCol] * this.direction[localCol] > 0 || this.speed[localCol] < 0) {
            this.spinState[localCol] = SpinState.SPIN_STATE_END;

            var offsetY;
            var targetY;
            for (row = 0; row < this.viewRowCount; ++row) {
                symbolSprite = this.getActiveSymbol(localCol, row);
                if (symbolSprite != null) {
                    targetY = this.getSymbolPos(localCol, row).y;
                    offsetY = targetY - symbolSprite.y;
                    break;
                }
            }

            for (row = 0; row < this.viewRowCount; ++row) {
                symbolSprite = this.getActiveSymbol(localCol, row);
                if (symbolSprite != null) {
                    symbolSprite.y += offsetY;
                }
            }
            this.onColSpinEnd(localCol);
            return;
        }

        for (row = 0; row < this.viewRowCount; ++row) {
            symbolSprite = this.getActiveSymbol(localCol, row);
            if (symbolSprite != null) {
                symbolSprite.setPositionY(symbolSprite.getPositionY() - deltaDistance);
            }
        }
    },

    updateInShakeEndState: function (dt, localCol) {
        var posOffset;
        var row;
        /**
         * @type {cc.Sprite}
         */
        var symbolNode;
        var symbolPos;
        for (row = 0; row < this.viewRowCount; ++row) {
            symbolNode = this.getActiveSymbol(localCol, row);
            if (symbolNode != null) {
                symbolPos = this.getSymbolPos(localCol, row);
                posOffset = symbolPos.y - symbolNode.getPositionY();
                break;
            }
        }
        for (row = 0; row < this.viewRowCount; ++row) {
            symbolNode = this.getActiveSymbol(localCol, row);
            if (symbolNode != null) {
                symbolNode.y += posOffset;
            }
        }

        this.spinState[localCol] = SpinState.SPIN_STATE_END;
        for (row = 0; row < this.viewRowCount; ++row) {
            symbolNode = this.getActiveSymbol(localCol, row);
            if (symbolNode) {
                var oldPosY = symbolNode.getPositionY();
                symbolNode.y = oldPosY - 20;
                symbolNode.runAction(cc.moveTo(0.25, symbolNode.getPositionX(), oldPosY).easing(cc.easeBounceOut()));
            }
        }

        this.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onColSpinEndCallFunc, this, localCol)));
    },

    onColSpinEndCallFunc: function (sender, localCol) {
        this.onColSpinEnd(localCol);
    },

    onSpinOneRow: function (localCol) {
        ++this.spinRowShift[localCol];
        this.onColDrumMode(localCol);

        var nextSymbolId = SymbolId.SYMBOL_ID_INVALID;
        var upSkipRowCount;
        var downSkipRowCount;
        var prevModelRow;
        /**
         * @type {cc.Sprite}
         */
        var oldNode;
        if (this.spinRowCountWhenResultReceived[localCol] > 0 && this.spinRowShift[localCol] >= (this.spinRowCountWhenResultReceived[localCol] + this.panelConfig.slotRows)) {
            this.speed[localCol] = this.SPIN_SPEED_DECEL;
            this.accel[localCol] = this.SPIN_DECEL;
            this.spinState[localCol] = SpinState.SPIN_STATE_DECEL;
            if (this.skipRowCounts[localCol] == 0) {
                nextSymbolId = this.randomInconsecutiveSymbolId(localCol, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
            }
            else {
                prevModelRow = this.getPrevModelRow(localCol, this.panelConfig.slotRows);

                oldNode = this.activeSymbols[localCol][prevModelRow];
                this.activeSymbols[localCol][prevModelRow] = null;
                this.setActiveSymbol(localCol, this.panelConfig.slotRows, oldNode);
                // for upper consecutive symbol
                upSkipRowCount = this.skipRowCounts[localCol] & 0xff;
                if (upSkipRowCount > 0) {
                    --upSkipRowCount;
                }
                downSkipRowCount = 0;
                this.skipRowCounts[localCol] = (upSkipRowCount & 0xff) | ((downSkipRowCount & 0xff) << 8);
            }
        }
        else if (this.spinRowCountWhenResultReceived[localCol] > 0 && this.spinRowShift[localCol] >= this.spinRowCountWhenResultReceived[localCol]) {
            if (this.skipRowCounts[localCol] == 0) {
                var resultRow = this.spinRowShift[localCol] - this.spinRowCountWhenResultReceived[localCol];
                if (this.direction[localCol] == Direction.DIRECTION_UP) {
                    resultRow = this.panelConfig.slotRows - 1 - resultRow;
                }
                nextSymbolId = this.getSpinResult(localCol, resultRow);
                var realNextSymbolId = this.getGlobalRealSpinResult(this.localColToGlobal(localCol), this.localRowToGlobal(resultRow));
                var tmpSymbolId;
                var tmpRealSymbolId;
                if (this.subjectTmpl.isConsecutiveSymbol(realNextSymbolId)) {
                    var symbolSize = this.subjectTmpl.getSymbolHeight(realNextSymbolId);
                    upSkipRowCount = symbolSize;
                    var rowStep = this.direction[localCol] == Direction.DIRECTION_DOWN ? 1 : -1;
                    for (var tmpRow = resultRow; tmpRow < this.panelConfig.slotRows && tmpRow >= 0; tmpRow += rowStep) {
                        tmpSymbolId = this.getSpinResult(localCol, tmpRow);
                        tmpRealSymbolId = this.getGlobalRealSpinResult(this.localColToGlobal(localCol), this.localRowToGlobal(tmpRow));
                        if (tmpSymbolId != nextSymbolId || tmpRealSymbolId != realNextSymbolId) {
                            break;
                        }
                        --upSkipRowCount;
                    }
                    if (upSkipRowCount < 0) {
                        upSkipRowCount = 0;
                    }
                    downSkipRowCount = symbolSize - upSkipRowCount - 1;
                    if (downSkipRowCount < 0) {
                        downSkipRowCount = 0;
                    }
                    //CCLOG("downSkipRowCount={0}", downSkipRowCount);
                    this.skipRowCounts[localCol] = (upSkipRowCount & 0xff) | ((downSkipRowCount & 0xff) << 8);
                }
            }
            else {
                prevModelRow = this.getPrevModelRow(localCol, this.panelConfig.slotRows);
                oldNode = this.activeSymbols[localCol][prevModelRow];
                this.activeSymbols[localCol][prevModelRow] = null;
                this.setActiveSymbol(localCol, this.panelConfig.slotRows, oldNode);

                upSkipRowCount = this.skipRowCounts[localCol] & 0xff;
                downSkipRowCount = (this.skipRowCounts[localCol] & 0xff00) >> 8;
                if (downSkipRowCount > 0) {
                    --downSkipRowCount;
                }
                else {
                    if (upSkipRowCount > 0) {
                        ++this.spinRowCountWhenResultReceived[localCol];
                        --upSkipRowCount;
                    }
                }
                this.skipRowCounts[localCol] = (upSkipRowCount & 0xff) | ((downSkipRowCount & 0xff) << 8);
                return;
            }
        }
        else {
            if (this.skipRowCounts[localCol] == 0) {
                var curSpinRow = this.spinRowShift[localCol] % this.SPIN_SYMBOL_ROWS;
                nextSymbolId = this.spinSymbols[localCol][curSpinRow];
                var nextSimulatorSymbolId = this.getRealSimulatorResult(localCol, curSpinRow);
                if ((nextSymbolId == SymbolId.SYMBOL_ID_INVALID) || ((this.spinRowShift[localCol] + this.subjectTmpl.getSymbolHeight(nextSimulatorSymbolId)) >= this.spinRowCountWhenResultReceived[localCol]
                    && this.spinRowCountWhenResultReceived[localCol] > 0)) {
                    nextSymbolId = this.randomInconsecutiveSymbolId(localCol, this.subjectTmpl, this.panelConfig.panelId, this.isInFreeSpin);
                    nextSimulatorSymbolId = nextSymbolId;
                }
                if (this.subjectTmpl.isConsecutiveSymbol(nextSimulatorSymbolId)) {
                    this.skipRowCounts[localCol] = this.subjectTmpl.getSymbolHeight(nextSimulatorSymbolId) - 1;
                }
            }
            else {
                prevModelRow = this.getPrevModelRow(localCol, this.panelConfig.slotRows);
                oldNode = this.activeSymbols[localCol][prevModelRow];
                this.activeSymbols[localCol][prevModelRow] = null;
                this.setActiveSymbol(localCol, this.panelConfig.slotRows, oldNode);

                upSkipRowCount = this.skipRowCounts[localCol] & 0xff;
                --upSkipRowCount;
                if (upSkipRowCount < 0) {
                    upSkipRowCount = 0;
                }
                this.skipRowCounts[localCol] = upSkipRowCount;
                return;
            }
        }

        if (nextSymbolId == SymbolId.SYMBOL_ID_INVALID) {
            //CCLOG("The SymbolId is kSymbolIdInvalid!");
            return;
        }
        var addedSymbolSprite = this.addSymbolSprite(localCol, this.panelConfig.slotRows, nextSymbolId);
        if (addedSymbolSprite != null) {
            addedSymbolSprite.y += this.distance[localCol];
            if (this.subjectTmpl.isConsecutiveSymbol(nextSymbolId)) {
                addedSymbolSprite.y -= this.gridHeight * (this.subjectTmpl.getSymbolHeight(nextSymbolId) - 1) * this.direction[localCol];
            }
        }
        this.setActiveSymbol(localCol, this.panelConfig.slotRows, addedSymbolSprite);
    },

    onColSpinEnd: function (localCol) {
        ++this.spinEndColCount;
        this.stopDrumModeAnim(localCol);
        if (this.spinEndColCount >= this.panelConfig.slotCols) {
            this.onSpinEnd();
        }
    },

    onBlinkAllWinLinesCompleted: function () {
        this.framesNode.removeAllChildren(true);
        this.framesBgNode.removeAllChildren(true);
        this.linesNode.zIndex = this.ZORDER_LINE_NODE;
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_ALL_WIN_LINE_END);
    },

    blinkWinLineInTurn: function () {
        this.curWinLineIndex = 0;
        this.blinkWinLine();
    },

    blinkWinLine: function () {
        this.overlayNode.visible = true;
        var winLine = this.getNormalWinLine(this.curWinLineIndex);
        if (this.lineNodeArray.length > winLine.lineIndex) {
            this.lineNodeArray[winLine.lineIndex].runAction(cc.sequence(cc.show(), cc.delayTime(2.0), cc.hide(), cc.callFunc(this.onBlinkWinLineCompleted, this)));
        }

        this.blinkWinFrameInLine(this.curWinLineIndex);
        this.blinkWinFrameBgInLine(this.curWinLineIndex);
        this.blinkSymbolsInLine(this.curWinLineIndex);

        //var matchSymbolId = this.getMatchSymbolInLine(this.curWinLineIndex);
        //var matchSymbolConfig = this.subjectTmpl.getSymbol(matchSymbolId);
        //if (matchSymbolConfig.payTables[winLine.num]) {
        //    var winCount = winLine.winRate * SlotMan.getCurrent().spinBet;
        //    this.dispatchOutputEvent(Util.sprintf("Line %d: %d x %s pays %s", winLine.lineIndex + 1, winLine.num, matchSymbolConfig.name, Util.getCommaNum(winCount)));
        //}
    },

    onBlinkWinLineCompleted: function () {
        var winLine = this.getNormalWinLine(this.curWinLineIndex);
        var lineConfig = this.getLine(winLine.lineIndex);
        var localSymbolNum = this.globalColToLocal(winLine.num);
        var symbolId;
        var symbolConfig;
        var symbolSprite;
        for (var localCol = 0; localCol < localSymbolNum && localCol < this.panelConfig.slotCols; ++localCol) {
            var globalCol = this.localColToGlobal(localCol);
            var globalRow = lineConfig.rows[globalCol];
            var localRow = this.globalRowToLocal(globalRow);
            symbolId = this.getSpinResult(localCol, localRow);
            symbolConfig = this.subjectTmpl.getSymbol(symbolId);
            if (symbolConfig.animName.length > 0 || symbolConfig.animEffect != SymbolAnimEffect.SYMBOL_ANIM_EFFECT_NONE) {
                symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
                if (symbolSprite != null) {
                    symbolSprite.setVisible(true);
                }
            }
        }

        this.overlayNode.visible = false;
        this.animsNode.removeAllChildren(true);
        this.framesNode.removeAllChildren(true);
        this.framesBgNode.removeAllChildren(true);

        ++this.curWinLineIndex;
        if (this.curWinLineIndex < this.getNormalWinLines().length) {
            this.blinkWinLine();
        } else {
            this.onBlinkWinLineRoundCompleted();
        }
    },

    onBlinkWinLineRoundCompleted: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_WIN_LINE_ROUND_END);
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
                    AudioHelper.playSlotEffect("reel-stop");
                }
            }
        } else if (this.hasDrumMode(localCol)) {
            this.startDrumMode(localCol);
        }
    },

    hasDrumMode: function (localCol) {
        var endSpinRow = this.spinRowCountWhenResultReceived[localCol] + this.panelConfig.slotRows;
        return ((this.spinRowShift[localCol] + this.drumModeSpinRows[localCol]) == endSpinRow && this.drumModeSpinRows[localCol] > 0);
    },

    hasScatterBonusJackpotInCol: function (localCol) {
        var i;
        var symbolId;
        var drumMode = DrumMode.DRUM_MODE_NULL;
        for(i = 0; i < this.drumModeState.length; ++i) {
            var tmpDrumMode = this.drumModeState[i];
            if (tmpDrumMode > DrumMode.DRUM_MODE_NULL && tmpDrumMode < DrumMode.DRUM_MODE_DRUM) {
                drumMode = tmpDrumMode;
                break;
            }
        }
        if (drumMode == DrumMode.DRUM_MODE_NULL) {
            return false;
        }
        for (i = 0; i < this.panelConfig.slotRows; ++i) {
            symbolId = this.getSpinResult(localCol, i);
            if (symbolId == SymbolId.SYMBOL_ID_BONUS && drumMode == DrumMode.DRUM_MODE_BLINK_BONUS) {
                return true;
            } else if (symbolId == SymbolId.SYMBOL_ID_JACKPOT && drumMode == DrumMode.DRUM_MODE_BLINK_JACKPOT) {
                return true;
            } else if (symbolId == SymbolId.SYMBOL_ID_SCATTER && drumMode == DrumMode.DRUM_MODE_BLINK_SCATTER) {
                return true;
            }
        }
        return false;
    },

    showBonusAppearAudio: function (localCol) {
        AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear3");
    },

    startDrumMode: function (localCol) {
        AudioPlayer.getInstance().playEffectByKey(DRUM_MODE_SOUND);

        this.playDrumModeAnim(localCol);
        this.speed[localCol] = this.SPIN_SPEED_STEADY - 200;
        this.accel[localCol] = 0.0;
        this.spinState[localCol] = SpinState.SPIN_STATE_STEADY;
    },

    onReelStopEffect: function (localCol) {
        var destCol = this.subjectTmpl.reelCol - 1;
        if (localCol + this.panelConfig.colShift == destCol) {
            AudioHelper.playSlotEffect("reel-stop");
        }
    },

    onShowDrumBonus: function (localCol) {
        for (var localRow = 0; localRow < this.panelConfig.slotRows; ++localRow) {
            if (this.getSpinResult(localCol, localRow) == SymbolId.SYMBOL_ID_BONUS) {
                var symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
                if (symbolSprite) {
                    symbolSprite.runAction(cc.fadeIn(0.1));
                }
            }
        }

        var globalCol = this.localColToGlobal(localCol);
        if (globalCol == 1) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear1");
        }
        else if (globalCol == 2) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear2");
        }
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
        if (globalCol === 1) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear1");
        }
        else if (globalCol === 2) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear2");
        }
    },

    onShowDrumScatter: function (localCol) {
        this.showDrumScatterCol(localCol);
    },

    showDrumScatterCol: function (localCol) {
        for (var localRow = 0; localRow < this.panelConfig.slotRows; ++localRow) {
            if (this.getSpinResult(localCol, localRow) == SymbolId.SYMBOL_ID_SCATTER) {
                var symbolSprite = this.getActiveConsecutiveSymbol(localCol, localRow);
                if (symbolSprite) {
                    symbolSprite.runAction(cc.fadeIn(0.1));
                }
            }
        }

        var globalCol = this.localColToGlobal(localCol);
        if (globalCol === 1) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear1");
        }
        else if (globalCol === 2) {
            AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear2");
        }
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
    },

    playDrumModeAnim: function (localCol) {
        if (localCol < this.panelConfig.slotCols) {
            this.curDrumCol = localCol;
            if (this.drumModeEffectNode) {
                var drumModePos = this.getDrumModePos(localCol);
                this.drumModeEffectNode.setPosition(drumModePos.x, drumModePos.y);
                this.drumModeEffectNode.setScaleX(this.gridWidth / 156);
                this.drumModeEffectNode.setScaleY(this.gridHeight * this.panelConfig.eachRowCounts[localCol] / 468.0 * 0.99);
                if (!this.drumModeEffectNode.visible) {
                    this.drumModeEffectNode.setVisible(true);
                }
            }
        }
    },

    stopDrumModeAnim: function (localCol) {
        if (this.curDrumCol == localCol) {
            AudioPlayer.getInstance().stopEffect(DRUM_MODE_SOUND);
            AudioPlayer.getInstance().stopAllEffects();
            this.curDrumCol = -1;
            if (this.drumModeEffectNode) {
                this.drumModeEffectNode.setVisible(false);
            }
        }
    },

    getRealSimulatorResult: function (localCol, localRow) {
        for (var i = localCol; i >= 0; --i) {
            var syId = this.spinSymbols[i][localRow];
            if (syId != SymbolId.SYMBOL_ID_FILL) {
                return syId;
            }
        }
        return SymbolId.SYMBOL_ID_FILL;
    },

    /**
     * @param {Symbol} symbolConfig
     * @returns {cc.Node}
     */
    getBlinkSymbolNode: function (symbolConfig) {
        var animNode;
        var isCCBAnim = symbolConfig.animName.lastIndexOf("ccbi") != -1;
        if (isCCBAnim) {
            animNode = Util.loadNodeFromCCB(symbolConfig.animName, null, "SymbolController", {});
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

    blinkSymbolBgInBottom: function () {
        return false;
    },

    getDrumModeSound: function() {
        switch (this.getDrumModeType()) {
            case DrumMode.DRUM_MODE_SLOW:
                return DRUM_MODE_SOUND_SLOW;
            default :
                return DRUM_MODE_SOUND;
        }
    }
});

module.exports = NormalSpinLayer;