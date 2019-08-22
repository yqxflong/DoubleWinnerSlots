var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../util/AudioHelper");
var AudioPlayer = require("../audio/AudioPlayer");
var EventDispatcher = require("../events/EventDispatcher");
var CommonEvent = require("../events/CommonEvent");
var MailMan = require("../../social/model/MailMan");

/**
 * Created by alanmars on 15/5/20.
 */
var FeedbackController = function () {
    BaseCCBController.call(this);
};

Util.inherits(FeedbackController, BaseCCBController);

FeedbackController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.UNREAD_MAILS, this.onUnreadMails, this);
    this.onUnreadMails();
};

FeedbackController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.UNREAD_MAILS, this.onUnreadMails, this);
    BaseCCBController.prototype.onExit.call(this);
};

FeedbackController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

};

FeedbackController.prototype.onUnreadMails  = function() {
    if (MailMan.getInstance().isHaveUnreadMail()) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("effect");
    } else {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
    }
};

FeedbackController.prototype.feedbackClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var Config = require("../util/Config");
    var ThemeName = require("../enum/ThemeName");
    if (Config.themeName === ThemeName.THEME_WTC) {
        var ContactUsController = require("./ContactUsController");
        var contactUsNode = ContactUsController.createFromCCB();
        contactUsNode.controller.popup();
    } else {
        var MailBoxController = require("../../social/controller/MailBoxController");
        var mailboxNode = MailBoxController.createFromCCB();
        mailboxNode.controller.popup();
    }
};

FeedbackController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/setting/casino_feedback.ccbi", null, "FeedbackController", new FeedbackController());
    return node;
};

module.exports = FeedbackController;