var Util = require("../../common/util/Util");
var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var MailItem = require("../entity/MailItem");

var S2CGetMails = function() {
    Protocol.call(this, ProtocolType.Social.S2C_GET_MAILS);
    this.mails = [];      // Array of MailItem
};

Util.inherits(S2CGetMails, Protocol);

S2CGetMails.prototype.execute = function() {
    var MailMan = require("../model/MailMan");
    MailMan.getInstance().onGetMails(this);
};

S2CGetMails.prototype.unmarshal = function(jsonObj) {
    if (!Protocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }

    var i;
    var mails = jsonObj["mails"];
    if (mails) {
        for (i = 0; i < mails.length; ++i) {
            var mailItem = new MailItem();
            mailItem.unmarshal(mails[i]);
            this.mails.push(mailItem);
        }
    }
};

module.exports = S2CGetMails;