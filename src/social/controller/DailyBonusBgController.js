var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var WheelController = require("../../common/controller/WheelController");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var PlayerMan = require("../../common/model/PlayerMan");
var AudioPlayer = require("../../common/audio/AudioPlayer");
/**
 * Created by qinning on 15/6/26.
 */
var REWARD_ARR = [6000, 10000, 15000, 20000, 30000];
var BONUS_TABLE = [80000, 500000, 150000, 50000, 60000, 100000, 60000, 1000000, 200000, 75000, 90000, 100000, 50000, 300000, 150000, 75000, 50000, 250000];
var MAX_REWARD_LEN = 5;


var DailyBonusUIItemController = function () {
    BaseCCBController.call(this);
    this._reward1Label = null;
    this._reward2Label = null;
    this._reward3Label = null;
};

Util.inherits(DailyBonusUIItemController, BaseCCBController);

DailyBonusUIItemController.prototype.onEnter = function () {
};

DailyBonusUIItemController.prototype.onExit = function () {
};

DailyBonusUIItemController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

DailyBonusUIItemController.prototype.initWithReward = function (rewardCount) {
    this._reward1Label.setString(Util.getCommaNum(rewardCount));
    this._reward2Label.setString(Util.getCommaNum(rewardCount));
    this._reward3Label.setString(Util.getCommaNum(rewardCount));
};

DailyBonusUIItemController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus.ccbi", null, "DailyBonusUIItemController", new DailyBonusUIItemController());
};


var DailyBonusBgController = function () {
    BaseCCBController.call(this);
    this.REWARD_NUMBER_ZORDER = 1;

    this._friendsLabel = null;
    this._returnLabel = null;
    this._totalWinLabel = null;
    this._dailySpinBonusLabel = null;
    this._returnBonusLabel = null;
    this._friendsBonusLabel = null;
    this._bgNode = null;
    this._wheelAnchorNode = null;

    /**
     * return labels
     * @type {Array}
     * @private
     */
    this._returnLabelNodes = [];
    /**
     * friend labels
     * @type {Array}
     * @private
     */
    this._friendLabelNodes = [];

    this._wheelBonusNode = null;
    this._returnAnimNode = null;
    this._friendsAnimNode = null;

    /**
     * @type {cc.Node}
     */
    this._wheelNode = null;
    /**
     * @type {cc.Node}
     */
    this._dailyBonusEffectAfterNode = null;
    /**
     * @type {cc.Node}
     */
    this._dailyBonusEffectBeforeNode = null;
    /**
     * @type {cc.Node}
     */
    this._dailyBonusEffectLight = null;

    this._dailyBonus = null;

    this._returnProgressTimer = null;
    this._friendsProgressTimer = null;

    this._collectCallFunc = null;
    this._resultIndex = null;

    this.totalWinChips = 0;
};

Util.inherits(DailyBonusBgController, BaseCCBController);

DailyBonusBgController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.DAILY_BONUS_RECEIVED, this.onReceivedCollectChips, this);
};

DailyBonusBgController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.DAILY_BONUS_RECEIVED, this.onReceivedCollectChips,this);
    if (this._totalWinNumAnim) {
        this._totalWinNumAnim.stopSchedule();
    }
    DialogManager.getInstance().checkDelayDialogQueue(this.rootNode);
};

DailyBonusBgController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._bgNode.visible = false;
    this._wheelNode = WheelController.createFromCCB("casino/daily_bonus/daily_bonus_reel.ccbi", 18);
    this._wheelNode.controller.initUI(BONUS_TABLE);
    this._wheelNode.controller.onSpinClickedCallback(this.spinCallback.bind(this));
    this._wheelNode.controller.setResultShowTime(1.0);
    this._wheelNode.controller.setWaitToRotateTime(0.5);
    this._wheelNode.controller.setSteadyRotateTime(1.5);
    this._wheelAnchorNode.addChild(this._wheelNode);
    this._bgNode.y = 20;

    this._dailyBonusEffectAfterNode = Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_reel_effect_afterspin.ccbi", null, "DailyBonusAfterController", {});
    this._wheelNode.addChild(this._dailyBonusEffectAfterNode);
    this._dailyBonusEffectAfterNode.visible = false;

    this._dailyBonusEffectBeforeNode = Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_reel_effect_beforespin.ccbi", null, "DailyBonusBeforeController", {});
    this._wheelNode.addChild(this._dailyBonusEffectBeforeNode);
    this._dailyBonusEffectBeforeNode.visible = true;
    this._dailyBonusEffectBeforeNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");

    this._dailyBonusEffectLight = Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_reel_effect_light.ccbi", null, "DailyBonusLightController", {});
    this._wheelNode.addChild(this._dailyBonusEffectLight);
    this._dailyBonusEffectLight.visible = false;

    for (var i = 1; i <= 5; ++i) {
        var returnLabelNode = this._bgNode.getChildByTag(200 + i);
        var returnLabel = DailyBonusUIItemController.createFromCCB();
        returnLabel.controller.initWithReward(REWARD_ARR[i - 1]);
        returnLabelNode.addChild(returnLabel);
        returnLabelNode.setLocalZOrder(this.REWARD_NUMBER_ZORDER);
        this._returnLabelNodes.push(returnLabel);
    }

    for (var i = 1; i <= 5; ++i) {
        var friendLabelNode = this._bgNode.getChildByTag(300 + i);
        var friendLabel = DailyBonusUIItemController.createFromCCB();
        friendLabel.controller.initWithReward(REWARD_ARR[i - 1]);
        friendLabelNode.addChild(friendLabel);
        friendLabelNode.setLocalZOrder(this.REWARD_NUMBER_ZORDER);
        this._friendLabelNodes.push(friendLabel);
    }

    this._returnLabel.setString("0");
    this._friendsLabel.setString("0");
    this.initUI();
    this.initNumberAnimation();
};

/**
 * @param {S2CGetDailyBonus} s2cGetDailyBonus
 */
DailyBonusBgController.prototype.onGetDailyBonus = function (s2cGetDailyBonus) {
    this.initWith(s2cGetDailyBonus);

    var hitIndex = 0;
    for (var i = 0; i < BONUS_TABLE.length; ++i) {
        if (s2cGetDailyBonus.wheelBonus == BONUS_TABLE[i]) {
            hitIndex = i;
        }
    }
    this._resultIndex = hitIndex;
};

DailyBonusBgController.prototype.spinCallback = function () {
    this._dailyBonusEffectBeforeNode.removeFromParent();
    this._dailyBonusEffectLight.visible = true;

    this._wheelNode.controller.rotate(this._resultIndex, this.onWheelRotateCompleted.bind(this), this.onShowResultCompleted.bind(this));
};

DailyBonusBgController.prototype.onWheelRotateCompleted = function () {
    this._dailyBonusEffectAfterNode.visible = true;
    this._dailyBonusEffectAfterNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
};

DailyBonusBgController.prototype.onShowResultCompleted = function () {
    AudioPlayer.getInstance().playEffectByKey("slots/bonus-cheer");
    this._dailyBonusEffectLight.visible = false;
    var t = 1.0;
    this._bgNode.runAction(cc.sequence(cc.show(), cc.moveTo(t, 75, this._bgNode.y), cc.callFunc(this.showReturnFriendsAnim, this)));
    this._wheelNode.runAction(cc.sequence(cc.moveTo(t, -165, 0)));
};

DailyBonusBgController.prototype.initUI = function () {
    var loadingSprite = new cc.Sprite("#dailybonus_loading_1.png");
    this._returnProgressTimer = new cc.ProgressTimer(loadingSprite);
    this._returnProgressTimer.type = cc.ProgressTimer.TYPE_BAR;
    this._returnProgressTimer.setAnchorPoint(cc.p(0, 0));
    this._returnProgressTimer.setPosition(this._returnAnimNode.getPosition());
    this._returnProgressTimer.midPoint = cc.p(0, 0.5);
    this._returnProgressTimer.barChangeRate = cc.p(1, 0);
    this._bgNode.addChild(this._returnProgressTimer);

    this._friendsProgressTimer = new cc.ProgressTimer(new cc.Sprite("#dailybonus_loading_2.png"));
    this._friendsProgressTimer.type = cc.ProgressTimer.TYPE_BAR;
    this._friendsProgressTimer.setAnchorPoint(cc.p(0, 0));
    this._friendsProgressTimer.setPosition(this._friendsAnimNode.getPosition());
    this._friendsProgressTimer.midPoint = cc.p(0, 0.5);
    this._friendsProgressTimer.barChangeRate = cc.p(1, 0);
    this._bgNode.addChild(this._friendsProgressTimer);
};

DailyBonusBgController.prototype.initNumberAnimation = function () {
    this._totalWinNumAnim = new NumberAnimation(this._totalWinLabel);
    this._totalWinNumAnim.tickDuration = 1.0;
    this._totalWinNumAnim.tickInterval = 0.05;
    this._totalWinNumAnim.playSound = true;
};

DailyBonusBgController.prototype.initWith = function (dailyBonus) {
    this._dailyBonus = dailyBonus;
    this._returnLabel.setString(0);
    this._friendsLabel.setString(0);

    this._dailySpinBonusLabel.setString(0);
    this._returnBonusLabel.setString(0);
    this._friendsBonusLabel.setString(0);

    this.totalWinChips = dailyBonus.wheelBonus + dailyBonus.loginBonus + dailyBonus.friendBonus;
    this._totalWinLabel.setString(0);
};

DailyBonusBgController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupIndicator();
    var BonusMan = require("../model/BonusMan");
    BonusMan.getInstance().sendClaimDailyBonusCmd();
    if (this._collectCallFunc) {
        this._collectCallFunc();
    }

    var LogMan = require("../../log/model/LogMan");
    var UserStepId = require("../../log/enum/UserStepId");
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_COLLECT_DAILY_BONUS, -1);
};

DailyBonusBgController.prototype.showReturnFriendsAnim = function () {
    if (this._dailyBonus.loginBonus > 0) {
        var percent = this.getPercentage(this._dailyBonus.loginBonus);
        this._returnProgressTimer.runAction(cc.sequence(cc.progressTo(0.6, percent), cc.callFunc(this.showReturnLabelAnim, this)));
    } else {
        this.showReturnLabelAnim();
    }
};

DailyBonusBgController.prototype.showReturnLabelAnim = function () {
    this._returnLabel.setString(Util.getCommaNum(this._dailyBonus.continuousDayCount));
    var index = this.getIndex(this._dailyBonus.loginBonus);
    if (index >= 0) {
        this._returnLabelNodes[index].animationManager.runAnimationsForSequenceNamed("effect");
    }
    //show friend bonus animation
    if (this._dailyBonus.friendBonus > 0) {
        var percent = this.getPercentage(this._dailyBonus.friendBonus);
        this._friendsProgressTimer.runAction(cc.sequence(cc.progressTo(0.6, percent), cc.callFunc(this.showFriendLabelAnim, this)));
    } else {
        this.showFriendLabelAnim();
    }
};

DailyBonusBgController.prototype.showFriendLabelAnim = function () {
    this._friendsLabel.setString(Util.getCommaNum(this._dailyBonus.friendCount));
    var index = this.getIndex(this._dailyBonus.friendBonus);
    if (index >= 0) {
        this._friendLabelNodes[index].animationManager.runAnimationsForSequenceNamed("effect");
    }
    this._totalWinNumAnim.startNum = 0;
    this._totalWinNumAnim.endNum = this.totalWinChips;
    this._totalWinNumAnim.start();

    this._dailySpinBonusLabel.setString(Util.getCommaNum(this._dailyBonus.wheelBonus));
    this._returnBonusLabel.setString(Util.getCommaNum(this._dailyBonus.loginBonus));
    this._friendsBonusLabel.setString(Util.getCommaNum(this._dailyBonus.friendBonus));
};

DailyBonusBgController.prototype.getIndex = function (bonusReward) {
    for (var i = 0; i < REWARD_ARR.length; ++i) {
        if (REWARD_ARR[i] == bonusReward) {
            return i;
        }
    }
    return -1;
};

DailyBonusBgController.prototype.getPercentage = function (bonusReward) {
    var index = this.getIndex(bonusReward);
    if (index + 1 >= 0) {
        return (index + 1) / MAX_REWARD_LEN * 100;
    } else {
        return 0;
    }
};

DailyBonusBgController.prototype.setCollectCallFunc = function (callFunc) {
    this._collectCallFunc = callFunc;
};

DailyBonusBgController.prototype.popup = function () {
    DialogManager.getInstance().popupForDelay(this.rootNode);
};

DailyBonusBgController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, false);
};

DailyBonusBgController.prototype.onReceivedCollectChips = function (event) {
    PlayerMan.getInstance().addChips(this.totalWinChips , true);
    var LogMan = require("../../log/model/LogMan");
    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
    LogMan.getInstance().userProductRecord(ProductChangeReason.GET_DAILY_BONUS, 0, this.totalWinChips, 0, 0, 0);
    this.close();
};
/**
 * @returns {cc.Node|null}
 */
DailyBonusBgController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_bg.ccbi", null, "DailyBonusBgController", new DailyBonusBgController());
};

module.exports = DailyBonusBgController;