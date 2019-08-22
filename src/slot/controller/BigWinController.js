/**
 * Created by alanmars on 15/5/21.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogData = require("../../common/events/MessageDialogData");
var MessageDialogType = require("../../common/events/MessageDialogType");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioSlotHelper = require("../../common/audio/AudioSlotHelper");
var PopupMan = require("../../common/model/PopupMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var PlayerMan = require("../../common/model/PlayerMan");
var SocialMan = require("../../social/model/SocialMan");

var BigWinController = function () {
    BaseCCBController.call(this);
    this._winLabel = null;
    this._bgSpr = null;

    //custom
    this._totalCoinNumAnim = null;
    this._winCount = 0;
    this._winEffectName = null;
    this._winEffectDuration = 0;
    this._timeoutKey = null;

    this._collectItem = null;

    this._canStopWinAnim = false;

    this._showCollectTimelineKey = 0;

    this._shareCheckSprite = null;
    this._canShare = true;
};

Util.inherits(BigWinController, BaseCCBController);

BigWinController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    AudioPlayer.getInstance().pauseMusicSlowly();
    this._timeoutKey = setTimeout(this.close.bind(this), 20000);

    cc.eventManager.addListener({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: this.onTouchBegan.bind(this)
    }, this.rootNode);
};

BigWinController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    //AudioPlayer.getInstance().stopEffect(this._winEffectName, true);
    AudioPlayer.getInstance().stopAllEffects();
    AudioPlayer.getInstance().resumeMusicSlowly();
    if (this._timeoutKey) {
        clearTimeout(this._timeoutKey);
        this._timeoutKey = null;
    }
    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
};

BigWinController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.useMaskLayer();

    this._canShare = true;

    if(this._collectItem) {
        this._collectItem.enabled = false;
    }
};

BigWinController.prototype.useMaskLayer = function() {
    if(this.maskLayer != null && !cc.isUndefined(this.maskLayer) && this.clipLayer != null && !cc.isUndefined(this.clipLayer)) {
        var clipParentNode = this.clipLayer.getParent();
        this.clipLayer.retain();
        this.clipLayer.removeFromParent(false);

        this.maskLayer.removeFromParent(false);
        this.maskLayer.visible = true;

        var clippingNode = new cc.ClippingNode(this.maskLayer);
        clippingNode.alphaThreshold = 0.5;
        clippingNode.addChild(this.clipLayer);
        this.clipLayer.release();

        clipParentNode.addChild(clippingNode);
    }
};

/**
 *
 * @param winCount
 * @param winEffectName
 * @param winEffectDuration
 */
BigWinController.prototype.initWith = function (winCount, winEffectName, winEffectDuration) {
    this._winLabel.setString("0");
    this._totalCoinNumAnim = new NumberAnimation(this._winLabel);
    this._totalCoinNumAnim.tickDuration = winEffectDuration;
    this._totalCoinNumAnim.tickInterval = 0.05;
    this._winEffectName = winEffectName;
    this._winEffectDuration = winEffectDuration;
    this._winCount = winCount;

    AudioPlayer.getInstance().playEffectByKey("slots/big-win-appear");

    var LogMan = require("../../log/model/LogMan");
    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
    LogMan.getInstance().userProductRecord(ProductChangeReason.BIG_WIN, 0, winCount, 0, 0, ClassicSlotMan.getInstance().subjectId, ClassicSlotMan.getInstance().taskId);
};

BigWinController.prototype.onWinLabelShowed = function (event) {
    AudioSlotHelper.playSlotWinEffect(this._winEffectName);

    this._totalCoinNumAnim.startNum = 0;
    this._totalCoinNumAnim.endNum = this._winCount;
    this._totalCoinNumAnim.start();

    this._showCollectTimelineKey = setTimeout(this.showCollectTimeline.bind(this), this._winEffectDuration * 1000);
    this._canStopWinAnim = true;
};

BigWinController.prototype.showCollectTimeline = function () {
    this._canStopWinAnim = false;
    clearInterval(this._showCollectTimelineKey);

    this.rootNode.animationManager.runAnimationsForSequenceNamed("collectTimeline");

    if(this._collectItem) {
        this._collectItem.enabled = true;
    }
};

BigWinController.prototype.onTouchBegan = function (touch, event) {
    if (!this._canStopWinAnim) return false;
    if (!this._totalCoinNumAnim.isCompleted()) {
        this._totalCoinNumAnim.stop();
        this.showCollectTimeline();
        //AudioPlayer.getInstance().stopEffect(this._winEffectName, true);
        //AudioPlayer.getInstance().stopAllEffects();
    }
    return false;
};

BigWinController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
    PopupMan.popupRate();
};

BigWinController.prototype.collectClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if(!PlayerMan.getInstance().isGuest() && this._canShare) {
        var SharePosType = require("../../social/enum/SharePosType");
        SocialMan.getInstance().shareWithPermission(SharePosType.SHARE_BIG_WIN, function (errorCode) {
            if (errorCode === 0) {
                this.sendShareRecordLog(true);
            }
            else {
                this.sendShareRecordLog(false);
            }
        }.bind(this), this._winCount);
    }
    else {
        this.sendShareRecordLog(false);
    }
    this.close();
};

BigWinController.prototype.sendShareRecordLog = function (canShare) {
    //guest does not need send share record log.
    if (PlayerMan.getInstance().isGuest()) {
        return;
    }
    var LogMan = require("../../log/model/LogMan");
    var SharePosType = require("../../social/enum/SharePosType");
    var ActionType = require("../../log/enum/ActionType");
    if (canShare) {
        LogMan.getInstance().shareRecord(SharePosType.SHARE_BIG_WIN, ActionType.TAKE_ACTION);
    } else {
        LogMan.getInstance().shareRecord(SharePosType.SHARE_BIG_WIN, ActionType.LEAVE);
    }
};

BigWinController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

BigWinController.prototype.shareClicked = function (sender) {
    this._canShare = !this._canShare;
    if(this._canShare) {
        this._shareCheckSprite.visible = true;
    }
    else {
        this._shareCheckSprite.visible = false;
    }
};

BigWinController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(MessageDialogType.SLOT_BIG_WIN));
};

BigWinController.createFromCCB = function() {
    var node = null;
    var randomValue = Util.randomNextInt(2);
    if(randomValue < 1) {
        var node = Util.loadNodeFromCCB("casino/popup/popup_bigwin_1.ccbi", null, "BigWinController", new BigWinController());
    }
    else {
        var node = Util.loadNodeFromCCB("casino/popup/popup_bigwin_2.ccbi", null, "BigWinController", new BigWinController());
    }
    node.setPosition(cc.p(-cc.winSize.width / 2, -320));
    return node;
};

module.exports = BigWinController;