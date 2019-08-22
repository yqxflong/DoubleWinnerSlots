var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var CommonEvent = require("../../common/events/CommonEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");
var MailBoxAskController = require("./MailBoxAskController");
var MailBoxItemController = require("./MailBoxItemController");
var MailMan = require("../model/MailMan");
var PopupMan = require("../../common/model/PopupMan");

var MailboxItemView = cc.TableViewCell.extend({
    mailNode: null,
    ctor: function () {
        this._super();
        this.mailNode = MailBoxItemController.createFromCCB();
        this.addChild(this.mailNode);
    },
    /**
     * @param {MailItem} mailItem
     */
    initWith: function (mailItem) {
        this.mailNode.controller.initWith(mailItem);
        this.mailNode.y = this.mailNode.controller.heightOffset;
    }
});

var TAB_HISTORY = 0;
var TAB_ASK_QUESTIONS = 1;

var MailBoxController = function () {
    BaseCCBController.call(this);
    this._closeItem = null;
    this._historyItem = null;
    this._askItem = null;
    this._contentNode = null;

    this._askNode = null;

    this._curTab = TAB_HISTORY;
};

Util.inherits(MailBoxController, BaseCCBController);


MailBoxController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.SEND_MAIL_COMPLETED, this.sendMailCompleted, this);
};

MailBoxController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.SEND_MAIL_COMPLETED, this.sendMailCompleted, this);
    //set unread message to read
    if (this._mails) {
        for (var i = 0; i < this._mails.length; ++i) {
            var mailItem = this._mails[i];
            mailItem.read = true;
        }
    }
    MailMan.getInstance().sendReadMailsCmd();
};

MailBoxController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._askNode = MailBoxAskController.createFromCCB();
    this.rootNode.addChild(this._askNode);
    this._askNode.visible = false;

    if (MailMan.getInstance().isHaveUnreadMail()) {
        this._curTab = TAB_HISTORY;
    } else {
        this._curTab = TAB_ASK_QUESTIONS;
    }
    this.updateTab();

    MailMan.getInstance().setHaveUnreadMail(false);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.UNREAD_MAILS);
};

MailBoxController.prototype.sendMailCompleted = function (event) {
    this._askNode.controller.sendMailCompleted(event);

    var isCompleted = event.getUserData();
    if (isCompleted) {
        this.historyClicked();
    }
};

MailBoxController.prototype.updateTab = function () {
    if (this._curTab == TAB_HISTORY) {
        this._mails = MailMan.getInstance().getMails();
        this.showMailTableView();
        this._tableView.visible = true;
        this._askNode.visible = false;
    } else if (this._curTab == TAB_ASK_QUESTIONS) {
        if (this._tableView) {
            this._tableView.visible = false;
        }
        this._askNode.visible = true;
    }
    this.updateTabButton();
};

MailBoxController.prototype.updateTabButton = function () {
    if (this._curTab == TAB_HISTORY) {
        this._historyItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_mail_history_highlight.png"));
        this._askItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_mail_askquestions_normal.png"));
    } else {
        this._historyItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_mail_history_normal.png"));
        this._askItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_mail_askquestions_highlight.png"));
    }
};

MailBoxController.prototype.showMailTableView = function () {
    if(!this._tableView) {
        var tableView = new cc.TableView(this, this._contentNode.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.ignoreAnchorPointForPosition(false);
        tableView.setAnchorPoint(cc.p(0, 0));
        tableView.setPosition(cc.p(0, 0));
        tableView.setDelegate(this);
        this._contentNode.addChild(tableView);
        this._tableView = tableView;
    }
    this._tableView.reloadData();
};

MailBoxController.prototype.scrollViewDidScroll = function (view) {

};

MailBoxController.prototype.scrollViewDidZoom = function (view) {

};

MailBoxController.prototype.tableCellTouched = function (table, cell) {
    cc.log("cell touched at index: " + cell.getIdx());

};

MailBoxController.prototype.tableCellSizeForIndex = function (table, idx) {
    return cc.size(850, this._mails[idx].mailHeight + 15);
};

MailBoxController.prototype.tableCellAtIndex = function (table, idx) {
    var cell = table.dequeueCell();
    if (!cell) {
        cell = new MailboxItemView();
    }
    cell.initWith(this._mails[idx]);
    return cell;
};

MailBoxController.prototype.numberOfCellsInTableView = function (table) {
    if (this._mails) {
        return this._mails.length;
    }
    return 0;
};

MailBoxController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

MailBoxController.prototype.historyClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this._curTab = TAB_HISTORY;
    this.updateTab();
};

MailBoxController.prototype.askClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this._curTab = TAB_ASK_QUESTIONS;
    this.updateTab();
};

MailBoxController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

MailBoxController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

MailBoxController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/setting/casino_mail_system.ccbi", null, "MailBoxController", new MailBoxController());
};

module.exports = MailBoxController;