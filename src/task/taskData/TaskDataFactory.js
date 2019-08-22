var TaskType = require('../enum/TaskType');
var SpinMaxBetTaskData = require('./SpinMaxBetTaskData');
var SpinTaskData = require('./SpinTaskData');
var FreeMaxSpinTaskData = require('./FreeMaxSpinTaskData');
var CollectSymbolTaskData = require('./CollectSymbolTaskData');
var CollectSymbolOnWinTaskData = require('./CollectSymbolOnWinTaskData');
var WinOnFreeSpinTaskData = require('./WinOnFreeSpinTaskData');
var WinInLimitedTimeTaskData = require('./WinInLimitedTimeTaskData');
var BreakChainTaskData = require('./BreakChainTaskData');
var WinOnFreeSpinNoLimitTaskData = require('./WinOnFreeSpinNoLimitTaskData');
var WinChipsNoLimitTaskData = require('./WinChipsNoLimitTaskData');
var FreeMaxSpinTimesTaskData = require('./FreeMaxSpinTimesTaskData');
var CollectSymbolOneSpinTaskData = require('./CollectSymbolOneSpinTaskData');
var CollectSymbolFreeSpinTaskData = require('./CollectSymbolFreeSpinTaskData');
var WinFreeSpinTaskData = require('./WinFreeSpinTaskData');
var ConsecutiveWinTaskData = require('./ConsecutiveWinTaskData');
var BreakIceTaskData = require('./BreakIceTaskData');
var BreakFireTaskData = require('./BreakFireTaskData');

var TaskDataFactory = {
    create: function(type, jsonObj) {
        jsonObj = jsonObj || {};
        var result = null;
        switch (type) {
            case TaskType.TASK_SPIN:
                result = new SpinTaskData(jsonObj);
                break;
            case TaskType.TASK_SPIN_MAX_BET:
                result = new SpinMaxBetTaskData(jsonObj);
                break;
            case TaskType.TASK_FREE_MAX_SPIN:
                result = new FreeMaxSpinTaskData(jsonObj);
                break;
            case TaskType.TASK_COLLECT_SYMBOL:
                result = new CollectSymbolTaskData(jsonObj);
                break;
            case TaskType.TASK_COLLECT_SYMBOL_ON_WIN:
                result = new CollectSymbolOnWinTaskData(jsonObj);
                break;
            case TaskType.TASK_WIN_ON_FREE_SPIN:
                result = new WinOnFreeSpinTaskData(jsonObj);
                break;
            case TaskType.TASK_WIN_IN_LIMITED_TIME:
                result = new WinInLimitedTimeTaskData(jsonObj);
                break;
            case TaskType.TASK_BREAK_CHAIN:
                result = new BreakChainTaskData(jsonObj);
                break;
            case TaskType.TASK_WIN_ON_FREE_SPIN_NO_LIMIT:
                result = new WinOnFreeSpinNoLimitTaskData(jsonObj);
                break;
            case TaskType.TASK_WIN_NO_LIMIT:
                result = new WinChipsNoLimitTaskData(jsonObj);
                break;
            case TaskType.TASK_FREE_MAX_SPIN_TIMES:
                result = new FreeMaxSpinTimesTaskData(jsonObj);
                break;
            case TaskType.TASK_COLLECT_SYMBOL_ONE_SPIN:
                result = new CollectSymbolOneSpinTaskData(jsonObj);
                break;
            case TaskType.TASK_COLLECT_SYMBOL_FREE_SPIN:
                result = new CollectSymbolFreeSpinTaskData(jsonObj);
                break;
            case TaskType.TASK_WIN_FREE_SPIN:
                result = new WinFreeSpinTaskData(jsonObj);
                break;
            case TaskType.TASK_CONSECUTIVE_WIN:
                result = new ConsecutiveWinTaskData(jsonObj);
                break;
            case TaskType.TASK_BREAK_ICE:
                result = new BreakIceTaskData(jsonObj);
                break;
            case TaskType.TASK_BREAK_FIRE:
                result = new BreakFireTaskData(jsonObj);
                break;
        }
        return result;
    }
};

module.exports = TaskDataFactory;