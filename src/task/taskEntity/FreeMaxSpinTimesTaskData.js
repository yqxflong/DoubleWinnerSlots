var Task = require('./Task');
var Util = require("../../common/util/Util");

var FreeMaxSpinTimesTaskData = function(jsonObj) {
    this.maxBetSpinCount = jsonObj["maxBetSpinCount"] || 0;
};

Util.inherits(FreeMaxSpinTimesTaskData, Task);

module.exports = FreeMaxSpinTimesTaskData;
