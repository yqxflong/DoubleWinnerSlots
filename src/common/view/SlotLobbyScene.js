/**
 * Created by alanmars on 15/4/14.
 * @class
 * @extends cc.Scene
 */
var Util = require("../util/Util");
var SceneMan = require("../model/SceneMan");
var CommonUITitleController = require("../controller/CommonUITitleController");
var LobbyBottomController = require("../controller/LobbyBottomController");
var AdControlMan = require("../../ads/model/AdControlMan");
var AudioPlayer = require("../audio/AudioPlayer");
var PopupMan = require("../model/PopupMan");
var LogicMan = require("../model/LogicMan");
var ScrollMapLayer = require("./ScrollMapLayer");
var TaskConfigMan = require("../../task/config/TaskConfigMan");
var DailyChallengeProgressController = require("../../task/controller/DailyChallengeProgressController");
var TaskProgressType = require("../../task/enum/TaskProgressType");
var FreeModeEnterController = require("../../common/controller/FreeModeEnterController");
var DeviceInfo = require("../util/DeviceInfo");
var StorageController = require("../../common/storage/StorageController");
var StoreMan = require("../../store/model/StoreMan");

var SlotLobbyScene = cc.Layer.extend({
    _titleNode: null,
    _bottomNode: null,
    _dailyChallengeNode: null,
    _bgSprite: null,
    _serverSubjects: null,
    _tableView: null,

    _leftArrowItem: null,
    _rightArrowItem: null,

    _isRunningAnim: false,
    /**
     * @type {cc.Node}
     */
    _slotLobbyNode: null,
    ctor: function () {
        this._super();
        this.initLobbyBg();
    },

    onEnter: function () {
        this._super();

        AdControlMan.getInstance().lobbySceneShowAd();
        AdControlMan.getInstance().showCrossPromotionAds();

        SceneMan.getInstance().isInLobbyScene = true;

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function (keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    PopupMan.popupLeaveGameDlg();
                }
            }
        }, this);

        if(!cc.sys.isNative) {
            PopupMan.closeIndicator();
        }

        LogicMan.getInstance().sendRewardMessageCmd();
        LogicMan.getInstance().sendTestTrackEvent();

        StoreMan.getInstance().trigerDailyDiscountWhenCoolingEnd();

        var LogMan = require("../../log/model/LogMan");
        var UserStepId = require("../../log/enum/UserStepId");
        var ClientAppVersion = require("../../common/enum/ClientAppVersion");
        if(cc.sys.os == cc.sys.OS_ANDROID && ClientAppVersion.supportNewSupersonicAndLockScreen()) {
            var isShownLockScreenAd = jsb_wtc.adsHelper.isLockScreenEnabled();
            LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_ENTER_GAME_LOBBY, isShownLockScreenAd);
        }
        else {
            LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_ENTER_GAME_LOBBY);
        }

    },

    onExit: function () {
        SceneMan.getInstance().isInLobbyScene = false;
        this._super();
    },

    initLobbyBg: function () {
        this._slotLobbyNode = new ScrollMapLayer();
        this.addChild(this._slotLobbyNode);
        this._slotLobbyNode.setPosition(cc.p(0, 0));
        this._slotLobbyNode.initWithTaskLevelConfigList(TaskConfigMan.getInstance().getLevelConfigList());

        if(DeviceInfo.isHighResolution()) {
            this._titleNode = CommonUITitleController.createFromCCB("casino/spinui_title_ipad.ccbi");
        }
        else {
            this._titleNode = CommonUITitleController.createFromCCB("casino/spinui_title_iphone.ccbi");
        }
        this._titleNode.controller.showSlotItem();
        this._titleNode.controller.showFeedback();
        this._titleNode.controller.showStoreDiscountCountDown();
        this._titleNode.controller.createFBLikeNode();
        this._titleNode.controller.showRewardVideoNode();

        this.addChild(this._titleNode);

        this._titleNode.x = cc.winSize.width / 2;
        this._titleNode.y = cc.winSize.height;

        this._dailyChallengeNode = DailyChallengeProgressController.createFromCCB();
        this.addChild(this._dailyChallengeNode);
        this._dailyChallengeNode.controller.initWith(TaskProgressType.TASK_PROGRESS_TYPE_BUTTON);
        var dailyChallengeSize = this._dailyChallengeNode.controller.getContentSize();
        this._dailyChallengeNode.setScale(0.6);
        this._dailyChallengeNode.x = cc.winSize.width - dailyChallengeSize.width * this._dailyChallengeNode.getScaleX() / 2;
        this._dailyChallengeNode.y = dailyChallengeSize.height * this._dailyChallengeNode.getScaleY() / 2;

        var freeModeEnterNode = FreeModeEnterController.createFromCCB();
        this.addChild(freeModeEnterNode);
        var freeModeEnterSize = freeModeEnterNode.controller.getContentSize();
        freeModeEnterNode.x = freeModeEnterSize.width * freeModeEnterNode.getScaleX() / 2;
        freeModeEnterNode.y = freeModeEnterSize.height * freeModeEnterNode.getScaleY() / 2;

        this._bottomNode = LobbyBottomController.createFromCCB();
        this.addChild(this._bottomNode);
        this._bottomNode.x = cc.winSize.width / 2;

        if(!DeviceInfo.isHighResolution()) {
            this._bottomNode.setScale(0.7);
        }

        var TaskMan = require("../../task/model/TaskMan");
        var curTaskLevel = TaskMan.getInstance().getCurTaskLevel();
        var isNewUser = StorageController.getInstance().getItem("isNewUser", "true");
        if(isNewUser == "true" && curTaskLevel == 1) {
            PopupMan.popupGuideDlg();
        }

        var StoreMan = require("../../store/model/StoreMan");
        StoreMan.getInstance().onSlotLobbyEntered();
    }
});

SlotLobbyScene.create = function () {
    return new SlotLobbyScene();
};

module.exports = SlotLobbyScene;