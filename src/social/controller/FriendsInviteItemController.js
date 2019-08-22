var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var friendInfo = require("../entity/FriendInfo");

/**
 * Created by alanmars on 15/5/21.
 */
var FriendsInviteItemController = function () {
    BaseCCBController.call(this);

    this._friendBg = null;
    this._friendsNameLabel = null;
    this._friendsIcon = 0;

    this.friendInfo = null;
};

Util.inherits(FriendsInviteItemController, BaseCCBController);

/**
 * @param {FriendInfo} friendInfo
 */
FriendsInviteItemController.prototype.initWithFriendInfo = function (friendInfo) {
    this.friendInfo = friendInfo;
    this._friendsNameLabel.setString(Util.omitText(this.friendInfo.name, 8));
    Util.scaleCCLabelBMFont(this._friendsNameLabel, 87);
    var picUrl = this.friendInfo.url;
    cc.log(picUrl);
    if (this.friendInfo) {
        this._friendsIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_head.png"));
    }
    if (picUrl) {
        var self = this;
        Util.loadRemoteImg(picUrl, function (error, tex, extra) {
            if (!error && tex && self.friendInfo && (self.friendInfo.id === extra)) {
                if(cc.sys.isObjectValid(self._friendsIcon)) {
                    self._friendsIcon.initWithTexture(tex, cc.rect(0, 0, tex.width, tex.height));
                }
            }
        }, this.friendInfo.id);
    }

    this.changeSelectState();
};

FriendsInviteItemController.prototype.changeSelectState = function () {
    if(this.friendInfo.isSelected) {
        this._friendBg.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_b_friend1.png"));
    } else {
        this._friendBg.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_b_friend2.png"));
    }
};

FriendsInviteItemController.prototype.getContentSize = function () {
    return this._friendBg.getContentSize();
};

FriendsInviteItemController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

FriendsInviteItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("facebook/facebook_invite_item.ccbi", null, "FriendsInviteItemController", new FriendsInviteItemController());
};

module.exports = FriendsInviteItemController;