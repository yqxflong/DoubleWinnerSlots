/**
 * Created by qinning on 15/5/8.
 */
var FaceBookMan = require("./FaceBookMan");
var C2SClaimReward = require("../protocol/C2SClaimReward");
var C2SGetReward = require("../protocol/C2SGetReward");
var ErrorCode = require("../../common/enum/ErrorCode");
var PlayerMan = require("../../common/model/PlayerMan");
var Util = require("../../common/util/Util");
var PopupMan = require("../../common/model/PopupMan");
var StorageController = require("../../common/storage/StorageController");
var C2SInviteFbFriends = require("../protocol/C2SInviteFbFriends");
var S2CSystemMessageNotice = require("../protocol/S2CSystemMessageNotice");
var C2SGetSystemMessage = require("../protocol/C2SGetSystemMessage");
var ProductType = require("../../common/enum/ProductType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var SharePosType = require("../enum/SharePosType");

var SocialMan = cc.Class.extend({
    PUBLISH_PERMISSION: "publish_actions",

    SHARE_INTERVAL: 10 * 60 * 1000,

    cacheRewards: null,

    lastShareTimeStamp: 0,

    ctor: function(){
        this.cacheRewards = [];
    },

    /**
     * @param {Function} func
     */
    fbLogin: function(func){
        FaceBookMan.getInstance().login(func);
    },

    /**
     * @returns {string}
     */
    getCacheFbId: function () {
        var facebookId = StorageController.getInstance().getItem("facebookId", "");
        return facebookId;
    },

    clearCacheFbId: function () {
        StorageController.getInstance().setItem("facebookId", "");
    },

    getReward: function () {
        var proto = new C2SGetReward();
        proto.send();
    },

    _isShowedRewardNotice: function(reward) {
        for(var i = 0; i < this.cacheRewards.length; ++i) {
            var tmpReward = this.cacheRewards[i];
            if(tmpReward.id === reward.id) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {S2CRewardNotice} rewardNotice
     */
    onRewardNotice: function(rewardNotice) {
        var RewardType = require("../enum/RewardType");
        var facebookInviteRewards = [];
        var rewards = rewardNotice.rewardList.rewards;
        for (var key in rewards) {
            var reward = rewards[key];
            if(reward.type == RewardType.FB_INVITE_REWARD) {
                facebookInviteRewards.push(reward);
            } else {
                if(!this._isShowedRewardNotice(reward)) {
                    this.cacheRewards.push(reward);
                    var self = this;
                    PopupMan.popupReward(reward, function (rewardId) {
                        for(var i = 0; i < self.cacheRewards.length; ++i) {
                            var tmpReward = self.cacheRewards[i];
                            if (tmpReward.id === rewardId) {
                                self.cacheRewards.splice(i, 1);
                                break;
                            }
                        }
                    });
                }
            }
        }

        if(facebookInviteRewards.length > 0) {
            PopupMan.popupInviteAcceptRewardDlg(facebookInviteRewards);
        }
    },

    /**
     * @param {Array.<number>} rewardIdList
     */
    claimReward: function(rewardIdList) {
        var proto = new C2SClaimReward();
        proto.rewardIdList = rewardIdList;
        proto.send();
    },

    /**
     * @param {S2CClaimReward} proto
     */
    onClaimReward: function(proto) {
        for (var i = 0; i < proto.rewardClaimList.length; ++ i) {
            var rewardClaim = proto.rewardClaimList[i];
            if (rewardClaim.errorCode == ErrorCode.SUCCESS) {
                var LogMan = require("../../log/model/LogMan");
                var ProductChangeReason = require("../../log/enum/ProductChangeReason");
                switch (rewardClaim.prodType) {
                    case ProductType.PRODUCT_TYPE_CHIP:
                        PlayerMan.getInstance().addChips(rewardClaim.chipCount, true);
                        LogMan.getInstance().userProductRecord(ProductChangeReason.CLAIM_REWARD, 0, rewardClaim.chipCount, 0, 0, 0);
                        break;
                    case ProductType.PRODUCT_TYPE_GEM:
                        PlayerMan.getInstance().addGems(rewardClaim.chipCount, true);
                        LogMan.getInstance().userProductRecord(ProductChangeReason.CLAIM_REWARD, rewardClaim.chipCount, 0, 0, 0, 0);
                        break;
                    case ProductType.PRODUCT_TYPE_STAR:
                        PlayerMan.getInstance().addStars(rewardClaim.chipCount, true);
                        LogMan.getInstance().userProductRecord(ProductChangeReason.CLAIM_REWARD, 0, 0, 0, rewardClaim.chipCount, 0);
                        break;
                }
            }
        }
    },

    inviteFBFriends: function (friendsIds) {
        var c2sInviteFbFriends = new C2SInviteFbFriends();
        c2sInviteFbFriends.fbIdList = friendsIds;
        c2sInviteFbFriends.send();
    },

    /**
     * get system message notice
     */
    getSystemMessageNotice: function () {
        var c2sGetSystemNotice = new C2SGetSystemMessage();
        c2sGetSystemNotice.send();
    },

    /**
     *
     * @param {S2CSystemMessageNotice} systemMessageNotice
     */
    onGetSystemMessageNotice: function (systemMessageNotice) {
        var msgMap = systemMessageNotice.msgMap;
        for(var key in msgMap) {
            var msg = msgMap[key];
            var msgArr = Util.getSplitArr(msg.msgStr, 30, " ");
            PopupMan.popupCommonDialog("SYSTEM NOTICE", msgArr, "Ok", null, null, true, false);
        }
    },

    sendClaimKeyReward: function (rewardKey) {
        var C2SClaimKeyReward = require("../protocol/C2SClaimKeyReward");
        var c2s = new C2SClaimKeyReward();
        c2s.rewardKey = rewardKey;
        c2s.send();
    },

    onClaimKeyReward: function (s2cClaimKeyReward) {
        PopupMan.closeIndicator();
        switch(s2cClaimKeyReward.errorCode) {
            case ErrorCode.SUCCESS:
                PopupMan.popupRewardKeyDlg(s2cClaimKeyReward);
                break;
            case ErrorCode.Social.REWARD_KEY_NOT_EXIST:
                PopupMan.popupCommonDialog("NOTICE", ["The promotion code you are", "trying to redeem appears to", "have been entered incorrectly."], "Confirm");
                break;
            case ErrorCode.Social.REWARD_KEY_EXPIRE:
                PopupMan.popupCommonDialog("NOTICE", ["The promotion code you are", "trying to redeem is no", "longer valid."], "Confirm");
                break;
            case ErrorCode.Social.REWARD_KEY_CLAIMED:
                PopupMan.popupCommonDialog("NOTICE", ["The promotion code you are", "trying to redeem appears to", "have been claimed."], "Confirm");
                break;
        }
    },

    sendFbNoticeClick: function (notiId) {
        var C2SFbNotiClick = require("../protocol/C2SFbNotiClick");
        var c2s = new C2SFbNotiClick();
        c2s.notiId = notiId;
        c2s.send();
    },
     /**
     * @param proto {S2CClaimVideoAdReward}
     */
    onClaimVideoAdReward: function (proto) {
        if (proto.errorCode != ErrorCode.SUCCESS) {
            return;
        }
        var Reward = require("../../social/entity/Reward");
        var RewardType = require("../../social/enum/RewardType");
        var reward = new Reward();
        reward.chipCount = proto.chips;
        reward.type = RewardType.REWARD_VIDEO_REWARD;
        PopupMan.popupReward(reward, null);
    },

    shareWithPermission: function (sharePos, callback, param1) {
        if(Util.getCurrentTime() - this.lastShareTimeStamp < this.SHARE_INTERVAL){
            return;
        }
        this.lastShareTimeStamp = Util.getCurrentTime();

        var facebookMan = FaceBookMan.getInstance();
        var self = this;
        facebookMan.hasPermission(this.PUBLISH_PERMISSION, function (hasPermission) {
            if (hasPermission) {
                self.shareToFB(sharePos, callback, param1);
            } else {
                facebookMan.loginWithPermissions([self.PUBLISH_PERMISSION], function (type, msg) {
                    if (type === 0 && msg && msg.permissions.indexOf(self.PUBLISH_PERMISSION) !== -1) {
                        self.shareToFB(sharePos, callback, param1);
                    } else {
                        callback(1);
                    }
                });
            }
        });
    },

    shareToFB: function (sharePos, callback, param1) {
        var shareConfigJson = Util.loadJson("config/share_config.json");
        var shareConfig;

        var name;
        var message;
        var caption;
        var description;
        var picture;
        var link;

        switch(sharePos) {
            case SharePosType.SHARE_BIG_WIN:
            {
                var randomValue = Util.randomNextInt(2);
                if(randomValue < 1) {
                    shareConfig = shareConfigJson.bigWin1;
                }
                else {
                    shareConfig = shareConfigJson.bigWin2;
                }

                name = shareConfig.name;
                message = shareConfig.message;
                caption = shareConfig.caption;
                description = Util.sprintf(shareConfig.description, PlayerMan.getInstance().player.fbName, Util.getCommaNum(param1));
                picture = shareConfig.picture;
                link = shareConfig.link;
            }
                break;
            case SharePosType.SHARE_TASK_FINISH:
            {
                shareConfig = shareConfigJson.taskFinish;

                name = Util.sprintf(shareConfig.name, Util.getCommaNum(param1));
                message = shareConfig.message;
                caption = shareConfig.caption;
                description = shareConfig.description;
                picture = shareConfig.picture;
                link = shareConfig.link;
            }
                break;
            default:
                break;
        }

        link = Util.sprintf("%s?playerId=%s&shareType=%s", link, PlayerMan.getInstance().playerId, "bigwin");

        var self = this;
        FaceBookMan.getInstance().shareFeed(name, message, caption, description, picture, link, function (errorCode) {
            callback(errorCode);
        });
     }
});

SocialMan._instance = null;
SocialMan._firstUseInstance = true;

/**
 *
 * @returns {SocialMan}
 */
SocialMan.getInstance = function () {
    if (SocialMan._firstUseInstance) {
        SocialMan._firstUseInstance = false;
        SocialMan._instance = new SocialMan();
    }
    return SocialMan._instance;
};

module.exports = SocialMan;