/**
 * Created by qinning on 16/3/10.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");

var TaskBreakChainController = function() {
    this.MAX_CHAIN_COUNT = 3;
    this.chainCount = 0;
};

Util.inherits(TaskBreakChainController,BaseCCBController);

TaskBreakChainController.prototype.onEnter = function () {
};

TaskBreakChainController.prototype.onExit = function () {
};

TaskBreakChainController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

};

TaskBreakChainController.prototype.showBreakChainNormal = function (chainCount) {
    this.chainCount = chainCount;
    var sequenceId = this.MAX_CHAIN_COUNT - chainCount + 1;
    if (sequenceId > 0 && sequenceId <= 3) {
        var sequenceName = Util.sprintf("normal_%d", sequenceId);
        this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
    }
};

TaskBreakChainController.prototype.showBreakChainAnim = function (chainCount) {
    if (this.chainCount > chainCount) {
        this.chainCount = chainCount;
        var sequenceId = this.MAX_CHAIN_COUNT - chainCount;
        if (sequenceId > 0 && sequenceId <= 3) {
            var sequenceName = Util.sprintf("effect_%d", sequenceId);
            this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
        }
    }
};

TaskBreakChainController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

TaskBreakChainController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

TaskBreakChainController.createFromCCB = function() {
    return Util.loadNodeFromCCB("magic_world/common/anim/tasks_thron.ccbi", null, "TaskBreakChainController", new TaskBreakChainController());
};

module.exports = TaskBreakChainController;