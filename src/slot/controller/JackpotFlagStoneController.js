var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var PrizePoolRank = require("../entity/PrizePoolRank");
var AudioHelper = require("../../common/util/AudioHelper");
var JackpotInfo = require("../entity/JackpotInfo");
var JackpotLevel = require("../enum/JackpotLevel");
var SlotConfigMan = require("../config/SlotConfigMan");
/**
 * Created by alanmars on 15/5/21.
 */
var JackpotFlagStoneController = function () {
    BaseCCBController.call(this);
    this._bgSpr = 0;
    this._jackNumLabel = null;
    this._beginnerIcon = null;
    this._intermediate = null;
    this._expertIcon = null;
    this._lineNumLabel = null;

    this._maxLabelWidth = 148;

    this.itemWidth = 0;
    this.itemHeight = 0;
};

Util.inherits(JackpotFlagStoneController, BaseCCBController);

JackpotFlagStoneController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.itemWidth = this._bgSpr.width;
    this.itemHeight = this._bgSpr.height;
};
/**
 *
 * @param {BetAccuJackpotInfo} jackpotInfo
 * @param {int} subjectTmplId
 */
JackpotFlagStoneController.prototype.initWith = function (jackpotInfo, subjectTmplId) {
    this._jackNumLabel.setString(Util.getCommaNum(jackpotInfo.jackpotValue));
    switch(jackpotInfo.jackpotLevel) {
        case JackpotLevel.BEGINNER:
            this._beginnerIcon.visible = true;
            this._intermediate.visible = false;
            this._expertIcon.visible = false;
            break;
        case JackpotLevel.INTERMEDIATE:
            this._beginnerIcon.visible = false;
            this._intermediate.visible = true;
            this._expertIcon.visible = false;
            break;
        case JackpotLevel.EXPERT:
            this._beginnerIcon.visible = false;
            this._intermediate.visible = false;
            this._expertIcon.visible = true;
            break;
    }
    var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subjectTmplId);
    this._bgSpr.setSpriteFrame(Util.sprintf("jackpot_flagstone_%s.png", subjectTmpl.resRootDir));

    Util.scaleCCLabelBMFontWithMaxScale(this._jackNumLabel, this._maxLabelWidth, 0.7);
    this._lineNumLabel.setString(Util.sprintf("%d/Line", jackpotInfo.minSingleBet));
};

JackpotFlagStoneController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_flagstone.ccbi", null, "JackpotFlagStoneController", new JackpotFlagStoneController());
};

module.exports = JackpotFlagStoneController;