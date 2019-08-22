/**
 * Created by qinning on 16/1/9.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");

var HourlyBonusSpecialCardController = function () {
    this._cardIcon = null;

    /**
     * @type {Function}
     * @private
     */
    this._specialAnimEndCallfunc = null;
};

Util.inherits(HourlyBonusSpecialCardController, BaseCCBController);

HourlyBonusSpecialCardController.prototype.onEnter = function () {
};

HourlyBonusSpecialCardController.prototype.onExit = function () {
};

HourlyBonusSpecialCardController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

HourlyBonusSpecialCardController.prototype.showSpecialAnimation = function (animEndCallfunc) {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("anim");
    this._specialAnimEndCallfunc = animEndCallfunc;
};

HourlyBonusSpecialCardController.prototype.onAnimEnd = function (target) {
    if (this._specialAnimEndCallfunc) {
        this._specialAnimEndCallfunc();
    }
    this.rootNode.removeFromParent();
};

HourlyBonusSpecialCardController.createFromCCB = function (fileName) {
    return Util.loadNodeFromCCB(fileName, null, "HourlyBonusSpecialCardController", new HourlyBonusSpecialCardController());
};

module.exports = HourlyBonusSpecialCardController;