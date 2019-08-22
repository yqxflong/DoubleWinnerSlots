var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PlayerMan = require("../../common/model/PlayerMan");
var ProductType = require("../../common/enum/ProductType");
var Constants = require("../../common/enum/Constants");
var StoreMan = require("../model/StoreMan");
/**
 * Created by qinning on 16/1/7.
 */
var StoreVIPCollectController = function () {
    BaseCCBController.call(this);
    this._rewardCoinsLabel = null;
    this._rewardGemsLabel = null;
    this._rewardStarsLabel = null;
    this._vipRemainLabel = null;
};

Util.inherits(StoreVIPCollectController, BaseCCBController);

StoreVIPCollectController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

StoreVIPCollectController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    DialogManager.getInstance().checkDelayDialogQueue(this.rootNode);
};

StoreVIPCollectController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.useMaskLayer();
    var vipRewardInfo = StoreMan.getInstance().vipRewardInfo;
    this._rewardCoinsLabel.setString(Util.getCommaNum(vipRewardInfo.rewardChips));
    this._rewardGemsLabel.setString(Util.getCommaNum(vipRewardInfo.rewardGems));
    this._rewardStarsLabel.setString(Util.getCommaNum(vipRewardInfo.rewardStars));
    this._vipRemainLabel.setString(Util.sprintf("%d days", StoreMan.getInstance().getLeftVIPDays()));
};

StoreVIPCollectController.prototype.useMaskLayer = function () {
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

StoreVIPCollectController.prototype.collectClicked = function () {
    AudioHelper.playBtnClickSound();
    StoreMan.getInstance().claimVIPDailyReward();
    var PopupMan = require("../../common/model/PopupMan");
    PopupMan.popupIndicator();
    this.close();
};

StoreVIPCollectController.prototype.popup = function () {
    DialogManager.getInstance().popupForDelay(this.rootNode);
};

StoreVIPCollectController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

StoreVIPCollectController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/popup/casino_popup_vip.ccbi", null, "StoreVIPCollectController", new StoreVIPCollectController());
};

module.exports = StoreVIPCollectController;