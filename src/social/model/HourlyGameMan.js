var Utils = require('../../common/util/Util');
var HourlyGameCardConfigData = require('../entity/HourlyGameCardConfigData');
var ErrorCode = require("../../common/enum/ErrorCode");
var C2SClaimHourlyGame = require("../protocol/C2SClaimHourlyGame");
var C2SGenHourlyGame = require("../protocol/C2SGenHourlyGame");
var C2SGetHourlyGame = require("../protocol/C2SGetHourlyGame");
var C2SUpgradeHourlyGameCard = require("../protocol/C2SUpgradeHourlyGameCard");
var SceneMan = require("../../common/model/SceneMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var Constants = require("../../common/enum/Constants");
var HourlyGameCollectData = require("../entity/HourlyGameCollectData");
var PopupMan = require("../../common/model/PopupMan");
var SocialPopupMan = require("../model/SocialPopupMan");
var HourlyGameCardId = require("../enum/HourlyGameCardId");
var HourlyGameCardType = require("../enum/HourlyGameCardType");
var PlayerMan = require("../../common/model/PlayerMan");
var SocialEvents = require("../events/SocialEvents");
var C2SUnlockHourlyGame = require("../protocol/C2SUnlockHourlyGame");
var LogMan = require("../../log/model/LogMan");
var ProductChangeReason = require("../../log/enum/ProductChangeReason");
var AudioHelper = require("../../common/util/AudioHelper");
var HourlyGameCardData = require("../entity/HourlyGameCardData");

var HourlyGameMan = (function() {
    var instance;

    function createInstance() {

        /**
         * collect end time.
         * @type {number} millionseconds
         */
        var hourlyBonusEndTime = 0;
        /**
         * user locked cards
         * @type {Array.<number>}
         */
        var userOwnCards = [];

        /**
         * hourly game cards list
         * @type {Array.<HourlyGameCardReward>}
         */
        var gameCardRewardList = [];
        /**
         * number of card allow to flip
         * @type {number}
         */
        var gameCardFlipNum = 0;
        /**
         * @type {Object.<number, HourlyGameCollectData>}
         */
        var gameCollectMap = {};
        /**
         * game reward stars
         * @type {number}
         */
        var gameRewardStars = 0;

        /**
         * unlock fb cards need friends count.
         * @type {number}
         */
        var unlockColFriends = 0;

        /**
         * unlock gems.
         * @type {number}
         */
        var unlockGems = 0;

        var hourlyBonusIntervalKey = null;
        var isShowedHourlyGameDialog = false;

        var MAX_CARD_LEVEL_NUM = 5;
        /**
         * card map.
         * @type {Object.<HourlyGameCardConfigData>}
         */
        var cardMap = {};
        var loadConfig = function () {
            var jsonObj = Utils.loadJson("config/hourly_game/hourly_game.json");
            if (jsonObj && Object.keys(jsonObj).length > 0) {
                var cardKeys = Object.keys(jsonObj);
                for(var i = 0; i < cardKeys.length; i++) {
                    var cardJsonObj = jsonObj[cardKeys[i]];
                    var card = new HourlyGameCardConfigData();
                    card.unmarshal(cardJsonObj);
                    cardMap[card.id] = card;
                }
                cc.log(Util.sprintf("load hourly bonus cards %s", JSON.stringify(cardMap)));
            }
        };

        loadConfig();

        return {
            /**
             * get card config data.
             * @param cardId
             * @returns {HourlyGameCardConfigData}
             */
            getCardConfigData: function (cardId) {
                return cardMap[cardId];
            },

            /**
             * get all card config.
             * @returns {Object.<HourlyGameCardConfigData>}
             */
            getCardConfigMap: function () {
                return cardMap;
            },

            /**
             * get user self cards
             * @returns {Array.<number>}
             */
            getUserOwnCardList: function () {
                return userOwnCards;
            },
            /**
             * get game card list
             * @returns {Array.<HourlyGameCardReward>}
             */
            getGameCardRewadList: function () {
                return gameCardRewardList;
            },
            /**
             * get flipCard number
             * @returns {number}
             */
            getFlipCardNum:function() {
                return gameCardFlipNum;
            },
            /**
             * @returns {Object.<number, HourlyGameCollectData>}
             */
            getGameCollectMap: function () {
                return gameCollectMap;
            },

             /**
             * get unlock col friends number.
             * @returns {number}
             */
            getUnlockColFriendsNum: function () {
                return unlockColFriends;
            },

            /**
             * get unlock gems.
             * @returns {number}
             */
            getUnlockGems: function () {
                return unlockGems;
            },

            /**
             * get hourly bonus left time.
             * @returns {number} millionseconds
             */
            getHourlyBonusLeftTime: function () {
                return Math.max(hourlyBonusEndTime - Date.now(), 0);
            },

            /**
             * get reward stars
             * @returns {number}
             */
            getRewardStars: function () {
                return gameRewardStars;
            },

            /**
             * set isShowedHourlyGameDialog
             * @param {boolean} showed
             */
            setIsShowedHourlyGameDialog: function (showed) {
                isShowedHourlyGameDialog = showed;
            },

            /**
             * unlock facebook game.
             * @returns {boolean}
             */
            isUnlockFacebookGame: function () {
                var player = PlayerMan.getInstance().player;
                if (player.friendCount >= unlockColFriends) {
                    return true;
                }
                return false;
            },

            /**
             * send get hourly game protocol
             */
            getHourlyGame: function () {
                var proto = new C2SGetHourlyGame();
                proto.send();
            },

            getCardGroupBonus:function (cardGroupId) {
                var cardKeys = Object.keys(cardMap);
                var cardbonus = {};
                for(var i = 0; i < cardKeys.length; i++) {
                    var cardInfo = cardMap[cardKeys[i]];
                    if(cardInfo.cardGroupId == cardGroupId)
                    {
                        cardbonus[cardInfo.level] = cardInfo.bonus;
                    }
                }
                return cardbonus;
            },
            /**
             * on get hourly game.
             * @param {S2CGetHourlyGame} proto
             */
            onGetHourlyGame: function (proto) {
                SceneMan.getInstance().onHourlyBonusReady();
                this._onUpdateHourlyTime(proto.leftTime);
                unlockGems = proto.unlockGems;
                gameRewardStars = proto.unclaimedStars;
                userOwnCards = proto.cards;
                unlockColFriends = proto.unlockColFriends;
                /**
                 * have unclaimed chips, then popup collect dialog.
                 */
                if (proto.unclaimedChips > 0) {
                    this._onGetCollectData(proto.unclaimedCards);
                    SocialPopupMan.popupHourlyGameCollectDlg(gameCollectMap, gameRewardStars, false, null);
                }
            },

            /**
             * gen hourly game
             */
            genHourlyGame: function () {
                var proto = new C2SGenHourlyGame();
                proto.friendCount = PlayerMan.getInstance().player.friendCount;
                proto.send();
            },

            /**
             * on gen hourly game.
             * @param {S2CGenHourlyGame} proto
             */
            onGenHourlyGame: function (proto) {
                gameCardRewardList = proto.cards;
                gameCardFlipNum = proto.flipCardNum;
                gameRewardStars = proto.rewardStars;
                this._onGetCollectData(gameCardRewardList);
                PopupMan.closeIndicator();
                if (gameCardRewardList.length == 0) {
                    throw new Error("server cards is null");
                }
                if (!isShowedHourlyGameDialog) {
                    isShowedHourlyGameDialog = true;
                    SocialPopupMan.popupHourlyGameDlg();
                } else {
                    EventDispatcher.getInstance().dispatchEvent(SocialEvents.SOCIAL_GENED_HOURLY_GAME);
                }
            },

            /**
             * claim hourly game.
             */
            claimHourlyGame: function () {
                var proto = new C2SClaimHourlyGame();
                proto.send();
            },

            /**
             * on claim hourly game.
             * @param {S2CClaimHourlyGame} proto
             */
            onClaimHourlyGame: function (proto) {
                PopupMan.closeIndicator();
                if (proto.errorCode == ErrorCode.SUCCESS) {
                    PlayerMan.getInstance().addChips(proto.totalChips, true);
                    PlayerMan.getInstance().addStars(proto.rewardStars, true);
                    this._onUpdateHourlyTime(proto.leftTime);
                    EventDispatcher.getInstance().dispatchEvent(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS, proto.totalChips);
                    LogMan.getInstance().userProductRecord(ProductChangeReason.GET_HOUR_BONUS, 0, proto.totalChips, 0, proto.rewardStars, 0);
                } else {
                    EventDispatcher.getInstance().dispatchEvent(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS, 0);
                }
            },

            /**
             * upgrade hourly game card
             * @param {number} cardId
             */
            upgradeHourlyGameCard: function (cardId) {
                var proto = new C2SUpgradeHourlyGameCard();
                proto.cardId = cardId;
                proto.send();
            },

            /**
             * on upgrade hourly game card.
             * @param {S2CUpgradeHourlyGameCard} proto
             */
            onUpgradeHourlyGameCard: function (proto) {
                PopupMan.closeIndicator();
                if (proto.errorCode == ErrorCode.SUCCESS) {
                    var PlayerMan = require("../../common/model/PlayerMan");
                    PlayerMan.getInstance().addStars(-proto.costStars, true);

                    for (var i = 0; i < userOwnCards.length; ++i) {
                        if (userOwnCards[i] == proto.oldCardId) {
                            userOwnCards[i] = proto.cardId ;
                            break;
                        }
                    }
                    EventDispatcher.getInstance().dispatchEvent(SocialEvents.SOCIAL_CARD_UPGRADED,{oldCardId:proto.oldCardId, cardId:proto.cardId});
                    AudioHelper.playCardEffect("card-levelup");
                    LogMan.getInstance().userProductRecord(ProductChangeReason.UPGRADE_HOURLY_GAME_CARD, 0, 0, 0, -proto.costStars, 0);
                }
            },

            /**
             * unlock hourly game protocol.
             */
            unlockHourlyGame: function () {
                var proto = new C2SUnlockHourlyGame();
                proto.send();
            },

            /**
             * on unlock hourly game.
             * @param {S2CUnlockHourlyGame} proto
             */
            onUnlockHourlyGame: function (proto) {
                PopupMan.closeIndicator();
                if (proto.errorCode == ErrorCode.SUCCESS) {
                    PlayerMan.getInstance().addGems(-proto.costGems, true);
                    hourlyBonusEndTime = Date.now();
                    this._clearHourlyBonus();
                    LogMan.getInstance().userProductRecord(ProductChangeReason.UNLOCK_HOURLY_GAME, -proto.costGems, 0, 0, 0, 0);
                }
            },

            /**
             * reset hourly game.
             */
            resetHourlyGame: function () {
                gameCardRewardList = [];
                gameCollectMap = {};
                gameRewardStars = 0;
            },

            /**
             * schedule hourly bonus.
             */
            scheduleHourlyBonusCountDown: function () {
                this._onUpdateHourlyTime();
            },

            /**
             * unlock new card.
             * @param {Array.<number>} unlockCards
             */
            unlockCards: function (unlockCards) {
                if (unlockCards && unlockCards.length > 0) {
                    unlockCards.forEach(function (cardId) {
                        userOwnCards.push(cardId);
                        SocialPopupMan.popupHourlyGameCollectCardDlg(cardId);
                    });
                }
            },

            /**
             * get get collect data.
             * @param {Array.<HourlyGameCardReward>} cards
             * @private
             */
            _onGetCollectData: function (cards) {
                gameCollectMap = {};
                var cardReward;
                var cardConfigData;
                for (var i = 0; i < cards.length; ++i) {
                    cardReward = cards[i];
                    cardConfigData = this.getCardConfigData(cardReward.id);
                    if (!cardConfigData || cardConfigData.type == HourlyGameCardType.HOURLY_GAME_CARD_TYPE_SPECIAL) {
                        continue;
                    }
                    var collectData = gameCollectMap[cardReward.id];
                    if (!collectData) {
                        collectData = new HourlyGameCollectData();
                        collectData.initWithCardInfo(this.getCardConfigData(cardReward.id));
                        gameCollectMap[cardReward.id] = collectData;
                    }
                    collectData.updateWithCardData(cardReward);
                }
            },

            _onUpdateHourlyTime: function (leftTime) {
                hourlyBonusEndTime = leftTime + Date.now();
                this._onUpdateHourlyInterval();
                clearInterval(hourlyBonusIntervalKey);
                hourlyBonusIntervalKey = setInterval(function () {
                    this._onUpdateHourlyInterval();
                }.bind(this), Constants.SEC_IN_MILLIS);
            },

            _onUpdateHourlyInterval: function () {
                if (hourlyBonusEndTime - Date.now() >= 0) {
                    var leftTime = hourlyBonusEndTime - Date.now();
                    if (leftTime >= 0) {
                        EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED, leftTime);
                    } else {
                        this._clearHourlyBonus();
                    }
                } else {
                    this._clearHourlyBonus();
                }
            },

            _clearHourlyBonus: function () {
                EventDispatcher.getInstance().dispatchEvent(CommonEvent.HOURLY_BONUS_CHANGED, 0);
                clearInterval(hourlyBonusIntervalKey);
            }
        };
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = HourlyGameMan;
