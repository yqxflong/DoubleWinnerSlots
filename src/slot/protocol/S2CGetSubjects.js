var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var Subject = require("../entity/Subject");
var ClasssicSlotMan = require("../../slot/model/ClassicSlotMan");
var Config = require("../../common/util/Config");
var TaskLevelConfig = require("../../task/config/TaskLevelConfig");
var TaskConfigMan = require("../../task/config/TaskConfigMan");

/**
 * Created by alanmars on 15/5/27.
 */
var S2CGetSubjects = function () {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_GET_SUBJECTS);
    /**
     * @type {Array.<Subject>}
     */
    this.subjects = null;
    /**
     * @type {Array.<subject id>}
     */
    this.popular = null;
    /**
     * @type {Array.<subject id>}
     */
    this.newest = null;
    /**
     * @type {Array.<subject id>}
     */
    this.jackpot = null;

    this.taskLevels = [];
};

Util.inherits(S2CGetSubjects, LogicProtocol);

S2CGetSubjects.prototype.execute = function () {
    TaskConfigMan.getInstance().updateTaskLevelConfig(this.taskLevels);
    ClasssicSlotMan.getInstance().onGetSubjects(this);
};

S2CGetSubjects.prototype.unmarshal = function (jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this, jsonObj);

    this.subjects = [];
    var subjects = jsonObj["subjects"];
    var i = 0;
    for(i = 0; i < subjects.length; ++i) {
        var subject = new Subject();
        subject.unmarshal(subjects[i]);
        this.subjects.push(subject);
    }

    this.popular = jsonObj["popular"];
    this.newest = jsonObj["newest"];
    this.jackpot = jsonObj["jackpot"];

    var levelStarArray = jsonObj["levelStar"];
    var keys = Object.keys(levelStarArray);
    for(i = 0; i < keys.length; i++) {
        var oneTaskLevel = new TaskLevelConfig();
        oneTaskLevel.level = keys[i];
        oneTaskLevel.levelStar = levelStarArray[keys[i]];
        this.taskLevels.push(oneTaskLevel);
    }
};


module.exports = S2CGetSubjects;