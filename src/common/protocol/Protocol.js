var PomeloClient = require("../net/PomeloClient");
var ProtocolMan = require("./ProtocolMan");
var ErrorCode = require("../enum/ErrorCode");
var ErrorCodeMan = require("../model/ErrorCodeMan");

/**
 * Created by alanmars on 15/4/22.
 */
var Protocol = function(type) {
    this.type = type;
    //deleted by qinning on 20150527,if have any bugs,please contact qinning
    //this.errorCode = ErrorCode.SUCCESS;
};

Protocol.prototype.execute = function() {
};

Protocol.prototype.send = function() {
    cc.log("sendData:"+JSON.stringify(this));
    PomeloClient.getInstance().request(this.getRoute(), this, function(data) {
        cc.log(JSON.stringify(data));
        var protoCtor = ProtocolMan.getInstance().getProtocol(data["type"]);
        if (protoCtor) {
            var protocol = new protoCtor();
            protocol.unmarshal(data);
            protocol.execute();
        }
    });
};

Protocol.prototype.getRoute = function() {
    return "connector.entryHandler.protocolEntry";
};

Protocol.prototype.unmarshal = function(jsonObj) {
    this.errorCode = jsonObj["errorCode"] || ErrorCode.SUCCESS;
    if(this.errorCode === ErrorCode.SUCCESS) {
        return true;
    }
    var Config = require("../util/Config");
    if(!Config.isLocal()) {
        ErrorCodeMan.getInstance().showErrorMsg(this.errorCode);
    }
    return false;
};

module.exports = Protocol;