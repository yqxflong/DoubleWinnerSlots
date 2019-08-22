var ProtocolType = require("../../common/enum/ProtocolType");
var ProtocolMan = require("../../common/protocol/ProtocolMan");
var S2CLogin = require("./S2CLogin");
var S2CGetSubjects = require("./S2CGetSubjects");
var S2CEnterRoom = require("./S2CEnterRoom");
var S2CSpin = require("./S2CSpin");

/**
 * Created by alanmars on 15/4/23.
 */
var ProtocolRegistry = {
    register: function() {
        var protocolInstance = ProtocolMan.getInstance();
        protocolInstance.register(ProtocolType.Common.S2C_LOGIN, S2CLogin);
        protocolInstance.register(ProtocolType.Slot.S2C_GET_SUBJECTS, S2CGetSubjects);
        protocolInstance.register(ProtocolType.Slot.S2C_ENTER_ROOM, S2CEnterRoom);
        protocolInstance.register(ProtocolType.Slot.S2C_SPIN, S2CSpin);
    }
};

module.exports = ProtocolRegistry;