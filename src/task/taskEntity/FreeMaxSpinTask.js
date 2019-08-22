var Task = require('./Task');
var Util = require("../../common/util/Util");

var FreeMaxSpinTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.seconds = taskConfig.seconds;
    this.maxBet = taskConfig.maxBet;
};

Util.inherits(FreeMaxSpinTask, Task);

module.exports = FreeMaxSpinTask;
