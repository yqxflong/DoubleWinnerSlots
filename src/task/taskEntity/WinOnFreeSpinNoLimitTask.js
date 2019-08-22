var Task = require('./Task');
var Util = require("../../common/util/Util");

var WinOnFreeSpinNoLimitTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needWin = taskConfig.param1;
};

Util.inherits(WinOnFreeSpinNoLimitTask, Task);

WinOnFreeSpinNoLimitTask.prototype.onSpin = function(params, taskData) {
    var WinOnFreeSpinNoLimitTaskData = taskData;
    if (params.isFreeSpin) {
        WinOnFreeSpinNoLimitTaskData.totalWin += params.totalWin;
    }
};

WinOnFreeSpinNoLimitTask.prototype.getProgress = function(taskData) {
    return Math.floor(taskData.totalWin * 100 / this.needWin);
};

module.exports = WinOnFreeSpinNoLimitTask;
