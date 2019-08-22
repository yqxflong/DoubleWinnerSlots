var Task = require('./Task');
var Util = require("../../common/util/Util");
var ChainInfo = require('../entity/ChainInfo');

var BreakChainTask = function(taskConfig) {
    Task.call(this, taskConfig);
    /**
     * @type {Array.<ChainInfo>}
     */
    this.chainInfos = [];
    var chainInfos = taskConfig.chainInfos;
    if (chainInfos) {
        for (var i = 0; i < chainInfos.length; ++i) {
            var chainInfo = new ChainInfo(chainInfos[i]);
            this.chainInfos.push(chainInfo);
        }
    }
    this.totalChainCount = taskConfig.totalChainCount;
};

Util.inherits(BreakChainTask, Task);

module.exports = BreakChainTask;
