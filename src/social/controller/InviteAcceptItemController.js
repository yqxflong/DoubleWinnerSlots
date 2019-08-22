/**
 * Created by qinning on 15/5/6.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");

var InviteAcceptItemController = function() {
    this._friendHeadIcon = null;
    this._friendNameLabel = null;
    this._infoLabel = null;
    this._bgSpr = null;

    this.itemWidth = 0;
    this.itemHeight = 0;

    this.imgWidth = 0;
    this.imgHeight = 0;
};


Util.inherits(InviteAcceptItemController,BaseCCBController);

InviteAcceptItemController.prototype.onEnter = function () {

};

InviteAcceptItemController.prototype.onExit = function () {

};

InviteAcceptItemController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.itemWidth = this._bgSpr.width;
    this.itemHeight = this._bgSpr.height;

    this.imgWidth = this._friendHeadIcon.width;
    this.imgHeight = this._friendHeadIcon.height;

    this._infoLabel.setString(Util.sprintf("Yes, I accept your invitation to\nGrandWin Casino - Free Slots!"));
};

InviteAcceptItemController.prototype.initWith = function(reward) {
    var fbRewardData = JSON.parse(reward.rewardData);
    var name = fbRewardData.inviteefbName;
    var id = fbRewardData.inviteefbId;
    this._friendNameLabel.setString(Util.omitText(name, 10));
    var picUrl = Util.getFacebookAvatarUrl(id, this.imgWidth, this.imgHeight);
    if (reward) {
        this._friendHeadIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_accept_head.png"));
    }
    if (picUrl) {
        var self = this;
        Util.loadRemoteImg(picUrl, function (error, tex, extra) {
            if (!error && tex && (id === extra)) {
                if(cc.sys.isObjectValid(self._friendHeadIcon)) {
                    var newScaleX = self.imgWidth / tex.width;
                    var newScaleY = self.imgHeight / tex.height;
                    self._friendHeadIcon.initWithTexture(tex, cc.rect(0, 0, tex.width, tex.height));
                    self._friendHeadIcon.scaleX = newScaleX;
                    self._friendHeadIcon.scaleY = newScaleY;
                }
            }
        }, id);
    }
};

InviteAcceptItemController.createFromCCB = function() {
    return Util.loadNodeFromCCB("facebook/facebook_accept_item.ccbi", null, "InviteAcceptItemController", new InviteAcceptItemController());
};

module.exports = InviteAcceptItemController;