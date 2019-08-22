/**
 * Created by alanmars on 15/7/16.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var BaseCCBController = require("./../../common/controller/BaseCCBController");

var JackpotWinnerController = function() {
    this._winnerNameLabel = null;
    this._subjectNameLabel = null;
    this._headIcon = null;
    this._winLabel = null;
};

Util.inherits(JackpotWinnerController, BaseCCBController);

JackpotWinnerController.prototype.onEnter = function () {
};

JackpotWinnerController.prototype.onExit = function () {
};

/**
 * @param {SlotOtherWinJackpotData} otherWinJackpotData
 */
JackpotWinnerController.prototype.initWith = function (otherWinJackpotData) {
    /**
     * @type {BasePlayer}
     */
    var basePlayer = otherWinJackpotData.winner;
    if (basePlayer.fbName) {
        this._winnerNameLabel.setString(Util.omitText(basePlayer.fbName,15));
    } else {
        this._winnerNameLabel.setString(Util.sprintf("guest %d", basePlayer.id));
    }
    this._subjectNameLabel.setString(otherWinJackpotData.subjectName);
    this._winLabel.setString(Util.getCommaNum(otherWinJackpotData.winChips));

    if (basePlayer.facebookId) {
        var self = this;
        Util.loadRemoteImg(Util.getFacebookAvatarUrl(basePlayer.facebookId, 52, 52), function (error, tex, extra) {
            if (!error && tex && (basePlayer.facebookId === extra)) {
                if(cc.sys.isObjectValid(self._headIcon)) {
                    self._headIcon.initWithTexture(tex, cc.rect(0, 0, tex.width, tex.height));
                }
            }
        }, basePlayer.facebookId);
    }
};

JackpotWinnerController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

JackpotWinnerController.prototype.onAnimCompleted = function (sender) {
    this.rootNode.removeFromParent(true);
};

JackpotWinnerController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_winner.ccbi", null, "JackpotWinnerController", new JackpotWinnerController());
};

module.exports = JackpotWinnerController;