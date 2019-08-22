var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var CommonEvent = require("../../common/events/CommonEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");
var MailSourceType = require("../enum/MailSourceType");
var dateFormat = require("dateformat");

var MailBoxItemController = function () {
    BaseCCBController.call(this);
    this._bgSprite = null;
    this._infoLabel = null;
    this._timeLabel = null;
    this._systemIcon = null;
    this._unreadIcon = null;

    this.heightOffset = 0;
    this.MAX_ITEM_WIDTH = 850;
};

Util.inherits(MailBoxItemController, BaseCCBController);

MailBoxItemController.prototype.onEnter = function () {

};

MailBoxItemController.prototype.onExit = function () {

};

MailBoxItemController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * @param {MailItem} mailItem
 */
MailBoxItemController.prototype.initWith = function (mailItem) {
    var bgName = "casino_setting_mail_bg1.png";
    if (mailItem.sourceType == MailSourceType.SYSTEM) {
        bgName = "casino_setting_mail_bg1.png";
        this._systemIcon.visible = true;
    } else if (mailItem.sourceType == MailSourceType.PLAYER) {
        bgName = "casino_setting_mail_bg2.png";
        this._systemIcon.visible = false;
    }
    var bgSpriteFrame = cc.spriteFrameCache.getSpriteFrame(bgName);
    this._bgSprite.setSpriteFrame(bgSpriteFrame);
    if (!mailItem.read) {
        this._unreadIcon.visible = true;
    } else {
        this._unreadIcon.visible = false;
    }
    this._infoLabel.setString(mailItem.msg);
    this._timeLabel.y = -mailItem.mailHeight + 30;
    var time = dateFormat(mailItem.timestamp, "yyyy-mm-dd h:MM:ss");
    this._timeLabel.setString(time);
    this._bgSprite.setPreferredSize(cc.size(this.MAX_ITEM_WIDTH, mailItem.mailHeight));

    this.heightOffset = mailItem.mailHeight;
};

MailBoxItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/setting/casino_mail_history_item.ccbi", null, "MailBoxItemController", new MailBoxItemController());
};

module.exports = MailBoxItemController;