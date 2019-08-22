var S2CGetMails = require("../protocol/S2CGetMails");
var S2CReadMails = require("../protocol/S2CReadMails");
var C2SGetMails = require("../protocol/C2SGetMails");
var C2SReadMails = require("../protocol/C2SReadMails");
var C2SSendMail = require("../protocol/C2SSendMail");
var S2CSendMail = require("../protocol/S2CSendMail");
var PopupMan = require("../../common/model/PopupMan");
var ErrorCode = require("../../common/enum/ErrorCode");
var PlayerMan = require("../../common/model/PlayerMan");
var DeviceInfo = require("../../common/util/DeviceInfo");
var MailItem = require("../entity/MailItem");
var MailSourceType = require("../enum/MailSourceType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var SendMailType = require("../enum/SendMailType");

var MailMan = (function () {
    var instance;

    function createInstance() {
        var mailItems = [];
        var hasUnreadMails = false;

        return {
            sendGetMailsCmd: function () {
                var c2sGetMails = new C2SGetMails();
                c2sGetMails.send();
            },

            sendReadMailsCmd: function () {
                var c2sReadMails = new C2SReadMails();
                c2sReadMails.send();
            },

            /**
             * @params {S2CGetMails}
             */
            onGetMails: function (s2cGetMails) {
                mailItems = s2cGetMails.mails;
                mailItems.sort(function (item1, item2) {
                    return item1.timestamp - item2.timestamp;
                });
                var label = new cc.LabelTTF("", "Helvetica", 20);
                label.setDimensions(cc.size(720, 0));
                for (var i = 0; i < mailItems.length; ++i) {
                    var mailItem = mailItems[i];
                    if (!mailItem.read) {
                        hasUnreadMails = true;
                    }
                    label.setString(mailItem.msg);
                    mailItem.mailHeight = label.height + 60;
                }
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.UNREAD_MAILS);
            },

            /**
             * @params {S2CReadMails}
             */
            onReadMail: function (s2cReadMails) {
            },

            sendMail: function (email, message) {
                var proto = new C2SSendMail();
                proto.email = email;
                proto.user_message = message;
                proto.IAP = PlayerMan.getInstance().player.iapTotal;
                proto.PT = DeviceInfo.getTargetPlatform();
                proto.bindEmail = SendMailType.SEND_MAIL_TYPE_NORMAL;
                proto.send();
            },

            bindEmail: function (email) {
                var proto = new C2SSendMail();
                proto.email = email;
                proto.user_message = "";
                proto.IAP = PlayerMan.getInstance().player.iapTotal;
                proto.PT = DeviceInfo.getTargetPlatform();
                proto.bindEmail = SendMailType.SEND_MAIL_TYPE_BIND_EMAIL;
                proto.send();
            },

            /**
             * @param {S2CSendMail} s2cSendMail
             */
            onSendMail: function (s2cSendMail) {
                PopupMan.closeIndicator();
                if (s2cSendMail.bindEmail == SendMailType.SEND_MAIL_TYPE_NORMAL) {
                    if (s2cSendMail.errorCode == ErrorCode.SUCCESS) {
                        var email = s2cSendMail.email;
                        if (email && email.length > 0) {
                            PlayerMan.getInstance().player.email = email;
                        }
                        var mailItem = s2cSendMail.mailItem;
                        var label = new cc.LabelTTF("", "Helvetica", 20);
                        label.setDimensions(cc.size(720, 0));
                        label.setString(mailItem.msg);
                        mailItem.mailHeight = label.height + 60;
                        MailMan.getInstance().addMail(mailItem);

                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.SEND_MAIL_COMPLETED, true);
                        PopupMan.popupCommonDialog("THANKS", ["Your message has been sent.", "We will reply you soon.", "Thank you."], "Ok", null, null, false);
                    } else {
                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.SEND_MAIL_COMPLETED, false);
                    }
                } else if (s2cSendMail.bindEmail == SendMailType.SEND_MAIL_TYPE_BIND_EMAIL) {
                    if (s2cSendMail.errorCode == ErrorCode.SUCCESS) {
                        var email = s2cSendMail.email;
                        if (email && email.length > 0) {
                            PlayerMan.getInstance().player.email = email;
                        }
                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.BIND_MAIL_COMPLETED, true);
                    } else {
                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.BIND_MAIL_COMPLETED, false);
                    }
                }
            },

            getMails: function () {
                return mailItems;
            },

            addMail: function (mailItem) {
                mailItems.push(mailItem);
            },

            isHaveUnreadMail: function () {
                return hasUnreadMails;
            },

            setHaveUnreadMail: function (unreadMail) {
                hasUnreadMails = unreadMail;
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = MailMan;
