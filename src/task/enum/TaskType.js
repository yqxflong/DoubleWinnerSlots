var TaskType = {
    TASK_NONE: 0,
    TASK_SPIN: 1,
    TASK_SPIN_MAX_BET: 2,//use max bet spin.
    TASK_FREE_MAX_SPIN: 3,//免费用max bet spin多长时间.
    TASK_COLLECT_SYMBOL: 4,//收集图标
    TASK_COLLECT_SYMBOL_ON_WIN: 5,//在赢钱线上收集图标
    TASK_WIN_ON_FREE_SPIN: 6,//在free spin里赢多少钱
    TASK_WIN_IN_LIMITED_TIME: 7,//限时赢多少钱
    TASK_BREAK_CHAIN: 8,//打开锁链
    TASK_WIN_ON_FREE_SPIN_NO_LIMIT: 9,//在free spin赢多少钱
    TASK_WIN_NO_LIMIT: 10,//win多少钱
    TASK_FREE_MAX_SPIN_TIMES: 11,//免费用max bet spin多少次
    TASK_COLLECT_SYMBOL_ONE_SPIN: 12,
    TASK_COLLECT_SYMBOL_FREE_SPIN: 13,
    TASK_WIN_FREE_SPIN: 14,
    TASK_CONSECUTIVE_WIN: 15,

    TASK_LIMITED_BET_AND_DURATION: 16,      // 限定时间,特定bet
    TASK_LIMITED_BET_AND_CHANCE: 17,        // 限定把数,特定bet
    TASK_WIN_WITH_LISTED_SYMBOLS: 18,       // 特定符号,赢一定数目的钱
    TASK_COLLECT_THE_REWARD_N_TIMES: 19,    // 收集特定奖励N次
    TASK_WIN_WITH_THE_REWARD: 20,           // 用特定奖励赢一定数目的钱
    TASK_GET_N_BIG_WIN: 21,                 // 得到N个big win
    TASK_COLLECT_BAR_AND_DIAMOND: 22,       // 收集bar和钻石
    TASK_COLLECT_LISTED_SYMBOLS: 23,        // 收集特定的一批符号
    TASK_COLLECT_LISTED_SYMBOLS_ON_WINLINE: 24, //在赢钱线上赢取特定的一批符号

    TASK_BREAK_ICE: 100, //碎冰模式
    NO_WIN_TIMES: 101, //连续n次不赢钱
    TASK_COLLECT_STACK: 102, //收集几次整列图标
    TASK_COMPLETE_PROCESS: 103, //进度条完成次数
    TASK_BREAK_FIRE: 104, //火焰模式
    TASK_BONUS_WIN_MONEY: 105 //Bonus Game中赢多少钱
};

TaskType.isTimeTask = function (taskType) {
    if (taskType == TaskType.TASK_FREE_MAX_SPIN || taskType == TaskType.TASK_WIN_IN_LIMITED_TIME ||
    taskType == TaskType.TASK_LIMITED_BET_AND_DURATION) {
        return true;
    }
    return false;
};

TaskType.isSpinMaxBet = function (taskType) {
    if (taskType == TaskType.TASK_FREE_MAX_SPIN || taskType == TaskType.TASK_SPIN_MAX_BET
        || taskType == TaskType.TASK_FREE_MAX_SPIN_TIMES) {
        return true;
    }
    return false;
};

TaskType.isSpinWithBetLimited = function (taskType) {
    if(taskType == TaskType.TASK_LIMITED_BET_AND_DURATION || taskType == TaskType.TASK_LIMITED_BET_AND_CHANCE) {
        return true;
    }
    return false;
};

module.exports = TaskType;