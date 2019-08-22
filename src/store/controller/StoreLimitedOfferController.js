var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var LogMan = require("../../log/model/LogMan");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var PopupMan = require("../../common/model/PopupMan");
var StoreType = require("../enum/StoreType");

/**
 * Created by qinning on 15/5/6.
 */
var StoreLimitedOfferController = function () {
    BaseCCBController.call(this);
    this._bgButton = null;
    this._closeButton = null;
    this._countdownLabelNew = null;
    this._countdownLabel = null;

    this.countDownTime = 0;
};

Util.inherits(StoreLimitedOfferController, BaseCCBController);

StoreLimitedOfferController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    this.initSchedule();
};

StoreLimitedOfferController.prototype.onExit = function () {
    this.stopSchedule();
    BaseCCBController.prototype.onExit.call(this);
};

StoreLimitedOfferController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

StoreLimitedOfferController.prototype.initSchedule = function () {
    cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
};

StoreLimitedOfferController.prototype.stopSchedule = function () {
    cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
};

StoreLimitedOfferController.prototype.update = function (dt) {
    this.countDownTime -= dt;
    if (this.countDownTime >= 0) {
        if (this._countdownLabelNew) {
            this._countdownLabelNew.setString(Math.floor(this.countDownTime));
        }
    } else {
        this.close();
    }
};

StoreLimitedOfferController.prototype.initWithTime = function (leftTime) {
    if (leftTime > 60) {
        leftTime = 60;
    }
    this.countDownTime = Math.floor(leftTime);
    if (this._countdownLabelNew) {
        this._countdownLabelNew.setString(Math.floor(this.countDownTime));
    }
};

StoreLimitedOfferController.prototype.initBgSprite = function (path) {
    if(this._bgButton) {
        this._bgButton.setNormalImage(new cc.Sprite(path));
        this._bgButton.setSelectedImage(new cc.Sprite(path));
        this._bgButton.setDisabledImage(new cc.Sprite(path));
    }
};

StoreLimitedOfferController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

StoreLimitedOfferController.prototype.acceptClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
    PopupMan.popupStoreDialog(StoreType.STORE_TYPE_COINS);
};

StoreLimitedOfferController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

StoreLimitedOfferController.prototype.close = function() {
    DialogManager.getInstance().close(this.rootNode, true);
};

StoreLimitedOfferController.createFromCCB = function (ccbiPath) {
    var node = Util.loadNodeFromCCB(ccbiPath, null, "StoreLimitedOfferController", new StoreLimitedOfferController());
    return node;
};

module.exports = StoreLimitedOfferController;