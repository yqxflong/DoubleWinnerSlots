/**
 * Created by qinning on 15/5/12.
 */

var ServerType = {
    SERVER_GATE: 100000,
    SERVER_LOGIN: 200000,
    SERVER_SOCIAL: 300000,
    SERVER_CACHE: 400000,

    SERVER_SLOT: 1000000,
    SERVER_BLACKJACK: 1100000,
    SERVER_HOLDEM: 1200000,
    SERVER_TOURNAMENT: 1300000,
    SERVER_VIDEOPOKER: 1600000
};

module.exports = ServerType;

/*
    getSceneType : function(serverType)
{
    switch (serverType)
    {
        case this.SERVER_SLOT:
            return SceneType.SLOT_ROOM;
        case SERVER_TOURNAMENT:
            return SceneType.TOURNAMENT_ROOM;
        case SERVER_HOLDEM:
            return SceneType.HOLDEM_ROOM;
        case SERVER_BLACKJACK:
            return SceneType.BLACKJACK_ROOM;
        case SERVER_VIDEOPOKER:
            return SceneType.VIDEOPOKER_ROOM;
    }
    return SceneType.INVALID_SCENE;
},

description : function(serverType)
{
    var result = "Lucky Win Casino";
    switch (serverType)
    {
        case SERVER_SLOT:
            result = "Slots";
            break;
        case SERVER_TOURNAMENT:
            result = "Tournament";
            break;
        case SERVER_HOLDEM:
            result = "Holdem";
            break;
        case SERVER_BLACKJACK:
            result = "Blackjack";
            break;
        case SERVER_VIDEOPOKER:
            result = "Videopoker";
            break;
    }
    return result;
},

icon : function(serverType)
{
    var result;
    switch (serverType)
    {
        case SERVER_SLOT:
            result = "common_icon_slots.png";
            break;
        case SERVER_TOURNAMENT:
            result = "common_icon_tournament.png";
            break;
        case SERVER_HOLDEM:
            result = "common_icon_holdem.png";
            break;
        case SERVER_BLACKJACK:
            result = "common_icon_blackjack.png";
            break;
        case SERVER_VIDEOPOKER:
            result = "common_icon_videopoker.png";
            break;
    }
    return result;
}
}*/