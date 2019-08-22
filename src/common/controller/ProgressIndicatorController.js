var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../util/AudioHelper");
var AudioPlayer = require("../audio/AudioPlayer");
var CommonEvent = require("../events/CommonEvent");
var EventDispatcher = require("../events/EventDispatcher");
var LoadingProgressData = require("../events/LoadingProgressData");

/**
 * Created by qinning on 15/5/22.
 */

var ProgressIndicatorController = function () {
    BaseCCBController.call(this);
};

Util.inherits(ProgressIndicatorController, BaseCCBController);

ProgressIndicatorController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.CLOSE_INDICATOR, this.close,this);
};

ProgressIndicatorController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.CLOSE_INDICATOR, this.close,this);
};

ProgressIndicatorController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

ProgressIndicatorController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

ProgressIndicatorController.prototype.close = function (sender) {
    DialogManager.getInstance().close(this.rootNode, true);
};

ProgressIndicatorController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/progress_indicator.ccbi", null, "ProgressIndicatorController", new ProgressIndicatorController());
    return node;
};

ProgressIndicatorController.close = function() {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.CLOSE_INDICATOR);
};

module.exports = ProgressIndicatorController;