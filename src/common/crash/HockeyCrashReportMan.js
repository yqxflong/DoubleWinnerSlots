/**
 * Created by qinning on 15/8/17.
 */

var Util = require("../../common/util/Util");
var SubjectTmpl = require("../entity/SubjectTmpl");
var Subject = require("../entity/Subject");
var LevelMaxBet = require("../entity/LevelMaxBet");
var JackpotStatus = require("../enum/JackpotStatus");
var JackpotType = require("../enum/JackpotType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var extend = require("extend");
var DeviceInfo = require("../../common/util/DeviceInfo");
var Config = require("../../common/util/Config");

var HOCKEYAPP_URL = "https://rink.hockeyapp.net:443/api/2/apps/%s/crashes/upload";

var HockeyCrashReportMan = (function () {
    var instance;

    function createInstance() {
        var hockeyAppId = "";
        var udid = DeviceInfo.getDeviceId();

        return {
            getURL: function () {
                return Util.sprintf(HOCKEYAPP_URL, hockeyAppId);
            },

            _createLog: function (errorMsg, trace) {
                var lines = {
                    //"Package:": DeviceInfo.getPackageName(),
                    "Version": Config.appVersion,
                    "OS": DeviceInfo.getTargetPlatform(),
                    "Date": Date.now()
                };
                var result = "";
                for (var key in lines) {
                    result += key + lines[key];
                };
                return result + errorMsg + trace;
            },

            _getTraceback: function (stackInfo) {

            },

            uploadJsError: function (errMsg, stackInfo, callback) {
                var dataLog = this._createLog(errMsg, this._getTraceback(stackInfo));
                var deviceId = udid;
                var description = "";
                var arguments = {
                    log: {
                        name: "log",
                        data: dataLog
                    },
                    description: {
                        name : "description",
                        data: "description"
                    },
                    userId: {
                        name: "userID",
                        data: deviceId
                    }
                };
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = HockeyCrashReportMan;