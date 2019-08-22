/**
 * Created by qinning on 15/12/2.
 */

var FlagStoneController = require("../../slot/controller/FlagStoneController");
var TaskLevelConfig = require("../../task/config/TaskLevelConfig");
var TaskMan = require("../../task/model/TaskMan");
var TaskConfigMan = require("../../task/config/TaskConfigMan");
var TaskEvent = require("../../task/events/TaskEvent");
var EventDispatcher = require("../events/EventDispatcher");
var FlagStoneNodeFactory = require("../../slot/controller/FlagStoneNodeFactory");
var MapPointController = require("../../slot/controller/MapPointController");
var BaseCCBController = require("../controller/BaseCCBController");
var FlagStoneType = require("../../slot/enum/FlagStoneType");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var DeviceInfo = require("../../common/util/DeviceInfo");

TowerController = function(index, callback, target) {
    BaseCCBController.call(this);
};

Util.inherits(TowerController, BaseCCBController);

TowerController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.useMaskLayer();
};

TowerController.prototype.useMaskLayer = function () {
    if(this.maskLayer != null && !cc.isUndefined(this.maskLayer) && this.clipLayer != null && !cc.isUndefined(this.clipLayer)) {
        var clipParentNode = this.clipLayer.getParent();
        this.clipLayer.retain();
        this.clipLayer.removeFromParent(false);

        this.maskLayer.removeFromParent(false);
        this.maskLayer.visible = true;

        var clippingNode = new cc.ClippingNode(this.maskLayer);
        clippingNode.alphaThreshold = 0.5;
        clippingNode.addChild(this.clipLayer);
        this.clipLayer.release();

        clipParentNode.addChild(clippingNode);
    }
};

TowerController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("map/magic_world_tower.ccbi", null, "TowerController", new TowerController());
    return node;
};

var ScrollMapLayer = cc.Layer.extend({
    MAX_MAP_COUNT: 4,

    NATIVE_OFFSET_X: 0,
    NATIVE_OFFSET_Y: 0,

    SINGLE_MAP_WIDTH: 1024,
    MAP_ZORDER: 0,
    MAP_ITEMS: 3,
    MAP_POINT_ZORDER: 5,
    FLAGSTONE_ZORDER: 10,
    FLAGSTONE_CUR_ZORDER: 11,
    PRE_DRAW_WIDTH_OFFSET: 300,
    MAP_PATH_ANIM_TIME: 3,
    LEVEL_UP_SCROLL_TIME: 2,
    COMMONG_SOON_LEVEL: -1,
    _leftArrowItem: null,
    _rightArrowItem: null,
    _scrollView: null,
    _mapLayer: null,
    _scrollSpriteNameList: null,
    _scrollSpriteBgList: null,
    _isRunningAnim: false,

    /**
     * @types {object<taskLevelId, FlagStoneNode>}
     */
    _taskFlagStoneMap: null,
    /**
     * @params {number}
     */
    _curMapIndex: -1,
    /**
     * @param {Array.<TaskLevelConfig>} taskLevelConfigList
     */
    _taskLevelConfigList: null,

    /**
     * @types {cc.Rect}
     */
    _preScrollViewOffset: null,
    /**
     * level => point node list.
     * @types {Object.<Number, Array>}
     */
    _pointNodeMap: null,

    _maxMapWidth: 0,
    _isDrawedAllFlagStone: false,
    _isDrawedAllMap: false,

    _hasDrawMapItem: false,

    ctor: function () {
        this._super();
        this._taskFlagStoneMap = {};
        this._scrollView = new cc.ScrollView(cc.size(0, 0));
        this._scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._scrollView.setBounceable(false);

        this._scrollView.setViewSize(cc.winSize);
        this._scrollView.setDelegate(this);

        this.addChild(this._scrollView);

        this._mapLayer = new cc.Layer();
        this._scrollView.setContainer(this._mapLayer);

        this._scrollSpriteNameList = [];
        for (var i = 1; i <= this.MAX_MAP_COUNT; ++i) {
            this._scrollSpriteNameList.push(Util.sprintf("map/lobby_map_%d.jpg", i));
        }

        this._scrollSpriteBgList = [];

        this._pointNodeMap = {};

        var commingSoonLevelConfig = TaskConfigMan.getInstance().getCommingSoonLevelConfig();
        this._maxMapWidth = commingSoonLevelConfig.flagStonePos[0] + 300;

        this._scrollView.setContentSize(cc.size(this._maxMapWidth, cc.winSize.height));
        this.setContentSize(cc.size(this._maxMapWidth, cc.winSize.height));

        this.addScrollViewIndicator();

        this._hasDrawMapItem = false;

        if(!DeviceInfo.isHighResolution()) {
            this.NATIVE_OFFSET_Y = -66;
        }
    },

    onEnter: function () {
        this._super();
        EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_UPDATE_FRIENDS_TASK, this.updateFriendsTask, this);

        this.checkAndShowTaskLevelUpAnim();
    },

    onExit: function () {
        var PlayerMan = require("../model/PlayerMan");
        PlayerMan.getInstance().mapPosition = this._scrollView.getContentOffset();
        EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_UPDATE_FRIENDS_TASK, this.updateFriendsTask, this);
        this._super();
    },

    /**
     * init with TaskLevelConfigList
     * @param {Array.<TaskLevelConfig>} taskLevelConfigList
     */
    initWithTaskLevelConfigList: function (taskLevelConfigList) {
        this._taskLevelConfigList = taskLevelConfigList;
        var curTaskLevel = TaskMan.getInstance().getCurTaskLevel();

        var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(curTaskLevel);
        if (!taskLevelConfig) {
            taskLevelConfig = TaskConfigMan.getInstance().getCommingSoonLevelConfig();
        }
        var PlayerMan = require("../model/PlayerMan");
        if(PlayerMan.getInstance().mapPosition != null) {
            this._scrollView.setContentOffset(PlayerMan.getInstance().mapPosition);
        }
        else {
            var scrollViewContentOffset = this.getContentOffsetByCenterPos(this.getTaskFlagStonePosition(taskLevelConfig));
            this._scrollView.setContentOffset(scrollViewContentOffset, false);
        }

    },

    /**
     * should need draw position flagstone.
     * @param {cc.Point} pos
     * @returns {boolean}
     */
    shouldDrawForPosition: function (pos) {
        var scrollViewContentOffset = this._scrollView.getContentOffset();
        var fromX = -scrollViewContentOffset.x;
        var toX = fromX + this._scrollView.getViewSize().width;
        if (pos.x >= fromX - this.PRE_DRAW_WIDTH_OFFSET && pos.x <= toX + this.PRE_DRAW_WIDTH_OFFSET) {
            return true;
        }
        return false;
    },

    updateFlagStoneView: function () {
        this._isDrawedAllFlagStone = true;
        var i;
        var j;
        //var pointNodeList;
        var flagStoneNode;
        var curTaskLevel = TaskMan.getInstance().getCurTaskLevel();

        for (i = 0; i < this._taskLevelConfigList.length; ++i) {
            var taskLevelConfig = this._taskLevelConfigList[i];
            if (!taskLevelConfig) continue;
            var flagStonePosition = this.getTaskFlagStonePosition(taskLevelConfig);
            flagStoneNode = this._taskFlagStoneMap[taskLevelConfig.level];
            if (!flagStoneNode) {
                if (this.shouldDrawForPosition(flagStonePosition)) {
                    if(taskLevelConfig.flagStoneType == FlagStoneType.FLAG_STONE_TYPE_COMMING_SOON) continue;
                    flagStoneNode = FlagStoneNodeFactory.create(taskLevelConfig.flagStoneType);
                    flagStoneNode.controller.initWithTaskLevelConfig(taskLevelConfig);
                    flagStoneNode.setPosition(flagStonePosition);
                    this._mapLayer.addChild(flagStoneNode, this.FLAGSTONE_ZORDER);
                    this._taskFlagStoneMap[taskLevelConfig.level] = flagStoneNode;

                    if (taskLevelConfig.level == curTaskLevel) {
                        flagStoneNode.setLocalZOrder(this.FLAGSTONE_CUR_ZORDER);
                    }

                    if(taskLevelConfig.level >= 51 && taskLevelConfig.level < 1000) {
                        flagStoneNode.visible = false;
                    }

                    for(var j = 0; j < taskLevelConfig.childrenLevel.length; j++) {
                        var nextTaskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskLevelConfig.childrenLevel[j]);
                        var pathKey = Util.sprintf("%d_%d", taskLevelConfig.level, nextTaskLevelConfig.level);

                        //if (!this._pointNodeMap[pathKey]) {
                        //    var pointList = TaskConfigMan.getInstance().getMapPointList(pathKey);
                        //    if (pointList) {
                        //        pointNodeList = [];
                        //        var levelCompleted = nextTaskLevelConfig.levelStar > 0;
                        //        for (var k = 0; k < pointList.length; k++) {
                        //            var mapPointNode = MapPointController.createFromCCB();
                        //            //this._mapLayer.addChild(mapPointNode, this.MAP_POINT_ZORDER);
                        //            mapPointNode.setPosition(pointList[k].pos);
                        //            mapPointNode.setRotation(pointList[k].rotation);
                        //            mapPointNode.controller.setCompleted(levelCompleted);
                        //            pointNodeList.push(mapPointNode);
                        //        }
                        //        this._pointNodeMap[pathKey] = pointNodeList;
                        //    }
                        //}
                    }
                }
                else {
                    this._isDrawedAllFlagStone = false;
                }
            }
            else {
                if (taskLevelConfig.level != this.COMMONG_SOON_LEVEL) {
                    //flagStoneNode.controller.updateTaskConfig(taskLevelConfig);
                    if (taskLevelConfig.level == curTaskLevel) {
                        flagStoneNode.setLocalZOrder(this.FLAGSTONE_CUR_ZORDER);
                    }
                }
            }
        }

        this.updateFriendsTask();
    },

    calMapItemPos: function (pos) {
        return cc.p(pos.x, cc.winSize.height - pos.y + (768 - cc.winSize.height) + this.NATIVE_OFFSET_Y);
    },

    updateMapItems: function () {
        if(!this._hasDrawMapItem) {
            this._hasDrawMapItem = true;

            var treeNode = Util.loadNodeFromCCB("map/magic_world_tree.ccbi", null);
            treeNode.setPosition(this.calMapItemPos(cc.p(1093, 205)));
            var leafParticle = treeNode.getChildByTag(1).getChildByTag(10);
            if(leafParticle) leafParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            leafParticle = treeNode.getChildByTag(1).getChildByTag(11);
            if(leafParticle) leafParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(treeNode, this.MAP_ITEMS);

            var villageNode = Util.loadNodeFromCCB("map/magic_world_village.ccbi", null);
            villageNode.setPosition(this.calMapItemPos(cc.p(469, 374)));
            var smokeParticle = villageNode.getChildByTag(1).getChildByTag(10);
            if(smokeParticle) smokeParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(villageNode, this.MAP_ITEMS);

            var snowNode = Util.loadNodeFromCCB("map/magic_world_snow.ccbi", null);
            snowNode.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height));
            var snowParticle = snowNode.getChildByTag(10);
            if(snowParticle) snowParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            snowParticle = snowNode.getChildByTag(11);
            if(snowParticle) snowParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            snowParticle = snowNode.getChildByTag(12);
            if(snowParticle) snowParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(snowNode, this.MAP_ITEMS);

            var castleNode = Util.loadNodeFromCCB("map/magic_world_castle.ccbi", null);
            castleNode.setPosition(this.calMapItemPos(cc.p(1960, 446)));
            this._mapLayer.addChild(castleNode, this.MAP_ITEMS);

            var stoneNode = Util.loadNodeFromCCB("map/magic_world_stone.ccbi", null);
            stoneNode.setPosition(this.calMapItemPos(cc.p(1815, 196)));
            var starParticle = stoneNode.getChildByTag(1).getChildByTag(10);
            if(starParticle) starParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(stoneNode, this.MAP_ITEMS);

            var sunNode = Util.loadNodeFromCCB("map/magic_world_sun.ccbi", null);
            sunNode.setPosition(this.calMapItemPos(cc.p(1960, 446)));
            var lightParticle = sunNode.getChildByTag(1).getChildByTag(10);
            if(lightParticle) lightParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(sunNode, this.MAP_ITEMS);

            var towerNode = TowerController.createFromCCB();
            towerNode.setPosition(this.calMapItemPos(cc.p(1358, 482)));
            this._mapLayer.addChild(towerNode, this.MAP_ITEMS);

            var volcanoNode = Util.loadNodeFromCCB("map/magic_world_volcano.ccbi", null);
            volcanoNode.setPosition(this.calMapItemPos(cc.p(2475, 362)));
            var pointParticle = volcanoNode.getChildByTag(1).getChildByTag(10);
            if(pointParticle) pointParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(volcanoNode, this.MAP_ITEMS);

            var boneNode = Util.loadNodeFromCCB("map/magic_world_bone.ccbi", null);
            boneNode.setPosition(this.calMapItemPos(cc.p(260, 580)));
            var boneStarParticle = boneNode.getChildByTag(1).getChildByTag(10);
            if(boneStarParticle) boneStarParticle.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            this._mapLayer.addChild(boneNode, this.MAP_ITEMS);
        }
    },

    updateFriendsTask: function (event) {
        //var friendsTaskList = TaskMan.getInstance().getFriendsTaskList();
        //if (!friendsTaskList) return;
        //for (var i = 0; i < friendsTaskList.length; ++i) {
        //    var friendTaskInfo = friendsTaskList[i];
        //    var taskFlagStoneNode = this._taskFlagStoneMap[friendTaskInfo.taskLevel];
        //    if (taskFlagStoneNode) {
        //        taskFlagStoneNode.controller.updateFriendTaskInfo(friendTaskInfo);
        //    }
        //}
    },

    checkAndShowTaskLevelUpAnim: function () {
        var haveNewTaskCompleted = TaskMan.getInstance().haveNewTaskCompleted();
        if (haveNewTaskCompleted) {
            this._scrollView.setTouchEnabled(false);
            this.setFlagStoneEnabled(false);
            //this.showMapPointPathCompletedAnim();

            if(TaskMan.getInstance().getHasUnlockNewTaskLevel()) {
                this.runAction(cc.sequence(cc.callFunc(this.showOldTaskCompletedAnim, this),
                    cc.delayTime(1.0), cc.callFunc(this.moveScrollMap, this),
                    cc.delayTime(this.LEVEL_UP_SCROLL_TIME), cc.callFunc(this.showNewTaskBeginAnim, this)));
            }
            else {
                this.runAction(cc.sequence(cc.callFunc(this.showOldTaskCompletedAnim, this),
                    cc.delayTime(1.0), cc.callFunc(this.finishShowNewTask, this)));
            }
        }
        else {
            this.onCheckTaskLevelUpFinished();
            AudioPlayer.getInstance().playMusicByKey("game-bg", true);
        }
    },

    setFlagStoneEnabled: function (enabled) {
        var levelKeys = Object.keys(this._taskFlagStoneMap);
        for(var i = 0; i < levelKeys.length; i++) {
            var flagstoneNode = this._taskFlagStoneMap[levelKeys[i]];
            flagstoneNode.controller.setFlagstoneEnabled(enabled);
        }
    },

    //showMapPointPathCompletedAnim: function () {
    //    var newTaskLevelUp = TaskMan.getInstance().getNewTaskLevelUp();
    //    var taskLevelUpConfig = TaskConfigMan.getInstance().getLevelConfig(newTaskLevelUp.oldTaskLevel);
    //    for(var i = 0; i < taskLevelUpConfig.childrenLevel.length; i++) {
    //        var nextTaskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskLevelUpConfig.childrenLevel[i]);
    //        if(nextTaskLevelConfig.levelStar > 0) continue;
    //        var pathKey = Util.sprintf("%d_%d", taskLevelUpConfig.level, nextTaskLevelConfig.level);
    //        var pointNodeList = this._pointNodeMap[pathKey];
    //        var pointNodeLength = pointNodeList.length;
    //        var delayTime = 0;
    //        for (var j = 0; j < pointNodeLength; j++) {
    //            delayTime = (j + 1) / pointNodeLength * this.MAP_PATH_ANIM_TIME;
    //            pointNodeList[j].runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(this.onMapPointCompleted, this)));
    //        }
    //    }
    //},

    onMapPointCompleted: function (target, data) {
        if (target) {
            target.controller.setCompleted(true);
            target.controller.showCompletedAnimation();
        }
    },

    onCheckTaskLevelUpFinished: function () {
        TaskMan.getInstance().setIsLobbyFlagStoneCanSpin(true);
    },

    showOldTaskCompletedAnim: function () {
        var levelUpConfig = TaskMan.getInstance().getNewTaskLevelUp();
        var oldTaskLevel = levelUpConfig.oldTaskLevel;
        var oldLevelConfig = TaskConfigMan.getInstance().getLevelConfig(oldTaskLevel);
        var oldTaskFlagStone = this._taskFlagStoneMap[oldTaskLevel];

        if (oldTaskFlagStone) {
            if(oldLevelConfig.isCompleted()) {
                oldTaskFlagStone.controller.showLevelCompletedAnim();
            }
            else {
                oldTaskFlagStone.controller.showLevelNewStarAnim();
            }
            oldTaskFlagStone.setLocalZOrder(this.FLAGSTONE_ZORDER);
        }
    },

    moveScrollMap: function (target, data) {
        var newTaskLevelUp = TaskMan.getInstance().getNewTaskLevelUp();
        var newTaskLevel = TaskMan.getInstance().getUnlockNewTaskLevelId();
        if(newTaskLevel < 0) newTaskLevel = newTaskLevelUp.newTaskLevel;
        var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(newTaskLevel);
        if (!taskLevelConfig) {
            taskLevelConfig = TaskConfigMan.getInstance().getCommingSoonLevelConfig();
        }
        var contentOffset = this.getContentOffsetByCenterPos(this.getTaskFlagStonePosition(taskLevelConfig));
        this._scrollView.getContainer().runAction(cc.sequence(cc.moveTo(this.LEVEL_UP_SCROLL_TIME, contentOffset)));
    },

    showNewTaskBeginAnim: function (target, data) {
        var newTaskLevelUp = TaskMan.getInstance().getNewTaskLevelUp();
        var taskLevelUpConfig = TaskConfigMan.getInstance().getLevelConfig(newTaskLevelUp.oldTaskLevel);

        var i = 0;
        for(i = 0; i < taskLevelUpConfig.childrenLevel.length; i++) {
            var nextTaskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(taskLevelUpConfig.childrenLevel[i]);

            var newTaskFlagStone = this._taskFlagStoneMap[nextTaskLevelConfig.level];
            if (newTaskFlagStone) {
                newTaskFlagStone.controller.showLevelBeginAnim();
                newTaskFlagStone.setLocalZOrder(this.FLAGSTONE_CUR_ZORDER);
            }
        }

        if (newTaskLevelUp.newSubjects && newTaskLevelUp.newSubjects.length > 0) {
            var HourlyGameMan = require("../../social/model/HourlyGameMan");
            var SlotConfigMan = require("../../slot/config/SlotConfigMan");
            for (i = 0; i < newTaskLevelUp.newSubjects.length; ++i) {
                var subject = SlotConfigMan.getInstance().getSubject(newTaskLevelUp.newSubjects[i]);
                if (subject.unlockCards && subject.unlockCards.length > 0) {
                    //HourlyGameMan.getInstance().unlockCards(subject.unlockCards);
                }
            }
        }
        this.finishShowNewTask();
    },

    finishShowNewTask: function (target, data) {
        TaskMan.getInstance().consumeNewTask();
        this.onCheckTaskLevelUpFinished();
        this._scrollView.setTouchEnabled(true);
        this.setFlagStoneEnabled(true);
        AudioPlayer.getInstance().playMusicByKey("game-bg", true);

        var curTaskLevel = TaskMan.getInstance().getCurTaskLevel();
        var curFlagStone = this._taskFlagStoneMap[curTaskLevel];
        if(curFlagStone) {
            curFlagStone.controller.setCurTaskAnim();
            curFlagStone.setLocalZOrder(this.FLAGSTONE_CUR_ZORDER);
        }
    },

    /**
     * get scrollview content offset by center position.
     * @param flagStonePos
     * @returns {cc.Point}
     */
    getContentOffsetByCenterPos: function (flagStonePos) {
        var contentOffsetX = Math.max(Math.min(this._scrollView.getViewSize().width/2 - flagStonePos.x, 0), -(this._maxMapWidth - this._scrollView.getViewSize().width));
        return cc.p(contentOffsetX, 0);
    },

    getMapIndex: function () {
        var scrollViewContentOffset = this._scrollView.getContentOffset();
        var scrollViewMaxContentOffset = this._scrollView.maxContainerOffset();
        cc.log("scrollViewContentOffset x:" + scrollViewContentOffset.x);
        return Math.floor((scrollViewMaxContentOffset.x - scrollViewContentOffset.x) / this.SINGLE_MAP_WIDTH + 0.5);
    },

    getMapPosition: function (mapIndex) {
        return cc.p(mapIndex * this.SINGLE_MAP_WIDTH, this.NATIVE_OFFSET_Y);
    },

    reDrawMapView: function () {
        this._isDrawedAllMap = true;
        var maxMapCount = 0;
        if (this._maxMapWidth % this.SINGLE_MAP_WIDTH == 0) {
            maxMapCount = Math.floor(this._maxMapWidth/this.SINGLE_MAP_WIDTH);
        } else {
            maxMapCount = Math.floor(this._maxMapWidth/this.SINGLE_MAP_WIDTH) + 1;
        }
        for (var i = 0; i < maxMapCount; ++i) {
            if (this._scrollSpriteBgList[i]) continue;
            if (!this._scrollSpriteBgList[i]) {
                this._scrollSpriteBgList[i] = new cc.Sprite(this._scrollSpriteNameList[i % this.MAX_MAP_COUNT]);
                this._mapLayer.addChild(this._scrollSpriteBgList[i], this.MAP_ZORDER);
                this._scrollSpriteBgList[i].setAnchorPoint(cc.p(0, 0));
                this._scrollSpriteBgList[i].setPosition(this.getMapPosition(i));
            }
            if (Math.abs(this._curMapIndex - i) <= 1) {

            } else {
                //this._isDrawedAllMap = false;
            }
        }
    },

    getTaskFlagStonePosition: function (taskLevelConfig) {
        return cc.p(taskLevelConfig.flagStonePos.x,  cc.winSize.height - taskLevelConfig.flagStonePos.y + (768 - cc.winSize.height) + this.NATIVE_OFFSET_Y);
    },

    convertToMapPosition: function (point) {
        return cc.pAdd(point, cc.p(0, cc.winSize.height / 2));
    },

    addScrollViewIndicator: function () {
        if (!cc.sys.isNative) {
            cc.spriteFrameCache.addSpriteFrames("casino/casino_common.plist", "casino/casino_common.png");
            this._leftArrowItem = new cc.MenuItemSprite(
                new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("casino_arrow_l.png")),
                new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("casino_arrow_l_select.png")),
                null, this.horizontalPrev, this);
            this._leftArrowItem.setAnchorPoint(cc.p(0.0, 0.5));
            this._leftArrowItem.x = 5;
            this._leftArrowItem.y = this.height * 0.5;
            this._leftArrowItem.visible = false;
            this._rightArrowItem = new cc.MenuItemSprite(
                new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("casino_arrow_l.png")),
                new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("casino_arrow_l_select.png")),
                null, this.horizontalNext, this);
            this._rightArrowItem.setScaleX(-1);
            this._rightArrowItem.setAnchorPoint(cc.p(0.0, 0.5));
            this._rightArrowItem.x = cc.winSize.width - this.x - 5;
            this._rightArrowItem.y = this.height * 0.5;
            this._rightArrowItem.visible = false;

            var arrowMenu = new cc.Menu(this._leftArrowItem, this._rightArrowItem);
            arrowMenu.x = arrowMenu.y = 0;
            this.addChild(arrowMenu, 10);

            this._onTableViewOffsetChanged();
        }
    },

    scrollViewDidScroll: function (view) {
        if (!this._isDrawedAllMap) {
            var newMapIndex = this.getMapIndex();
            if (newMapIndex != this._curMapIndex) {
                this._curMapIndex = newMapIndex;
                this.reDrawMapView();
            }
        }
        cc.log("_isDrawedAllMap:" + this._isDrawedAllMap);
        cc.log("_isDrawedAllFlagStone:" + this._isDrawedAllFlagStone);
        if (!this._isDrawedAllFlagStone) {
            var scrollViewOffset = this._scrollView.getContentOffset();
            if (this._preScrollViewOffset) {
                if (Math.abs(scrollViewOffset.x - this._preScrollViewOffset.x) >= this.PRE_DRAW_WIDTH_OFFSET / 2) {
                    this.updateFlagStoneView();
                    this.updateMapItems();
                }
            } else {
                this._preScrollViewOffset = scrollViewOffset;
                this.updateFlagStoneView();
                this.updateMapItems();
            }
        }

        if (this._leftArrowItem) {
            this._onTableViewOffsetChanged();
        }
    },

    scrollViewDidZoom: function (view) {
    },

    horizontalPrev: function (sender) {
        this._leftArrowItem.visible = false;
        this._rightArrowItem.visible = false;

        var offsetX = this._scrollView.getContentOffset().x;
        var maxOffsetX = this._scrollView.maxContainerOffset().x;
        var moveOffset = Math.min(maxOffsetX - offsetX, 768) + offsetX;
        this._scrollView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
        this._isRunningAnim = true;

        this.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
    },

    horizontalNext: function (sender) {
        this._leftArrowItem.visible = false;
        this._rightArrowItem.visible = false;

        var offsetX = this._scrollView.getContentOffset().x;
        var minOffsetX = this._scrollView.minContainerOffset().x;
        var moveOffset = Math.max(minOffsetX - offsetX, -768) + offsetX;
        this._scrollView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
        this._isRunningAnim = true;

        this.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
    },

    onTableViewOffsetChanged: function () {
        this._isRunningAnim = false;
        this._onTableViewOffsetChanged();
    },

    _onTableViewOffsetChanged: function () {
        if (this._isRunningAnim) {
            return;
        }
        var offsetX = Math.round(this._scrollView.getContentOffset().x);
        var minOffsetX = Math.round(this._scrollView.minContainerOffset().x);
        var maxOffsetX = Math.round(this._scrollView.maxContainerOffset().x);

        if (this._scrollView.getViewSize().width >= this._scrollView.getContentSize().width) {
            this._leftArrowItem.visible = false;
            this._rightArrowItem.visible = false;
        } else {
            if (offsetX <= minOffsetX) {
                this._leftArrowItem.visible = true;
                this._rightArrowItem.visible = false;
            } else if (offsetX >= maxOffsetX) {
                this._leftArrowItem.visible = false;
                this._rightArrowItem.visible = true;
            } else {
                this._leftArrowItem.visible = true;
                this._rightArrowItem.visible = true;
            }
        }
    }
});

module.exports = ScrollMapLayer;