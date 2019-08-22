/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var SlotUIType = require("../events/SlotUIType");
var SlotUIData = require("../events/SlotUIData");
var SlotUIChangeBetData = require("../events/SlotUIChangeBetData");
var CCComboBox = require("../../common/ext/CCComboBox");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var AudioSlotHelper = require("../../common/audio/AudioSlotHelper");
var PlayerMan = require("../../common/model/PlayerMan");
var CommonEvent = require("../../common/events/CommonEvent");
var ProductType = require("../../common/enum/ProductType");
var PayTableController = require("./PaytableController");
var Config = require("../../common/util/Config");
var PopupMan = require("../../common/model/PopupMan");
var ThemeName = require("../../common/enum/ThemeName");
var WinLevel = require("../enum/WinLevel");

var SlotFunctionController = function () {
    this.MAX_BET_WIDTH = 220;
    this.TOTAL_WIN_WIDTH = 290;

    this._spinItem = null;
    this._stopItem = null;
    this._autoSpinItem = null;
    this._autoSpinStopItem = null;
    this._autoSpinSprite = null;
    this._maxBetItem = null;
    this._addBetItem = null;
    this._minusBetItem = null;
    this._changeBetItem = null;
    this._changeBetSpinBox = null;
    this._betList = null;
    this._paysItem = null;

    this._minusLinesItem = null;
    this._addLinesItem = null;

    this._linesLabel = null;
    this._betLabel = null;
    this._winLabel = null;
    this._outputLabel = null;
    this._winNumAnim = null;
    this._totalBetLabel = null;
    this._balanceLabel = null;

    this._subjectTmpl = null;
    this._winEffectName = null;

    this._balanceMaxWidth = 0;
    this._totalCoinNumAnim = null;
    this._betMaxWidth = 0;
    this._totalBetMaxWidth = 0;
    this._winMaxWidth = 0;

    this._spinButton = null;
    this._outputBgLayer = null;

    var subject = SlotConfigMan.getInstance().getSubject(ClassicSlotMan.getInstance().subjectId);
    this._subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
};

Util.inherits(SlotFunctionController, BaseCCBController);

SlotFunctionController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, this.onWinChangedNoAnim, this);
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED, this.onWinChanged, this);
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_REFRESH_FREE_SPIN, this.refreshFreeSpin, this);

    EventDispatcher.getInstance().addEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.LEVEL_UP, this.onLevelUp, this);
};

SlotFunctionController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, this.onWinChangedNoAnim, this);
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED, this.onWinChanged, this);
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_REFRESH_FREE_SPIN, this.refreshFreeSpin, this);

    EventDispatcher.getInstance().removeEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.LEVEL_UP, this.onLevelUp, this);

    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
    if(this._winNumAnim) {
        this._winNumAnim.stopSchedule();
    }
};

SlotFunctionController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._spinItem.visible = true;
    if (this._stopItem) {
        this._stopItem.visible = false;
    }

    this.setTotalBetMaxWidth(this.MAX_BET_WIDTH);

    if (this._changeBetItem) {
        this._betList = SlotConfigMan.getInstance().getBetList(ClassicSlotMan.getInstance().subjectId,
            PlayerMan.getInstance().player.level);
        this.updateChangeBetSpinBox();
    }

    this._winNumAnim = new NumberAnimation(this._winLabel);
    this._winNumAnim.tickDuration = 2.0;
    this._winNumAnim.tickInterval = 0.05;
    this.setWinMaxWidth(this.TOTAL_WIN_WIDTH);

    this.setWin(0);
    this.updateOutput("");

    if (this._balanceLabel) {
        this._totalCoinNumAnim = new NumberAnimation(this._balanceLabel);
        this._totalCoinNumAnim.tickDuration = 1.0;
        this._totalCoinNumAnim.tickInterval = 0.05;

        this.setBalanceMaxWidth(200);
        this.setChipCount(PlayerMan.getInstance().player.chips);
    }

    if(this._addLinesItem) {
        this._addLinesItem.enabled = false;
    }
    if(this._minusLinesItem) {
        this._minusLinesItem.enabled = false;
    }
};

SlotFunctionController.prototype.onSpinButtonClicked = function (sender) {
    this.onSpinItemClicked(sender);
};

SlotFunctionController.prototype.onSpinItemClicked = function (sender) {
    this.onChangeBetLoseFocus();
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_SPIN_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onAutoSpinItemClicked = function (sender) {
    AudioPlayer.getInstance().playEffectByKey("slots/auto-spin-active");
    this.onChangeBetLoseFocus();
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_AUTO_SPIN_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onStopItemClicked = function (sender) {
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_STOP_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onAutoSpinStopItemClicked = function (sender) {
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_AUTO_SPIN_STOP_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onMaxBetItemClicked = function (sender) {
    this.onChangeBetLoseFocus();
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_MAX_BET_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onAddBetItemTriggered = function (sender) {
    //if(Config.isLocal()) {
    //    Config.testIndex++;
    //}
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_ADD_BET_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onMinusBetItemTriggered = function (sender) {
    //if(Config.isLocal()) {
    //    Config.testIndex--;
    //    if(Config.testIndex < 0) Config.testIndex = 0;
    //}
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_MINUS_BET_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onAddLineNumItemTriggered = function (sender) {
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_ADD_LINE_NUM_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onMinusLineNumItemTriggered = function (sender) {
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_MINUS_LINE_NUM_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onChangeBetItemClicked = function (sender) {
    this._changeBetSpinBox.visible = !this._changeBetSpinBox.visible;
};

SlotFunctionController.prototype.onPaysItemClicked = function (sender) {
    //if(Config.isLocal()) {
    //    Config.testForSoundMode = true;
    //    Config.testForSoundSubjectId = ClassicSlotMan.getInstance().subjectId;
    //    this.onChangeBetLoseFocus();
    //    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_SPIN_ITEM_TRIGGERED));
    //}
    
    this.onChangeBetLoseFocus();

    AudioHelper.playBtnClickSound();
    PopupMan.popupPayTable(this._subjectTmpl);
};

SlotFunctionController.prototype.onFreeSpinItemClicked = function (sender) {
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIData(SlotUIType.SLOT_FREE_SPIN_ITEM_TRIGGERED));
};

SlotFunctionController.prototype.onChangeBetActivated = function (txt, index) {
    this._changeBetSpinBox.visible = false;
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UI, new SlotUIChangeBetData(index));
};

SlotFunctionController.prototype.onChangeBetLoseFocus = function (event) {
    if (this._changeBetSpinBox && this._changeBetSpinBox.visible) {
        this._changeBetSpinBox.visible = false;
    }
};

SlotFunctionController.prototype.updateBet = function (betCount) {
    if (this._betLabel) {
        this._betLabel.setString(Util.getCommaNum(betCount));
    }
    this.updateTotalBet();
    if (this._betMaxWidth > 0) {
        Util.scaleCCLabelBMFont(this._betLabel, this._betMaxWidth);
    }
};

SlotFunctionController.prototype.updateLineNum = function (lineNum) {
    if (this._linesLabel) {
        this._linesLabel.setString(Util.getCommaNum(lineNum));
    }
    this.updateTotalBet();
};

SlotFunctionController.prototype.updateTotalBet = function () {
    if (this._totalBetLabel) {
        this._totalBetLabel.setString(Util.getCommaNum(ClassicSlotMan.getInstance().getCurrentTotalBet()));
        if (this._totalBetMaxWidth > 0) {
            Util.scaleCCLabelBMFont(this._totalBetLabel, this._totalBetMaxWidth);
        }
    }
};

/**
 * @param {string} output
 */
SlotFunctionController.prototype.updateOutput = function (output) {
    if (this._outputLabel) {
        this._outputLabel.setString(output);
        if(this._outputBgLayer) {
            if(output && output.length > 0) {
                this._outputBgLayer.visible = true;
            } else {
                this._outputBgLayer.visible = false;
            }
        }
    }
};

SlotFunctionController.prototype.onWinChangedNoAnim = function (event) {
    this._winNumAnim.stop();
    this.setWin(ClassicSlotMan.getInstance().totalWinChips);

    this.setChipCount(ClassicSlotMan.getInstance().curChips);
};

SlotFunctionController.prototype.onWinChanged = function (event) {
    var totalWin = ClassicSlotMan.getInstance().totalWinChips;
    if (totalWin > 0) {
        var curWin = ClassicSlotMan.getInstance().curWinChips;
        if (curWin > 0) {
            var winLevel = ClassicSlotMan.getInstance().getSpinPanel().winLevel;
            if (winLevel == WinLevel.NON_WIN) {
                winLevel = WinLevel.SMALL_WIN;
            }
            if (winLevel < WinLevel.BIG_WIN) {
                var playSound = event.getUserData();
                if(playSound == null || cc.isUndefined(playSound)) playSound = true;

                if(playSound) {
                    AudioPlayer.getInstance().lowerMusicVolumeSlowly();
                    this._winEffectName = this.getWinEffectName(winLevel);
                    AudioSlotHelper.playSlotWinEffect(this._winEffectName);
                }

                this._winNumAnim.tickDuration = this.getWinEffectDuration(winLevel);
                this._winNumAnim.endNum = totalWin;
                if(playSound) {
                    this._winNumAnim.setNumberAnimEndCallback(function () {
                        AudioPlayer.getInstance().louderMusicVolumeSlowly();
                    });
                }
                this._winNumAnim.start();
            } else {
                this.setWin(totalWin);
            }
        }
    } else {
        this._winNumAnim.startNum = 0;
        this.setWin(0);
    }

    if (this._balanceLabel) {
        this._totalCoinNumAnim.startNum = this.getChipCount();
        this._totalCoinNumAnim.endNum = ClassicSlotMan.getInstance().curChips;
        this._totalCoinNumAnim.start();
    }
};

SlotFunctionController.prototype.getWinEffectName = function (winLevel) {
    var TaskConfigMan = require("../../task/config/TaskConfigMan");
    var taskConfig = TaskConfigMan.getInstance().getTaskConfig(ClassicSlotMan.getInstance().taskId);
    if(taskConfig) {
        var themeConfig = SlotConfigMan.getInstance().getSlotThemeConfig(taskConfig.resGroup);
        switch(winLevel) {
            case 1:
                return Util.sprintf("slots/%s/small-win", themeConfig.themeAudio);
                break;
            case 2:
                return Util.sprintf("slots/%s/mid-win", themeConfig.themeAudio);
                break;
            case 3:
                return Util.sprintf("slots/%s/big-win", themeConfig.themeAudio);
                break;
            case 4:
                return Util.sprintf("slots/%s/big-win", themeConfig.themeAudio);
                break;
            default:
                break;
        }
    }
    else {
        var winEffect = this._subjectTmpl.getWinEffect(winLevel);
        return winEffect.effectName;
    }

    return "";
};

SlotFunctionController.prototype.getWinEffectDuration = function (winLevel) {
    switch(winLevel) {
        case 1:
            return 2;
            break;
        case 2:
            return 3;
            break;
        case 3:
            return 7;
            break;
        case 4:
            return 7;
            break;
        default:
            break;
    }

    return 0;
};

SlotFunctionController.prototype.onProductChanged = function (event) {
    if (this._balanceLabel) {
        var userData = event.getUserData();
        if (userData.productType == ProductType.PRODUCT_TYPE_CHIP) {
            this._totalCoinNumAnim.startNum = this.getChipCount();
            this._totalCoinNumAnim.endNum = PlayerMan.getInstance().player.chips;
            this._totalCoinNumAnim.start();
        }
    }
};

SlotFunctionController.prototype.onLevelUp = function (event) {
    if (this._changeBetItem) {
        var newBetList = SlotConfigMan.getInstance().getBetList(ClassicSlotMan.getInstance().subjectId, PlayerMan.getInstance().player.level);
        if (newBetList.length > this._betList.length) {
            this._betList = newBetList;
            this.updateChangeBetSpinBox();
        }
    }
};

SlotFunctionController.prototype.updateChangeBetSpinBox = function () {
    if (this._changeBetSpinBox) {
        this._changeBetSpinBox.removeFromParent(true);
    }
    var lineNum = this._linesLabel ? 1 : ClassicSlotMan.getInstance().maxLineNum;
    var betStrArray = [];
    this._betList.forEach(function (item, index, arr) {
        betStrArray.push(Util.getCommaNum(lineNum * item));
    });
    this._changeBetSpinBox = new CCComboBox(betStrArray, "slot/bet_bg1.png", "slot/bet_bg2.png", "slot/bet_bg2_select.png", 5);
    this._changeBetSpinBox.setAnchorPoint(cc.p(0.5, 0.0));
    this._changeBetSpinBox.setPosition(cc.p(this._changeBetItem.x, this._changeBetItem.y + 25));
    this._changeBetSpinBox.visible = false;
    this._changeBetSpinBox.activatedHandler = this.onChangeBetActivated;
    this._changeBetSpinBox.activatedTarget = this;
    this.rootNode.addChild(this._changeBetSpinBox);
};

SlotFunctionController.prototype.getChipCount = function () {
    return Util.unformatCommaNum(this._balanceLabel.getString());
};

SlotFunctionController.prototype.setChipCount = function (chipCount) {
    if (this._balanceLabel) {
        this._balanceLabel.setString(Util.getCommaNum(chipCount));
        if (this._balanceMaxWidth > 0) {
            Util.scaleCCLabelBMFont(this._balanceLabel, this._balanceMaxWidth);
        }
    }
};

SlotFunctionController.prototype.enableSpin = function () {
    this._spinItem.visible = true;
    this._spinItem.enabled = true;
    if (this._stopItem != null) {
        this._stopItem.visible = false;
    }
    if(this._autoSpinStopItem) {
        this._autoSpinStopItem.visible = false;
        this._autoSpinSprite.visible = false;
    }

    if (this._maxBetItem) {
        this._maxBetItem.enabled = true;
    }
    if (this._changeBetItem) {
        this._changeBetItem.enabled = true;
    }
    if (this._addBetItem) {
        this._addBetItem.enabled = true;
    }
    if (this._minusBetItem) {
        this._minusBetItem.enabled = true;
    }
    if (this._autoSpinItem) {
        this._autoSpinItem.enabled = true;
    }
    if (this._paysItem) {
        this._paysItem.enabled = true;
    }
};

SlotFunctionController.prototype.enableStop = function () {
    this._spinItem.visible = false;
    if (this._stopItem != null) {
        this._stopItem.visible = true;
        this._stopItem.enabled = true;
    }

    if (this._winEffectName != null) {
        //AudioPlayer.getInstance().stopEffect(this._winEffectName, true);
        //AudioPlayer.getInstance().resumeMusicSlowly(true);
        AudioPlayer.getInstance().louderMusicVolumeSlowly();
        this._winEffectName = null;
    }

    if (this._maxBetItem) {
        this._maxBetItem.enabled = false;
    }
    if (this._changeBetItem) {
        this._changeBetItem.enabled = false;
    }
    if (this._addBetItem) {
        this._addBetItem.enabled = false;
    }
    if (this._minusBetItem) {
        this._minusBetItem.enabled = false;
    }
    //if (this._addLinesItem) {
    //    this._addLinesItem.enabled = false;
    //}
    //if (this._minusLinesItem) {
    //    this._minusLinesItem.enabled = false;
    //}
    if (this._autoSpinItem) {
        this._autoSpinItem.enabled = false;
    }
    if (this._paysItem) {
        this._paysItem.enabled = false;
    }
};

SlotFunctionController.prototype.disableStop = function () {
    this._spinItem.visible = false;
    if (this._stopItem != null) {
        this._stopItem.visible = true;
        this._stopItem.enabled = false;
    }
};

SlotFunctionController.prototype.enableAutoSpin = function () {
    this._autoSpinItem.visible = false;
    this._stopItem.visible = true;
    this._stopItem.setPosition(this._autoSpinItem.getPosition());
    this._stopItem.enabled = true;
    this._spinItem.visible = true;
    this._spinItem.enabled = false;

    if (this._changeBetItem) {
        this._changeBetItem.enabled = false;
    }
    if (this._maxBetItem) {
        this._maxBetItem.enabled = false;
    }
};

SlotFunctionController.prototype.stopAutoSpin = function () {
    this._autoSpinItem.visible = true;
    this._stopItem.visible = false;
    this._stopItem.setPosition(this._spinItem.getPosition());
};

SlotFunctionController.prototype.enableFreeSpin = function () {
};

SlotFunctionController.prototype.stopFreeSpin = function () {
};

SlotFunctionController.prototype.setWin = function (win) {
    this._winLabel.setString(Util.getCommaNum(win));
    if (this._winMaxWidth > 0) {
        Util.scaleCCLabelBMFont(this._winLabel, this._winMaxWidth);
    }
};

SlotFunctionController.prototype.setTotalBetMaxWidth = function (value) {
    this._totalBetMaxWidth = value;
};

SlotFunctionController.prototype.setWinMaxWidth = function (value) {
    this._winMaxWidth = value;
    this._winNumAnim.maxWidth = value;
};

SlotFunctionController.prototype.setBalanceMaxWidth = function (value) {
    if (this._balanceLabel) {
        this._balanceMaxWidth = value;
        this._totalCoinNumAnim.maxWidth = value;
    }
};

SlotFunctionController.prototype.updateCurrentBet = function () {
    this.updateBet(ClassicSlotMan.getInstance().bet);
};

SlotFunctionController.prototype.hasWinAnimStopped = function () {
    return this._winNumAnim.hasStopped();
};

SlotFunctionController.prototype.stopWinAnim = function () {
    this._winNumAnim.stop();
};

SlotFunctionController.prototype.updateFreeSpin = function () {
};

SlotFunctionController.prototype.refreshFreeSpin = function () {
};

SlotFunctionController.createFromCCB = function (filePath) {
    return Util.loadNodeFromCCB(filePath, null, "SlotFunctionController", new SlotFunctionController());
};

module.exports = SlotFunctionController;