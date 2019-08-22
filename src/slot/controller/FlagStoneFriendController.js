/**
 * Created by qinning on 15/5/20.
 */

var Util = require("../../common/util/Util");
var EventDispatcher = require("../../common/events/EventDispatcher");
var BaseCCBController = require("./../../common/controller/BaseCCBController");


var FlagStoneFriendController = function() {
    this._friendIcon = null;

    this._fbId = null;
};

Util.inherits(FlagStoneFriendController,BaseCCBController);

FlagStoneFriendController.prototype.onEnter = function () {
};

FlagStoneFriendController.prototype.onExit = function () {
};

FlagStoneFriendController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

FlagStoneFriendController.prototype.initWithFBId = function (fbId) {
    if (this._fbId == fbId) return;
    this._fbId = fbId;
    var iconWidth = 60;
    var iconHeight = 60;
    var self = this;
    Util.loadRemoteImg(Util.getFacebookAvatarUrl(this._fbId, iconWidth, iconHeight), function (error, tex, extra) {
        if (!error && tex && (self._fbId === extra)) {
            if (cc.sys.isObjectValid(self._friendIcon)) {
                var spriteFrame = new cc.SpriteFrame(tex, cc.rect(0, 0, tex.width, tex.height));
                self._friendIcon.setSpriteFrame(spriteFrame);
                self._friendIcon.visible = true;
            }
        }
    }, this._fbId);
};

FlagStoneFriendController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/flagstone/slot_lobby_friends.ccbi", null, "FlagStoneFriendController", new FlagStoneFriendController());
};

module.exports = FlagStoneFriendController;