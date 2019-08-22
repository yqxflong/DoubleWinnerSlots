/**
 * Created by qinning on 16/3/10.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");

var TaskFireController = function() {
    this.MAX_CHAIN_COUNT = 3;
    this.fireCount = 0;

    this._frame1 = null;
    this._frame2 = null;
    this._frame3 = null;
};

Util.inherits(TaskFireController, BaseCCBController);

TaskFireController.prototype.onEnter = function () {
};

TaskFireController.prototype.onExit = function () {
};

TaskFireController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

TaskFireController.prototype.showFireNormal = function (fireCount) {
    this.fireCount = fireCount;
    var sequenceId = fireCount;
    if (sequenceId > 0 && sequenceId <= 3) {
        var sequenceName = Util.sprintf("normal_%d", sequenceId);
        this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
        this.setFrameBlendFunc(sequenceId);
    }
};

TaskFireController.prototype.showPutOutFireAnim = function (fireCount) {
    if (this.fireCount > fireCount) {
        this.fireCount = fireCount;
        var sequenceId = fireCount + 1;
        if (sequenceId > 0 && sequenceId <= 3) {
            var sequenceName = Util.sprintf("effect_%d", sequenceId);
            this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
            this.setFrameBlendFunc(sequenceId);
        }
    }
};

TaskFireController.prototype.setFrameBlendFunc = function (animId) {
    switch(animId) {
        case 1:
            this._frame1.setBlendFunc(new cc.BlendFunc(cc.ONE, cc.ONE));
            break;
        case 2:
            this._frame2.setBlendFunc(new cc.BlendFunc(cc.ONE, cc.ONE));
            break;
        case 3:
            this._frame3.setBlendFunc(new cc.BlendFunc(cc.ONE, cc.ONE));
            break;
        default:
            break;
    }
};

TaskFireController.prototype.effect3Callback = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("normal_2");
    this.setFrameBlendFunc(2);
};

TaskFireController.prototype.effect2Callback = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("normal_1");
    this.setFrameBlendFunc(1);
};

TaskFireController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskFireController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskFireController.createFromCCB = function() {
    return Util.loadNodeFromCCB("magic_world/common/anim/fire_effect.ccbi", null, "TaskFireController", new TaskFireController());
};

module.exports = TaskFireController;