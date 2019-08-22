/**
 * Created by alanmars on 15/5/12.
 */
var ErrorCode = {
    SUCCESS: 0,
    Common: {
        PLAYER_NOT_FOUND_FOR_BINDING: 1000,
        INVALID_LOGIN_ARGUMENTS: 1001,
        SERVER_MAINTAIN: 1002
    },
    Slot: {
        SPIN_INVALID_BET: 2000,
        SPIN_BET_NOT_ENOUGH: 2001,
        SPIN_INVALID_SUBJECT: 2002,
        SPIN_INVALID_TASK: 2103,
        SPIN_EXCEPTION: 2104,

        UNLOCK_SUBJECT_INVALID_ID: 2110,
        UNLOCK_SUBJECT_GEM_NOT_ENOUGH: 2111,
        UNLOCK_SUBJECT_LOGIC: 2112,
        UNLOCK_SUBJECT_REPEAT: 2113
    },
    Social: {
        DAILY_BONUS_CLAIM_DUPLICATED: 3000,
        HOURLY_BONUS_CLAIM_EARLY: 3001,
        CLAIM_VIP_STATUS_FAIL: 3002,
        CLAIM_VIP_REPEAT: 3003,
        HOURLY_GAME_NOT_INIT: 3004,
        HOURLY_GAME_UP_CARD_INVALID: 3005,
        HOURLY_GAME_UP_CARD_MAX_LEVEL: 3006,
        HOURLY_GAME_UP_CARD_STAR_NOT_ENOUGHT: 3007,
        HOURLY_GAME_GEN_EARLY: 3008,

        IAP_VERIFY_FAILED: 3100,
        IAP_DUPLICATED_TRANSACTION: 3101,
        IAP_INVALID_PRODUCT: 3102,
        IAP_INVALID_TRANSACTION_ID: 3103,
        IAP_NO_PROCESSING_ORDER: 3104,

        REWARD_KEY_NOT_EXIST: 3200,
        REWARD_KEY_EXPIRE: 3201,
        REWARD_KEY_CLAIMED: 3202

    },
    Task: {
        FINISH_TASK_INVALID: 4000,
        FINISH_TASK_FAIL: 4001,

        CLAIM_DAILY_TASK_NOT_INIT: 4005,
        CLAIM_DAILY_TASK_REPEAT: 4006,
        CLAIM_DAILY_NOT_CONFIG: 4007,
        CLAIM_DAILY_NOT_FINISH: 4008
    },

    /**
     * @param errorCode
     * @returns {Array.<string>}
     */
    getDescription: function (errorCode) {
        switch (errorCode) {
            case this.Social.DAILY_BONUS_CLAIM_DUPLICATED:
                return ["Daily bonus has been claimed!"];
        }
        return ["Unknown error"];
    }
};

module.exports = ErrorCode;