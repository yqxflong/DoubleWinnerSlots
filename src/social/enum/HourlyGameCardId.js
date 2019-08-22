
var HourlyGameCardId = {
    GAME_OVER: 1,
    TAKE_ALL: 2,

    SMALL_CARD_BEGIN: 100,

    NORMAL_ID_BEGIN: 200
};

HourlyGameCardId.isNormalCard = function (cardId) {
    if (cardId >= HourlyGameCardId.SMALL_CARD_BEGIN) {
        return true;
    }
    return false;
};

module.exports = HourlyGameCardId;
