/**
 * Created by ZenQhy on 16/4/20.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var PlayerMan = require("../../common/model/PlayerMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../../slot/events/SlotEvent");
var CommonEvent = require("../../common/events/CommonEvent");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var ProductType = require("../../common/enum/ProductType");
var SocialMan = require("../../social/model/SocialMan");
var GameDirector = require("../../common/model/GameDirector");
var BonusMan = require("../../social/model/BonusMan");
var LogicMan = require("../../common/model/LogicMan");
var PomeloClient = require("../../common/net/PomeloClient");
var LoginUIController = require("../../common/controller/LoginUIController");
var PopupMan = require("../../common/model/PopupMan");
var AudioHelper = require("../../common/util/AudioHelper");
var ActionType = require("../../log/enum/ActionType");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var StorageController = require("../../common/storage/StorageController");
var SceneMan = require("../../common/model/SceneMan");
var SceneType = require("../../common/enum/SceneType");
var StoreDiscountCountDownController = require("../../store/controller/StoreDiscountCountDownController");
var FriendsInviteController = require("../../social/controller/FriendsInviteController");
var FriendInfo = require("../../social/entity/FriendInfo");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var JackpotType = require("../../slot/enum/JackpotType");
var JackpotWinnerController = require("../../slot/controller/JackpotWinnerController");
var JackpotStatusController = require("../../slot/controller/JackpotStatusController");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var DeviceInfo = require("../../common/util/DeviceInfo");
var StoreType = require("../../store/enum/StoreType");
var TaskEvent = require("../../task/events/TaskEvent");

var SlotTitleController = function() {
    this.TITLE_HEIGHT = 88;
    this.LEVEL_TIMER_ZORDER = 1;
    this.LEVEL_EXP_ZORDER = 2;
    this.OTHER_JACKPOT_ZORDER = 3;
    this.CHIPS_MAX_WIDTH = 200;
    this.GEMS_MAX_WIDTH = 130;

    this._menuItem = null;
    this._friendsItem = null;
    this._addGoldItem = null;
    this._addGemItem = null;
    this._backItem = null;

    this._VIPItem = null;

    this._faceBookItem = null;
    this._coinsCountLabel = null;
    this._gemCountLabel = null;

    this._levelLabel = null;
    this._coinLabel = null;
    this._expProgressTimer = null;
    this._expPosNode = null;
    this._levelBg = null;

    this._fbHeadIcon = null;
    this._fbHeadBg = null;

    this._backItem = null;
    this._expProgressBg = null;
    this._unfullscreenItem = null;
    this._fullscreenitem = null;

    this._jackpotLabel = null;
    this._jackpotOffBg = null;
    this._jackpotOnBg = null;

    this.otherWinJackpotNode = null;
    this.jackpotOnNode = null;
    this.jackpotOffNode = null;

    this._totalCoinNumAnim = null;
    this._totalGemNumAnim = null;
};


Util.inherits(SlotTitleController, BaseCCBController);

SlotTitleController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, this.onChipsChangedNoAnim, this);
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED, this.onChipsChanged, this);

    EventDispatcher.getInstance().addEventListener(CommonEvent.EXP_CHANGED, this.onExpChanged, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_UI, this.onSpinUITriggered, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.BACK_CLICKED, this.backClicked, this);
    EventDispatcher.getInstance().addEventListener(TaskEvent.TASK_DAILY_TASK_COMPLETED, this.onDailyTaskCompleted, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.FULL_SCREEN_CHANGED, this.onFullScreenChanged, this);

    if (this._jackpotLabel) {
        if (Config.themeName === ThemeName.THEME_WTC) {
            this._jackpotLabel.setString(0);
        } else {
            this.jackpotOnNode = JackpotStatusController.createOnFromCCB();
            this.jackpotOnNode.x = this._jackpotOnBg.x;
            this.jackpotOnNode.y = this._jackpotOnBg.y - this._jackpotOnBg.height * 0.5;
            this.jackpotOnNode.visible = false;
            this.rootNode.addChild(this.jackpotOnNode);
            this.jackpotOffNode = JackpotStatusController.createOffFromCCB();
            this.jackpotOffNode.x = this._jackpotOnBg.x;
            this.jackpotOffNode.y = this._jackpotOnBg.y - this._jackpotOnBg.height * 0.5;
            this.jackpotOffNode.visible = false;
            this.rootNode.addChild(this.jackpotOffNode);
        }

        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_UPDATE_JACKPOT, this.onUpdateJackpot, this);
        EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_JACKPOT_STATUS_CHANGED, this.onJackpotStatusChanged, this);

        if ((Config.themeName === ThemeName.THEME_OLD_VEGAS || Config.themeName === ThemeName.THEME_VEGAS_STAR) && ClassicSlotMan.getInstance().betLevel >= 0) {
            //Warnning, it's not a good habit
            ClassicSlotMan.getInstance().bet = 0;
            ClassicSlotMan.getInstance().setBetLevel(ClassicSlotMan.getInstance().betLevel, false);
        }
    }

    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_OTHER_WIN_JACKPOT, this.onOtherWinJackpot, this);
};

SlotTitleController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED_NO_ANIM, this.onChipsChangedNoAnim, this);
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_WIN_RATE_CHANGED, this.onChipsChanged, this);

    EventDispatcher.getInstance().removeEventListener(CommonEvent.EXP_CHANGED, this.onExpChanged, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_UI, this.onSpinUITriggered, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.BACK_CLICKED, this.backClicked, this);
    EventDispatcher.getInstance().removeEventListener(TaskEvent.TASK_DAILY_TASK_COMPLETED, this.onDailyTaskCompleted, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.FULL_SCREEN_CHANGED, this.onFullScreenChanged, this);

    if(this._totalCoinNumAnim) {
        this._totalCoinNumAnim.stopSchedule();
    }
    if (this._totalGemNumAnim) {
        this._totalGemNumAnim.stopSchedule();
    }

    if (this._jackpotLabel) {
        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_UPDATE_JACKPOT, this.onUpdateJackpot, this);
        EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_JACKPOT_STATUS_CHANGED, this.onJackpotStatusChanged, this);
    }

    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_OTHER_WIN_JACKPOT, this.onOtherWinJackpot, this);
};

SlotTitleController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.initUI();
};

SlotTitleController.prototype.initUI = function() {
    this._totalCoinNumAnim = new NumberAnimation(this._coinsCountLabel);
    this._totalCoinNumAnim.tickDuration = 1.0;
    this._totalCoinNumAnim.tickInterval = 0.05;

    this._totalGemNumAnim = new NumberAnimation(this._gemCountLabel);
    this._totalGemNumAnim.tickDuration = 1.0;
    this._totalGemNumAnim.tickInterval = 0.05;
    this._totalGemNumAnim.playSound = true;
    this._totalGemNumAnim.setSoundEffect("fx-gems-update");

    if (SceneMan.getInstance().getCurSceneType() == SceneType.SLOT_LOBBY) {
        this._totalCoinNumAnim.playSound = true;
    }

    this.setChipCountMaxWidth(this.CHIPS_MAX_WIDTH);
    this.setGemCountMaxWidth(this.GEMS_MAX_WIDTH);

    this.setChipCount(PlayerMan.getInstance().player.chips);
    this.setGemCount(PlayerMan.getInstance().player.gems);

    if (this._levelLabel) {
        this._levelLabel.setString(PlayerMan.getInstance().player.level);

        var levelSprite = new cc.Sprite("#casino_ui_level.png");
        this._expProgressTimer = new cc.ProgressTimer(levelSprite);
        this._expProgressTimer.type = cc.ProgressTimer.TYPE_BAR;
        this._expProgressTimer.setAnchorPoint(cc.p(0.0, 0.5));
        this._expProgressTimer.setPosition(cc.pAdd(this._expPosNode.getPosition(),cc.p(0,-1)));
        this._expProgressTimer.midPoint = cc.p(0, 0.5);
        this._expProgressTimer.barChangeRate = cc.p(1, 0);
        this.rootNode.addChild(this._expProgressTimer);
        this._expProgressTimer.setLocalZOrder(this.LEVEL_TIMER_ZORDER);
        this._expProgressTimer.scaleX = (this._expProgressBg.width - 5) / levelSprite.width;
        var player = PlayerMan.getInstance().player;
        this._expProgressTimer.setPercentage(player.exp / player.levelUpExp * 100);

        this._levelBg.setLocalZOrder(this.LEVEL_EXP_ZORDER);
        this._levelLabel.setLocalZOrder(this.LEVEL_EXP_ZORDER);
    }

    if (this._fbHeadIcon) {
        if (PlayerMan.getInstance().isFBLogin()) {
            this._fbHeadIcon.visible = true;
            this._fbHeadBg.visible = true;
            this._faceBookItem.visible = false;
            var url = Util.getFacebookAvatarUrl(PlayerMan.getInstance().player.facebookId, 52, 52);
            var self = this;
            Util.loadRemoteImg(url, function (error, tex, extra) {
                if (!error && tex) {
                    var newScaleX = self._fbHeadIcon.width / tex.width * self._fbHeadIcon.getScaleX();
                    var newScaleY = self._fbHeadIcon.height / tex.height * self._fbHeadIcon.getScaleY();
                    self._fbHeadIcon.initWithTexture(tex, cc.rect(0, 0, tex.width, tex.height));
                    self._fbHeadIcon.scaleX = newScaleX;
                    self._fbHeadIcon.scaleY = newScaleY;
                }
            }, null);
        } else {
            this._fbHeadIcon.visible = false;
            this._fbHeadBg.visible = false;
            this._faceBookItem.visible = true;
        }
    }

    this._unfullscreenItem.visible = false;
    this._fullscreenitem.visible = false;

    ////cc.log("browserType:" + cc.sys.browserType);// "cc.sys.os === cc.sys.OS_IOS")
    //if (cc.sys.isNative) {
    //    this._unfullscreenItem.visible = false;
    //    this._fullscreenitem.visible = false;
    //} else {
    //    if (cc.sys.browserType == cc.sys.BROWSER_TYPE_CHROME ||
    //        cc.sys.browserType == cc.sys.BROWSER_TYPE_FIREFOX ||
    //        cc.sys.browserType == cc.sys.BROWSER_TYPE_OPERA) {
    //        if(cc.screen.fullScreen()) {
    //            this._unfullscreenItem.visible = true;
    //            this._fullscreenitem.visible = false;
    //        } else {
    //            this._unfullscreenItem.visible = false;
    //            this._fullscreenitem.visible = true;
    //        }
    //    } else {
    //        this._unfullscreenItem.visible = false;
    //        this._fullscreenitem.visible = false;
    //    }
    //}
};

SlotTitleController.prototype.coinNumLabelWorldPosition = function () {
    return this._coinsCountLabel.parent.convertToWorldSpace(this._coinsCountLabel.getPosition());
};

SlotTitleController.prototype.showBackItem = function () {
    this._backItem.visible = true;
};

SlotTitleController.prototype.showSlotItem = function () {
    this._backItem.enabled = false;
};

SlotTitleController.prototype.showFeedback = function () {
    var FeedbackController = require("../../common/controller/FeedbackController");
    var node = FeedbackController.createFromCCB();
    this.rootNode.addChild(node);
    node.x = -this.rootNode.width / 2;
    node.y = -this.rootNode.height - 50;
};

SlotTitleController.prototype.showStoreDiscountCountDown = function () {
    var StoreDiscountCountDownController = require("../../store/controller/StoreDiscountCountDownController");
    var node = StoreDiscountCountDownController.createFromCCB();
    this.rootNode.addChild(node);
    node.x = cc.winSize.width / 2;
    node.y = -this._menuItem.height;
    node.visible = false;
};

SlotTitleController.prototype.backClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupCommonYesNoDialog("LEAVE ROOM", ["Are you sure you want", "to leave the room?"], "Stay", "Leave", function () {}, function () {
        SceneMan.getInstance().backSwitchScene();
    });
};

SlotTitleController.prototype.vipClicked = function(sender) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupCommonDialog("NOTICE", ["Comming soon!"], "Ok");
};

SlotTitleController.prototype.fbClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    this._fbLogin();
};

SlotTitleController.prototype.buyCoinClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    var LogMan = require("../../log/model/LogMan");
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.FIRST_PURCHAE, null, 0, 0, ActionType.ENTER, 2);
    PopupMan.popupStoreDialog(StoreType.STORE_TYPE_COINS);
};

SlotTitleController.prototype.buyGemClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    var LogMan = require("../../log/model/LogMan");
    LogMan.getInstance().purchaseRecord(PurchaseRecordPage.FIRST_PURCHAE, null, 0, 0, ActionType.ENTER, 2);
    PopupMan.popupStoreDialog(StoreType.STORE_TYPE_GEMS);
};

SlotTitleController.prototype.slotsClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupFreeModeDlg();
};

SlotTitleController.prototype.menuClicked  = function(sender) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupSettingDialog();
};

SlotTitleController.prototype.fullscreenClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.showFullScreen();
};

SlotTitleController.prototype.unfullscreenClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.showFullScreen();
};

SlotTitleController.prototype.showFullScreen = function () {
    if(cc.screen.fullScreen()) {
        cc.screen.exitFullScreen();
    } else {
        var appContainerNode = document.getElementById("appContainer");
        LogicMan.getInstance().requestFullScreen(appContainerNode);
    }
};

SlotTitleController.prototype.getFullScreenSize = function () {
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var ratio = 4 / 3;
    if (screenWidth / screenHeight >= ratio) {
        return cc.size(screenHeight * ratio, screenHeight);
    } else {
        return cc.size(screenWidth, screenWidth / ratio);
    }
};

SlotTitleController.prototype.setHtmlElementSize = function (width, height) {
    var canvasNode = document.getElementById("gameCanvas");
    var cocos2dGameContainer = document.getElementById("Cocos2dGameContainer");
    var appContainerNode = document.getElementById("appContainer");

    this.updateElementWidthHeight(canvasNode, width, height);
    this.updateElementWidthHeight(cocos2dGameContainer, width, height);
    this.updateElementWidthHeight(appContainerNode, width, height);
};

SlotTitleController.prototype.updateElementWidthHeight = function (elementNode, width, height) {
    elementNode.style.width = width;
    elementNode.style.height = height;
};

SlotTitleController.prototype.inviteClicked = function(sender) {
    AudioHelper.playBtnClickSound();
    if(PlayerMan.getInstance().isGuest()) {
        this._fbLogin();
    } else {
        var FaceBookMan = require("../../social/model/FaceBookMan");
        FaceBookMan.getInstance().getFriendsList(function (error, friendsList) {
            if(!error) {
                var node = FriendsInviteController.createFromCCB();
                node.controller.popup();
            } else {
                PopupMan.popupCommonDialog("NOTICE", ["Get friends info failed!"], "Yes");
            }
        });
    }
};

SlotTitleController.prototype.onFullScreenChanged = function (event) {
    var isFullScreen = event.getUserData();
    if (!isFullScreen) {
        //this._unfullscreenItem.visible = false;
        //this._fullscreenitem.visible = true;
    } else {
        //this._unfullscreenItem.visible = true;
        //this._fullscreenitem.visible = false;
    }
};

SlotTitleController.prototype.onUpdateJackpot = function (event) {
    var subject = SlotConfigMan.getInstance().getSubject(ClassicSlotMan.getInstance().subjectId);
    if (subject && subject.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
        this._jackpotLabel.setString(Util.getCommaNum(subject.jackpotInfoList[0].jackpotValue));
    } else if(subject && subject.jackpotType === JackpotType.JACKPOT_TYPE_BET_ACCU) {
        var jackpotSubInfo = ClassicSlotMan.getInstance().jackpotSubInfo;
        if(jackpotSubInfo && jackpotSubInfo.rewardRatios) {
            this._jackpotLabel.setString(Util.getCommaNum(subject.jackpotInfoList[ClassicSlotMan.getInstance().jackpotIndex].jackpotValue
            * jackpotSubInfo.rewardRatios[ClassicSlotMan.getInstance().betLevel]));
        } else {
            this._jackpotLabel.setString(0);
        }
    }
};

SlotTitleController.prototype.onJackpotStatusChanged = function (event) {
    /**
     * @type {SlotJackpotStatusData}
     */
    var jackpotStatusData = event.getUserData();
    if (Config.themeName === ThemeName.THEME_WTC) {
    } else {
        if (jackpotStatusData.isOn) {
            this.jackpotOnNode.visible = true;
            this.jackpotOffNode.visible = false;
            this.jackpotOnNode.stopAllActions();
            this.jackpotOnNode.runAction(cc.sequence(cc.delayTime(3.0), cc.hide()));

            this._jackpotOnBg.visible = true;
            this._jackpotOffBg.visible = false;
        } else {
            this.jackpotOnNode.visible = false;
            this.jackpotOffNode.visible = true;
            this.jackpotOffNode.controller.initWith(false, jackpotStatusData.thresholdBet);
            this.jackpotOffNode.stopAllActions();
            this.jackpotOffNode.runAction(cc.sequence(cc.delayTime(3.0), cc.hide()));

            this._jackpotOnBg.visible = false;
            this._jackpotOffBg.visible = true;
        }
    }
};

SlotTitleController.prototype.onOtherWinJackpot = function (event) {
    /**
     * @type {SlotOtherWinJackpotData}
     */
    var otherWinJackpotData = event.getUserData();
    this.otherWinJackpotNode = JackpotWinnerController.createFromCCB();
    this.otherWinJackpotNode.controller.initWith(otherWinJackpotData);

    this.otherWinJackpotNode.x = cc.winSize.width*0.5 - 150;
    this.otherWinJackpotNode.y = - this.TITLE_HEIGHT + 10;


    this.rootNode.addChild(this.otherWinJackpotNode);
    this.otherWinJackpotNode.setLocalZOrder(this.OTHER_JACKPOT_ZORDER);
    this.otherWinJackpotNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
};

SlotTitleController.prototype.onDailyTaskCompleted = function (event) {
    var TaskMan = require("../../task/model/TaskMan");
    var DailyChallengeProgressController = require("../../task/controller/DailyChallengeProgressController");
    var TaskProgressType = require("../../task/enum/TaskProgressType");
    var completedCount = TaskMan.getInstance().getDailyTaskCompletedCount();
    if (completedCount <= 0) return;
    var taskProgressNode;
    var isAllDailyTaskCompleted = TaskMan.getInstance().getDailyTaskCompleted();
    if (isAllDailyTaskCompleted) {
        taskProgressNode = DailyChallengeProgressController.createFromCCBAllCompleted();
    } else {
        taskProgressNode = DailyChallengeProgressController.createFromCCBOneCompleted();
        taskProgressNode.x = cc.winSize.width * 0.5 - 150;
        taskProgressNode.y = - this.TITLE_HEIGHT - 30;
    }

    taskProgressNode.controller.initWith(TaskProgressType.TASK_PROGRESS_TYPE_POPUP);
    this.rootNode.addChild(taskProgressNode);
    taskProgressNode.controller.showTaskCompletedAnim(completedCount, isAllDailyTaskCompleted);
};

SlotTitleController.prototype._fbLogin = function () {
    SocialMan.getInstance().fbLogin(function (type, response) {
        if (type == 0) {
            PomeloClient.getInstance().disconnect();
            var node = LoginUIController.createFromCCB();
            GameDirector.getInstance().runWithScene(node);
            node.controller.bindFacebook(response);
        } else {
            //fb login fail,do nothing
        }
    });
};

SlotTitleController.prototype.onChipsChanged = function (event) {
    this._totalCoinNumAnim.startNum = this.getChipCount();
    this._totalCoinNumAnim.endNum = ClassicSlotMan.getInstance().curChips;
    this._totalCoinNumAnim.start();
};

SlotTitleController.prototype.onChipsChangedNoAnim = function (event) {
    this.setChipCount(ClassicSlotMan.getInstance().curChips);
};

SlotTitleController.prototype.onExpChanged = function (event) {

    /*
     this._levelLabel.setString(PlayerMan.getInstance().player.level);
     var curPercentage = this._expProgressTimer.getPercentage();
     var destPercentage = PlayerMan.getInstance().player.exp / PlayerMan.getInstance().player.levelUpExp * 100;

     var userData = event.getUserData();
     var dt = 0.5;
     if(userData.levelUp) {
     var dt2 = destPercentage / (100 - curPercentage + destPercentage) * dt;
     var dt1 = dt - dt2;
     this._expProgressTimer.runAction(cc.sequence(cc.progressTo(dt1, 100), cc.progressFromTo(dt2, 0, destPercentage)));
     } else {
     this._expProgressTimer.runAction(cc.progressTo(dt, destPercentage));
     }*/
};

SlotTitleController.prototype.onProductChanged = function (event) {
    var userData = event.getUserData();
    if (userData.productType == ProductType.PRODUCT_TYPE_CHIP) {
        this._totalCoinNumAnim.startNum = this.getChipCount();
        this._totalCoinNumAnim.endNum = PlayerMan.getInstance().player.chips;
        this._totalCoinNumAnim.start();
    } else if(userData.productType == ProductType.PRODUCT_TYPE_GEM) {
        this._totalGemNumAnim.startNum = this.getGemCount();
        this._totalGemNumAnim.endNum = PlayerMan.getInstance().player.gems;
        this._totalGemNumAnim.start();
    }
};

SlotTitleController.prototype.onSpinUITriggered = function (event) {
    var userData = event.getUserData();
    //switch(userData.uiType) {
    //    case SlotUIType.SL
    //        this._backItem.setEnabled(false);
    //        break;
    //}
};

SlotTitleController.prototype.enableButton = function () {
    this._backItem.setEnabled(true);
};

SlotTitleController.prototype.disableButton = function () {
    this._backItem.setEnabled(false);
};

SlotTitleController.prototype.getChipCount = function () {
    return Util.unformatCommaNum(this._coinsCountLabel.getString());
};

SlotTitleController.prototype.setChipCount = function (chipCount) {
    this._coinsCountLabel.setString(Util.getCommaNum(chipCount));

    if (this._chipCountMaxWidth > 0) {
        Util.scaleCCLabelBMFont(this._coinsCountLabel, this._chipCountMaxWidth);
    }
};

SlotTitleController.prototype.getGemCount = function () {
    return Util.unformatCommaNum(this._gemCountLabel.getString());
};

SlotTitleController.prototype.setGemCount = function (gemCount) {
    this._gemCountLabel.setString(Util.getCommaNum(gemCount));

    if (this._gemCountMaxWidth > 0) {
        Util.scaleCCLabelBMFont(this._gemCountLabel, this._gemCountMaxWidth);
    }
};

SlotTitleController.prototype.setChipCountMaxWidth = function (value) {
    this._chipCountMaxWidth = value;
    this._totalCoinNumAnim.maxWidth = value;
};

SlotTitleController.prototype.setGemCountMaxWidth = function (value) {
    this._gemCountMaxWidth = value;
    this._totalGemNumAnim.maxWidth = value;
};

SlotTitleController.createFromCCB = function(ccbName) {
    return Util.loadNodeFromCCB(ccbName, null, "SlotTitleController", new SlotTitleController());
};

module.exports = SlotTitleController;