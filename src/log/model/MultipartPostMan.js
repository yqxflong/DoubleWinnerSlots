/**
 * Created by qinning on 15/5/12.
 */
var Util = require("../../common/util/Util");

var MultipartPostMan = cc.Class.extend({
    ctor: function () {

    },

    appendData: function (key, value) {
        var result = "";
        result += "content-disposition: form-data; name=\"" + key + "\"; filename=\"" + key + "\"";
        result += "\r\n\r\n";
        result += value;
        result += "\r\n";
        return result;
    },

    encode: function (params, boundary) {
        var result = "";
        for (var key in params) {
            result += "--" + boundary + "\r\n";
            result += this.appendData(key, params[key]);
        }
        result += "--" + boundary + "--\r\n";
        return result;
    },

    genBonudary: function () {
        var t = "BONUDARY-";
        for(var i = 0; i < 15; ++i) {
            t += Util.randomNextInt(100);
        }
        return t + "-BOUNDARY";
    }

});

MultipartPostMan._instance = null;
MultipartPostMan._firstUseInstance = true;

/**
 *
 * @returns {MultipartPostMan}
 */
MultipartPostMan.getInstance = function () {
    if (MultipartPostMan._firstUseInstance) {
        MultipartPostMan._firstUseInstance = false;
        MultipartPostMan._instance = new MultipartPostMan();
    }
    return MultipartPostMan._instance;
};

module.exports = MultipartPostMan;