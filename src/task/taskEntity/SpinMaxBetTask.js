var Task = require('./Task');
var Util = require("../../common/util/Util");

var SpinMaxBetTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.needSpinCount = taskConfig.needSpinCount;
    this.maxBet = taskConfig.maxBet;
};

Util.inherits(SpinMaxBetTask, Task);

module.exports = SpinMaxBetTask;
