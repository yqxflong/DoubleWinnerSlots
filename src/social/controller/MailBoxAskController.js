var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var CommonEvent = require("../../common/events/CommonEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");
var MailMan = require("../model/MailMan");
var PlayerMan = require("../../common/model/PlayerMan");
var PopupMan = require("../../common/model/PopupMan");
var MailItem = require("../entity/MailItem");
var MailSourceType = require("../enum/MailSourceType");
var emoji = require('emoji');

var MAX_CONTENT_LENGTH = 1000;

var MailBoxAskController = function () {
    BaseCCBController.call(this);
    this._userIdLabel = null;
    this._mailBg = null;
    this._messageBg = null;
    this._inputBg = null;
    this._infoCount = null;
    this._sendItem = null;
    this._sendInfo = null;
    this._rewardsLabel = null;
    this._rewardTipsLabel = null;

    this._emailEditBox = null;
    this._inputEditBox = null;
};

Util.inherits(MailBoxAskController, BaseCCBController);

MailBoxAskController.prototype.onEnter = function () {
    if (!cc.sys.isNative) {
        if (this._emailEditBox) {
            this._emailEditBox.visible = true;
        }
        if (this._inputEditBox) {
            this._inputEditBox.visible = true;
        }
    }
    EventDispatcher.getInstance().addEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideMailEditBox, this);
};

MailBoxAskController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideMailEditBox, this);
};

MailBoxAskController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._infoCount.setString(Util.sprintf("%d/%d", 0, MAX_CONTENT_LENGTH));
    this._userIdLabel.setString("User ID:" + PlayerMan.getInstance().playerId);
    this._emailEditBox = this.createEditBox(this._mailBg.getContentSize(), this._mailBg.getPosition());
    this._emailEditBox.setPlaceHolder("input your email!");
    this._emailEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_EMAILADDR);
    this._emailEditBox.setString(PlayerMan.getInstance().player.email);
    this.rootNode.addChild(this._emailEditBox);
    this._inputEditBox = this.createEditBox(this._inputBg.getContentSize(), this._inputBg.getPosition());
    this._inputEditBox.setPlaceHolder("input your question!");
    this._inputEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
    this._inputEditBox.setString("");
    this.rootNode.addChild(this._inputEditBox);
    this.checkIsShowBindEmailRewardTips();
};

MailBoxAskController.prototype.checkIsShowBindEmailRewardTips = function () {
    var email = PlayerMan.getInstance().player.email;
    if (email && email.length > 0) {
        this._rewardsLabel.visible = false;
        this._rewardTipsLabel.visible = false;
    } else {
        this._rewardsLabel.setString(Util.getCommaNum(PlayerMan.getInstance().serverConfig.bindEmailReward));
        this._rewardsLabel.visible = true;
        this._rewardTipsLabel.visible = true;
    }
};

/**
 *
 * @param {cc.size} editSize
 * @param {cc.p} pos
 */
MailBoxAskController.prototype.createEditBox = function (editSize, pos) {
    var editBox = new cc.EditBox(editSize, new cc.Scale9Sprite("#casino_black.png"), new cc.Scale9Sprite("#casino_black.png"));

    editBox.setString("");
    editBox.setPosition(pos);

    editBox.setAnchorPoint(cc.p(0, 0));
    editBox.setFontSize(25);
    editBox.setFontColor(cc.color(255, 255, 255));
    //editBox.setPlaceHolder("input your suggestion!");
    editBox.setPlaceholderFontSize(20);
    editBox.setDelegate(this);
    return editBox;
};


MailBoxAskController.prototype.editBoxEditingDidBegin = function (editBox) {

};

MailBoxAskController.prototype.editBoxEditingDidEnd = function (editBox) {

};

MailBoxAskController.prototype.editBoxTextChanged = function (editBox, text) {
    if (this._inputEditBox == editBox) {
        if(text.length > MAX_CONTENT_LENGTH) {
            text = text.substr(0, MAX_CONTENT_LENGTH);
        }
        this._infoCount.setString(Util.sprintf("%d/%d",text.length,MAX_CONTENT_LENGTH));
        this._sendInfo.setString(text);
    }
};

MailBoxAskController.prototype.editBoxReturn = function (editBox) {

};

MailBoxAskController.prototype.sendClicked = function (sender) {
    var text = this._sendInfo.getString();
    text = this.getFilterText(text);
    if (text.length == 0) {
        PopupMan.popupCommonDialog("WARNING", ["Please input your tips"], "Ok", null, null, false);
    } else {
        if (!cc.sys.isNative) {
            this._emailEditBox.visible = false;
            this._inputEditBox.visible = false;
        }

        var emailText = this._emailEditBox.getString();
        emailText = this.getFilterText(emailText);
        MailMan.getInstance().sendMail(emailText, text);
        PopupMan.popupIndicator();
    }
};

MailBoxAskController.prototype.getFilterText = function (oldText) {
    var text = emoji.unifiedToHTML(oldText);
    text = text.replace(/<\/?[^>]*>/g,'');
    return text;
};

MailBoxAskController.prototype.sendMailCompleted = function (event) {
    var isCompleted = event.getUserData();
    if (!cc.sys.isNative) {
        this._emailEditBox.visible = true;
        this._inputEditBox.visible = true;
    }
    this._infoCount.setString(Util.sprintf("%d/%d", 0, MAX_CONTENT_LENGTH));
    if (isCompleted) {
        if (PlayerMan.getInstance().player.email != this._emailEditBox.getString()) {
            this._emailEditBox.setString(PlayerMan.getInstance().player.email);
        }
        this.checkIsShowBindEmailRewardTips();
        this._inputEditBox.setString("");
        this._sendInfo.setString("");
    }
};

MailBoxAskController.prototype.hideMailEditBox = function (event) {
    if (cc.sys.isNative) {
        return;
    }
    var isHide = event.getUserData();
    if (isHide) {
        this._emailEditBox.visible = false;
        this._inputEditBox.visible = false;
    } else {
        this._emailEditBox.visible = true;
        this._inputEditBox.visible = true;
    }
};

MailBoxAskController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/setting/casino_mail_ask_questions.ccbi", null, "MailBoxAskController", new MailBoxAskController());
};

module.exports = MailBoxAskController;