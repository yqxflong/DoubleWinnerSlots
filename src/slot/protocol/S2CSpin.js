var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var SpinPanel = require("../entity/SpinPanel");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var LevelExp = require("../../common/entity/LevelExp");
var ErrorCode = require("../../common/enum/ErrorCode");
var TaskLevelUp = require("../../task/entity/taskLevelUp");
var DailyTaskUpdate = require("../../task/entity/DailyTaskUpdate");
var Config = require("../../common/util/Config");

/**
 * Created by qinning on 15/4/27.
 */
var S2CSpin = function() {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_SPIN);
    this.errorCode = 0;
    /**
     *
     * @type {Array.<SpinPanel>}
     */
    this.result = [];
    this.isFreeSpin = 0;
    this.subjectId = -1;
    /**
     *
     * @type {TaskLevelUp}
     */
    this.taskLevelUp = null;
    this.syncExp = new LevelExp();
    this.syncDailyTasks = []; //array of DailyTaskUpdate
    this.dailyTaskCompleted = false;

    //if(Config.localDebugMode) {
    //    this.resultIndex = 0;
    //}
};

Util.inherits(S2CSpin, LogicProtocol);

S2CSpin.prototype.execute = function() {
    ClassicSlotMan.getInstance().onGetSpinResult(this);
};

S2CSpin.prototype.unmarshal = function(jsonObj) {

    //if(Config.localDebugMode) {
    //    var jsonFile = Util.loadJson("config/slot_test_spin_result.json");
    //    var resultList = jsonFile["spinResult"];
    //    jsonObj = resultList[this.resultIndex];
    //}

    //if(Config.testForSoundMode) {
    //    Config.testForSoundMode = false;
    //
    //    var jsonFile = Util.loadJson("config/slot_test_spin_result.json");
    //    var resultList = jsonFile["spinResult"];
    //    var index = 0;
    //
    //    if(Config.testForSoundSubjectId == 60101) index = 0;
    //    else if(Config.testForSoundSubjectId == 60102) index = 1;
    //    else if(Config.testForSoundSubjectId == 60105) index = 2;
    //    else if(Config.testForSoundSubjectId == 60106) index = 5;
    //    else if(Config.testForSoundSubjectId == 60110) index = 0;
    //    jsonObj = resultList[index];
    //}

    this.errorCode = jsonObj["errorCode"] || ErrorCode.SUCCESS;
    if (this.errorCode != ErrorCode.SUCCESS) {
        return;
    }
    this.result.length = 0;
    var jsonResult = jsonObj["result"];
    for(var i = 0; i < jsonResult.length; ++i) {
        var spinPanel = new SpinPanel();
        spinPanel.unmarshal(jsonResult[i]);
        this.result.push(spinPanel);
    }
    this.isFreeSpin = jsonObj["isFreeSpin"];
    this.subjectId = jsonObj["subjectId"];
    if (jsonObj["syncExp"]) {
        this.syncExp.unmarshal(jsonObj["syncExp"]);
    }
    var taskLevelUp = jsonObj["taskLevelUp"];
    if (taskLevelUp) {
        this.taskLevelUp = new TaskLevelUp();
        this.taskLevelUp.unmarshal(taskLevelUp);
    }
    var syncDailyTasks = jsonObj["syncDailyTasks"];
    if (syncDailyTasks) {
        for (var i = 0; i < syncDailyTasks.length; ++i) {
            var dailyTaskUpdate = new DailyTaskUpdate();
            dailyTaskUpdate.unmarshal(syncDailyTasks[i]);
            this.syncDailyTasks.push(dailyTaskUpdate);
        }
    }
    this.dailyTaskCompleted = jsonObj["dailyTaskCompleted"];
};

module.exports = S2CSpin;