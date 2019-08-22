/**
 * Created by qinning on 15/4/23.
 */
var GameDirector = require("../model/GameDirector");
var AudioPlayer = require("../audio/AudioPlayer");
var PopupMan = require("../model/PopupMan");
var SceneType = require("../enum/SceneType");

var SERVER_MASK = 0x1;
var RESOURCES_MASK = 0x2;
var HOULY_BONUS_MASK = 0x4;
var SUBJECT_MASK = 0x8;
var TASK_MASK = 0x10;
var DAILY_TASK_MASK = 0x20;

var SceneMan = cc.Class.extend({


    progressMask: 0,

    lastSceneType: null,
    destSceneType: null,

    loadingScene: null,
    loadingSceneMap: null,
    readyAction: null,
    actionMaskMap: null,
    isInLobbyScene: false,

    ctor: function () {
        this.progressMask = 0;
        this.lastSceneType = SceneType.INVALID_SCENE;
        this.destSceneType = SceneType.INVALID_SCENE;
        this.initLoadingSceneMap();
        this.initDestSceneReadyMap();
        this.initActionMaskMap();
    },

    initLoadingSceneMap: function () {
        this.loadingSceneMap = {};

        this.loadingSceneMap[this.fromToPair(SceneType.LOGIN, SceneType.SLOT_LOBBY)] = require("../controller/LoginLoadingController").createFromCCB;
        this.loadingSceneMap[this.fromToPair(SceneType.SLOT_LOBBY, SceneType.SLOT_ROOM)] = require("../controller/SlotRoomLoadingController").createFromCCB;
        this.loadingSceneMap[this.fromToPair(SceneType.SLOT_ROOM, SceneType.SLOT_LOBBY)] = require("../../slot/controller/SlotLobbyLoadingController").createFromCCB;
        this.loadingSceneMap[this.fromToPair(SceneType.LOADING_RESOURCE, SceneType.SLOT_LOBBY)] = require("../controller/ResourceLoadingController").createFromCCB;
    },

    initDestSceneReadyMap: function () {
        this.readyAction = {};
        this.readyAction[this.fromToPair(SceneType.LOGIN, SceneType.SLOT_LOBBY)] = require("../controller/LoginLoadingController").ready;
        this.readyAction[this.fromToPair(SceneType.SLOT_LOBBY, SceneType.SLOT_ROOM)] = require("../controller/SlotRoomLoadingController").ready;
        this.readyAction[this.fromToPair(SceneType.SLOT_ROOM, SceneType.SLOT_LOBBY)] = require("../../slot/controller/SlotLobbyLoadingController").ready;
        this.readyAction[this.fromToPair(SceneType.LOADING_RESOURCE, SceneType.SLOT_LOBBY)] = require("../controller/ResourceLoadingController").ready;
    },

    fromToPair: function(fromSceneType, toSceneType) {
        return ((fromSceneType << 8) | toSceneType);
    },

    initActionMaskMap: function () {
        this.actionMaskMap = {};
        this.actionMaskMap[this.fromToPair(SceneType.LOGIN, SceneType.SLOT_LOBBY)] = HOULY_BONUS_MASK | SUBJECT_MASK | SERVER_MASK | TASK_MASK | DAILY_TASK_MASK | RESOURCES_MASK;
        this.actionMaskMap[this.fromToPair(SceneType.SLOT_LOBBY, SceneType.SLOT_ROOM)] = SERVER_MASK | RESOURCES_MASK;
        this.actionMaskMap[this.fromToPair(SceneType.SLOT_ROOM, SceneType.SLOT_LOBBY)] = 0;
        this.actionMaskMap[this.fromToPair(SceneType.LOADING_RESOURCE, SceneType.SLOT_LOBBY)] = HOULY_BONUS_MASK | SUBJECT_MASK | SERVER_MASK | RESOURCES_MASK | TASK_MASK | DAILY_TASK_MASK;
    },

    _resetProgressMask: function (sceneType) {
        this.progressMask = this.actionMaskMap[sceneType];
    },

    _getActionCount: function (actionMask) {
        var countx = 0;
        while (actionMask) {
            countx++;
            actionMask = actionMask & (actionMask - 1);
        }
        return countx;
    },

    getAllActionMaskCount: function (curSceneType, destSceneType) {
        var actionMaskMap = this.actionMaskMap[this.fromToPair(curSceneType, destSceneType)];
        return this._getActionCount(actionMaskMap);
    },

    getCurActionMaskCount: function () {
        return this._getActionCount(this.progressMask);
    },

    onServerReady: function () {
        this.progressMask &= ~(SERVER_MASK);
        this.checkProgress();
    },

    onResourcesReady: function () {
        this.progressMask &= ~(RESOURCES_MASK);
        this.checkProgress();
    },

    onHourlyBonusReady: function () {
        this.progressMask &= ~(HOULY_BONUS_MASK);
        this.checkProgress();
    },

    onGetSubjectReady: function () {
        this.progressMask &= ~(SUBJECT_MASK);
        this.checkProgress();
    },

    onGetTaskReady: function () {
        this.progressMask &= ~(TASK_MASK);
        this.checkProgress();
    },

    onGetDailyTaskReady: function () {
        this.progressMask &= ~(DAILY_TASK_MASK);
        this.checkProgress();
    },

    checkProgress : function() {
        cc.log("progressMask:"+this.progressMask);
        if (this.progressMask == 0) {
            this.afterSwitchScene();
        }
        var EventDispatcher = require("../events/EventDispatcher");
        var CommonEvent = require("../events/CommonEvent");
        EventDispatcher.getInstance().dispatchEvent(CommonEvent.MASK_PROGRESS_UPDATE);
    },

    onServerError: function () {
        //back to the last scene
        this.switchScene(this.lastSceneType);
        this.onResourcesReady();
        this.onServerReady();
    },

    onResourceError: function () {
        this.onServerError();
    },

    backSwitchScene: function () {
        this.switchScene(this.lastSceneType);
    },

    afterSwitchScene: function () {
        var readyAction = this.readyAction[this.fromToPair(this.lastSceneType, this.destSceneType)];
        if(readyAction) {
            readyAction();
        }
    },

    setCurSceneType: function (curSceneType) {
        this.destSceneType = curSceneType;
    },

    switchScene: function (sceneType, isClose) {
        if(cc.isUndefined(isClose)) {
            isClose = false;
        }
        this.lastSceneType = this.destSceneType;
        this.destSceneType = sceneType;
        var fromToType = this.fromToPair(this.lastSceneType, this.destSceneType);
        this._resetProgressMask(fromToType);
        var loadingCreateFunc = this.loadingSceneMap[fromToType];
        if (loadingCreateFunc) {
            var loadingNode = loadingCreateFunc();
            GameDirector.getInstance().runWithScene(loadingNode, isClose);
            AudioPlayer.getInstance().stopAllEffects();
            AudioPlayer.getInstance().stopMusic();
        }
    },

    getCurSceneType: function () {
        return this.destSceneType;
    }
});

SceneMan._instance = null;
SceneMan._firstUseInstance = true;

/**
 *
 * @returns {SceneMan}
 */
SceneMan.getInstance = function () {
    if (SceneMan._firstUseInstance) {
        SceneMan._firstUseInstance = false;
        SceneMan._instance = new SceneMan();
    }
    return SceneMan._instance;
};

module.exports = SceneMan;