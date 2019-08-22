var Task = require('./Task');
var Util = require("../../common/util/Util");
var IceInfo = require('../entity/IceInfo');

var BreakIceTask = function(taskConfig) {
    Task.call(this, taskConfig);
    /**
     * @type {Array.<ChainInfo>}
     */
    this.iceInfos = [];
    var iceInfosArray = taskConfig.chainInfos;
    if (iceInfosArray) {
        for (var i = 0; i < iceInfosArray.length; ++i) {
            var iceInfo = new IceInfo(iceInfosArray[i]);
            this.iceInfos.push(iceInfo);
        }
    }
};

Util.inherits(BreakIceTask, Task);

module.exports = BreakIceTask;
