var Protocol = require("./Protocol");
var Util = require("../util/Util");

/**
 * Created by alanmars on 15/4/27.
 */
var LogicProtocol = function(type) {
    Protocol.call(this, type);
};

Util.inherits(LogicProtocol, Protocol);

LogicProtocol.prototype.getRoute = function() {
    return "logic.logicHandler.protocolEntry";
};

module.exports = LogicProtocol;