/**
 * Created by JianWang on 7/8/16.
 */
var C2SGetIncentiveAds = require("../social/protocol/C2SGetIncentiveAds");
var C2SUpdateIncentiveAds = require("../social/protocol/C2SUpdateIncentiveAds");
var DeviceInfo = require("../common/util/DeviceInfo");
var IncentiveAdsEvent = require("../common/events/IncentiveAdsEvent");
var EventDispatcher = require("../common/events/EventDispatcher");
var PlayerMan = require("../common/model/PlayerMan");
var PopupMan = require("../common/model/PopupMan");
var Config = require("../common/util/Config")
var IncentiveAppStates = require("./IncentiveAppStates");
var LogMan = require("../log/model/LogMan");
var Util = require("../common/util/Util");

var IncentiveAdMan = cc.Class.extend({
        _isInited: false,
        _isResOk:false,
        _isActive:false,
        _isShow:false,

        _resPath:"",
        _incentiveAds:[],
        _incentiveAppStates:{},
        _incentiveAdMap:{},
        _rewardAppIdMaps:{},

        ctor: function () {

        },
        getIncentiveAdsFromServer:function () {
            var proto = new C2SGetIncentiveAds();
            proto.send();
        },
        getIncentiveAds:function() {
            return this._incentiveAds;
        },
        onIncentiveAds:function (proto) {

            if(proto.resPath != this._resPath) {
                  this._resPath = proto.resPath;
            }
            this._incentiveAds = [];

            if(Config.getAppVersion > proto.maxVersion)
            {
                this._isActive = false;
            }
            this._isActive = proto.isActive;
            var tempIncentiveAds = [];

            for(var i = 0; i < proto.ads.length; i++)
            {
                var ad = proto.ads[i];
                var appid = ad.appId;
                if(proto.adStatus[appid] == null)
                {
                    this._incentiveAppStates[appid] = IncentiveAppStates.INCENTIVE_APP_INIT;
                }
                else
                {
                    this._incentiveAppStates[appid] = proto.adStatus[appid];
                }

                if((this._incentiveAppStates[appid] != IncentiveAppStates.INCENTIVE_APP_INSTALLED_REWARD && !DeviceInfo.isAppInstalled(ad.scheme)) ||
                    (this._incentiveAppStates[appid] != IncentiveAppStates.INCENTIVE_APP_INIT && (DeviceInfo.isAppInstalled(ad.scheme) || !cc.sys.isNative)))
                {
                    ad.state = this._incentiveAppStates[appid];
                    if(ad.state == IncentiveAppStates.INCENTIVE_APP_INSTALLED_REWARD)
                    {
                        tempIncentiveAds.push(ad);
                    }
                    else
                    {
                        this._incentiveAds.push(ad);
                    }
                }
            }

            for(var i = 0; i < tempIncentiveAds.length; i++)
            {
                this._incentiveAds.push(tempIncentiveAds[i]);
            }

            for(var i = 0; i < this._incentiveAds.length; i++)
            {
                this._incentiveAdMap[this._incentiveAds[i].appId] = this._incentiveAds[i];
            }

            EventDispatcher.getInstance().dispatchEvent(IncentiveAdsEvent.IncentiveAds_Dlg_Close, null);

            EventDispatcher.getInstance().dispatchEvent(IncentiveAdsEvent.IncentiveAds_Update, null);
        },

        onUpdateAdsState:function (proto) {
            PopupMan.closeTipsIndicator();
            if(this._incentiveAdMap[proto.appId] != null)
            {
                this._incentiveAppStates[proto.appId] = proto.status;
                this._incentiveAdMap[proto.appId].state = proto.status;

                if(proto.status == IncentiveAppStates.INCENTIVE_APP_INSTALLED_REWARD && proto.rewardValue > 0)
                {
                    EventDispatcher.getInstance().dispatchEvent(IncentiveAdsEvent.IncentiveAds_Update,{appId:proto.appId});


                    var Reward = require("../social/entity/Reward");
                    var RewardType = require("../social/enum/RewardType");
                    var reward = new Reward();
                    reward.chipCount = proto.rewardValue;
                    reward.type = RewardType.REWARD_INCENTIVE_AD;

                    PopupMan.popupReward(reward, null);
                 //   PlayerMan.getInstance().addMoney(proto.rewardValue, proto.rewardType, true, true);
                    
                    LogMan.getInstance().incentiveAdRecord("INCENTIVE_AD_REWARD", proto.appId);
                }
                EventDispatcher.getInstance().dispatchEvent(IncentiveAdsEvent.IncentiveAds_Update, null);
            }
        },
        shouldShow:function () {
            return  this.isActive();
        },

        isActive:function () {
            return this._isActive;
        },
        onClickIncentiveAd:function (appId) {

            if(this._incentiveAppStates[appId] == null || this._incentiveAdMap[appId] == null)
            {
                return;
            }

            var state = this._incentiveAppStates[appId];
            var newState = IncentiveAppStates.INCENTIVE_APP_INIT;

            switch (state)
            {
                case IncentiveAppStates.INCENTIVE_APP_INIT:
                {
                    newState = IncentiveAppStates.INCENTIVE_APP_CLICK;
                    this.updateIncentiveStatus(appId, IncentiveAppStates.INCENTIVE_APP_CLICK);
                }
                case IncentiveAppStates.INCENTIVE_APP_CLICK:
                {
                    newState = state;
                    var scheme = "";
                    if(this._incentiveAdMap[appId] != null)
                    {
                        scheme = this._incentiveAdMap[appId].scheme;
                    }
                    if(IncentiveAppStates.INCENTIVE_APP_CLICK == state && (DeviceInfo.isAppInstalled(scheme) || !cc.sys.isNative ))
                    {
                        this.updateIncentiveStatus(appId, IncentiveAppStates.INCENTIVE_APP_INSTALLED_REWARD);
                    }
                    else
                    {

                     //   EventDispatcher.getInstance().dispatchEvent(IncentiveAdsEvent.IncentiveAds_Dlg_Close);
                        var append = Util.sprintf("?appName=%s&playerId=%s",Config.appName, PlayerMan.getInstance().getPlayerId());
                        if(!cc.sys.isNative)
                            cc.sys.openURL(this._incentiveAdMap[appId].url + append);
                        else
                            cc.sys.openURL(this._incentiveAdMap[appId].url);
                    }
                }
                    break;
                default:
                    newState = state;
                    break;
            }
 
            if(this._incentiveAdMap[appId] != null)
            {
                this._incentiveAdMap[appId].state = newState;
                LogMan.getInstance().incentiveAdRecord("INCENTIVE_AD_CLICKED", appId);
            }

            return newState;
      },

      updateIncentiveStatus:function(appId, state){
        var proto = new C2SUpdateIncentiveAds();
        proto.appId = appId;
        proto.status = state;

        proto.send();

        if(state == IncentiveAppStates.INCENTIVE_APP_INSTALLED_REWARD) {
            PopupMan.popupTipsIndicator("Claiming...", true);
        }
    },

});

IncentiveAdMan._instance = null;
IncentiveAdMan._firstUseInstance = true;

/**
 *
 * @returns {IncentiveAdMan}
 */
IncentiveAdMan.getInstance = function () {
        if (IncentiveAdMan._firstUseInstance) {
                IncentiveAdMan._firstUseInstance = false;
                IncentiveAdMan._instance = new IncentiveAdMan();
        }
        return IncentiveAdMan._instance;
};

module.exports = IncentiveAdMan;