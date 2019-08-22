/**
 * Created by qinning on 15/5/12.
 */
var ZoneType = require("./ZoneType");

var SceneType = {
    INVALID_SCENE: 0,

    SLOT_LOBBY: 0x1,
    SLOT_ROOM: 0x2,
    LOGIN: 0x4,
    LOADING_RESOURCE: 0x8
};

module.exports = SceneType;