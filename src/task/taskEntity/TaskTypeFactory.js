var TaskType = require('../enum/TaskType');
var SpinMaxBetTask = require('./SpinMaxBetTask');
var SpinTask = require('./SpinTask');
var FreeMaxSpinTask = require('./FreeMaxSpinTask');
var CollectSymbolTask = require('./CollectSymbolTask');
var CollectSymbolOnWinTask = require('./CollectSymbolOnWinTask');
var WinOnFreeSpinTask = require('./WinOnFreeSpinTask');
var WinInLimitedTimeTask = require('./WinInLimitedTimeTask');
var BreakChainTask = require('./BreakChainTask');
var BreakIceTask = require('./BreakIceTask');
var BreakFireTask = require('./BreakFireTask');
var WinChipsNoLimitTask = require("./WinChipsNoLimitTask");
var WinOnFreeSpinNoLimitTask = require("./WinOnFreeSpinNoLimitTask");
var FreeMaxSpinTimesTaskData = require("./FreeMaxSpinTimesTaskData");
var ConsecutiveWinTask = require('./ConsecutiveWinTask');

var TaskTypeFactory = {
    create: function(taskConfig) {
        var result = null;
        switch (taskConfig.taskType) {
            case TaskType.TASK_SPIN:
                result = new SpinTask(taskConfig);
                break;
            case TaskType.TASK_SPIN_MAX_BET:
                result = new SpinMaxBetTask(taskConfig);
                break;
            case TaskType.TASK_FREE_MAX_SPIN:
                result = new FreeMaxSpinTask(taskConfig);
                break;
            case TaskType.TASK_COLLECT_SYMBOL:
                result = new CollectSymbolTask(taskConfig);
                break;
            case TaskType.TASK_COLLECT_SYMBOL_ON_WIN:
                result = new CollectSymbolOnWinTask(taskConfig);
                break;
            case TaskType.TASK_WIN_ON_FREE_SPIN:
                result = new WinOnFreeSpinTask(taskConfig);
                break;
            case TaskType.TASK_WIN_IN_LIMITED_TIME:
                result = new WinInLimitedTimeTask(taskConfig);
                break;
            case TaskType.TASK_BREAK_CHAIN:
                result = new BreakChainTask(taskConfig);
                break;
            case TaskType.TASK_WIN_ON_FREE_SPIN_NO_LIMIT:
                result = new WinOnFreeSpinNoLimitTask(taskConfig);
                break;
            case TaskType.TASK_WIN_NO_LIMIT:
                result = new WinChipsNoLimitTask(taskConfig);
                break;
            case TaskType.TASK_FREE_MAX_SPIN_TIMES:
                result = new FreeMaxSpinTimesTaskData(taskConfig);
                break;
            case TaskType.TASK_BREAK_ICE:
                result = new BreakIceTask(taskConfig);
                break;
            case TaskType.TASK_BREAK_FIRE:
                result = new BreakFireTask(taskConfig);
                break;
            case TaskType.TASK_CONSECUTIVE_WIN:
                result = new ConsecutiveWinTask(taskConfig);
                break;
        }
        return result;
    }
};

module.exports = TaskTypeFactory;