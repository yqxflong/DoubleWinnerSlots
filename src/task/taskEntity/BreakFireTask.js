var Task = require('./Task');
var Util = require("../../common/util/Util");
var FireInfo = require('../entity/FireInfo');

var BreakFireTask = function(taskConfig) {
    Task.call(this, taskConfig);
    /**
     * @type {Array.<ChainInfo>}
     */
    this.fireInfos = [];
    var fireInfosArray = taskConfig.chainInfos;
    if (fireInfosArray) {
        for (var i = 0; i < fireInfosArray.length; ++i) {
            var fireInfo = new FireInfo(fireInfosArray[i]);
            this.fireInfos.push(fireInfo);
        }
    }
};

Util.inherits(BreakFireTask, Task);

module.exports = BreakFireTask;
