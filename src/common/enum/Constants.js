/**
 * Created by qinning on 15/4/14.
 */


var Constants = {
    //Game Status
    GAME_STATE_BEGIN: 0,
    GAME_STATE_PAUSE: 1,
    GAME_STATE_OVER: 2,

    DEFAULT_MAC_ADDRESS: "00:00:00:00:00:00",
    DEFAULT_MAC_ADDRESS_2: "02:00:00:00:00:00",
    CHIPS_THRESHOLD: 100000,
    SEC_IN_MILLIS: 1000,
    MIN_IN_MILLIS: 60*1000,
    HOUR_IN_MILLIS: 3600*1000,
    DAY_IN_MILLIS: 24*3600*1000
};

module.exports = Constants;
