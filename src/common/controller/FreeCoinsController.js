/**
 * Created by JianWang on 8/11/16.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AdControlMan = require("../../ads/model/AdControlMan");
var NodeProrityMan = require("../../common/model/NodeProrityMan");
var CommonEvent = require("../../common/events/CommonEvent");
var PopupMan = require("../../common/model/PopupMan");
var EventDispatcher = require("../../common/events/EventDispatcher");


var FreeCoinsController = function () {
    BaseCCBController.call(this);

    this.ownController = null;
    this.callback = null;
};

Util.inherits(FreeCoinsController, BaseCCBController);

FreeCoinsController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    
};

FreeCoinsController.prototype.onExit = function () {
  
    BaseCCBController.prototype.onExit.call(this);
};

FreeCoinsController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FreeCoinsController.prototype.showRewardVideo = function (callback) {
    if(AdControlMan.getInstance().shouldShowRewardIcon()) {
        this.rootNode.visible = true;
        this.callback = callback;
        return true;
    }
    else {
        this.rootNode.visible = false;
        if(this.callback) {
            this.callback();
        }
    }
    return false;
};
FreeCoinsController.prototype.rewardvideoClicked = function (sender) {
    var LogMan = require("../../log/model/LogMan");
    var ActionType = require("../../log/enum/ActionType");
    var PageType = require("../../log/enum/PageType");
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_REWARDVIDEOCLICK, ActionType.TAKE_ACTION, 0, 1, 0);

    AdControlMan.getInstance().showRewardVideo("Lobby");
    NodeProrityMan.getInstance().resetPrority();
    this.rootNode.visible = false;

    if(this.callback)
        this.callback();
};

FreeCoinsController.prototype.onClose = function() {
    DialogManager.getInstance().close(this.rootNode, true);
};

FreeCoinsController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

FreeCoinsController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/setting/casino_reward_video.ccbi", null, "FreeCoinsController", new FreeCoinsController());
};

module.exports = FreeCoinsController;
