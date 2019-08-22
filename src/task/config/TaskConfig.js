var TaskType = require("../enum/TaskType");
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var SlotSceneType = require("../../slot/enum/SlotSceneType");

var TaskConfig = function(jsonObj) {
    var dataArray = jsonObj;
    if(dataArray && !cc.isUndefined(dataArray) && dataArray.length >= 12) {
        this.taskLevelId = dataArray[0] || 1;
        this.levelStar = dataArray[1] || 0;
        this.taskProgress = dataArray[2] || 0;
        this.taskId = dataArray[3] || 0;
        this.subjectId = dataArray[4] || 0;
        this.taskType = dataArray[5] || 0;
        this.param1 = dataArray[6];
        this.param2 = dataArray[7];
        this.param3 = dataArray[8];
        this.param4 = dataArray[9];
        this.param5 = dataArray[10];
        this.resGroup = dataArray[11];
    }
};

TaskConfig.prototype.updateTaskConfig = function (jsonObj) {
    var dataArray = jsonObj;
    if(dataArray && !cc.isUndefined(dataArray) && dataArray.length >= 12) {
        this.taskLevelId = dataArray[0] || this.taskLevelId;
        this.levelStar = dataArray[1] || this.levelStar;
        this.taskProgress = dataArray[2] || this.taskProgress;
        this.taskId = dataArray[3] || this.taskId;
        this.subjectId = dataArray[4] || this.subjectId;
        this.taskType = dataArray[5] || this.taskType;
        this.param1 = dataArray[6] || this.param1;
        this.param2 = dataArray[7] || this.param2;
        this.param3 = dataArray[8] || this.param3;
        this.param4 = dataArray[9] || this.param4;
        this.param5 = dataArray[10] || this.param5;
        this.resGroup = dataArray[11] || this.resGroup;
    }
};

TaskConfig.prototype.getDescription = function () {
    //1	spin n 次	n
    //2	最大bet spin n 次	n	最大singleBet数值
    //3	免费max bet free spin	秒数	最大singleBet数值
    //4	收集n个symbol	symboldId	收集个数
    //5	在赢钱线上收集n个symbol	symbold	收集个数
    //6	freespin下赢多少钱	赢钱总数	多少把内
    //7	在多长时间内赢多少钱	赢钱总数	秒数
    //8	打开锁链
    //var Config = require("../../common/util/Config");
    //var strs = [
    //    "Spin 1000 times",
    //    "Spin 1000 times\nwith max bet",
    //    "Free Max Bet! Spin!",
    //    "Collect 1000 Symbols",
    //    "Collect 1000 Symbols\nin win line",
    //    "Win 100M during\nFree Spins",
    //    "Win 100M during\n100 seconds",
    //    "Break the Chains",
    //    "Win 100M during\nFree Spins",
    //    "Win 1000M",
    //    "Free Max Bet\n100 Times",
    //    "Collect 500 Symbols\nin ONE Spin",
    //    "Collect 500 Symbols\nduring Free Spins",
    //    "Hit 5 Free Spins",
    //    "Free spin with\nbet 100M in 100 seconds",
    //    "Win 100 Times\nin a Row",
    //    "Free spins with\nbet 100M for 100 times",
    //    "Win 100M with\ncertain symbol",
    //    "Win certain payout\n1000 times",
    //    "Win 100M with\ncertain payout",
    //    "BIG WIN 5 times",
    //    "Collect n Bars,\nCollect n Diamonds",
    //    "Collect 1000 Symbols",
    //    "Collect 1000 symbols in\na winning combination",
    //    "Melt the ice",
    //    "Spin 100 times in a\nrow without winning",
    //    "Hit 5 Stacks",
    //    "Fill the meter 5 times",
    //    "Extinguish the flame",
    //    "Win 100M during\nBonus Game"
    //];
    //
    //if(Config.testIndex >= strs.length)
    //{
    //    Config.testIndex = 0;
    //}
    //return strs[Config.testIndex];
    switch (this.taskType) {
        case TaskType.TASK_SPIN:
            return Util.sprintf("Spin %d times", this.param1);
            break;
        case TaskType.TASK_SPIN_MAX_BET:
            return Util.sprintf("Spin %d times \nwith max bet", this.param1);
            break;
        case TaskType.TASK_FREE_MAX_SPIN:
            return "Free Max Bet! Spin!";
            break;
        case TaskType.TASK_COLLECT_SYMBOL:
            return Util.sprintf("Collect %d Symbols", this.param2);
            break;
        case TaskType.TASK_COLLECT_SYMBOL_ON_WIN:
            return Util.sprintf("Win %d Symbols", this.param2);
            break;
        case TaskType.TASK_WIN_ON_FREE_SPIN:
            return Util.sprintf("Win %s during\nFree Spins", Util.formatAbbrNum(this.param1));
            break;
        case TaskType.TASK_WIN_IN_LIMITED_TIME:
            return Util.sprintf("Win %s during\n%d seconds", Util.formatAbbrNum(this.param1), this.param2);
            break;
        case TaskType.TASK_BREAK_CHAIN:
            return "Break the Thorns";
            break;
        case TaskType.TASK_WIN_ON_FREE_SPIN_NO_LIMIT:
            return Util.sprintf("Win %s during\nFree Spins", Util.formatAbbrNum(this.param1));
            break;
        case TaskType.TASK_WIN_NO_LIMIT:
            return Util.sprintf("Win %s", Util.formatAbbrNum(this.param1));
            break;
        case TaskType.TASK_FREE_MAX_SPIN_TIMES:
            return Util.sprintf("Free Max Bet \n%d Times", this.param1);
            break;
        case TaskType.TASK_COLLECT_SYMBOL_ONE_SPIN:
            return Util.sprintf("Collect %d Symbols\nin ONE Spin", this.param2);
            break;
        case TaskType.TASK_COLLECT_SYMBOL_FREE_SPIN:
            return Util.sprintf("Collect %d Symbols\nduring Free Spins", this.param2);
            break;
        case TaskType.TASK_WIN_FREE_SPIN:
            if (this.param1 <= 1) {
                return Util.sprintf("Hit %d Free Spin", this.param1);
            }
            return Util.sprintf("Hit %d Free Spins", this.param1);
            break;
        case TaskType.TASK_CONSECUTIVE_WIN:
            return Util.sprintf("Win %d Times \nin a Row", this.param1);
            break;
        case TaskType.TASK_LIMITED_BET_AND_DURATION:
            var betValue = SlotConfigMan.getInstance().getBet(this.subjectId, this.param2);
            var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(this.subjectId);
            return Util.sprintf("Free spin with\nbet %s in %d seconds", Util.formatAbbrNum(betValue * subjectTmpl.getMaxLineCount()), this.param1);
            break;
        case TaskType.TASK_LIMITED_BET_AND_CHANCE:
            var betValue = SlotConfigMan.getInstance().getBet(this.subjectId, this.param2);
            var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(this.subjectId);
            return Util.sprintf("Free spins with\nbet %s for %d times", Util.formatAbbrNum(betValue * subjectTmpl.getMaxLineCount()), this.param1);
            break;
        case TaskType.TASK_WIN_WITH_LISTED_SYMBOLS:
            return Util.sprintf("Win %d with\ncertain symbol", this.param2);
            break;
        case TaskType.TASK_COLLECT_THE_REWARD_N_TIMES:
            return Util.sprintf("Win certain payout\n%d times", this.param2);
            break;
        case TaskType.TASK_WIN_WITH_THE_REWARD:
            return Util.sprintf("Win %d with\ncertain payout", this.param2);
            break;
        case TaskType.TASK_GET_N_BIG_WIN:
            if(this.param1 == 1) {
                return Util.sprintf("BIG WIN %d time", this.param1);
            }
            else {
                return Util.sprintf("BIG WIN %d times", this.param1);
            }
            break;
        case TaskType.TASK_COLLECT_BAR_AND_DIAMOND:
            return Util.sprintf("Collect n Bars\nCollect n Diamonds");
            break;
        case TaskType.TASK_COLLECT_LISTED_SYMBOLS:
            return Util.sprintf("Collect %d Symbols", this.param2);
            break;
        case TaskType.TASK_COLLECT_LISTED_SYMBOLS_ON_WINLINE:
            return Util.sprintf("Collect %d symbols in\na winning combination", this.param2);
            break;

        // New In Double Winner
        case TaskType.TASK_BREAK_ICE:
            return "Melt the ice";
            break;
        case TaskType.NO_WIN_TIMES:
            return Util.sprintf("Spin %d times in a\nrow without winning", this.param1);
            break;
        case TaskType.TASK_COLLECT_STACK:
            return Util.sprintf("Hit %d Stacks", this.param2);
            break;
        case TaskType.TASK_COMPLETE_PROCESS:
            return Util.sprintf("Fill the meter %d times", this.param1);
            break;
        case TaskType.TASK_BREAK_FIRE:
            return "Extinguish the flame";
            break;
        case TaskType.TASK_BONUS_WIN_MONEY:
            return Util.sprintf("Win %s during\nBonus Game", Util.formatAbbrNum(this.param1));
            break;

        default:
            return "not supported TaskType";
    }
};

TaskConfig.prototype.getIconName = function () {
    var TaskConfigMan = require("./TaskConfigMan");
    var taskTypeConfig = TaskConfigMan.getInstance().getTaskTypeConfig(this.taskType);
    if (taskTypeConfig) {
        return taskTypeConfig.iconName;
    } else {
        return "";
    }
};

TaskConfig.prototype.getSlotIconName = function () {
    var SlotConfigMan = require("../../slot/config/SlotConfigMan");
    switch (this.taskType) {
        case TaskType.TASK_COLLECT_SYMBOL:
        case TaskType.TASK_COLLECT_SYMBOL_ON_WIN:
        case TaskType.TASK_WIN_WITH_LISTED_SYMBOLS:
        case TaskType.TASK_COLLECT_LISTED_SYMBOLS:
        case TaskType.TASK_COLLECT_LISTED_SYMBOLS_ON_WINLINE:
        case TaskType.TASK_COLLECT_SYMBOL_ONE_SPIN:
        case TaskType.TASK_COLLECT_SYMBOL_FREE_SPIN:
            var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
            var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
            var symbol = subjectTmpl.getSymbol(this.param1);
            return symbol.imgName;
        case TaskType.TASK_COLLECT_STACK:
            if(this.param1 == -1) {
                return this.getIconName();
            }
            else {
                var subject = SlotConfigMan.getInstance().getSubject(this.subjectId);
                var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
                var symbol = subjectTmpl.getSymbol(this.param1);
                return symbol.imgName;
            }
        default:
            return this.getIconName();
    }
};

TaskConfig.prototype.getSlotSceneIconName = function () {
    switch(this.subjectId) {
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_01:
            return "mission_icon_witch.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_02:
            return "mission_icon_warrior.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_03:
            return "mission_icon_ziz.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_04:
            return "mission_icon_master.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_05:
            return "mission_icon_king.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_06:
            return "mission_icon_goblin.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_07:
            return "mission_icon_mages.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_08:
            return "mission_icon_wizard.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_09:
            return "mission_icon_amazon.png";
            break;
        case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_10:
            return "mission_icon_charybdis.png";
            break;
    }
};

module.exports = TaskConfig;
