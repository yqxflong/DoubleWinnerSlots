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
var SocialLoginController = function () {
    BaseCCBController.call(this);

    this._rewardLabel = null;
};

Util.inherits(SocialLoginController, BaseCCBController);

SocialLoginController.prototype.onEnter = function () {
    //EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, true);
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_BIND_FB, ActionType.ENTER);
};

SocialLoginController.prototype.onExit = function () {
    //EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, false);
};

SocialLoginController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    var PlayerMan = require("../../common/model/PlayerMan");
    this._rewardsLabel.setString(Util.getCommaNum(PlayerMan.getInstance().serverConfig.bindFacebookReward));
};

SocialLoginController.prototype.socialLoginClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_BIND_FB, ActionType.TAKE_ACTION);
    var SocialMan = require("../model/SocialMan");
    var StorageController = require("../../common/storage/storageController");
    var PomeloClient = require("../../common/net/PomeloClient");
    var LoginUIController = require("../../common/controller/LoginUIController");
    var GameDirector = require("../../common/model/GameDirector");
    SocialMan.getInstance().fbLogin(function (type, response) {
        if (type == 0) {
            //StorageController.getInstance().setItem("email", email);
            //StorageController.getInstance().setItem("name", name);
            PomeloClient.getInstance().disconnect();
            var node = LoginUIController.createFromCCB();
            GameDirector.getInstance().runWithScene(node);
            node.controller.bindFacebook(response);
        } else {
            //fb login fail,do nothing
        }
    });
};

SocialLoginController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode, true);
};

SocialLoginController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

SocialLoginController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/casino_social_login.ccbi", null, "SocialLoginController", new SocialLoginController());
};

module.exports = SocialLoginController;