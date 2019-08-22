/**
 * Created by qinning on 15/12/31.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var DialogManager = require("../../common/popup/DialogManager");
var PopupMan = require("../../common/model/PopupMan");
var AudioHelper = require("../../common/util/AudioHelper");
var HourlyBonusTimeController = require("../../social/controller/HourlyBonusTimeController");
var HourlyGameMan = require("../model/HourlyGameMan");
var HourlyBonusCardController = require("./HourlyBonusCardController");
var PlayerMan = require("../../common/model/PlayerMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var SocialPopupMan = require("../model/SocialPopupMan");
var StoreType = require("../../store/enum/StoreType");
var SocialEvents = require("../events/SocialEvents");
var ProductType = require("../../common/enum/ProductType");
var HourlyGameCardId = require("../enum/HourlyGameCardId");
var UIHelper = require("../../common/util/UIHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var HourlyBonusSpecialCardController = require("./HourlyBonusSpecialCardController");
var ModalLayer = require("../../common/popup/ModalLayer");

var CardLockType = {
    CARD_LOCK_TYPE_NORMAL: 0,
    CARD_LOCK_TYPE_FB: 1
};

var CardAnimStep = {
    CARD_ANIM_STEP_NORMAL: 0,
    CARD_ANIM_STEP_SHOWING: 1,
    CARD_ANIM_STEP_END: 2
};

var HourlyGameStep = {
    HOURLY_GAME_STEP_ENTER: 0,
    HOURLY_GAME_STEP_RECEIVING: 1,
    HOURLY_GAME_DATA_RECEIVED: 2,
    HOURLY_GAME_STEP_END: 3
};


/**
 * HourlyBonusWinTotalController
 * @constructor
 */
var HourlyBonusWinTotalController = function () {
    this._totalWin1Label = null;
    this._totalWin2Label = null;
    this._totalWin3Label = null;

    this._totalWinNumAnimList = [];

    this._totalCoinsNum = 0;
};

Util.inherits(HourlyBonusWinTotalController, BaseCCBController);

HourlyBonusWinTotalController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.resetTotalWin();
    this._totalWinNumAnimList[0] = this.getNumberAnimation(this._totalWin1Label, true);
    this._totalWinNumAnimList[1] = this.getNumberAnimation(this._totalWin2Label, false);
    this._totalWinNumAnimList[2] = this.getNumberAnimation(this._totalWin3Label, false);
};

HourlyBonusWinTotalController.prototype.getNumberAnimation = function (label, playSound) {
    var totalWinNumAnim = new NumberAnimation(label);
    totalWinNumAnim.tickDuration = 1.0;
    totalWinNumAnim.tickInterval = 0.05;
    totalWinNumAnim.playSound = playSound;
    return totalWinNumAnim;
};

HourlyBonusWinTotalController.prototype._updateCoins = function (index, label, addedCoins) {
    this._totalWinNumAnimList[index].startNum = this._totalCoinsNum - addedCoins;
    this._totalWinNumAnimList[index].endNum = this._totalCoinsNum;
    this._totalWinNumAnimList[index].start();
};

HourlyBonusWinTotalController.prototype.updateTotalWin = function (addedCoins) {
    this._totalCoinsNum += addedCoins;
    if (addedCoins > 0) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("effect");
    }
    this._updateCoins(0, this._totalWin1Label, addedCoins);
    this._updateCoins(1, this._totalWin2Label, addedCoins);
    this._updateCoins(2, this._totalWin3Label, addedCoins);
};

HourlyBonusWinTotalController.prototype.getTickDuration = function () {
    return this._totalWinNumAnimList[0].DEFAULT_TICK_DURATION;
};

HourlyBonusWinTotalController.prototype.resetTotalWin = function () {
    this._totalCoinsNum = 0;
    this._totalWin1Label.setString(0);
    this._totalWin2Label.setString(0);
    this._totalWin3Label.setString(0);
};

HourlyBonusWinTotalController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_win_l.ccbi", null, "HourlyBonusWinTotalController", new HourlyBonusWinTotalController());
};

///////////////////////////



var HourlyBonusSmallWinController = function () {
    this._totalWinLabel= null;
};

Util.inherits(HourlyBonusSmallWinController, BaseCCBController);

HourlyBonusSmallWinController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

HourlyBonusSmallWinController.prototype.updateCoins = function (coins) {
    if (coins > 0) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("effect");
    }
    this._totalWinLabel.setString(Util.getCommaNum(coins));
};

HourlyBonusSmallWinController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_win_s.ccbi", null, "HourlyBonusSmallWinController", new HourlyBonusSmallWinController());
};

////////////////////////////////

var HourlyBonusFlipCardController = function () {
    /**
     * @type {Function}
     * @private
     */
    this._flipCardCallback = null;
};

Util.inherits(HourlyBonusFlipCardController, BaseCCBController);

HourlyBonusFlipCardController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

HourlyBonusFlipCardController.prototype.initWithCallback = function (flipCardCallback) {
    this._flipCardCallback = flipCardCallback;
};

HourlyBonusFlipCardController.prototype.flipCardClicked = function (event) {
    AudioHelper.playBtnClickSound();
    if (this._flipCardCallback) {
        this._flipCardCallback();
    }
};

HourlyBonusFlipCardController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_flipcard.ccbi", null, "HourlyBonusFlipCardController", new HourlyBonusFlipCardController());
};

var HourlyBonusController = function () {
    this.TABLE_VIEW_ROW = 4;
    this.TABLE_VIEW_COL = 4;
    this.TABLE_VIEW_NORMAL_COUNT = 16;
    this.TABLE_VIEW_FB_COL = 1;
    this.TABLE_VIEW_FB_COUNT = 4;
    this.STAR_MAX_WIDTH = 100;
    this.FLY_TIME = 1.0;
    this.ANIM_NODE_ZORDER = 10;

    this._collectItem = null;
    this._closeItem = null;
    this._upgradingItem = null;
    this._starLabel = null;
    this._totalWinLabel = null;
    this._facebookNode = null;
    this._friendsLabel = null;
    this._cardLockNode = null;
    this._timeNode = null;
    this._spendGemLabel = null;

    this._cardsContentNode = null;
    this._fbCardsContentNode = null;
    this._takeAllNode = null;
    this._animNode = null;
    this._flipCardNode = null;

    //custom
    this._hourlyBonusTimeNode = null;
    this._hourlyBonusTotalWinNode = null;

    //data
    /**
     * @type {Array.<cc.Node>}
     * @private
     */
    this._cardNodes = null;
    /**
     * @type {CardAnimStep}
     * @private
     */
    this._cardAnimStep = CardAnimStep.CARD_ANIM_STEP_NORMAL;
    /**
     * show card index.
     * @type {number}
     * @private
     */
    this._showCardIndex = 0;
    /**
     * @type {Array.<HourlyGameCardReward>}
     * @private
     */
    this._cardRewardList = [];

    /**
     * @type {number}
     * @private
     */
    this._cardAllowFlipNum = 0;

    /**
     * @type {HourlyGameStep}
     * @private
     */
    this._hourlyGameStep = HourlyGameStep.HOURLY_GAME_STEP_ENTER;
    /**
     * take all chips count.
     * @type {number}
     * @private
     */
    this._takeAllChipsCount = 0;

    /**
     *
     * @type {Mode}
     * @private
     */
    this._remainingCardslabel = 0;
    /**
     *
     * @type {Mode}
     * @private
     */
    this._specialAnimLayerColor = null;
};

Util.inherits(HourlyBonusController, BaseCCBController);

HourlyBonusController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.HOURLY_BONUS_CHANGED, this.onUpdateCollectTime, this);
    EventDispatcher.getInstance().addEventListener(SocialEvents.SOCIAL_GENED_HOURLY_GAME, this.onGenedHourlyGame, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    EventDispatcher.getInstance().addEventListener(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS, this.onClaimedHourlyBonus, this);
    cc.eventManager.addListener({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: this.onTouchBegan.bind(this)
    }, this.rootNode);
    HourlyGameMan.getInstance().setIsShowedHourlyGameDialog(true);
};

HourlyBonusController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SocialEvents.SOCIAL_GENED_HOURLY_GAME, this.onGenedHourlyGame, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HOURLY_BONUS_CHANGED, this.onUpdateCollectTime, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
    EventDispatcher.getInstance().removeEventListener(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS, this.onClaimedHourlyBonus, this);
    HourlyGameMan.getInstance().setIsShowedHourlyGameDialog(false);
};

HourlyBonusController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._specialAnimLayerColor = new ModalLayer();
    this._specialAnimLayerColor.ignoreAnchorPointForPosition(false);
    this._specialAnimLayerColor.setColor(cc.color.BLACK);
    this._specialAnimLayerColor.setOpacity(190);
    this._specialAnimLayerColor.setLocalZOrder(0);
    this._specialAnimLayerColor.visible = false;
    this._animNode.addChild(this._specialAnimLayerColor);
    this._animNode.setLocalZOrder(this.ANIM_NODE_ZORDER);

    this._totalWinLabel.setString(0);
    this._friendsLabel.setString(Util.sprintf("x%d", HourlyGameMan.getInstance().getUnlockColFriendsNum()));
    this._starLabel.setString(Util.getCommaNum(PlayerMan.getInstance().getStars()));
    Util.scaleCCLabelBMFont(this._starLabel, this.STAR_MAX_WIDTH);
    this._spendGemLabel.setString(HourlyGameMan.getInstance().getUnlockGems());

    this._hourlyBonusTotalWinNode = HourlyBonusWinTotalController.createFromCCB();
    this.rootNode.addChild(this._hourlyBonusTotalWinNode);
    this._hourlyBonusTotalWinNode.setPosition(this._totalWinLabel.getPosition());
    this._totalWinLabel.visible = false;
    /**
     * init hourly bonus node.
     */
    this._hourlyBonusTimeNode = HourlyBonusTimeController.createFromCCB();
    this._timeNode.addChild(this._hourlyBonusTimeNode);
    if (HourlyGameMan.getInstance().getHourlyBonusLeftTime() > 0) {
        this._cardLockNode.visible = true;
        this._flipCardNode.visible = false;
    } else {
        this._cardLockNode.visible = false;
        this._flipCardNode.visible = true;
        this.showCardsTableView();
    }
    var flipCardNode = HourlyBonusFlipCardController.createFromCCB();
    if (HourlyGameMan.getInstance().isUnlockFacebookGame()) {
        this._facebookNode.visible = false;
        this._flipCardNode.setPositionX(this._cardsContentNode.x +
        (this._fbCardsContentNode.width + this._fbCardsContentNode.x - this._cardsContentNode.x) / 2);
    } else {
        this._facebookNode.visible = true;
        this._flipCardNode.setPositionX(this._cardsContentNode.x + this._cardsContentNode.width / 2);
    }
    this._flipCardNode.addChild(flipCardNode);
    this._remainingCardslabel.setString(Util.getCommaNum("0/0"));
    flipCardNode.controller.initWithCallback(this.startGame.bind(this));
};

HourlyBonusController.prototype.startGame = function () {
    HourlyGameMan.getInstance().genHourlyGame();
    PopupMan.popupIndicator();
};

HourlyBonusController.prototype.onTouchBegan = function (touch, event) {
    if (!this._cardNodes) return false;
    if (this._cardAnimStep != CardAnimStep.CARD_ANIM_STEP_NORMAL) return false;
    if (this._hourlyGameStep != HourlyGameStep.HOURLY_GAME_DATA_RECEIVED) return false;
    var touchLocation = touch.getLocation();
    for (var i = 0; i < this._cardNodes.length; ++i) {
        var cardBoundingBox = this._cardNodes[i].controller.boundingBox();
        var nodeTouchLocation = this._cardNodes[i].getParent().convertToNodeSpace(touchLocation);
        if (this._cardNodes[i].controller.isLocked()) continue;
        if (this._cardNodes[i].controller.isShowed()) continue;
        if (cc.rectContainsPoint(cardBoundingBox, nodeTouchLocation)) {
            this.gridTouched(i);
            return true;
        }
    }
    return false;
};

HourlyBonusController.prototype.showCardsTableView = function () {
    this._cardsContentNode.removeAllChildren();
    this._fbCardsContentNode.removeAllChildren();
    this._cardNodes = [];
    var i;
    var cardNode;
    for (i = 0; i < this.TABLE_VIEW_NORMAL_COUNT; ++i) {
        cardNode = this.getHourlyBonusItem();
        this._cardNodes.push(cardNode);
        this._cardsContentNode.addChild(cardNode);
        cardNode.setPosition(this.getCardPosition(i, CardLockType.CARD_LOCK_TYPE_NORMAL));
    }

    var isUnlockFacebookGame = HourlyGameMan.getInstance().isUnlockFacebookGame();
    if (!isUnlockFacebookGame) {
        return;
    }
    for (i = 0; i < this.TABLE_VIEW_FB_COUNT; ++i) {
        cardNode = this.getHourlyBonusItem();
        if (!isUnlockFacebookGame) {
            cardNode.controller.lockCard();
        }
        this._cardNodes.push(cardNode);
        this._fbCardsContentNode.addChild(cardNode);
        cardNode.setPosition(this.getCardPosition(i, CardLockType.CARD_LOCK_TYPE_FB));
    }

};

HourlyBonusController.prototype.getCardPosition = function (index, type) {
    var colCount;
    if (type == CardLockType.CARD_LOCK_TYPE_NORMAL) {
        colCount = this.TABLE_VIEW_COL;
    } else {
        colCount = this.TABLE_VIEW_FB_COL;
    }
    var row = Math.floor(index / colCount);
    var col = index % colCount;
    var gridSize = this.gridSizeForTable();
    return cc.p(gridSize.width * (col + 0.5), gridSize.height * (row + 0.5));
};

HourlyBonusController.prototype.getHourlyBonusItem = function() {
    var cell = HourlyBonusCardController.createFromCCB();
    cell.controller.showCardBack();
    return cell;
};

HourlyBonusController.prototype.gridSizeForTable = function() {
    return cc.size(this._cardsContentNode.width / this.TABLE_VIEW_COL, this._cardsContentNode.height / this.TABLE_VIEW_ROW);
};

HourlyBonusController.prototype.gridTouched = function(idx) {
    cc.log("gridTouched gridIdx:" + idx);
    var cardNode = this._cardNodes[idx];
    if (cardNode) {
        if (cardNode.controller.isShowed()) return;
        if (cardNode.controller.isLocked()) return;
        if (this._showCardIndex < this._cardRewardList.length) {
            this._cardAnimStep = CardAnimStep.CARD_ANIM_STEP_SHOWING;
            var cardReward = this._cardRewardList[this._showCardIndex];
            cardNode.controller.initWithCardInfo(cardReward, this.onShowCardAnimEnd.bind(this));
            cardNode.controller.showTurnCardAnim(false);

            if(cardReward.id >= 1000) {
                AudioHelper.playCardEffect("rare-card");
            }
            else {
                AudioHelper.playCardEffect("card-turn");
            }
        }
    }
};

/**
 *
 * @param {cc.Node} cardNode
 * @param {number} coins
 * @param {number} flyTime
 */
HourlyBonusController.prototype.showFlyCoinsAnim = function (cardNode, coins, flyTime) {
    var totalWinLabelWorldPos = this._totalWinLabel.getParent().convertToWorldSpace(this._totalWinLabel.getPosition());
    var cardWorldPos = cardNode.getParent().convertToWorldSpace(cardNode.getPosition());

    var flyNode = HourlyBonusSmallWinController.createFromCCB();
    flyNode.controller.updateCoins(coins);
    flyNode.setPosition(this.rootNode.convertToNodeSpace(cardWorldPos));
    UIHelper.showFlyNodeAnim(flyNode, this.rootNode.convertToNodeSpace(totalWinLabelWorldPos), flyTime, this.rootNode);
};

/**
 *
 * @param {cc.Node} target
 * @param {HourlyGameCardReward} cardReward
 */
HourlyBonusController.prototype.onShowCardAnimEnd = function (target, cardReward) {
    if (cardReward.id == HourlyGameCardId.TAKE_ALL) {
        AudioHelper.playCardEffect("card-angel-anim");
    } else if (cardReward.id == HourlyGameCardId.GAME_OVER) {
        AudioHelper.playCardEffect("card-skull-anim");
    }

    if (HourlyGameCardId.isNormalCard(cardReward.id)) {
        this.showFlyCoinsAnim(target, cardReward.chips, this.FLY_TIME);
    }
    var specialCardNode;
    if (cardReward.id == HourlyGameCardId.TAKE_ALL) {
        this._specialAnimLayerColor.visible = true;
        specialCardNode = HourlyBonusSpecialCardController.createFromCCB("casino/card/casino_hourly_bonus_angel.ccbi");
        this._animNode.addChild(specialCardNode);
        specialCardNode.controller.showSpecialAnimation(function () {
            this._specialAnimLayerColor.visible = false;
            this._takeAllChipsCount = 0;
            for (var i = 0; i < this._cardNodes.length; ++i) {
                var cardNode = this._cardNodes[i];
                if (cardNode.controller.isShowed()) continue;
                if (cardNode.controller.isLocked()) continue;
                cardReward = this._cardRewardList[++this._showCardIndex];
                if (cardReward) {
                    this._takeAllChipsCount += cardReward.chips;
                    this._cardNodes[i].controller.initWithCardInfo(cardReward, null);
                    this._cardNodes[i].controller.showTurnCardAnim(true);
                } else {
                    throw new Error("cardReward is null");
                }
            }
            setTimeout(this.onShowTakeAllCardFlyAnim.bind(this), 300);
        }.bind(this));
    } else if (cardReward.id == HourlyGameCardId.GAME_OVER) {
        this._specialAnimLayerColor.visible = true;
        specialCardNode = HourlyBonusSpecialCardController.createFromCCB("casino/card/casino_hourly_bonus_skull.ccbi");
        this._animNode.addChild(specialCardNode);
        specialCardNode.controller.showSpecialAnimation(function () {
            this._specialAnimLayerColor.visible = false;
            setTimeout(this.onHourlyGameEnd.bind(this), this._hourlyBonusTotalWinNode.controller.getTickDuration() * 1000 + 300);
        }.bind(this));
    } else {
        ++this._showCardIndex;
        if (this._showCardIndex < this._cardRewardList.length) {

            this._cardAnimStep = CardAnimStep.CARD_ANIM_STEP_NORMAL;
        }

        if (this._showCardIndex >= this._cardRewardList.length) {
            setTimeout(function () {
                setTimeout(this.onHourlyGameEnd.bind(this), this._hourlyBonusTotalWinNode.controller.getTickDuration() * 1000 + 600);
                this._hourlyBonusTotalWinNode.controller.updateTotalWin(cardReward.chips);
            }.bind(this), this.FLY_TIME * 1000);
        }
        else
        {
            setTimeout(function () {
                 this._hourlyBonusTotalWinNode.controller.updateTotalWin(cardReward.chips);
            }.bind(this), this.FLY_TIME * 1000);
        }
        this._remainingCardslabel.setString(Util.getCommaNum(this._cardAllowFlipNum - this._showCardIndex)+ "/" + Util.getCommaNum(this._cardAllowFlipNum));
     }
};

HourlyBonusController.prototype.onShowTakeAllCardFlyAnim = function () {
    this.showFlyCoinsAnim(this._takeAllNode, this._takeAllChipsCount, this.FLY_TIME);
    setTimeout(this.onShowTakeAllCardAnimEnd.bind(this), this.FLY_TIME * 1000);
};

HourlyBonusController.prototype.onShowTakeAllCardAnimEnd = function () {
    this._hourlyBonusTotalWinNode.controller.updateTotalWin(this._takeAllChipsCount);
    setTimeout(this.onHourlyGameEnd.bind(this), this._hourlyBonusTotalWinNode.controller.getTickDuration() * 1000 + 300);
};

HourlyBonusController.prototype.onHourlyGameEnd = function () {
    //AudioPlayer.getInstance().playMusicByKey("game-bg", true);
    this._cardAnimStep = CardAnimStep.CARD_ANIM_STEP_END;
    this._hourlyGameStep = HourlyGameStep.HOURLY_GAME_STEP_END;
    this._remainingCardslabel.setString("0/" + Util.getCommaNum(this._cardAllowFlipNum));
    SocialPopupMan.popupHourlyGameCollectDlg(HourlyGameMan.getInstance().getGameCollectMap(),
        HourlyGameMan.getInstance().getRewardStars(), true, null);

};

HourlyBonusController.prototype.resetHourlyGame = function () {
    this._showCardIndex = 0;
    this._hourlyBonusTotalWinNode.controller.resetTotalWin();
    this._closeItem.enabled = true;
    this._cardsContentNode.removeAllChildren();
    this._fbCardsContentNode.removeAllChildren();
    HourlyGameMan.getInstance().resetHourlyGame();
    this._cardAnimStep = CardAnimStep.CARD_ANIM_STEP_NORMAL;
    this._hourlyGameStep = HourlyGameStep.HOURLY_GAME_STEP_ENTER;
    this._upgradingItem.enabled = true;
};

HourlyBonusController.prototype.onGenedHourlyGame = function (event) {
    this._hourlyGameStep = HourlyGameStep.HOURLY_GAME_DATA_RECEIVED;
    this._cardRewardList = HourlyGameMan.getInstance().getGameCardRewadList();
    this._cardAllowFlipNum = HourlyGameMan.getInstance().getFlipCardNum();
    if (this._cardRewardList.length == 0) {
        throw new Error("server cards is null");
    } else {
        this._closeItem.enabled = false;
        this._flipCardNode.visible = false;
        this._upgradingItem.enabled = false;
        this.showCardsTableView();
        this._remainingCardslabel.setString(Util.getCommaNum(this._cardAllowFlipNum)+ "/" + Util.getCommaNum(this._cardAllowFlipNum));
    }
};

HourlyBonusController.prototype.onClaimedHourlyBonus = function (event) {
    this.resetHourlyGame();
};

HourlyBonusController.prototype.onUpdateCollectTime = function (event) {
    var leftTime = event.getUserData();
    this._onUpdateCollectTime(leftTime);
};

HourlyBonusController.prototype._onUpdateCollectTime = function (leftTime) {
    if (leftTime > 0) {
        this._cardLockNode.visible = true;
        this._flipCardNode.visible = false;
    } else {
        this._cardLockNode.visible = false;
        this._flipCardNode.visible = true;
        this.showCardsTableView();
    }
};

HourlyBonusController.prototype.onProductChanged = function (event) {
    var userData = event.getUserData();
    if (userData.productType == ProductType.PRODUCT_TYPE_STAR) {
        this._starLabel.setString(Util.getCommaNum(PlayerMan.getInstance().getStars()));
        Util.scaleCCLabelBMFont(this._starLabel, this.STAR_MAX_WIDTH);
    }
};

//HourlyBonusController.prototype.reGenHourlyGame = function () {
//    HourlyGameMan.getInstance().genHourlyGame();
//};

HourlyBonusController.prototype.upgradingClicked = function (event) {
    AudioHelper.playBtnClickSound();
    var HourlyBonusUpgradeController = require("./HourlyBonusUpgradeController");
    var upgradeNode = HourlyBonusUpgradeController.createFromCCB();
    upgradeNode.controller.popup();
};

HourlyBonusController.prototype.gemsUnlockedClicked = function (event) {
    AudioHelper.playBtnClickSound();
    if (HourlyGameMan.getInstance().getUnlockGems() > PlayerMan.getInstance().getGems()) {
        PopupMan.popupStoreDialog(StoreType.STORE_TYPE_GEMS);
    } else {
        HourlyGameMan.getInstance().unlockHourlyGame();
        PopupMan.popupIndicator();
    }
};

HourlyBonusController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

HourlyBonusController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

HourlyBonusController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

HourlyBonusController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus.ccbi", null, "HourlyBonusController", new HourlyBonusController());
};

module.exports = HourlyBonusController;