var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../util/AudioHelper");
var AudioPlayer = require("../audio/AudioPlayer");
var ContactUsController = require("./ContactUsController");
var Config = require("../../common/util/Config");
var PageType = require("../../log/enum/PageType");
var ActionType = require("../../log/enum/ActionType");
var ClientAppVersion = require("../../common/enum/ClientAppVersion");

/**
 * Created by alanmars on 15/5/20.
 */
var SettingController = function () {
    BaseCCBController.call(this);
    this._soundItem = null;
    this._closeItem = null;
    this._userIdLabel = null;
    this._loginItem = null;
    this._versionLabel = null;
    this._lockScreenItem = null;
};

Util.inherits(SettingController, BaseCCBController);

SettingController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    var PlayerMan = require("../../common/model/PlayerMan");
    this._userIdLabel.setString(PlayerMan.getInstance().playerId);
    if(!Config.isRelease()) {
        this._versionLabel.setString(Config.debugVersion)
    }
    else {
        this._versionLabel.setString(Config.releaseVersion);
    }

    if (PlayerMan.getInstance().isGuest()) {
        this._loginItem.enabled = true;
    } else {
        this._loginItem.enabled = false;
    }
    this.setSoundItemImage();

    if (ClientAppVersion.supportNewSupersonicAndLockScreen()) {
        if (this._lockScreenItem) {
            this.setLockScreenStatus(jsb_wtc.adsHelper.isLockScreenEnabled());
        }
    }
};

SettingController.prototype._fbLogin = function () {
    var SocialMan = require("../../social/model/SocialMan");
    var PomeloClient = require("../../common/net/PomeloClient");
    var LoginUIController = require("../controller/LoginUIController");
    var GameDirector = require("../../common/model/GameDirector");
    SocialMan.getInstance().fbLogin(function (type, response) {
        if (type == 0) {
            PomeloClient.getInstance().disconnect();
            var node = LoginUIController.createFromCCB();
            GameDirector.getInstance().runWithScene(node);
            node.controller.bindFacebook(response);
        }
    });
};

SettingController.prototype.contactUsClicked = function (sender) {
    return;
    AudioHelper.playBtnClickSound();

    var Config = require("../util/Config");
    var ThemeName = require("../enum/ThemeName");
    if (Config.themeName === ThemeName.THEME_WTC) {
        var ContactUsController = require("./ContactUsController");
        var contactUsNode = ContactUsController.createFromCCB();
        contactUsNode.controller.popup();
    } else {
        var MailBoxController = require("../../social/controller/MailBoxController");
        var mailboxNode = MailBoxController.createFromCCB();
        mailboxNode.controller.popup();
    }
    this.close();
};

SettingController.prototype.soundClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var isAudioOn = AudioPlayer.getInstance().isAudioOn();
    if (isAudioOn) {
        AudioPlayer.getInstance().setAudioOn(!isAudioOn);
    } else {
        AudioPlayer.getInstance().setAudioOn(!isAudioOn);
    }
    this.setSoundItemImage();
};

SettingController.prototype.lockScreenClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (ClientAppVersion.supportNewSupersonicAndLockScreen()) {
        var PopupMan = require("../../common/model/PopupMan");
        if (jsb_wtc.adsHelper.isLockScreenEnabled()) {
            PopupMan.popupCommonDialog("SETTING", ["A convenient locker","display charging status, and", "sponsor's content. You can", "turn it off."], "Off",
                function () {
                    jsb_wtc.adsHelper.setLockScreenEnabled(false);
                    this.setLockScreenStatus(false);
                }.bind(this)
            );
        } else {
            PopupMan.popupCommonDialog("SETTING", ["A convenient locker","display charging status, and", "sponsor's content. You can", "turn it on."], "On",
                function () {
                    jsb_wtc.adsHelper.setLockScreenEnabled(true);
                    this.setLockScreenStatus(true);
                }.bind(this)
            );
        }
    }
};

SettingController.prototype.setSoundItemImage = function() {
    var isAudioOn = AudioPlayer.getInstance().isAudioOn();
    if(isAudioOn){
        this._soundItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_on.png"));
        this._soundItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_on.png"));
    } else {
        this._soundItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_off.png"));
        this._soundItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_off.png"));
    }
};

SettingController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

SettingController.prototype.rateUsClicked = function (sender) {

};

SettingController.prototype.likeUsClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var BonusMan = require("../../social/model/BonusMan");
    BonusMan.getInstance().doLikeUs();
    var LogMan = require("../../log/model/LogMan");
    LogMan.getInstance().socialRecord(PageType.PAGE_TYPE_SETTING_LIKE_US, ActionType.TAKE_ACTION);
};

SettingController.prototype.loginClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this._fbLogin();
};

SettingController.prototype.setLockScreenStatus = function (isOn) {
    if (isOn) {
        this._lockScreenItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_on.png"));
        this._lockScreenItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_on.png"));
    } else {
        this._lockScreenItem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_off.png"));
        this._lockScreenItem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("casino_setting_sound_off.png"));
    }
};

SettingController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

SettingController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

SettingController.createFromCCB = function() {
    var fileName = "casino/setting/casino_setting.ccbi";
    var PlayerMan = require("../../common/model/PlayerMan");
    var AdControlMan = require("../../ads/model/AdControlMan");
    if (cc.sys.os === cc.sys.OS_ANDROID && ClientAppVersion.supportNewSupersonicAndLockScreen() && !PlayerMan.getInstance().hasPurchased() &&
        AdControlMan.getInstance().canShowLockScreenAd()) {
        if (Util.isFileExist("casino/setting/casino_setting_android.ccbi")) {
            fileName = "casino/setting/casino_setting_android.ccbi";
        }
    }
    var node = Util.loadNodeFromCCB(fileName, null, "SettingController", new SettingController());
    return node;
};

module.exports = SettingController;