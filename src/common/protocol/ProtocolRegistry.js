var ProtocolType = require("../enum/ProtocolType");
var ProtocolMan = require("./ProtocolMan");
var S2CLogin = require("./S2CLogin");
var S2CSpin = require("../../slot/protocol/S2CSpin");
var S2CEnterRoom = require("../../slot/protocol/S2CEnterRoom");
var S2CUpdatePrizePoolPlayers = require("../../slot/protocol/S2CUpdatePrizePoolPlayers");
var S2CClaimDailyBonus = require("../../social/protocol/S2CClaimDailyBonus");
var S2CClaimHourlyBonus = require("../../social/protocol/S2CClaimHourlyBonus");
var S2CGetDailyBonus = require("../../social/protocol/S2CGetDailyBonus");
var S2CGetHourlyBonus = require("../../social/protocol/S2CGetHourlyBonus");
var S2CRewardNotice = require("../../social/protocol/S2CRewardNotice");
var S2CGetShops = require("../../store/protocol/S2CGetShops");
var S2CVerifyPurchase = require("../../store/protocol/S2CVerifyPurchase");
var S2CAdControl = require("../../ads/protocol/S2CAdControl");
var S2CClaimReward = require("../../social/protocol/S2CClaimReward");
var S2CPrizePoolResult = require("../../slot/protocol/S2CPrizePoolResult");
var S2CGetSubjects = require("../../slot/protocol/S2CGetSubjects");
var S2CFbIapNotice = require("../../store/protocol/S2CFbIapNotice");
var S2CSystemMessageNotice = require("../../social/protocol/S2CSystemMessageNotice");
var S2COtherWinJackpot = require("../../slot/protocol/S2COtherWinJackpot");
var S2CGetSubjectJackpotInfos = require("../../slot/protocol/S2CGetSubjectJackpotInfos");
var S2CGetJackpotRecords = require("../../slot/protocol/S2CGetJackpotRecords");
var S2CClaimMultiHourlyBonus = require("../../social/protocol/S2CClaimMultiHourlyBonus");
var S2CGetMultiHourlyBonus = require("../../social/protocol/S2CGetMultiHourlyBonus");
var S2CClaimKeyReward = require("../../social/protocol/S2CClaimKeyReward");
var S2CFbNotiClick = require("../../social/protocol/S2CFbNotiClick");
var S2CReadMails = require("../../social/protocol/S2CReadMails");
var S2CGetMails = require("../../social/protocol/S2CGetMails");
var S2CSendMail = require("../../social/protocol/S2CSendMail");
var S2CLikeUs = require("../../social/protocol/S2CLikeUs");
var S2CGetCurTask = require("../../task/protocol/S2CGetCurTask");
var S2CCompleteTask = require("../../task/protocol/S2CCompleteTask");
var S2CGetDailyTask = require("../../task/protocol/S2CGetDailyTask");
var S2CClaimDailyTaskReward = require('../../task/protocol/S2CClaimDailyTaskReward');
var S2CGetFriendTask = require("../../task/protocol/S2CGetFriendTask");
var S2CUnlockSubject = require("../../slot/protocol/S2CUnlockSubject");
var S2CSlotParam = require("../../slot/protocol/S2CSlotParam");
var S2CConsumePurchase = require("../../store/protocol/S2CConsumePurchase");
var S2CClaimVipDailyReward = require("../../store/protocol/S2CClaimVipDailyReward");
var S2CClaimHourlyGame = require('./../../social/protocol/S2CClaimHourlyGame');
var S2CGenHourlyGame = require('./../../social/protocol/S2CGenHourlyGame');
var S2CGetHourlyGame = require('./../../social/protocol/S2CGetHourlyGame');
var S2CUpgradeHourlyGameCard = require('./../../social/protocol/S2CUpgradeHourlyGameCard');
var S2CUnlockHourlyGame = require("../../social/protocol/S2CUnlockHourlyGame");
var S2CSyncDailyTask = require("../../task/protocol/S2CSyncDailyTask");
var S2CDailyShopPopup = require("../../store/protocol/S2CDailyShopPopup");
var S2CIncentiveAd = require("../../social/protocol/S2CIncentiveAd");
var S2CIncentiveStateUpdate = require("../../social/protocol/S2CIncentiveStateUpdate");
var S2CClaimVideoAdReward = require("../../ads/protocol/S2CClaimVideoAdReward");
/**
 * Created by alanmars on 15/4/23.
 */
var ProtocolRegistry = {
    register: function() {
        var protocolInstance = ProtocolMan.getInstance();
        protocolInstance.register(ProtocolType.Common.S2C_LOGIN, S2CLogin);

        protocolInstance.register(ProtocolType.Slot.S2C_SPIN, S2CSpin);
        protocolInstance.register(ProtocolType.Slot.S2C_ENTER_ROOM, S2CEnterRoom);
        protocolInstance.register(ProtocolType.Slot.S2C_UPDATE_PRIZE_POOL_PLAYERS, S2CUpdatePrizePoolPlayers);
        protocolInstance.register(ProtocolType.Slot.S2C_PRIZE_POOL_RESULT, S2CPrizePoolResult);
        protocolInstance.register(ProtocolType.Slot.S2C_GET_SUBJECTS, S2CGetSubjects);
        protocolInstance.register(ProtocolType.Slot.S2C_OTHER_WIN_JACKPOT, S2COtherWinJackpot);
        protocolInstance.register(ProtocolType.Slot.S2C_GET_SUBJECT_JACKPOT_INFOS, S2CGetSubjectJackpotInfos);
        protocolInstance.register(ProtocolType.Slot.S2C_GET_JACKPOT_RECORDS, S2CGetJackpotRecords);

        protocolInstance.register(ProtocolType.Social.S2C_REWARD_NOTICE, S2CRewardNotice);
        protocolInstance.register(ProtocolType.Social.S2C_GET_HOURLY_BONUS, S2CGetHourlyBonus);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_HOURLY_BONUS, S2CClaimHourlyBonus);
        protocolInstance.register(ProtocolType.Social.S2C_GET_DAILY_BONUS, S2CGetDailyBonus);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_DAILY_BONUS, S2CClaimDailyBonus);
        protocolInstance.register(ProtocolType.Social.S2C_GET_SHOPS, S2CGetShops);
        protocolInstance.register(ProtocolType.Social.S2C_VERIFY_PURCHASE, S2CVerifyPurchase);
        protocolInstance.register(ProtocolType.Social.S2C_AD_CONTROL, S2CAdControl);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_REWARD, S2CClaimReward);
        protocolInstance.register(ProtocolType.Social.S2C_FB_IAP_NOTICE, S2CFbIapNotice);
        protocolInstance.register(ProtocolType.Social.S2C_SYSTEM_MESSAGE_NOTICE, S2CSystemMessageNotice);
        protocolInstance.register(ProtocolType.Social.S2C_GET_MULTI_HOURLY_BONUS, S2CGetMultiHourlyBonus);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_MULTI_HOURLY_BONUS, S2CClaimMultiHourlyBonus);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_KEY_REWARD, S2CClaimKeyReward);
        protocolInstance.register(ProtocolType.Social.S2C_FB_NOTI_CLICK, S2CFbNotiClick);
        protocolInstance.register(ProtocolType.Social.S2C_GET_MAILS, S2CGetMails);
        protocolInstance.register(ProtocolType.Social.S2C_READ_MAILS, S2CReadMails);
        protocolInstance.register(ProtocolType.Social.S2C_SEND_MAIL, S2CSendMail);
        protocolInstance.register(ProtocolType.Social.S2C_LIKE_US, S2CLikeUs);
        protocolInstance.register(ProtocolType.Task.S2C_GET_CUR_TASK, S2CGetCurTask);
        protocolInstance.register(ProtocolType.Task.S2C_COMPLETE_TASK, S2CCompleteTask);
        protocolInstance.register(ProtocolType.Task.S2C_GET_DAILY_TASK, S2CGetDailyTask);
        protocolInstance.register(ProtocolType.Task.S2C_CLAIM_DAILY_TASK_REWARD, S2CClaimDailyTaskReward);
        protocolInstance.register(ProtocolType.Task.S2C_GET_FRIEND_TASK, S2CGetFriendTask);
        protocolInstance.register(ProtocolType.Task.S2C_SYNC_DAILY_TASK, S2CSyncDailyTask);
        protocolInstance.register(ProtocolType.Slot.S2C_UNLOCK_SUBJECT, S2CUnlockSubject);
        protocolInstance.register(ProtocolType.Slot.S2C_SLOT_PARAM, S2CSlotParam);
        protocolInstance.register(ProtocolType.Social.S2C_CONSUME_PURCHASE, S2CConsumePurchase);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_VIP_DAILY_REWARD, S2CClaimVipDailyReward);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_HOURLY_GAME, S2CClaimHourlyGame);
        protocolInstance.register(ProtocolType.Social.S2C_GEN_HOURLY_GAME, S2CGenHourlyGame);
        protocolInstance.register(ProtocolType.Social.S2C_GET_HOURLY_GAME, S2CGetHourlyGame);
        protocolInstance.register(ProtocolType.Social.S2C_UPGRADE_HOURLY_GAME_CARD, S2CUpgradeHourlyGameCard);
        protocolInstance.register(ProtocolType.Social.S2C_UNLOCK_HOURLY_GAME, S2CUnlockHourlyGame);
        protocolInstance.register(ProtocolType.Social.S2C_INCENTIVE_AD,S2CIncentiveAd);
        protocolInstance.register(ProtocolType.Social.S2C_INCENTIVE_STATE_UPDATE,S2CIncentiveStateUpdate);
        protocolInstance.register(ProtocolType.Social.S2C_DAILY_SHOP_POP_UP,S2CDailyShopPopup);
        protocolInstance.register(ProtocolType.Social.S2C_CLAIM_VIDEO_AD_REWARD,S2CClaimVideoAdReward);

    }
};

module.exports = ProtocolRegistry;