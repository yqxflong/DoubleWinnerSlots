var Task = require('./Task');
var Util = require("../../common/util/Util");

var CollectSymbolTask = function(taskConfig) {
    Task.call(this, taskConfig);
    this.symbolId = taskConfig.symbolId;
    this.needSymbolCount = taskConfig.needSymbolCount;
};

Util.inherits(CollectSymbolTask, Task);

module.exports = CollectSymbolTask;
