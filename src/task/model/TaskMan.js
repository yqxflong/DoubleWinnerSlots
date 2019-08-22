var PopupMan = require("../../common/model/PopupMan");
var ErrorCode = require("../../common/enum/ErrorCode");
var PlayerMan = require("../../common/model/PlayerMan");
var DeviceInfo = require("../../common/util/DeviceInfo");
var C2SGetCurTask = require("../protocol/C2SGetCurTask");
var C2SCompleteTask = require("../protocol/C2SCompleteTask");
var C2SGetDailyTask = require("../protocol/C2SGetDailyTask");
var C2SClaimDailyTaskReward = require("../protocol/C2SClaimDailyTaskReward");
var C2SGetFriendTask = require("../protocol/C2SGetFriendTask");
var EventDispatcher = require("../../common/events/EventDispatcher");
var TaskEvent = require("../events/TaskEvent");
var TaskConfigMan = require("../config/TaskConfigMan");

var TaskMan = (function () {
    var instance;

    function createInstance() {
        var taskLevel = 0;

        var newTaskLevelUp = null;
        var hasUnlockNewTaskLevel = false;
        var unlockNewTaskLevelId = -1;
        var dailyTaskList = [];
        var dailyTaskReward = null;
        var friendsTaskList = [];
        var openSubjects = [];
        var dailyTaskCompleted = false;
        var rewardClaimed = false;
        var timeOutKey = null;
        var taskStarNum = 0;
        var isLobbyFlagStoneCanSpin = false;

        return {
            sendGetCurTaskCmd: function () {
                var c2sGetCurTask = new C2SGetCurTask();
                c2sGetCurTask.send();
            },

            /**
             * on get cur task.
             * @param {S2CGetCurTask} proto
             */
            onGetCurTask: function (proto) {
                taskLevel = proto.taskLevel;
                TaskConfigMan.getInstance().clearAllTaskLevelTask();
                TaskConfigMan.getInstance().clearAllTaskLevelStar();
                this.updateTaskConfigs(taskLevel, proto.curTaskConfigs);
                openSubjects = proto.openSubjects;
                var SceneMan = require("../../common/model/SceneMan");
                newTaskLevelUp = null;

                taskStarNum = proto.taskStarNum;
                SceneMan.getInstance().onGetTaskReady();
            },

            /**
             * @param {Number} taskLevel
             * @param {Array.<TaskConfig>} taskConfigs
             */
            updateTaskConfigs: function (taskLevel, taskConfigs) {
                for (var i = 0; i < taskConfigs.length; ++i) {
                    var taskConfig = taskConfigs[i];
                    TaskConfigMan.getInstance().addTaskConfig(taskConfig);
                    TaskConfigMan.getInstance().addTaskLevelTaskId(taskConfig.taskLevelId, taskConfig);
                }
            },
            getTaskStarNum: function () {
                return taskStarNum;
            },
            setTaskStarNum: function (starNum) {
                taskStarNum = starNum;
            },
            getCurTaskLevel: function () {
                return taskLevel;
            },
            isLobbyFlagStoneCanSpin: function () {
                return isLobbyFlagStoneCanSpin;
            },

            setIsLobbyFlagStoneCanSpin: function (canSpin) {
                isLobbyFlagStoneCanSpin = canSpin;
            },

            /**
             * @param {TaskLevelUp} taskLevelUp
             */
            addNewTaskLevelUp: function (taskLevelUp) {
                newTaskLevelUp = taskLevelUp;
                TaskConfigMan.getInstance().clearAllTaskLevelTask();
                hasUnlockNewTaskLevel = TaskConfigMan.getInstance().addLevelStar(newTaskLevelUp.oldTaskLevel);
                if(hasUnlockNewTaskLevel) {
                    unlockNewTaskLevelId = TaskConfigMan.getInstance().getUnlockNewTaskLevelId(newTaskLevelUp.oldTaskLevel);
                }
                this.updateTaskConfigs(taskLevelUp.newTaskLevel, taskLevelUp.newTaskConfigs);

                var newSubjects = taskLevelUp.newSubjects;
                if (newSubjects && newSubjects.length > 0) {
                    for (var i = 0; i < newSubjects.length; ++i) {
                        if (!Util.arrContain(openSubjects, newSubjects[i])) {
                            openSubjects.push(newSubjects[i]);
                        }
                    }
                }

                var ProductChangeReason = require("../../log/enum/ProductChangeReason");
                var LogMan = require("../../log/model/LogMan");
                LogMan.getInstance().userProductRecord(ProductChangeReason.TASK_LEVEL_UP,
                    0, 0, newTaskLevelUp, 0, 0);

                if (cc.sys.isNative) {
                    var facebookId = PlayerMan.getInstance().player.facebookId;
                    if (!facebookId) {
                        facebookId = "";
                    }
                    jsb_wtc.EventHelper.getInstance().TrackEventLevel(facebookId, newTaskLevelUp.newTaskLevel);
                }
            },

            getNewTaskLevelUp: function () {
                return newTaskLevelUp;
            },

            getHasUnlockNewTaskLevel: function () {
                return hasUnlockNewTaskLevel;
            },

            getUnlockNewTaskLevelId: function () {
                return unlockNewTaskLevelId;
            },

            haveNewTaskCompleted: function () {
                if (newTaskLevelUp && newTaskLevelUp.newTaskLevel > 0) {
                    return true;
                }
                return false;
            },

            isCommingSoonTask: function () {
                if (newTaskLevelUp && newTaskLevelUp.newTaskLevel > 0 && newTaskLevelUp.newTaskConfigs.length == 0) {
                    return true;
                } else if (newTaskLevelUp.newTaskLevel > TaskConfigMan.getInstance().getMaxTaskLevel()) {
                    return true;
                }
                return false;
            },

            consumeNewTask: function () {
                taskLevel = newTaskLevelUp.newTaskLevel;
                newTaskLevelUp = null;
                hasUnlockNewTaskLevel = false;
                unlockNewTaskLevelId = -1;
            },

            sendCompleteTaskCmd: function (taskId, taskLevelId, levelStar) {
                var c2sCompleteTask = new C2SCompleteTask();
                c2sCompleteTask.taskId = taskId;
                c2sCompleteTask.taskLevelId = taskLevelId;
                c2sCompleteTask.levelStar = levelStar;
                c2sCompleteTask.send();
            },

            /**
             * @param {S2CCompleteTask} s2cCompleteTask
             */
            onCompletedTask: function (s2cCompleteTask) {
                if (s2cCompleteTask.errorCode == ErrorCode.SUCCESS) {
                    var taskLevelUp = s2cCompleteTask.taskLevelUp;
                    this.addNewTaskLevelUp(taskLevelUp);
                    PopupMan.popupTaskCompletedDlg(taskLevelUp);

                    taskStarNum = s2cCompleteTask.taskLevelUp.taskStarNum;
                }
            },

            sendGetDailyTask: function () {
                var proto = new C2SGetDailyTask();
                proto.send();
            },

            /**
             * @param {S2CGetDailyTask} s2cGetDailyTask
             */
            onGetDailyTask: function (s2cGetDailyTask) {
                dailyTaskList = s2cGetDailyTask.taskList;
                dailyTaskReward = s2cGetDailyTask.dailyTaskReward;

                dailyTaskCompleted = s2cGetDailyTask.completed;
                rewardClaimed = s2cGetDailyTask.rewardClaimed;
                if (!s2cGetDailyTask.rewardClaimed && s2cGetDailyTask.completed) {
                    EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_DAILY_TASK_COMPLETED);
                }

                //clear old timeout schedule.
                if (timeOutKey) {
                    clearTimeout(timeOutKey);
                    timeOutKey = null;
                }
                //send and get new daily task.
                if (s2cGetDailyTask.clearLeftTime > 0) {
                    var self = this;
                    timeOutKey = setTimeout(function () {
                        self.sendGetDailyTask();
                    }, s2cGetDailyTask.clearLeftTime);
                }
                var SceneMan = require("../../common/model/SceneMan");
                SceneMan.getInstance().onGetDailyTaskReady();
            },

            getRewardClaimed: function () {
                return rewardClaimed;
            },

            setRewardClaimed: function (isRewardClaimed) {
                rewardClaimed = isRewardClaimed;
            },

            getDailyTaskCompleted: function () {
                return dailyTaskCompleted;
            },

            setDailyTaskCompleted: function (isCompleted) {
                dailyTaskCompleted = isCompleted;
            },

            /**
             * get daily task list
             * @returns {Array.<DailyTaskInfo>}
             */
            getDailyTaskList: function () {
                return dailyTaskList;
            },

            getDailyTaskReward: function () {
                return dailyTaskReward;
            },

            /**
             * get daily task completed count.
             * @returns {number}
             */
            getDailyTaskCompletedCount: function () {
                if (dailyTaskCompleted) {
                    return dailyTaskReward.minFinishCount;
                } else {
                    var completedCount = 0;
                    for (var i = 0; i < dailyTaskList.length; ++i) {
                        var dailyTask = dailyTaskList[i];
                        if (dailyTask.isCompleted()) {
                            ++completedCount;
                        }
                    }
                    return completedCount;
                }
            },

            /**
             * sync daily task
             * @param {S2CSyncDailyTask} proto
             */
            onSyncDailyTasks: function (proto) {
                this.updateDailyTasks(proto.syncDailyTasks);
                var syncDailyTasks = proto.syncDailyTasks;
                this.setDailyTaskCompleted(proto.completed);
                var haveCompletedDailyTask = false;
                if (syncDailyTasks && syncDailyTasks.length > 0) {
                    for (var i = 0; i < syncDailyTasks.length; ++i) {
                        var isCompleted = syncDailyTasks[i].completed;
                        if (isCompleted) {
                            haveCompletedDailyTask = true;
                            break;
                        }
                    }
                }
                if (haveCompletedDailyTask) {
                    EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_DAILY_TASK_COMPLETED);
                }
            },

            /**
             * update daily tasks.
             * @param {Array.<DailyTaskUpdate>} dailyTaskUpdates
             */
            updateDailyTasks: function (dailyTaskUpdates) {
                for (var i = 0; i < dailyTaskUpdates.length; ++i) {
                    var dailyTaskUpdate = dailyTaskUpdates[i];
                    this._updateDailyTask(dailyTaskUpdate);
                }
            },

            /**
             * @param {DailyTaskUpdate} dailyTaskUpdate
             */
            _updateDailyTask: function (dailyTaskUpdate) {
                for (var i = 0; i < dailyTaskList.length; ++i) {
                    var dailyTask = dailyTaskList[i];
                    if (dailyTask.taskType == dailyTaskUpdate.taskType) {
                        dailyTask.updateTask(dailyTaskUpdate);
                    }
                }
            },

            /**
             * @param {String} dailyTaskType
             */
            isDailyTaskCompleted: function (dailyTaskType) {
                for (var i = 0; i < dailyTaskList.length; ++i) {
                    var dailyTask = dailyTaskList[i];
                    if (dailyTask.taskType == dailyTaskType) {
                        if (dailyTask.isCompleted()) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                return false;
            },

            /**
             * send claim daily task reward cmd
             */
            claimDailyTaskReward: function () {
                var proto = new C2SClaimDailyTaskReward();
                proto.send();
            },

            /**
             * @param {S2CClaimDailyTaskReward} s2cClaimDailyTaskReward
             */
            onClaimDailyTaskReward: function (s2cClaimDailyTaskReward) {
                PopupMan.closeIndicator();
                if (s2cClaimDailyTaskReward.errorCode == ErrorCode.SUCCESS) {
                    var dailyTaskReward = s2cClaimDailyTaskReward.dailyTaskReward;
                    PlayerMan.getInstance().addChips(dailyTaskReward.rewardChips, true);
                    PlayerMan.getInstance().addGems(dailyTaskReward.rewardGems, true);
                    PlayerMan.getInstance().addStars(dailyTaskReward.rewardStars, true);

                    this.setRewardClaimed(true);

                    EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_DAILY_TASK_REWARD_CLAIMED);

                    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
                    var LogMan = require("../../log/model/LogMan");
                    LogMan.getInstance().userProductRecord(ProductChangeReason.COMPLETE_DAILY_TASK, dailyTaskReward.rewardGems, dailyTaskReward.rewardChips, 0, dailyTaskReward.rewardStars, 0);
                }
            },

            /**
             * get friends task
             * @param {Array} friendsFBIds
             */
            getFriendsTask: function (friendsFBIds) {
                var proto = new C2SGetFriendTask();
                proto.fbIds = friendsFBIds;
                proto.send();
            },

            /**
             * get friends task info
             * @param {S2CGetFriendTask} s2cGetFriendTask
             */
            onGetFriendsTask: function (s2cGetFriendTask) {
                friendsTaskList = s2cGetFriendTask.playerTaskList;
                EventDispatcher.getInstance().dispatchEvent(TaskEvent.TASK_UPDATE_FRIENDS_TASK);
            },

            getFriendsTaskList: function () {
                return friendsTaskList;
            },

            getOpenSubjectIds: function () {
                return openSubjects;
            },

            getOpenSubjectCount: function () {
                if (openSubjects) {
                    return openSubjects.length;
                }
                return 0;
            },

            getAllSubjectCount: function () {
                var SlotConfigMan = require("../../slot/config/SlotConfigMan");
                var subjectList =  SlotConfigMan.getInstance().getSubjectList();
                if (subjectList) {
                    return subjectList.length;
                }
                return 0;
            },

            addOpenSubjectId: function (subjectId) {
                if (openSubjects) {
                    openSubjects.push(subjectId);
                } else {
                    openSubjects = [subjectId];
                }
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

module.exports = TaskMan;
