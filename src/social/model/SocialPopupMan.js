/**
 * Created by qinning on 16/1/5.
 */

var SocialPopupMan = {

    /**
     * game collect map.
     * @param {Object.<number,HourlyGameCollectData>} gameCollectMap
     * @param {Number} starNum
     * @param {Boolean} isInGame
     * @param {Function} closeCallback
     */
    popupHourlyGameCollectDlg: function (gameCollectMap, starNum, isInGame, closeCallback) {
        var HourlyBonusCollectController = require("../controller/HourlyBonusCollectController");
        var collectNode = HourlyBonusCollectController.createFromCCB();
        collectNode.controller.initWithCollectData(gameCollectMap, starNum, isInGame, closeCallback);
        collectNode.controller.popup();
    },

    popupHourlyGameDlg: function () {
        var HourlyBonusController = require("../../social/controller/HourlyBonusController");
        var hourlyBonusNode = HourlyBonusController.createFromCCB();
        hourlyBonusNode.controller.popup();
    },

    popupHourlyGameCardInfoDlg: function (cardId) {
        var HourlyBonusCardInfoController = require("../../social/controller/HourlyBonusCardInfoController");
        var cardInfoNode = HourlyBonusCardInfoController.createFromCCB();
        cardInfoNode.controller.initWithCard(cardId);
        cardInfoNode.controller.popup();
    },

    popupHourlyGameCollectCardDlg: function (cardId) {
        var HourlyBonusUnlockCardController = require("../../social/controller/HourlyBonusUnlockCardController");
        var hourlyBonusUnlockCardNode = HourlyBonusUnlockCardController.createFromCCB();
        hourlyBonusUnlockCardNode.controller.initWithCard(cardId);
        hourlyBonusUnlockCardNode.controller.popup();
    }
};

module.exports = SocialPopupMan;