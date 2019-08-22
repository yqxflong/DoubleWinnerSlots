var Task = require('./Task');
var Util = require("../../common/util/Util");

var CollectSymbolOnWinTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.symbolId = taskConfig.symbolId;
    this.needSymbolCount = taskConfig.needSymbolCount;
};

Util.inherits(CollectSymbolOnWinTask, Task);

module.exports = CollectSymbolOnWinTask;
