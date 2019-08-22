/**
 * Created by qinning on 15/5/12.
 */

var LogType = {
    LOG_GAME_RECORD: 0x001,
    LOG_BONUS: 0x002,
    LOG_SOCIAL: 0x004,
    LOG_LOGIN_RECORD: 0x008,
    LOG_PURCHASE_RECORD: 0x010,
    LOG_ERROR_INFO: 0x011,
    LOG_HELP_MSG: 0x012,
    LOG_GAME_STATUS: 0x0200,
    LOG_FACE_BOOK_RECORD: 0x0400,
    LOG_PLAYER_RECORD: 0x0800,
    LOG_SLOT_RECORD: 0x0100,
    LOG_USER_PRODUCT_RECORD: 0x0200,
    LOG_RESOURCE_UPDATE_RECORD: 0x0300,
    LOG_USER_STEP: 0x1000,
    LOG_SHARE_RECORD: 0x2000,
    LOG_AD_INFO: 0x08000,
    LOG_INCENTIVE_AD_INFO:0x0f000,

    description: function (logType) {
        var result;
        switch (logType) {
            case LogType.LOG_GAME_RECORD:
                result = "GameRecord";
                break;
            case LogType.LOG_BONUS:
                result = "Bonus";
                break;
            case LogType.LOG_SOCIAL:
                result = "Social";
                break;
            case LogType.LOG_LOGIN_RECORD:
                result = "LoginRecord";
                break;
            case LogType.LOG_PURCHASE_RECORD:
                result = "PurchaseRecord";
                break;
            case LogType.LOG_ERROR_INFO:
                result = "ErrorInfo";
                break;
            case LogType.LOG_HELP_MSG:
                result = "UserHelpMessage";
                break;
            case LogType.LOG_RESOURCE_UPDATE_RECORD:
                result = "ResourceUpdate";
                break;
            case LogType.LOG_USER_PRODUCT_RECORD:
                result = "UserProductRecord";
                break;
            case LogType.LOG_AD_INFO:
                result = "adInfo";
                break;
            case LogType.LOG_USER_STEP:
                result = "UserStep";
                break;
            case LogType.LOG_SHARE_RECORD:
                result = "ShareRecord";
                break;
            default:
                result = "Unknown";
                break;
        }
        return result;
    }
};



module.exports = LogType;