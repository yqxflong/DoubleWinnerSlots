var Task = require('./Task');
var Util = require("../../common/util/Util");

var ConsecutiveWinTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needConsecutiveWinCount = taskConfig.needConsecutiveWinCount;
};

Util.inherits(ConsecutiveWinTask, Task);

module.exports = ConsecutiveWinTask;
