var Protocol = require("./Protocol");
var Util = require("../../common/util/Util");

/**
 * Created by alanmars on 15/4/27.
 */
var SlotProtocol = function(type) {
    Protocol.call(this, type);
};

Util.inherits(SlotProtocol, Protocol);

SlotProtocol.prototype.getRoute = function() {
    return "logic.logicHandler.protocolEntry";
};

module.exports = SlotProtocol;