var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PageType = require("../../log/enum/PageType");
var LogMan = require("../../log/model/LogMan");
var ActionType = require("../../log/enum/ActionType");

/**
 * Created by qinning on 15/11/18.
 */
var LikeUsController = function () {
    BaseCCBController.call(this);

    this._rewardLabel = null;
};

Util.inherits(LikeUsController, BaseCCBController);

LikeUsController.prototype.onEnter = function () {
    //EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, true);
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_LIKE_US, ActionType.ENTER);
};

LikeUsController.prototype.onExit = function () {
    //EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, false);
};

LikeUsController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    var PlayerMan = require("../../common/model/PlayerMan");
    this._rewardsLabel.setString(Util.getCommaNum(PlayerMan.getInstance().serverConfig.likeUsReward));
};

LikeUsController.prototype.likeUsClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var BonusMan = require("../model/BonusMan");
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_LIKE_US, ActionType.TAKE_ACTION);
    BonusMan.getInstance().doLikeUs();
    this.close();
};

LikeUsController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

LikeUsController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

LikeUsController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

LikeUsController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/casino_social_likeus.ccbi", null, "LikeUsController", new LikeUsController());
};

module.exports = LikeUsController;