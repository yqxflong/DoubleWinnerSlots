/**
 * Created by qinning on 15/4/29.
 */

var GameDirector = cc.Scene.extend({
    BACKGROUND_SCENE_ZORDER: 0,
    RUNNING_SCENE_ZORDER: 10,
    POPUP_SCENE_ZORDER: 30,

    runningScene: null,
    popupScene: null,
    lastScene: null,

    _nextScene: null,
    ctor: function () {
        this._super();

        this.popupScene = new cc.Layer();
        this.popupScene.x = cc.winSize.width * 0.5;
        this.popupScene.y = cc.winSize.height * 0.5;
        this.addChild(this.popupScene, this.POPUP_SCENE_ZORDER);
    },

    getScene: function () {
        return this;
    },

    onEnter: function () {
        this._super();
        cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
    },

    onExit: function () {
        cc.director.getScheduler().unscheduleUpdateForTarget(this);
        this._super();
    },

    update: function (dt) {
        if (this._nextScene) {
            if (this.runningScene) {
                this.runningScene.removeFromParent(true);
                this.runningScene = null;
            }
            this.runningScene = this._nextScene;
            this.addChild(this.runningScene, this.RUNNING_SCENE_ZORDER);
            this._nextScene.release();
            this._nextScene = null;
        }
    },

    /**
     * @param {cc.Node} scene
     * @param {boolean} isCloseDlg
     */
    runWithScene: function (scene, isCloseDlg) {
        if (isCloseDlg !== true) {
            isCloseDlg = false;
        }

        this._nextScene = scene;
        this._nextScene.retain();

        if (isCloseDlg) {
            var DialogManager = require("../popup/DialogManager");
            DialogManager.getInstance().closeAll();
        }
    },

    setRunningScene: function (runningScene) {
        this.runningScene = runningScene;
        this.addChild(this.runningScene, this.RUNNING_SCENE_ZORDER);
    }
});

GameDirector._instance = null;
GameDirector._firstUseInstance = true;

/**
 *
 * @returns {PlayerMan}
 */
GameDirector.getInstance = function () {
    if (GameDirector._firstUseInstance) {
        GameDirector._firstUseInstance = false;
        GameDirector._instance = new GameDirector();
    }
    return GameDirector._instance;
};

module.exports = GameDirector;
