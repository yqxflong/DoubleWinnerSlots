var Task = require('./Task');
var Util = require("../../common/util/Util");

var WinOnFreeSpinTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needWin = taskConfig.needWin;
    this.spinLimit = taskConfig.spinLimit;
};

Util.inherits(WinOnFreeSpinTask, Task);

module.exports = WinOnFreeSpinTask;
