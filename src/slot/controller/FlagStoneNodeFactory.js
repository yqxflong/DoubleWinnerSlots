/**
 * Created by qinning on 15/12/23.
 */

var FlagStoneType = require("../enum/FlagStoneType");
var FlagStoneController = require("./FlagStoneController");
var TaskFlagStoneController = require("./TaskFlagStoneController");
var GuideTaskFlagStoneController = require("./GuideTaskFlagStoneController");
var TaskFlagStoneChestController = require("./TaskFlagStoneChestController");
var FlagStoneCommingSoonController = require("./FlagStoneCommingSoonController");

var FlagStoneNodeFactory = {
    create: function (type) {
        var node;
        switch (type) {
            case FlagStoneType.FLAG_STONE_TYPE_NORMAL:
                node = TaskFlagStoneController.createFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_point.ccbi");
                break;
            case FlagStoneType.FLAG_STONE_TYPE_BOSS:
                node = TaskFlagStoneController.createFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_boss.ccbi");
                break;
            case FlagStoneType.FLAG_STONE_TYPE_CHEST:
                node = TaskFlagStoneChestController.createFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_chest.ccbi");
                break;
            case FlagStoneType.FLAG_STONE_TYPE_COMMING_SOON:
                //node = FlagStoneCommingSoonController.createFromCCB(ccbFileName);
                break;
            case FlagStoneType.FLAG_STONE_TYPE_GUIDE:
                node = GuideTaskFlagStoneController.createFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_guide.ccbi");
                break;
        }
        return node;
    }
};

module.exports = FlagStoneNodeFactory;