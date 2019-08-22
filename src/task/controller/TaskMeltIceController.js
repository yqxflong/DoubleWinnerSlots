/**
 * Created by qinning on 16/3/10.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");

var TaskMeltIceController = function() {
    this.MAX_CHAIN_COUNT = 3;
    this.iceCount = 0;
};

Util.inherits(TaskMeltIceController, BaseCCBController);

TaskMeltIceController.prototype.onEnter = function () {
};

TaskMeltIceController.prototype.onExit = function () {
};

TaskMeltIceController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this.useMaskLayer();
};

TaskMeltIceController.prototype.useMaskLayer = function () {
    if(this.maskLayer != null && !cc.isUndefined(this.maskLayer) && this.clipLayer != null && !cc.isUndefined(this.clipLayer)) {
        var clipParentNode = this.clipLayer.getParent();
        this.clipLayer.retain();
        this.clipLayer.removeFromParent(false);

        this.maskLayer.removeFromParent(false);
        this.maskLayer.visible = true;

        var clippingNode = new cc.ClippingNode(this.maskLayer);
        clippingNode.alphaThreshold = 0.5;
        clippingNode.addChild(this.clipLayer);
        this.clipLayer.release();

        clipParentNode.addChild(clippingNode);
    }
};

TaskMeltIceController.prototype.showIceNormal = function (iceCount) {
    this.iceCount = iceCount;
    var sequenceId = this.MAX_CHAIN_COUNT - iceCount + 1;
    if (sequenceId > 0 && sequenceId <= 3) {
        var sequenceName = Util.sprintf("normal_%d", sequenceId);
        this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
    }
};

TaskMeltIceController.prototype.showMeltIceAnim = function (iceCount) {
    if (this.iceCount > iceCount) {
        this.iceCount = iceCount;
        var sequenceId = this.MAX_CHAIN_COUNT - iceCount;
        if (sequenceId > 0 && sequenceId <= 3) {
            var sequenceName = Util.sprintf("effect_%d", sequenceId);
            this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
        }
    }
};

TaskMeltIceController.prototype.effect1Callback = function (iceCount) {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("normal_2");
};

TaskMeltIceController.prototype.effect2Callback = function (iceCount) {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("normal_3");
};

TaskMeltIceController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskMeltIceController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskMeltIceController.createFromCCB = function() {
    return Util.loadNodeFromCCB("magic_world/common/anim/ice_effect.ccbi", null, "TaskMeltIceController", new TaskMeltIceController());
};

module.exports = TaskMeltIceController;