/**
 * Created by JianWang on 7/8/16.
 */

var Util = require("../common/util/Util");
var AudioHelper = require("../common/util/AudioHelper");
var BaseCCBController = require("../common/controller/BaseCCBController");
var IncentiveAdMan = require("./IncentiveAdMan");
var IncentiveAppStates = require("./IncentiveAppStates");
var DeviceInfo = require("../common/util/DeviceInfo");
var IncentiveAdItemController = function () {

    this._item = null;
    this._icon = null;
    this._gemIcon = null;
    this._coinIcon = null;
    this._valueLabel = null;
    this._desLabel = null;
    this._appName = null;
    this._contentbg = null;
    this.ad = null;
};

Util.inherits(IncentiveAdItemController, BaseCCBController);

IncentiveAdItemController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

IncentiveAdItemController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

IncentiveAdItemController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

IncentiveAdItemController.prototype.initWithAd = function (ad) {
    this.ad = ad;

    this._appName.setString(this.ad.appName);

    if(this.ad.rType == 0)
    {
        this._gemIcon.visible = true;
        this._coinIcon.visible = false;
    }
    else
    {
        this._gemIcon.visible = false;
        this._coinIcon.visible = true;
    }
    this._valueLabel.setString(Util.getCommaNum(this.ad.rValue));

    this._desLabel.setString(this.ad.des);

    this.updateItem(this.ad.state);
    this.updateIcon();

};

IncentiveAdItemController.prototype.appleClicked = function () {
    AudioHelper.playBtnClickSound();

    var state = IncentiveAdMan.getInstance().onClickIncentiveAd(this.ad.appId);

    if(state != this.ad.state)
    {
        this.ad.state = state;
        this.updateItem(state);
    }
};

IncentiveAdItemController.prototype.getContentSize = function (state) {
    return this._contentbg.getContentSize();

}
IncentiveAdItemController.prototype.updateItem = function (state) {
   var sprite = "";
   var spriteselect = "";
   switch (state)
   {
       case IncentiveAppStates.INCENTIVE_APP_INIT:
           sprite = "incentivead_b_down.png";
           spriteselect = "incentivead_b_down_select.png";
           break;
       case IncentiveAppStates.INCENTIVE_APP_CLICK:
           sprite = "incentivead_b_down.png";
           spriteselect = "incentivead_b_down_select.png";
           if(DeviceInfo.isAppInstalled(this.ad.scheme) || !cc.sys.isNative)
           {
               sprite = "incentivead_b_collect_gold.png";
               spriteselect = "incentivead_b_collect_gold_select.png";
           }
           break;
       case IncentiveAppStates.INCENTIVE_APP_INSTALLED_REWARD:
           sprite = "incentivead_b_collect_gray.png";
           spriteselect = "incentivead_b_collect_gray.png";
           break;
       default:
           break;
   }
    if(sprite != "")
    {
        var itemSpriteframe = cc.spriteFrameCache.getSpriteFrame(sprite);
        var itemspriteselectframe = cc.spriteFrameCache.getSpriteFrame(spriteselect);
        this._item.setNormalSpriteFrame(itemSpriteframe);
        this._item.setSelectedSpriteFrame(itemspriteselectframe);
        this._item.setDisabledSpriteFrame(itemSpriteframe);
    }
};

IncentiveAdItemController.prototype.updateIcon = function () {
    if(!this.ad  || !this._icon)
        return;

    if (this.ad.iconURL != null) {
        var self = this;
        Util.loadRemoteImg(this.ad.iconURL, function (error, tex, extra) {
            if (!error && tex) {

                sp = new cc.Sprite(tex);
                var width = self._icon.getContentSize().width * self._icon.getScaleX();
                var height = self._icon.getContentSize().height * self._icon.getScaleY();
                self._icon.setSpriteFrame(sp.getSpriteFrame());

                cc.log(IncentiveAdItemController);
                cc.log(sp.getContentSize().width);
                cc.log(sp.getContentSize().height);

                var xScale = width / self._icon.getContentSize().width;
                var yScale = height / self._icon.getContentSize().height;

                self._icon.setScaleX(xScale);
                self._icon.setScaleY(yScale);
            }
        }, this.ad.iconURL);
    }

}
IncentiveAdItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("incentive_ad/incentivead_bar.ccbi", null, "IncentiveAdItemController", new IncentiveAdItemController());
};


module.exports = IncentiveAdItemController;