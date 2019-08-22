/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var PlayerMan = require("../../common/model/PlayerMan");
var Config = require("../../common/util/Config");
var ThemeName = require("../../common/enum/ThemeName");
var PrizePoolType = require("../enum/PrizePoolType");
var DeviceInfo = require("../../common/util/DeviceInfo");

var PrizePoolPlayerController = function (prizePoolType) {
    this._otherNode = null;
    this._rankLabel = null;
    this._scoreNumLabel = null;

    this._myNode = null;
    this._myRankLabel = null;
    this._myScoreNumLabel = null;

    /**
     * @type {cc.Sprite}
     * @private
     */
    this._headIcon = null;

    /**
     * @type {Player}
     * @private
     */
    this._player = null;

    this._prizePoolType = prizePoolType;
};


Util.inherits(PrizePoolPlayerController, BaseCCBController);

PrizePoolPlayerController.prototype.onEnter = function () {
};

PrizePoolPlayerController.prototype.onExit = function () {

};

PrizePoolPlayerController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * @param {PrizePoolPlayer} player
 */
PrizePoolPlayerController.prototype.bindData = function (player) {
    var iconWidth = 75;
    var iconHeight = 75;
    var defaultHeadFile = "";
    if (Config.themeName === ThemeName.THEME_WTC) {
        iconWidth = 53;
        iconHeight = 53;
        defaultHeadFile = "facebook_invite_head.png";
    } else {
        iconWidth = 75;
        iconHeight = 75;
        defaultHeadFile = "oldvegas_prizepool_head.png";
    }
    if (player) {
        var scoreStr;
        if (player.score < 10000000) {
            scoreStr = Util.getCommaNum(player.score);
        } else {
            scoreStr = Util.formatAbbrNum(player.score);
        }
        if (player.playerId != PlayerMan.getInstance().playerId) {
            this._otherNode.visible = true;
            this._myNode.visible = false;
            this._rankLabel.setString("#" + player.rank);
            this._scoreNumLabel.setString(scoreStr);
        } else {
            this._otherNode.visible = false;
            this._myNode.visible = true;
            this._myRankLabel.setString("#" + player.rank);
            this._myScoreNumLabel.setString(scoreStr);
        }

        var self = this;
        if (!this._player || this._player.playerId != player.playerId) {
            //the head must be reset if the rank is owned by another player
            if (this._player) {
                self._headIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(defaultHeadFile));
            }
            this._player = player;
            if (player.facebookId) {
                Util.loadRemoteImg(Util.getFacebookAvatarUrl(player.facebookId, iconWidth, iconHeight), function (error, tex, extra) {
                    if (!error && tex && self._player && (self._player.facebookId === extra)) {
                        if(cc.sys.isObjectValid(self._headIcon)) {
                            var spriteFrame = new cc.SpriteFrame(tex, cc.rect(0, 0, tex.width, tex.height));
                            self._headIcon.setSpriteFrame(spriteFrame);
                        }
                    }
                }, player.facebookId);
            }
        } else {
            this._player = player;
        }
    } else {
        this._otherNode.visible = true;
        this._rankLabel.setString("--");
        this._myNode.visible = false;
        this._scoreNumLabel.setString(0);
        if (this._player) {
            this._headIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(defaultHeadFile));
        }
        this._player = player;
    }
};

PrizePoolPlayerController.createFromCCB = function (prizePoolType) {
    if (prizePoolType == PrizePoolType.PRIZE_POOL_POPUP) {
        var ccbFileName = "slot/prize_pool/oldvegas_prize_pool2_player.ccbi";
        if (DeviceInfo.isHighResolution()) {
            ccbFileName = "slot/prize_pool/oldvegas_prize_pool_player.ccbi";
        }
        return Util.loadNodeFromCCB(ccbFileName, null, "PrizePoolPlayerController", new PrizePoolPlayerController(prizePoolType));
    } else {
        return Util.loadNodeFromCCB("slot/prize_pool/oldvegas_prize_pool_player.ccbi", null, "PrizePoolPlayerController", new PrizePoolPlayerController(prizePoolType));
    }
};

module.exports = PrizePoolPlayerController;