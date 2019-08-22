var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PageType = require("../../log/enum/PageType");
var LogMan = require("../../log/model/LogMan");
var ActionType = require("../../log/enum/ActionType");
var PlayerMan = require("../../common/model/PlayerMan");
var NodeProrityMan = require("../../common/model/NodeProrityMan");
/**
 * Created by qinning on 15/11/18.
 */
var FBLikeUsController = function () {
    BaseCCBController.call(this);

    this._rewardLabel = null;
};

Util.inherits(FBLikeUsController, BaseCCBController);

FBLikeUsController.prototype.onEnter = function () {
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_LIKE_US, ActionType.ENTER);
    cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
};

FBLikeUsController.prototype.onExit = function () {
    cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
    BaseCCBController.prototype.onExit.call(this);
};

FBLikeUsController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FBLikeUsController.prototype.likeUsClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var BonusMan = require("../model/BonusMan");
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_LIKE_US, ActionType.TAKE_ACTION);
    BonusMan.getInstance().doLikeUs();
    this.rootNode.visible = false;
};
FBLikeUsController.prototype.update = function (dt) {

    var player = PlayerMan.getInstance().player;
    var likeUs = player.likeUs;
    if(likeUs) {
        this.rootNode.visible = false;
        return;
    }

    if (NodeProrityMan.getInstance().askForVisible(NodeProrityMan.getInstance().FBLIKEUSNODEPRORITY)) {
        this.rootNode.visible = true;
        return;
    }
    this.rootNode.visible = false;
};

FBLikeUsController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/setting/casino_like.ccbi", null, "FBLikeUsController", new FBLikeUsController());
};

module.exports = FBLikeUsController;