var Task = require('./Task');
var Util = require("../../common/util/Util");

var SpinTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needSpinCount = taskConfig.needSpinCount;
};

Util.inherits(SpinTask, Task);

module.exports = SpinTask;