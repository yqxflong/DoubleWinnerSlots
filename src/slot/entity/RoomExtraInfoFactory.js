var RoomExtraInfoType = require("../enum/RoomExtraInfoType");
var FortunateFortuneRoomExtraInfo = require("./FortunateFortuneRoomExtraInfo");
var TunnelOfFearRoomExtraInfo = require("./TunnelOfFearRoomExtraInfo");
var VolcanoHellRoomExtraInfo = require("./VolcanoHellRoomExtraInfo");
var MagicWorld60106RoomExtraInfo = require("./MagicWorld60106RoomExtraInfo");
var MagicWorld60107RoomExtraInfo = require("./MagicWorld60107RoomExtraInfo");

/**
 * Created by qinning on 15/4/27.
 */
var RoomExtraInfoFactory = {
    create: function(type) {
        var result = null;
        switch (type) {
            case RoomExtraInfoType.ROOM_FORTUNATE_FORTUNE:
                result = new FortunateFortuneRoomExtraInfo();
                break;
            case RoomExtraInfoType.ROOM_TUNNEL_OF_FEAR:
                result = new TunnelOfFearRoomExtraInfo();
                break;
            case RoomExtraInfoType.ROOM_VOLCANO_HELL:
                result = new VolcanoHellRoomExtraInfo();
                break;



            case RoomExtraInfoType.ROOM_MAGIC_WORLD_60106:
                result = new MagicWorld60106RoomExtraInfo();
                break;
            case RoomExtraInfoType.ROOM_MAGIC_WORLD_60107:
                result = new MagicWorld60107RoomExtraInfo();
                break;
        }
        return result;
    }
};

module.exports = RoomExtraInfoFactory;
