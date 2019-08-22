var extend = require('extend');
var Utils = require('../../common/util/Util');
var TaskLevelConfig = require('./TaskLevelConfig');
var TaskConfig = require('./TaskConfig');
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var DailyTaskConfig = require('./DailyTaskConfig');
var FlagStoneType = require("../../slot/enum/FlagStoneType");
var TaskTypeConfig = require("../config/TaskTypeConfig");
var TaskCollectSymbolConfig = require("./TaskCollectSymbolConfig");
var PathInfo = require("../entity/PathInfo");

var TaskConfigMan = (function () {
    var instance;

    function createInstance() {
        var MAX_MAP_POINT_NUM = 20;
        var MAX_DISTANCE = 300;

        /**
         * TaskLevelConfig Map, not contain comming sooon config.
         * @type {Object.<number, TaskLevelConfig>}
         */
        var taskLevelConfigMap = {};

        /**
         * TaskLevelConfig list, contain comming soon config.
         * @type {Array.<TaskLevelConfig>}
         */
        var taskLevelConfigList = [];

        /**
         * @type {TaskLevelConfig}
         */
        var commingSoonConfig = null;

        /**
         * TaskTypeConfigMap
         * @type {Object.<number, TaskTypeConfig>}
         */
        var taskTypeConfigMap = {};

        var taskConfigMap = {};
        var maxLevel = 0;
        var dailyTaskConfigMap = {};

        /**
         * level => PointList
         * @type {Object.<Number, Array.<cc.Point>>}
         */
        var mapPathPointMap = {};

        var taskTypeConfigObj = Utils.loadJson("config/task_config/task_type_config.json");
        if (taskTypeConfigObj) {
            taskTypeConfigObj.value.forEach(function (taskClientConfig) {
                var taskTypeConfig = new TaskTypeConfig();
                taskTypeConfigMap[taskClientConfig.task_type] = taskTypeConfig;
                taskTypeConfig.unmarshal(taskClientConfig);
            });
        }

        taskLevelConfigList = [];
        taskLevelConfigMap = {};
        var taskLevelConfigClientObj = Utils.loadJson("config/task_config/task_map_data.json");
        if (taskLevelConfigClientObj && Object.keys(taskLevelConfigClientObj).length > 0) {
            var levelKeys = Object.keys(taskLevelConfigClientObj);
            for(var i = 0; i < levelKeys.length; i++) {
                var oneLevelConfig = taskLevelConfigClientObj[levelKeys[i]];

                var taskLevelConfig = new TaskLevelConfig();
                taskLevelConfig.unmarshal(oneLevelConfig);
                taskLevelConfigMap[taskLevelConfig.level] = taskLevelConfig;
                taskLevelConfigList.push(taskLevelConfig);

                if (taskLevelConfig.level > maxLevel && !taskLevelConfig.isBranchTask) {
                    maxLevel = taskLevelConfig.level;
                }

                var nextTaskLevelConfig = taskLevelConfigClientObj[levelKeys[i + 1]];
                if(nextTaskLevelConfig != null && !cc.isUndefined(nextTaskLevelConfig) && !nextTaskLevelConfig.isBranchTask) {
                    taskLevelConfig.childrenLevel.push(nextTaskLevelConfig.level);
                }
            }
        }

        //for(var i = 1; i <= 50; i++) {
        //    var levelConfigTest = new TaskLevelConfig();
        //    levelConfigTest.level = i;
        //    levelConfigTest.flagStonePos = [50 * i, 100 * ((i % 2) * 2 - 1) - 50];
        //    levelConfigTest.flagStoneName = "slot/lobby/flagstone/slot_lobby_flagstone_poing";
        //    levelConfigTest.flagStoneType = 1;
        //    taskLevelConfigMap[levelConfigTest.level] = levelConfigTest;
        //    taskLevelConfigList.push(levelConfigTest);
        //}

        var lastLevelConfig = new TaskLevelConfig();
        lastLevelConfig.level = -1;
        lastLevelConfig.flagStonePos = [3063, 58];
        lastLevelConfig.flagStoneName = "slot/lobby/flagstone/slot_lobby_flagstone_coming_soon";
        lastLevelConfig.flagStoneType = 4;
        taskLevelConfigMap[lastLevelConfig.level] = lastLevelConfig;
        taskLevelConfigList.push(lastLevelConfig);
        commingSoonConfig = lastLevelConfig;

        cc.log('load task levels %s', JSON.stringify(taskLevelConfigMap));

        dailyTaskConfigMap = {};
        var dailyTaskConfigObj = Utils.loadJson("config/task_config/daily_task.json");
        if (dailyTaskConfigObj) {
            dailyTaskConfigObj.value.forEach(function (taskConfig) {
                var config = new DailyTaskConfig(taskConfig);
                dailyTaskConfigMap[taskConfig.task_type] = config;
            });
        }
        cc.log('load daily tasks %s', JSON.stringify(dailyTaskConfigMap));

        /*
        var collectSymbols = Utils.loadJson("config/task_config/task_collect_symbol_config.json");
        if (collectSymbols) {
            collectSymbols.value.forEach(function (collectSymbolObj) {
                var collectSymbolConfig = new TaskCollectSymbolConfig();
                collectSymbolConfig.unmarshal(collectSymbolObj);
                collectSymbolConfigList.push(collectSymbolConfig);
            });
        }*/

        return {
            /**
             * get random position list from fromPos to toPos.
             * @param {number} index
             * @param {cc.Point} fromPos
             * @param {cc.Point} toPos
             * @param {number} num
             */
            getPathPointList: function (fromPos, toPos, num) {
                var resultArr = [];
                var allOffsetX = toPos.x - fromPos.x;
                var allOffsetY = toPos.y - fromPos.y;
                var singleOffsetX = allOffsetX / num;
                var singleOffsetY = allOffsetY / num;

                var getY = function (x, ratio) {
                    if (x > 0.5) {
                        return (1 - 0.5 * Math.pow(2 - 2 * x, ratio));
                    } else {
                        return (0.5 * Math.pow(2 * x, ratio));
                    }
                };

                var getRotation = function (pathInfo, nextPathInfo) {
                    var pos = pathInfo.pos;
                    var nextPos = nextPathInfo.pos;
                    var degree;
                    if (nextPos.x - pos.x > 0) {
                        degree = Math.atan((nextPos.y - pos.y) / (nextPos.x - pos.x));
                    } else {
                        degree = Math.atan((nextPos.y - pos.y) / (nextPos.x - pos.x)) + Math.PI;
                    }
                    return (- degree * 180 / Math.PI);
                };

                var i;
                var pathInfo;
                var nextPathInfo;
                for (i = 0; i < num; ++i) {
                    pathInfo = new PathInfo();
                    if(allOffsetX != 0) {
                        pathInfo.pos = cc.p(fromPos.x + singleOffsetX * i,
                            fromPos.y + getY(singleOffsetX / allOffsetX * i, 2) * allOffsetY);
                    }
                    else {
                        pathInfo.pos = cc.p(fromPos.x + singleOffsetX * i,
                            fromPos.y + singleOffsetY * i);
                    }
                    pathInfo.rotation = 0;
                    resultArr.push(pathInfo);
                }

                for (i = 0; i < resultArr.length; ++i) {
                    if (i != resultArr.length - 1) {
                        pathInfo = resultArr[i];
                        nextPathInfo = resultArr[i + 1];
                        pathInfo.rotation = getRotation(pathInfo, nextPathInfo);
                    }
                }

                return resultArr;
            },

            /**
             * generate map path point.
             */
            generateMapPathPoint: function () {
                if (mapPathPointMap && Object.keys(mapPathPointMap) > 0) return;

                var fromPos;
                var toPos;
                for(var i = 0; i < taskLevelConfigList.length; i++) {
                    var curTaskLevelConfig = taskLevelConfigList[i];
                    for(var j = 0; j < curTaskLevelConfig.childrenLevel.length; j++) {
                        var nextTaskLevelConfig = taskLevelConfigMap[curTaskLevelConfig.childrenLevel[j]];

                        fromPos = curTaskLevelConfig.flagStonePos;
                        toPos = nextTaskLevelConfig.flagStonePos;
                        var distance = cc.pDistance(fromPos, toPos);
                        var num = Math.floor(MAX_MAP_POINT_NUM * distance / MAX_DISTANCE);

                        var pathKey = Utils.sprintf("%d_%d", curTaskLevelConfig.level, nextTaskLevelConfig.level)
                        mapPathPointMap[pathKey] = this.getPathPointList(fromPos, toPos, num);
                    }
                }
            },

            /**
             * get task level map point list.
             * @param {Number} taskLevel
             * @returns {Array.<cc.Point>}
             */
            getMapPointList: function (pathKey) {
                return mapPathPointMap[pathKey];
            },

            getLevelConfig: function (taskLevel) {
                return taskLevelConfigMap[taskLevel];
            },
            getCommingSoonLevelConfig: function () {
                return commingSoonConfig;
            },
            getLevelConfigMap: function () {
                return taskLevelConfigMap;
            },
            getLevelConfigList: function () {
                return taskLevelConfigList;
            },
            getTaskList: function () {
                return Object.keys(taskConfigMap);
            },
            getTaskConfig: function (taskId) {
                return taskConfigMap[taskId];
            },
            getMaxLevel: function () {
                return maxLevel;
            },
            getLevelTaskList: function (taskLevel) {
                if (taskLevel <= maxLevel) {
                    return this.getLevelConfig(taskLevel).taskList;
                }
                return [];
            },
            getDailyTaskList: function() {
                return Object.keys(dailyTaskConfigMap);
            },
            getDailyTaskConfig: function(taskType) {
                return dailyTaskConfigMap[taskType];
            },

            /**
             * @param {number} taskType
             * @returns {TaskTypeConfig}
             */
            getTaskTypeConfig: function (taskType) {
                return taskTypeConfigMap[taskType];
            },

            getMaxTaskLevel: function () {
                return maxLevel;
            },

            /**
             * @param {TaskConfig} taskConfig
             */
            addTaskConfig: function (taskConfig) {
                var curTaskConfig = taskConfigMap[taskConfig.taskId];
                if (curTaskConfig) {
                    curTaskConfig.updateTaskConfig(taskConfig);
                } else {
                    taskConfigMap[taskConfig.taskId] = taskConfig;
                }
            },

            addTaskLevelTaskId: function (taskLevel, taskConfig) {
                var taskLevelConfig = taskLevelConfigMap[taskLevel];
                if (taskLevelConfig) {
                    taskLevelConfig.addTask(taskConfig);
                }
            },

            clearTaskLevelTaskById: function (taskLevel) {
                var taskLevelConfig = taskLevelConfigMap[taskLevel];
                if(taskLevelConfig) {
                    taskLevelConfig.clearTask();
                }
            },

            clearAllTaskLevelTask: function () {
                for(var i = 0; i < taskLevelConfigList.length; i++) {
                    taskLevelConfigList[i].clearTask();
                }
            },

            clearAllTaskLevelStar: function () {
                for(var i = 0; i < taskLevelConfigList.length; i++) {
                    taskLevelConfigList[i].clearLevelStar();
                }
            },

            addLevelStar: function (taskLevel) {
                var hasUnlockNewTask = false;
                var curTaskLevelConfig = taskLevelConfigMap[taskLevel];
                if(curTaskLevelConfig) {
                    if(curTaskLevelConfig.flagStoneType == FlagStoneType.FLAG_STONE_TYPE_CHEST) {
                        curTaskLevelConfig.levelStar = 2;
                    }
                    else {
                        curTaskLevelConfig.levelStar++;
                    }

                    for(var i = 0; i < curTaskLevelConfig.childrenLevel.length; i++) {
                        var nextTaskLevelConfig = taskLevelConfigMap[curTaskLevelConfig.childrenLevel[i]];
                        if(nextTaskLevelConfig && nextTaskLevelConfig.levelStar == 0) {
                            nextTaskLevelConfig.levelStar++;
                            hasUnlockNewTask = true;
                        }
                    }
                }
                return hasUnlockNewTask;
            },

            getUnlockNewTaskLevelId: function (taskLevel) {
                var curTaskLevelConfig = taskLevelConfigMap[taskLevel];
                if(curTaskLevelConfig && curTaskLevelConfig.childrenLevel.length > 0) {
                    return curTaskLevelConfig.childrenLevel[0];
                }
                return -1;
            },

            updateTaskLevelConfig: function (configList) {
                for(var i = 0; i < configList.length; i++) {
                    var oneTaskLevelConfig = configList[i];
                    if(taskLevelConfigMap[oneTaskLevelConfig.level]) {
                        taskLevelConfigMap[oneTaskLevelConfig.level].updateLevelConfig(oneTaskLevelConfig);
                    }
                }

                this.generateMapPathPoint();
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

module.exports = TaskConfigMan;
