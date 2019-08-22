/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var PlayerMan = require("../model/PlayerMan");
var EventDispatcher = require("../events/EventDispatcher");
var SlotEvent = require("../../slot/events/SlotEvent");
var CommonEvent = require("../events/CommonEvent");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var NumberAnimation = require("../animation/NumberAnimation");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var ProductType = require("../enum/ProductType");
var SocialMan = require("../../social/model/SocialMan");
var GameDirector = require("../model/GameDirector");
var StorageController = require("../storage/StorageController");
var PopupMan = require("../model/PopupMan");
var LogicMan = require("../model/LogicMan");
var PomeloClient = require("../net/PomeloClient");
var Config = require("../util/Config");
var AudioHelper = require("../util/AudioHelper");
var SelectServerListController = require("./SelectServerListController");
var ThemeName = require("../enum/ThemeName");
var ServerURLType = require("../enum/ServerURLType");
var FaceBookMan = require("../../social/model/FaceBookMan");
var DeviceInfo = require("../../common/util/DeviceInfo");

var LoginUIController = function() {
    this._bgIcon = null;
    this._descNode = null;
    this._rewardLabel = null;
    this._facebookItem = null;
    this._guestItem = null;
};

Util.inherits(LoginUIController, BaseCCBController);

LoginUIController.prototype.onEnter = function () {
    cc.eventManager.addListener({
        event: cc.EventListener.KEYBOARD,
        onKeyReleased: function (keyCode, event) {
            if(keyCode == cc.KEY.back){
                PopupMan.popupLeaveGameDlg();
            }
        }
    },this.rootNode);
};

LoginUIController.prototype.onExit = function () {

};

LoginUIController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._facebookItem.enabled = false;
    this._guestItem.enabled = false;
    if (!cc.sys.isNative) {
        if (this._descNode) {
            this._descNode.visible = false;
        }
    } else {
        if (this._rewardLabel) {
            this._rewardLabel.setString(Util.getCommaNum(Config.bindFacebookReward));
        }
    }

    if (Config.isRelease()) {
        this.initUI();
    } else {
        this._facebookItem.enabled = true;
        this._guestItem.enabled = true;
        var node = SelectServerListController.createFromCCB();
        node.controller.initWith(Config.getServerList());
        node.controller.popup();
    }

    var LogMan = require("../../log/model/LogMan");
    var UserStepId = require("../../log/enum/UserStepId");
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_NATIVE_LOGIN_UI_POPUP, -1);
};

LoginUIController.prototype.initUI = function() {
    var facebookId = SocialMan.getInstance().getCacheFbId();
    var isGuestLogin = StorageController.getInstance().getItem("isGuestLogin", "false");
    if (facebookId && facebookId.length > 0 && isGuestLogin != "true") {
        StorageController.getInstance().setItem("isGuestLogin", "false");
        this.showLoadingScene();
        this.connectToServer(function() {
            PlayerMan.getInstance().loginWithFBId(facebookId);
        });
    } else {
        this._facebookItem.enabled = true;
        this._guestItem.enabled = true;
    }
};

/**
 * @param {Object} response
 */
LoginUIController.prototype.bindFacebook = function(response) {
    this.bindFacebookInner(response);
};

LoginUIController.prototype.fbLoginClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    StorageController.getInstance().setItem("isGuestLogin", "false");
    var self = this;
    PopupMan.popupIndicator();
    SocialMan.getInstance().fbLogin(function (type, response) {
        if (type == 0) {
            FaceBookMan.getInstance().getMyFriendsList(function (error, friendsList) {
                if (!error) {
                    response["friendCount"] = friendsList.length;
                } else {
                    response["friendCount"] = 0;
                }
                self.bindFacebookInner(response);
                PopupMan.closeIndicator();
            });
        } else {
            PopupMan.closeIndicator();
            PopupMan.popupCommonDialog("WARNING", ["Connect to Facebook failed"], "Ok", null, null, false);
        }
    });
};

LoginUIController.prototype.bindFacebookInner = function (response) {
    var self = this;
    var udid = StorageController.getInstance().getItem("udid", "");
    if (udid && udid.length > 0) {
        PopupMan.popupCommonYesNoDialog("FACEBOOK BINDING", ["Do you want to keep your", "progress of guest account", "or facebook account?"], "Keep Guest", "Keep Facebook", function () {
            self.connectToServer(function() {
                PlayerMan.getInstance().bindFacebook(response);
            });
            self.showLoadingScene();
        }, function () {
            self.connectToServer(function() {
                PlayerMan.getInstance().loginWithFacebook(response);
            });
            self.showLoadingScene();
        });
    } else {
        self.connectToServer(function() {
            PlayerMan.getInstance().loginWithFacebook(response);
        });
        self.showLoadingScene();
    }
};

LoginUIController.prototype.connectToServer = function (connectedFunc) {
    if(Config.isRelease()) {
        this._connectToServer(connectedFunc);
    } else {
        PomeloClient.getInstance().init(StorageController.getInstance().getItem("host", Config.getServerURL(ServerURLType.LOGIN_SERVER_URL)),
            StorageController.getInstance().getItem("port", Config.getServerPort()), function () {
                connectedFunc();
            });
    }
};

LoginUIController.prototype._connectToServer = function (connectedFunc) {
    StorageController.getInstance().setItem("host", Config.getServerURL(ServerURLType.LOGIN_SERVER_URL));
    StorageController.getInstance().setItem("port", Config.getServerPort());
    PomeloClient.getInstance().init(Config.getServerURL(ServerURLType.LOGIN_SERVER_URL), Config.getServerPort(), function () {
        connectedFunc();
    });
};

LoginUIController.prototype.showLoadingScene = function() {
    var SceneType = require("../enum/SceneType");
    var SceneMan = require("../model/SceneMan");
    SceneMan.getInstance().setCurSceneType(SceneType.LOGIN);
    SceneMan.getInstance().switchScene(SceneType.SLOT_LOBBY);
};

LoginUIController.prototype.guestLoginClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    StorageController.getInstance().setItem("isGuestLogin", "true");
    this.showLoadingScene();
    this.connectToServer(function() {
        PlayerMan.getInstance().loginWithGuest();
    });
};

LoginUIController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/login/login.ccbi", null, "LoginUIController", new LoginUIController());
};

module.exports = LoginUIController;