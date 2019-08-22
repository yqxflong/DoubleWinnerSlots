var Task = require('./Task');
var Util = require("../../common/util/Util");

var WinChipsNoLimit = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needWin = taskConfig.param1;
};

Util.inherits(WinChipsNoLimit, Task);

WinChipsNoLimit.prototype.onSpin = function(params, taskData) {
    var WinChipsNoLimitTaskData = taskData;
    WinChipsNoLimitTaskData.totalWin += params.totalWin;
};

WinChipsNoLimit.prototype.getProgress = function(taskData) {
    return Math.floor(taskData.totalWin * 100 / this.needWin);
};

module.exports = WinChipsNoLimit;
