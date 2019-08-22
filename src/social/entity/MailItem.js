/**
 * Created by liuyue on 15-9-12.
 */
var MailItem = function () {
    this.sourceType = 0;  //MailSourceType 0 : PLAYER , 1 : SYSTEM
    this.msg = null;
    this.timestamp = 0;  //milliseconds from epoch
    this.read = false; //true or false

    this.mailHeight = 0;
};

MailItem.prototype.unmarshal = function(jsonObj) {
    this.sourceType = jsonObj["sourceType"];  //MailSourceType 0 : PLAYER , 1 : SYSTEM
    this.msg = jsonObj["msg"];
    this.timestamp = jsonObj["timestamp"];  //milliseconds from epoch
    this.read = jsonObj["read"]; //true or false
};

module.exports = MailItem;
