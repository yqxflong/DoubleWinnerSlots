/**
 * Created by qinning on 15/5/5.
 */

var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var EventDispatcher = require("../events/EventDispatcher");
var CommonEvent = require("../events/CommonEvent");
var dateFormat = require("dateformat");
var BonusMan = require("../../social/model/BonusMan");
var AudioHelper = require("../util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var HourlyBonusTimeController = require("../../social/controller/HourlyBonusTimeController");
var PlayerMan = require("../model/PlayerMan");
var HourlyGameMan = require("../../social/model/HourlyGameMan");
var ProductType = require("../../common/enum/ProductType");
var NumberAnimation = require("../../common/animation/NumberAnimation");

var ONE_HOUR_SECONDS = 3600;

var AnimationType = {
    ANIMATION_TYPE_NORMAL: 0,
    ANIMATION_TYPE_READY: 1
};

var LobbyBottomController = function() {
    this.MAX_STAR_LABEL_WIDTH = 90;
    this._starsLabel = null;
    this._timeNode = null;
    this._freeCoinsNode = null;

    this._hourlyBonusTimeNode = null;

    this._totalStarNumAnim = null;
    this._animationType = AnimationType.ANIMATION_TYPE_NORMAL;

    this._timeOutKey = -1;
};

Util.inherits(LobbyBottomController,BaseCCBController);

LobbyBottomController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.HOURLY_BONUS_CHANGED, this.onUpdateCollectTime, this);
};

LobbyBottomController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HOURLY_BONUS_CHANGED, this.onUpdateCollectTime, this);
};

LobbyBottomController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._hourlyBonusTimeNode = HourlyBonusTimeController.createFromCCB();
    this._timeNode.addChild(this._hourlyBonusTimeNode);
    this._hourlyBonusTimeNode.setScale(0.52);

    this._onUpdateCollectTime(HourlyGameMan.getInstance().getHourlyBonusLeftTime());
};

LobbyBottomController.prototype.exploreClicked = function(event) {
    AudioHelper.playBtnClickSound();
    var SocialPopupMan = require("../../social/model/SocialPopupMan");
    SocialPopupMan.popupHourlyGameDlg();
};

LobbyBottomController.prototype.onUpdateCollectTime = function(event) {
    var leftTime = event.getUserData();
    this._onUpdateCollectTime(leftTime);
};

LobbyBottomController.prototype._onUpdateCollectTime = function (leftTime) {
    if (leftTime > 0) {
        this._timeNode.visible = true;
        this._freeCoinsNode.visible = false;
        this._runAnimations(AnimationType.ANIMATION_TYPE_NORMAL);
    } else {
        this._timeNode.visible = false;
        this._freeCoinsNode.visible = true;
        this._runAnimations(AnimationType.ANIMATION_TYPE_READY);
    }
};

LobbyBottomController.prototype._runAnimations = function (animationType) {
    if (this._animationType == animationType) return;
    this._animationType = animationType;
    this.clearTimeout();
    this._timeOutKey = setTimeout(function () {
        if (animationType == AnimationType.ANIMATION_TYPE_NORMAL) {
            this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
        } else {
            this.rootNode.animationManager.runAnimationsForSequenceNamed("bonusReady");
        }
    }.bind(this), 100);
};

LobbyBottomController.prototype.clearTimeout = function () {
    if (this._timeOutKey >= 0) {
        clearTimeout(this._timeOutKey);
    }
};

LobbyBottomController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/slot_lobby_ui_bottom.ccbi", null, "LobbyBottomController", new LobbyBottomController());
};

module.exports = LobbyBottomController;