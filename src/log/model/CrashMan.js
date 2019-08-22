/**
 * Created by qinning on 15/5/12.
 */

var MultipartPostMan = require("./MultipartPostMan");
var Util = require("../../common/util/Util");
var Config = require("../../common/util/Config");
var HttpClient = require("../../common/net/HttpClient");
var dateFormat = require("dateformat");

var HOCKEYAPP_URL = "https://rink.hockeyapp.net/api/2/apps/%s/crashes/upload";

var CrashMan = cc.Class.extend({
    ctor: function () {
    },

    register: function () {
        var self = this;
        if (!cc.sys.isNative) {
            if (Config.isRelease()) {
                window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
                    cc.log("message:", errorMessage);
                    cc.log("fileName:", scriptURI);
                    cc.log("fileLineNum:", lineNumber);
                    cc.log("fileColNum:", columnNumber);
                    self.uploadJsError(errorMessage, scriptURI, lineNumber, columnNumber, errorObj.stack);
                };
            }
        }
    },

    uploadJsError: function (errorMsg, fileName, lineNumber, columnNumber, stackTrace) {
        var log = this._createLog(errorMsg, fileName, lineNumber, columnNumber, stackTrace);
        var params = {};
        params["log"] = log;
        params["description"] = this._createAdditionalInfoLog();
        params["userID"] = "";
        var boundary = MultipartPostMan.getInstance().genBonudary();
        var encodePost = MultipartPostMan.getInstance().encode(params, boundary);
        var headers = {};
        headers["Content-Type"] = "multipart/form-data;boundary=" + boundary;

        HttpClient.doPost(this._getURL(), encodePost, headers, function (error, txt) {
            if (!error) {
                cc.log("post callback:" + txt);
            } else {
                cc.log("post error:" +error + ",,," + txt);
            }
        });
    },

    _createAdditionalInfoLog: function () {
        return "additional info: web";
    },

    _getURL: function () {
        return Util.sprintf(HOCKEYAPP_URL, Config.hockeyAppId);
    },

    _createLog: function (errorMsg, fileName, lineNumber, columnNumber, stackTrace) {
        var lines = {};
        lines["Package"] = Config.hockeyAppBundleId;
        lines["Version"] = Config.appVersion;
        lines["Language"] = window.navigator.language;
        lines["Platform"] = window.navigator.platform;
        lines["User-Agent"] = window.navigator.userAgent;
        lines["Date"] = dateFormat(Date.now(), "yyyy-dd-mm h:MM:ss");
        lines["Manufacturer"] = "Web";
        var results = "";
        for (var key in lines) {
            results += key + ": " + lines[key] + "\n";
        }
        results += errorMsg + "\n";
        results += "at " + errorMsg + "(" + fileName + ":" + lineNumber + ")\n";
        results += stackTrace + "\n";
        return results;
    }
});

CrashMan._instance = null;
CrashMan._firstUseInstance = true;

/**
 *
 * @returns {CrashMan}
 */
CrashMan.getInstance = function () {
    if (CrashMan._firstUseInstance) {
        CrashMan._firstUseInstance = false;
        CrashMan._instance = new CrashMan();
    }
    return CrashMan._instance;
};

module.exports = CrashMan;