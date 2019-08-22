var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var CommonEvent = require("../../common/events/CommonEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");
var MailMan = require("../model/MailMan");
var PlayerMan = require("../../common/model/PlayerMan");
var PopupMan = require("../../common/model/PopupMan");
var SocialMan = require("../../social/model/SocialMan");
var PageType = require("../../log/enum/PageType");
var LogMan = require("../../log/model/LogMan");
var ActionType = require("../../log/enum/ActionType");

var BindEmailController = function () {
    BaseCCBController.call(this);
    this._rewardsLabel = null;
    this._mailBg = null;

    this._emailEditBox = null;

    this.MAX_REWARD_WIDTH = 190;
};

Util.inherits(BindEmailController, BaseCCBController);

BindEmailController.prototype.onEnter = function () {
    if (!cc.sys.isNative) {
        if (this._emailEditBox) {
            this._emailEditBox.visible = true;
        }
    }
    EventDispatcher.getInstance().addEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideMailEditBox, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.BIND_MAIL_COMPLETED, this.bindMailCompleted, this);

    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_BIND_EMAIL, ActionType.ENTER);
};

BindEmailController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.BIND_MAIL_COMPLETED, this.bindMailCompleted, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideMailEditBox, this);
};

BindEmailController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    var PlayerMan = require("../../common/model/PlayerMan");
    this._rewardsLabel.setString(Util.getCommaNum(PlayerMan.getInstance().serverConfig.bindEmailReward));
    this._emailEditBox = this.createEditBox(this._mailBg.getContentSize(), this._mailBg.getPosition());
    this._emailEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_EMAILADDR);
    this._emailEditBox.setPlaceHolder("input your email!");
    this._emailEditBox.setString(PlayerMan.getInstance().player.email);
    this.rootNode.addChild(this._emailEditBox);

    Util.scaleCCLabelBMFont(this._rewardsLabel, this.MAX_REWARD_WIDTH);
};

/**
 *
 * @param {cc.size} editSize
 * @param {cc.p} pos
 */
BindEmailController.prototype.createEditBox = function (editSize, pos) {
    var editBox = new cc.EditBox(editSize, new cc.Scale9Sprite("#casino_black.png"), new cc.Scale9Sprite("#casino_black.png"));

    editBox.setString("");
    editBox.setPosition(pos);

    editBox.setAnchorPoint(cc.p(0, 0));
    editBox.setFontSize(25);
    editBox.setFontColor(cc.color(255, 255, 255));
    editBox.setPlaceholderFontSize(20);
    editBox.setDelegate(this);
    return editBox;
};


BindEmailController.prototype.editBoxEditingDidBegin = function (editBox) {

};

BindEmailController.prototype.editBoxEditingDidEnd = function (editBox) {

};

BindEmailController.prototype.editBoxTextChanged = function (editBox, text) {

};

BindEmailController.prototype.editBoxReturn = function (editBox) {

};

BindEmailController.prototype.bindClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_BIND_EMAIL, ActionType.TAKE_ACTION);
    var emailText = this._emailEditBox.getString();
    if (emailText.length > 0) {
        if (Util.validateEmail(emailText)) {
            if (!cc.sys.isNative) {
                this._emailEditBox.visible = false;
            }
            MailMan.getInstance().bindEmail(emailText);
            PopupMan.popupIndicator();
        } else {
            PopupMan.popupCommonDialog("WARNING", ["Invalid email"], "Ok", null, null, false);
        }
    }
};

BindEmailController.prototype.bindMailCompleted = function (event) {
    var isCompleted = event.getUserData();
    if (!cc.sys.isNative) {
        this._emailEditBox.visible = true;
    }
    if (isCompleted) {
        this.close();
    }
};

BindEmailController.prototype.hideMailEditBox = function (event) {
    if (cc.sys.isNative) {
        return;
    }
    var isHide = event.getUserData();
    if (isHide) {
        this._emailEditBox.visible = false;
    } else {
        this._emailEditBox.visible = true;
    }
};

BindEmailController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

BindEmailController.prototype.close = function (sender) {
    DialogManager.getInstance().close(this.rootNode, true);
};

BindEmailController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

BindEmailController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/casino_social_bind_email.ccbi", null, "BindEmailController", new BindEmailController());
};

module.exports = BindEmailController;