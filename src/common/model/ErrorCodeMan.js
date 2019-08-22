/**
 * Created by qinning on 15/4/23.
 */
var ErrorCode = require("../enum/ErrorCode");
var Config = require("../util/Config");

var ErrorCodeMan = cc.Class.extend({
    showErrorMsg : function(errorCode, args){
        if (!Config.isLocal()) {
            return;
        }
        if(!Config.isRelease()) {
            var PopupMan = require("../model/PopupMan");
            PopupMan.popupCommonDialog("ERROR", ErrorCode.getDescription(errorCode), "Ok", null, null, false, false);
        } else {
            PopupMan.popupCommonDialog("ERROR", ["Known Error"], "Ok", null, null, false, false);
        }
        switch (errorCode){
            case ErrorCode.Common.INVALID_LOGIN_ARGUMENTS:

                break;
            case ErrorCode.Common.PLAYER_NOT_FOUND_FOR_BINDING:

                break;
            default:

                break;
        }
    }
});

ErrorCodeMan._instance = null;
ErrorCodeMan._firstUseInstance = true;

/**
 *
 * @returns {ErrorCodeMan}
 */
ErrorCodeMan.getInstance = function () {
    if (ErrorCodeMan._firstUseInstance) {
        ErrorCodeMan._firstUseInstance = false;
        ErrorCodeMan._instance = new ErrorCodeMan();
    }
    return ErrorCodeMan._instance;
};

module.exports = ErrorCodeMan;