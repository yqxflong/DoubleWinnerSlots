var PomeloClientMan = require('../model/PomeloClientMan');
var ProtocolMan = require("../../common/protocol/ProtocolMan");
var ErrorCode = require('../../common/enum/ErrorCode');

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

Protocol.prototype.send = function(udid) {
    console.log("player " + udid + " sendData:"+JSON.stringify(this));
    PomeloClientMan.getInstance().getClient(udid).request(this.getRoute(), this, function(data) {
        console.log(JSON.stringify(data));
        var protoCtor = ProtocolMan.getInstance().getProtocol(data["type"]);
        if (protoCtor) {
            var protocol = new protoCtor();
            protocol.unmarshal(data);
            protocol.execute(udid);
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
    console.log("protocol unmarshal error " + JSON.stringify(this.errorCode));
    return false;
};

module.exports = Protocol;