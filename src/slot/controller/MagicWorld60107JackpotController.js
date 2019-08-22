/**
 * Created by ZenQhy on 16/6/1.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var DeviceInfo = require("../../common/util/DeviceInfo");

var MagicWorld60107JackpotController = function() {
    this._copperLabel = null;
    this._silverLabel = null;
    this._goldLabel = null;

    this._goldNode = null;
    this._silverNode = null;
    this._copperNode = null;

    this.goldGemNodes = [];
    this.silverGemNodes = [];
    this.copperGemNodes = [];

    this._copperLabelAnim = null;
    this._silverLabelAnim = null;
    this._goldLabelAnim = null;
};

Util.inherits(MagicWorld60107JackpotController, BaseCCBController);

MagicWorld60107JackpotController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

MagicWorld60107JackpotController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

MagicWorld60107JackpotController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    if(this._goldNode) {
        this.goldGemNodes.push(this._goldNode.getChildByTag(1));
        this.goldGemNodes.push(this._goldNode.getChildByTag(2));
        this.goldGemNodes.push(this._goldNode.getChildByTag(3));
    }

    if(this._silverNode) {
        this.silverGemNodes.push(this._silverNode.getChildByTag(1));
        this.silverGemNodes.push(this._silverNode.getChildByTag(2));
        this.silverGemNodes.push(this._silverNode.getChildByTag(3));
    }

    if(this._copperNode) {
        this.copperGemNodes.push(this._copperNode.getChildByTag(1));
        this.copperGemNodes.push(this._copperNode.getChildByTag(2));
        this.copperGemNodes.push(this._copperNode.getChildByTag(3));
    }

    this._copperLabelAnim = new NumberAnimation(this._copperLabel);
    this._copperLabelAnim.tickDuration = 1.0;
    this._copperLabelAnim.tickInterval = 0.05;

    this._silverLabelAnim = new NumberAnimation(this._silverLabel);
    this._silverLabelAnim.tickDuration = 1.0;
    this._silverLabelAnim.tickInterval = 0.05;

    this._goldLabelAnim = new NumberAnimation(this._goldLabel);
    this._goldLabelAnim.tickDuration = 1.0;
    this._goldLabelAnim.tickInterval = 0.05;
};

MagicWorld60107JackpotController.prototype.setJackpot = function(minorCoins, majorCoins, grandCoins) {
    this._copperLabel.setString(Util.getCommaNum(minorCoins));
    this._silverLabel.setString(Util.getCommaNum(majorCoins));
    this._goldLabel.setString(Util.getCommaNum(grandCoins));
};

MagicWorld60107JackpotController.prototype.refreshJackpot = function(minorCoins, majorCoins, grandCoins) {
    this._copperLabelAnim.startNum = Util.unformatCommaNum(this._copperLabel.getString());
    this._copperLabelAnim.endNum = minorCoins;
    this._copperLabelAnim.start();

    this._silverLabelAnim.startNum = Util.unformatCommaNum(this._silverLabel.getString());
    this._silverLabelAnim.endNum = majorCoins;
    this._silverLabelAnim.start();

    this._goldLabelAnim.startNum = Util.unformatCommaNum(this._goldLabel.getString());
    this._goldLabelAnim.endNum = grandCoins;
    this._goldLabelAnim.start();
};

MagicWorld60107JackpotController.prototype.playWinGoldAnim = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("gold");
};

MagicWorld60107JackpotController.prototype.playWinSilverAnim = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("silver");
};

MagicWorld60107JackpotController.prototype.playWinCopperAnim = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("copper");
};

MagicWorld60107JackpotController.prototype.getGemPos = function (gemType, gemCount) {
    var heightDelta = 0;
    switch(gemType) {
        case 0:
            return this.rootNode.convertToWorldSpace(cc.pAdd(this.copperGemNodes[gemCount].getPosition(), cc.p(-230, heightDelta)));
            break;
        case 1:
            return this.rootNode.convertToWorldSpace(cc.pAdd(this.silverGemNodes[gemCount].getPosition(), cc.p(0, heightDelta)));
            break;
        case 2:
            return this.rootNode.convertToWorldSpace(cc.pAdd(this.goldGemNodes[gemCount].getPosition(), cc.p(250, heightDelta)));
            break;
    }
    return cc.p(0, 0);
};

MagicWorld60107JackpotController.createFromCCB = function() {
    return Util.loadNodeFromCCB("magic_world/jackpot/magic_world_jackpot_back.ccbi", null, "Jackpot60107Controller", new MagicWorld60107JackpotController());
};

module.exports = MagicWorld60107JackpotController;