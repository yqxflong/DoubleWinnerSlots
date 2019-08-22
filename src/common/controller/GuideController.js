var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var DeviceInfo = require("../util/DeviceInfo");
var FlagStoneNodeFactory = require("../../slot/controller/FlagStoneNodeFactory");
var FlagStoneType = require("../../slot/enum/FlagStoneType");
var TaskConfigMan = require("../../task/config/TaskConfigMan");

var GuideController = function () {
    BaseCCBController.call(this);
};

Util.inherits(GuideController, BaseCCBController);

GuideController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

GuideController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

GuideController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this.rootNode.animationManager.runAnimationsForSequenceNamed("show");

    this.addLevelPoint();
};

GuideController.prototype.addLevelPoint  = function() {
    var guidePointPosX = 82 - cc.winSize.width * 0.5;
    var guidePointPosY = cc.winSize.height - 447 + (768 - cc.winSize.height) - cc.winSize.height * 0.5;
    if(!DeviceInfo.isHighResolution()) {
        guidePointPosY -= 66;
    }

    var guideArrow = Util.loadNodeFromCCB("casino/dialog/casino_arrow.ccbi", null);
    guideArrow.setPosition(cc.p(guidePointPosX + 40, guidePointPosY));
    this.rootNode.addChild(guideArrow);

    var guidePointNode = FlagStoneNodeFactory.create(FlagStoneType.FLAG_STONE_TYPE_GUIDE);
    guidePointNode.setPosition(cc.p(guidePointPosX, guidePointPosY));
    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(1);
    guidePointNode.controller.initWithTaskLevelConfig(taskLevelConfig);
    guidePointNode.controller.setClickCallback(this.guideClickCallback.bind(this));
    this.rootNode.addChild(guidePointNode);
};

GuideController.prototype.guideClickCallback = function () {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("hide");
};

GuideController.prototype.onHideFinished  = function() {
    var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
    var taskLevelConfig = TaskConfigMan.getInstance().getLevelConfig(1);
    var taskList = taskLevelConfig.taskList;
    if (taskList.length > 0) {
        ClassicSlotMan.getInstance().showTaskChooseDlg(taskLevelConfig);
    }

    this.close();
};

GuideController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

GuideController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

GuideController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/dialog/casino_guide.ccbi", null, "GuideController", new GuideController());
    return node;
};

module.exports = GuideController;