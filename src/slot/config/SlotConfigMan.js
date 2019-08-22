/**
 * Created by alanmars on 15/4/15.
 */
var Util = require("../../common/util/Util");
var SubjectTmpl = require("../entity/SubjectTmpl");
var Subject = require("../entity/Subject");
var LevelMaxBet = require("../entity/LevelMaxBet");
var JackpotStatus = require("../enum/JackpotStatus");
var JackpotType = require("../enum/JackpotType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var extend = require("extend");
var SubjectClassify = require("../enum/SubjectClassify");
var LockType = require("../enum/LockType");
var Config = require("../../common/util/Config");
var SlotThemeConfig = require("../entity/SlotThemeConfig");

var SlotConfigMan = (function () {
    var instance;

    function createInstance() {
        /**
         * subjectTmplId => SubjectTmpl
         * @type {object.<int, SubjectTmpl>}
         */
        var subjectTmplMap = {};
        /**
         * @type {Array.<Subject>}
         */
        var subjectList = [];
        /**
         * @type {Object.<SubjectClassify, Array.<Subject>>}
         */
        var subjectClassifyMap= {};
        var jackpotUpdateEnabled = false;
        var lastJackpotUpdateTime = 0;
        /**
         * subjectId => Subject
         * @type {object.<int, Subject>}
         */
        var subjectMap = {};
        /**
         * subjectId => bets
         * @type {object.<int, Array>}
         */
        var subjectBetMap = {};
        /**
         * {
         *   "betLevel": 0,
         *   "unlockLevel": 1
         * }
         * @type {Array.<object>}
         */
        var subjectBetUnlockList = null;

        /**
         * {
         *   "betLevel": 0,
         *   "unlockLevel": 1
         * }
         * @type {Array.<object>}
         */
        var subjectBetFreeModeUnlockList = null;

        var slotThemeList = [];

        var i;
        //init subject tmpl list
        var subjectTmplIdObj = Util.loadJson("config/subject_tmpl_list/subject_tmpl_id_list.json");
        var tmplIdArray = subjectTmplIdObj["subjectTmplIdList"];
        for (i = 0; i < tmplIdArray.length; ++i) {
            var subjectTmplPath = Util.sprintf("config/subject_tmpl_list/subject_tmpl_%d.json", tmplIdArray[i]);
            var specialPaytablePath = Util.sprintf("config/subject_tmpl_list/special_paytable_%d.json", tmplIdArray[i]);

            var subjectTmplObj = Util.loadJson(subjectTmplPath);
            subjectTmplObj = extend(true, subjectTmplObj, subjectTmplObj.client);
            var subjectTmpl = new SubjectTmpl();
            subjectTmpl.unmarshal(subjectTmplObj);

            var specialPayTableObj = Util.loadJson(specialPaytablePath);
            if (specialPayTableObj) {
                subjectTmpl.replaceBySpecialPaytable(specialPayTableObj);
            }
            subjectTmplMap[subjectTmpl.subjectTmplId] = subjectTmpl;
        }

        //init bet
        var betObj = Util.loadJson("config/slot_bet.json");
        var subjectBetObjArray = betObj["value"];
        for (i = 0; i < subjectBetObjArray.length; ++ i) {
            var subjectBetObj = subjectBetObjArray[i];
            subjectBetMap[subjectBetObj["subjectId"]] = subjectBetObj["betList"];
        }
        var betLockObj = Util.loadJson("config/slot_bet_unlock.json");
        subjectBetUnlockList = betLockObj["value"];

        var betFreeModeLockObj = Util.loadJson("config/slot_bet_unlock_free_mode.json");
        subjectBetFreeModeUnlockList = betFreeModeLockObj["value"];

        var slotThemeJson = Util.loadJson("config/slot_theme.json");
        var slotThemeArray = slotThemeJson["slotThemes"];
        for(i = 0; i < slotThemeArray.length; i++) {
            var oneSlotTheme = new SlotThemeConfig();
            oneSlotTheme.unmarshal(slotThemeArray[i]);
            slotThemeList.push(oneSlotTheme);
        }

        return {
            /**
             * @param {number} subjectTmplId
             * @returns {SubjectTmpl} subject tmpl object
             */
            getSubjectTmpl: function (subjectTmplId) {
                return subjectTmplMap[subjectTmplId];
            },

            /**
             * @param {S2CGetSubjects} proto
             */
            initSubjectList: function(proto) {
                var serverSubjectList = proto.subjects;

                var hasJackpot = false;
                subjectList.length = 0;
                for (var i = 0; i < serverSubjectList.length; ++ i) {
                    var serverSubject = serverSubjectList[i];
                    var subjectTmpl = this.getSubjectTmpl(serverSubject.subjectTmplId);
                    if (subjectTmpl) {
                        serverSubject.ccbName = "slot/lobby/free_mode/lobby_free_mode_item.ccbi";
                        if (Util.isFileExist(serverSubject.ccbName)) {
                            subjectMap[serverSubject.subjectId] = serverSubject;
                            subjectList.push(serverSubject);

                            if (!hasJackpot && serverSubject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN && serverSubject.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
                                hasJackpot = true;
                            }
                        }
                    }
                }

                if (hasJackpot && !jackpotUpdateEnabled) {
                    jackpotUpdateEnabled = true;
                    lastJackpotUpdateTime = Date.now();
                    setInterval(this._updateJackpots, 100);
                }
                subjectClassifyMap[SubjectClassify.SUBJECT_CLASSIFY_JACKPOT] = this._getSubjectListByType(proto.jackpot);
                subjectClassifyMap[SubjectClassify.SUBJECT_CLASSIFY_NEWEST] = this._getSubjectListByType(proto.newest);
                subjectClassifyMap[SubjectClassify.SUBJECT_CLASSIFY_POPULAR] = this._getSubjectListByType(proto.popular);
                subjectClassifyMap[SubjectClassify.SUBJECT_CLASSIFY_ALL] = subjectList;
            },

            _getSubjectListByType: function (classifyArr) {
                if (!classifyArr) {
                    return [];
                }
                var subjectArr = [];
                for (var i = 0; i < classifyArr.length; ++i) {
                    var subjectId = classifyArr[i];
                    var subject = this.getSubject(subjectId);
                    if (subject) {
                        subjectArr.push(subject);
                    }
                }
                return subjectArr;
            },

            /**
             * @params {SubjectClassify}
             * @returns {Array.<Subject>}
             */
            getSubjectListByType: function (type) {
                return subjectClassifyMap[type];
            },

            /**
             * @returns {Array.<Subject>}
             */
            getSubjectList: function () {
                return subjectList;
            },

            /**
             * @param {number} subjectId
             * @returns {Subject} subject object
             */
            getSubject: function (subjectId) {
                return subjectMap[subjectId];
            },

            /**
             * @param {number} subjectId
             * @param {number} betLevel
             * @returns {number} the bet
             */
            getBet: function (subjectId, betLevel) {
                return subjectBetMap[subjectId][betLevel];
            },

            /**
             * @param {number} subjectId
             * @param {number} playerLevel
             * @param {number} isFreeMode
             * @returns {Array.<number>} the bet list
             */
            getBetList: function (subjectId, playerLevel, isFreeMode) {
                var unlockList = subjectBetUnlockList;
                if (isFreeMode) {
                    unlockList = subjectBetFreeModeUnlockList;
                }
                var maxBetLevel = 0;
                for (var i = 0; i < unlockList.length; ++ i) {
                    if (playerLevel >= unlockList[i].unlockLevel && maxBetLevel <= unlockList[i].betLevel) {
                        maxBetLevel = unlockList[i].betLevel;
                    } else {
                        break;
                    }
                }
                var allBetList = subjectBetMap[subjectId];
                return allBetList.slice(0, maxBetLevel + 1);
            },

            getBetLevelCount: function (subjectId, playerLevel, isFreeMode) {
                var bets = this.getBetList(subjectId, playerLevel, isFreeMode);
                return bets.length;
            },

            _updateJackpots: function () {
                var elapsedTime = (Date.now() - lastJackpotUpdateTime)*0.001;
                subjectList.forEach(function (subject, index, arr) {
                    if (subject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN && subject.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
                        var jackpotInfo = subject.jackpotInfoList[0];
                        jackpotInfo.jackpotValue += jackpotInfo.incPerSec*elapsedTime;
                        jackpotInfo.jackpotValue = Math.floor(jackpotInfo.jackpotValue);
                    }
                });
                lastJackpotUpdateTime = Date.now();
                EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_UPDATE_JACKPOT, null);
            },

            getSlotThemeConfig: function (resGroup) {
                return slotThemeList[resGroup];
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = SlotConfigMan;
