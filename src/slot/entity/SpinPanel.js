/**
 * Created by alanmars on 15/4/16.
 */
var WinLine = require("./WinLine");
var SpinExtraInfoFactory = require("./SpinExtraInfoFactory");
var TaskDataFactory = require("../../task/taskData/TaskDataFactory");

var SpinPanel = function() {
    this.panel = null;   //int[][]
    /**
     * @type {Array.<WinLine>}
     */
    this.winLines = null;
    this.winRate = 0;
    this.winLevel = 0;
    this.gems = 0;
    this.chips = 0;
    this.isBonus = 0;
    this.leftFreeSpin = 0;
    this.jackpotTriggered = false;
    this.type = 0;
    this.extraInfo = null;
    this.jackpotLevel = 0;
    this.jackpotWin = 0;
    this.taskProgress = 0;
    this.taskNewDetail = null;
};

SpinPanel.prototype = {
    constructor: SpinPanel,

    unmarshal: function (jsonObj) {
        this.panel = jsonObj["panel"];
        var jsonWinLines = jsonObj["winLines"];

        //var winLineCount = jsonWinLines.length / 2;
        this.winLines = [];
        for (var i = 0; i < jsonWinLines.length; ++i) {
            var winLine = new WinLine();
            winLine.unmarshal(jsonWinLines[i]);
            this.winLines.push(winLine);
        }
        this.winRate = jsonObj["winRate"];
        this.winLevel = jsonObj["winLevel"];
        this.gems = jsonObj["gems"];
        this.chips = jsonObj["chips"];
        this.isBonus = jsonObj["isBonus"];
        this.leftFreeSpin = jsonObj["leftFreeSpin"];
        this.jackpotTriggered = jsonObj["jackpotTriggered"];
        this.type = jsonObj["type"];
        this.jackpotLevel = jsonObj["jackpotLevel"];
        this.jackpotWin = jsonObj["jackpotWin"];
        this.taskProgress = jsonObj["taskProgress"];

        this.extraInfo = SpinExtraInfoFactory.create(this.type);
        this.extraInfo.unmarshal(jsonObj["extraInfo"]);

        var taskNewDetailJsonObj = jsonObj["taskNewDetail"];
        if (taskNewDetailJsonObj) {
            var ClassicSlotMan = require("../model/ClassicSlotMan");
            var slotMan = ClassicSlotMan.getInstance();
            if (slotMan.taskInfo) {
                this.taskNewDetail = TaskDataFactory.create(slotMan.taskInfo.taskType, taskNewDetailJsonObj);
            }
        }
    }
};

module.exports = SpinPanel;