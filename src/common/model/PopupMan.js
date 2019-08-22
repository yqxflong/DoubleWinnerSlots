var LevelUpController = require("../controller/LevelUpController");
var CommonDialogController = require("../controller/CommonDialogController");
var SettingController = require("../controller/SettingController");
var RewardType = require("../../social/enum/RewardType");
var PrizePoolRewardController = require("../../slot/controller/PrizePoolRewardController");
var ProgressIndicatorController = require("../controller/ProgressIndicatorController");
var ProgressTipsIndicatorController = require("../controller/ProgressTipsIndicatorController");
var SystemRewardController = require("../../social/controller/SystemRewardController");
var BonusType = require("../../slot/enum/BonusType");
var FreeSpinController = require("../../slot/controller/FreeSpinController");
var FreeSpinRewardController = require("../../slot/controller/FreeSpinRewardController");
var FreeSpinStartController = require("../../slot/controller/FreeSpinStartController");
var MessageDialogType = require("../events/MessageDialogType");

var NETWORK_ERROR_TIPS = ["Connection lost.", "Please check your network", "and retry."];
var SERVER_MAINTENCE_TIPS = ["Server is maintaining,"," please try again later."];
/**
 * Created by alanmars on 15/5/20.
 */
var PopupMan = {
    popupLevelUpDialog: function (level, rewardChips) {
        var levelUpDlg = LevelUpController.createFromCCB();
        levelUpDlg.controller.initWith(level, rewardChips);
        levelUpDlg.controller.popup();
    },

    /**
     * @param {string} title
     * @param {Array.<string>} infos
     * @param {string} buttonText
     * @param {function} confirmCallback
     * @param {function} closeCallback
     * @param {boolean} isShowClose
     * @param {boolean} closeOtherCommonDialog
     */
    popupCommonDialog: function (title, infos, buttonText, confirmCallback, closeCallback, isShowClose, closeOtherCommonDialog) {
        if(cc.isUndefined(isShowClose)) {
            isShowClose = true;
        }
        if(cc.isUndefined(closeOtherCommonDialog)) {
            closeOtherCommonDialog = true;
        }
        if (closeOtherCommonDialog) {
            PopupMan.closeCommonDialog();
        }
        var commonDialogController = CommonDialogController.createFromCCB();

        commonDialogController.controller.initWith(title, infos, buttonText, confirmCallback, closeCallback, isShowClose);
        commonDialogController.controller.popup();
    },

    /**
     * @param {string} title
     * @param {Array.<string>} infos
     * @param {string} confirmText
     * @param {string} cancelText
     * @param {function} confirmCallback
     * @param {function} closeCallback
     * @param {boolean} closeOtherCommonDialog
     */
    popupCommonYesNoDialog: function (title, infos, confirmText, cancelText, confirmCallback, closeCallback, closeOtherCommonDialog) {
        if(cc.isUndefined(closeOtherCommonDialog)) {
            closeOtherCommonDialog = true;
        }
        if (closeOtherCommonDialog) {
            PopupMan.closeCommonDialog();
        }
        var commonDialogController = CommonDialogController.createFromCCB();
        commonDialogController.controller.initWithYesNoDlg(title, infos, confirmText, cancelText, confirmCallback, closeCallback);
        commonDialogController.controller.popup();
    },

    /**
     * @param {string} title
     * @param {Array.<string>} infos
     * @param {Array.<cc.color>} colors
     * @param {string} buttonText
     * @param {function} confirmCallback
     * @param {function} closeCallback
     * @param {boolean} isShowClose
     * @param {boolean} closeOtherCommonDialog
     */
    popupCommonDialogWithColors: function (title, infos, colors, buttonText, confirmCallback, closeCallback, isShowClose, closeOtherCommonDialog) {
        if(cc.isUndefined(isShowClose)) {
            isShowClose = true;
        }
        if(cc.isUndefined(closeOtherCommonDialog)) {
            closeOtherCommonDialog = true;
        }
        if (closeOtherCommonDialog) {
            PopupMan.closeCommonDialog();
        }
        var commonDialogController = CommonDialogController.createFromCCB();

        commonDialogController.controller.initWithColors(title, infos, colors, buttonText, confirmCallback, closeCallback, isShowClose);
        commonDialogController.controller.popup();
    },

    /**
     * @param {string} title
     * @param {Array.<string>} infos
     * @param {Array.<cc.color>} colors
     * @param {string} confirmText
     * @param {string} cancelText
     * @param {function} confirmCallback
     * @param {function} closeCallback
     * @param {boolean} closeOtherCommonDialog
     */
    popupCommonYesNoDialogWithColors: function (title, infos, colors, confirmText, cancelText, confirmCallback, closeCallback, closeOtherCommonDialog) {
        if(cc.isUndefined(closeOtherCommonDialog)) {
            closeOtherCommonDialog = true;
        }
        if (closeOtherCommonDialog) {
            PopupMan.closeCommonDialog();
        }
        var commonDialogController = CommonDialogController.createFromCCB();
        commonDialogController.controller.initWithYesNoDlgColors(title, infos, colors, confirmText, cancelText, confirmCallback, closeCallback);
        commonDialogController.controller.popup();
    },

    closeCommonDialog: function () {
        CommonDialogController.close();
    },

    popupSettingDialog: function () {
        var settingNode = SettingController.createFromCCB();
        settingNode.controller.popup();
    },

    popupStoreDialog: function (storeType) {
        var StoreUISceneController = require("../../store/controller/StoreUISceneController");
        var storePopup = StoreUISceneController.createFromCCB();
        storePopup.controller.initWithStoreType(storeType);
        storePopup.controller.popup();
    },

    popupOutOfChipsError: function () {
        var StoreType = require("../../store/enum/StoreType");
        PopupMan.popupStoreDialog(StoreType.STORE_TYPE_COINS);
    },

    popupInviteAcceptRewardDlg: function (rewardList) {
        var InviteAcceptController = require("../../social/controller/InviteAcceptController");
        var node = InviteAcceptController.createFromCCB();
        node.controller.initWith(rewardList);
        node.controller.popup();
    },

    /**
     * @param {Reward} reward
     */
    popupReward: function (reward, closeCallback) {
        switch (reward.type) {
            case RewardType.PRIZE_POOL_REWARD:
            {
                var prizePoolRewardDlg = PrizePoolRewardController.createFromCCB();
                prizePoolRewardDlg.controller.initWith(reward);
                prizePoolRewardDlg.controller.initWithCallback(closeCallback);
                prizePoolRewardDlg.controller.popup();
                break;
            }
            case RewardType.SYSTEM_REWARD:
            case RewardType.REWARD_VIDEO_REWARD:
            case RewardType.REWARD_INCENTIVE_AD:
            {
                var systemRewardController = SystemRewardController.createFromCCB();
                systemRewardController.controller.initWith(reward);
                systemRewardController.controller.popup();
                break;
            }
            case RewardType.BIND_FACEBOOK_REWARD:
            {
                var systemRewardController = SystemRewardController.createFromCCB();
                systemRewardController.controller.initWith(reward);
                systemRewardController.controller.popup();
            }
        }
    },

    popupIndicator: function () {
        var indicatorController = ProgressIndicatorController.createFromCCB();
        indicatorController.controller.popup();
    },

    closeIndicator: function () {
        ProgressIndicatorController.close();
    },

    popupTipsIndicator: function (tipInfo, isSmallTips) {
        var indicatorController = ProgressTipsIndicatorController.createFromCCB();
        indicatorController.controller.initWith(tipInfo, isSmallTips);
        indicatorController.controller.popup();
    },

    closeTipsIndicator: function () {
        ProgressIndicatorController.close();
    },

    popupNetWorkError: function () {
        var PomeloClient = require("../net/PomeloClient");
        var Config = require("../util/Config");
        var PlayerMan = require("../model/PlayerMan");
        var StorageController = require("../storage/StorageController");
        var SceneMan = require("../model/SceneMan");
        PopupMan.popupCommonDialog("ERROR", NETWORK_ERROR_TIPS, "Ok", function () {
            var DialogManager = require("../popup/DialogManager");
            DialogManager.getInstance().closeAll();
            var host = StorageController.getInstance().getItem("host", "");
            var port = StorageController.getInstance().getItem("port", "");
            if (host && port && host.length > 0 && port.length > 0) {
                var SceneType = require("../enum/SceneType");
                var SceneMan = require("../model/SceneMan");
                SceneMan.getInstance().setCurSceneType(SceneType.LOGIN);
                SceneMan.getInstance().switchScene(SceneType.SLOT_LOBBY, true);
                PomeloClient.getInstance().init(host, port, function () {
                    PlayerMan.getInstance().reLogin();
                });
            }
        }, null, false);
    },

    popupLeaveGameDlg: function () {
        this.popupCommonYesNoDialog("LEAVE GAME", ["Are you sure you want", "to leave the game?"], "Stay", "Leave", function () {}, function () {
            cc.director.end();
        });
    },

    popupRate: function () {
        if (cc.sys.isNative) {
            jsb_wtc.RateHelper.getInstance().logEvent();
        }
    },

    popupLimitedTimeStore: function (countdown, filePath, url) {
        cc.log("popupLimitedTimeStore " + url + " filePath = " + filePath);
        PopupMan.popupRemoteDownloadDialog(url, filePath, function () {
            var ccbPath = filePath + "/casino_store_discount_dialog.ccbi";
            if(!cc.sys.isNative) {
                ccbPath = url + "/" + filePath + "/casino_store_discount_dialog.ccbi";
            }

            var StoreLimitedOfferController = require("../../store/controller/StoreLimitedOfferController");
            var storeLimitedOfferNode = StoreLimitedOfferController.createFromCCB(ccbPath);
            if(storeLimitedOfferNode) {
                storeLimitedOfferNode.controller.initWithTime(countdown);
                if(!cc.sys.isNative) {
                    storeLimitedOfferNode.controller.initBgSprite(url + "/" + filePath + "/casino_store_discount_dialog.png");
                }
                storeLimitedOfferNode.controller.popup();
            }
        }, false);
    },

    popupRemoteDownloadDialog: function (url, dir, cb, showIndicator) {
        if(cc.isUndefined (showIndicator)){
            showIndicator = true;
        }
        if(showIndicator){
            PopupMan.popupTipsIndicator("Loading...", true);
        }

        if(cc.sys.isNative) {
            var ResourceMan = require("../../common/model/ResourceMan");
            ResourceMan.getInstance().chapterAssetsFromRemoteBegin(url,dir, function(error) {
                PopupMan.closeTipsIndicator();
                if(!error) {
                    cb.call(this);
                } else {
                    if(showIndicator){
                        PopupMan.popupCommonDialog("ERROR",["Resource download error, please retry!"],["OK"], null, false);
                    }
                }
            });
        }
        else
        {
            var jsonResource = url + "/" + dir +"/resource_list.json";
            cc.loader.loadJson(jsonResource, function(error, resultArr) {
                if(!error) {
                    var newResultArr = [];
                    for(var index = 0; index < resultArr.length; index++) {
                        var resultUrl = url + "/" + resultArr[index];
                        cc.log("Download Url: " + resultUrl);
                        newResultArr.push(resultUrl);
                    }
                    cc.loader.load(newResultArr,
                        function (result, count, loadedCount) {

                        }, function () {
                            cc.log("Download Success!!!");
                            PopupMan.closeTipsIndicator();
                            cb.call(this);
                        });
                } else {
                    cc.log("load resource error");
                    if(showIndicator){
                        PopupMan.popupCommonDialog("ERROR",["Resource download error, please retry!"],["OK"], null, false);
                    }
                }
            });
        }
    },

    popupPayTable: function (subjectTmpl) {
        var PayTableController = require("../../slot/controller/PayTableController");
        var dlg = PayTableController.createFromCCB();
        dlg.controller.initWith(subjectTmpl);
        dlg.controller.popup();
    },

    popupFreeSpinDlg: function (rewardValue, messageDlgType) {
        var freeSpinNode = FreeSpinStartController.createFromCCB();
        freeSpinNode.controller.initWith(rewardValue, messageDlgType);
        freeSpinNode.controller.popup();
    },

    popupSlotsRewardsDlg: function (rewardValue, messageDlgType) {
        var freeSpinNode = FreeSpinRewardController.createFromCCB();
        freeSpinNode.controller.initWith(rewardValue, messageDlgType);
        freeSpinNode.controller.popup();
    },

    /**
     *
     * @param {BetAccuJackpotSubInfo} jackpotSubInfo
     */
    popupJackpotSelectBetDlg: function (jackpotSubInfo) {
        var JackpotSelectBetController = require("../../slot/controller/JackpotSelectBetController");
        var jackpotSelectBetNode = JackpotSelectBetController.createFromCCB();
        jackpotSelectBetNode.controller.initWith(jackpotSubInfo);
        jackpotSelectBetNode.controller.popup();
    },

    popupRewardKeyDlg: function (s2cClaimKeyReward) {
        var systemRewardController = SystemRewardController.createFromCCB();
        systemRewardController.controller.initWithKeyReward(s2cClaimKeyReward);
        systemRewardController.controller.popup();
    },

    popupServerMaintence: function () {
        var PomeloClient = require("../net/PomeloClient");
        var Config = require("../util/Config");
        var PlayerMan = require("../model/PlayerMan");
        var StorageController = require("../storage/StorageController");
        var SceneMan = require("../model/SceneMan");
        PopupMan.popupCommonDialog("NOTICE", SERVER_MAINTENCE_TIPS, "Retry", function () {
            var DialogManager = require("../popup/DialogManager");
            DialogManager.getInstance().closeAll();
            var host = StorageController.getInstance().getItem("host", "");
            var port = StorageController.getInstance().getItem("port", "");
            if (host && port && host.length > 0 && port.length > 0) {
                var SceneType = require("../enum/SceneType");
                var SceneMan = require("../model/SceneMan");
                SceneMan.getInstance().setCurSceneType(SceneType.LOGIN);
                SceneMan.getInstance().switchScene(SceneType.SLOT_LOBBY, true);
                PomeloClient.getInstance().init(host, port, function () {
                    PlayerMan.getInstance().reLogin();
                });
            }
        }, null, false);
    },

    /**
     * @param {ShopProduct} shopProduct
     */
    popupSuperSaleDlg: function (shopProduct) {
        var StoreSuperSaleController = require("../../store/controller/StoreSuperSaleController");
        var superSaleNode = StoreSuperSaleController.createFromCCB();
        superSaleNode.controller.initWith(shopProduct);
        superSaleNode.controller.popup();
    },


    popupNoWifiError: function () {
        PopupMan.popupCommonDialog("NOTICE", ["On your device please toggle", "wifi on then try again."], "Confirm");
    },

    popupBindEmailDlg: function () {
        var BindEmailController = require("../../social/controller/BindEmailController");
        var bindEmailNode = BindEmailController.createFromCCB();
        bindEmailNode.controller.popup();
    },

    popupBindFbDlg: function () {
        var SocialLoginController = require("../../social/controller/SocialLoginController");
        var socialLoginNode = SocialLoginController.createFromCCB();
        socialLoginNode.controller.popup();
    },

    popupLikeUsDlg: function () {
        var LikeUsController = require("../../social/controller/LikeUsController");
        var likeUsNode = LikeUsController.createFromCCB();
        likeUsNode.controller.popup();
    },

    popupTaskCompletedDlg: function (taskLevelUp) {
        var TaskCompletedController = require("../../task/controller/TaskCompletedController");
        var taskCompletedNode = TaskCompletedController.createFromCCB();
        taskCompletedNode.controller.initWith(taskLevelUp);
        taskCompletedNode.controller.popup();
    },

    popupTaskFailedDlg: function (replayCallback) {
        var TaskFailedController = require("../../task/controller/TaskFailedController");
        var taskFailedNode = TaskFailedController.createFromCCB();
        taskFailedNode.controller.initWith(replayCallback);
        taskFailedNode.controller.popup();
    },

    popupTaskStartDlg: function (taskConfig, callback) {
        var TaskStartController = require("../../task/controller/TaskStartController");
        var taskStartNode = TaskStartController.createFromCCB();
        taskStartNode.controller.initWith(taskConfig, callback);
        taskStartNode.controller.popup();
    },

    popupDailyTaskDlg: function () {
        var TaskMan = require("../../task/model/TaskMan");
        if (TaskMan.getInstance().getDailyTaskCompleted()) {
            var DailyChallengeCompletedController = require("../../task/controller/DailyChallengeCompletedController");
            var dailyChallengeCompletedNode = DailyChallengeCompletedController.createFromCCB();
            dailyChallengeCompletedNode.controller.popup();
        } else {
            var DailyChallengeController = require("../../task/controller/DailyChallengeController");
            var dailyChallengeNode = DailyChallengeController.createFromCCB();
            dailyChallengeNode.controller.popup();
        }
    },

    popupDailyTaskCompleteOneDlg: function () {
        var DailyTaskCompletedController = require("../../task/controller/DailyTaskCompletedController");
        var dailyTaskCompletedNode = DailyTaskCompletedController.createFromCCB();
        dailyTaskCompletedNode.prototype.popup();
    },

    popupFreeModeDlg: function () {
        var LobbyFreeModeController = require("../controller/LobbyFreeModeController");
        var lobbyFreeModeNode = LobbyFreeModeController.createFromCCB();
        lobbyFreeModeNode.controller.popup();
    },

    popupTaskDestinyDlg: function (taskLevelConfig) {
        var TaskDestinyController = require("../../task/controller/TaskDestinyController");
        var taskDestinyNode = TaskDestinyController.createFromCCB();
        taskDestinyNode.controller.initWith(taskLevelConfig);
        taskDestinyNode.controller.popup();
    },

    popupVIPRewardDlg: function () {
        var StoreVIPCollectController = require("../../store/controller/StoreVIPCollectController");
        var vipCollectNode = StoreVIPCollectController.createFromCCB();
        vipCollectNode.controller.popup();
    },

    popupSlotLevelProgressDlg: function () {
        var SlotLevelProgressController = require("../../slot/controller/SlotLevelProgressController");
        var dlg = SlotLevelProgressController.createFromCCB();
        dlg.controller.popup();
    },

    popupGuideDlg: function () {
        var GuideController = require("../controller/GuideController");
        var dlg = GuideController.createFromCCB();
        dlg.controller.popup();
    },
    popupDailyDiscountDlg: function () {
        var StoreDailyDiscountController = require("../../store/controller/StoreDailyDiscountController");
        var storeDailyDiscountNode = StoreDailyDiscountController.createFromCCB();
        storeDailyDiscountNode.controller.popup();
    }

};

module.exports = PopupMan;
