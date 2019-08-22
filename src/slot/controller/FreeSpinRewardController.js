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
var AudioPlayer = require("../../common/audio/AudioPlayer");
var PopupMan = require("../../common/model/PopupMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");

/**
 * Created by qinning on 15/10/27.
 */
var FreeSpinRewardController = function () {
    BaseCCBController.call(this);
    this._winCoinLabel = null;

    this._totalCoinNumAnim = null;
    this.rewardCount = 0;

    this.messageDialogType = 0;

    this._chipCountMaxWidth = 450;

    this._coinParticle1 = null;
    this._coinParticle2 = null;
    this._coinParticle3 = null;
    this._coinParticle4 = null;
    this._coinParticleList = [];
};

Util.inherits(FreeSpinRewardController, BaseCCBController);

FreeSpinRewardController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

FreeSpinRewardController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
};

FreeSpinRewardController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.useMaskLayer();

    this._coinParticleList = [];
    this._coinParticleList.push(this._coinParticle1);
    this._coinParticleList.push(this._coinParticle2);
    this._coinParticleList.push(this._coinParticle3);
    this._coinParticleList.push(this._coinParticle4);
    this.setParticleBlendFunc();
};

FreeSpinRewardController.prototype.useMaskLayer = function () {
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

FreeSpinRewardController.prototype.setParticleBlendFunc = function() {
    for(var i = 0; i < this._coinParticleList.length; i++) {
        if(this._coinParticleList[i]) {
            this._coinParticleList[i].setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._coinParticleList[i].setBlendFunc(new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA));
        }
    }
};

/**
 *
 * @param {int} rewardCount
 * @param {MessageDialogType} messageDialogType
 */
FreeSpinRewardController.prototype.initWith = function (rewardCount, messageDialogType) {
    this.rewardCount = rewardCount;
    this._winCoinLabel.setString(0);
    this.messageDialogType = messageDialogType;

    this._totalCoinNumAnim = new NumberAnimation(this._winCoinLabel);
    this._totalCoinNumAnim.tickDuration = 2.0;
    this._totalCoinNumAnim.tickInterval = 0.05;
    this._totalCoinNumAnim.maxWidth = this._chipCountMaxWidth;
};

FreeSpinRewardController.prototype.onWinLabelShowed = function (event) {
    this._totalCoinNumAnim.startNum = 0;
    this._totalCoinNumAnim.endNum = this.rewardCount;
    this._totalCoinNumAnim.start();
    if(this.rewardCount > 0) {
        AudioPlayer.getInstance().playEffectByKey("slots/free-spin-end");
    }
};

FreeSpinRewardController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

FreeSpinRewardController.prototype.collectClicked = function (sender) {
    this.closeClicked();
};

FreeSpinRewardController.prototype.shareClicked = function (sender) {
    AudioHelper.playBtnClickSound();
};

FreeSpinRewardController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

FreeSpinRewardController.prototype.onDialogClosed = function (event) {
    this.close();
};

FreeSpinRewardController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(this.messageDialogType));
};

FreeSpinRewardController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/popup/casino_popup_freespin_reward.ccbi", null, "FreeSpinRewardController", new FreeSpinRewardController());
    return node;
};

module.exports = FreeSpinRewardController;