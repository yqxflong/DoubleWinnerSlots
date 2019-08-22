var Task = require('./Task');
var Util = require("../../common/util/Util");

var WinInLimitedTimeTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needWin = taskConfig.needWin;
    this.seconds = taskConfig.seconds;
};

Util.inherits(WinInLimitedTimeTask, Task);

module.exports = WinInLimitedTimeTask;
