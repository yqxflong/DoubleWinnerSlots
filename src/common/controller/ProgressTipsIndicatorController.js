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

var ProgressTipsIndicatorController = function () {
    BaseCCBController.call(this);
    this._labelBig = null;
    this._labelSmall = null;
    this._bgBig = null;
    this._bgSmall = null;
};

Util.inherits(ProgressTipsIndicatorController, BaseCCBController);

ProgressTipsIndicatorController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.CLOSE_INDICATOR, this.close,this);
};

ProgressTipsIndicatorController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.CLOSE_INDICATOR, this.close,this);
};

ProgressTipsIndicatorController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

ProgressTipsIndicatorController.prototype.initWith = function(info, isSmallTips) {
    if (isSmallTips) {
        this._labelSmall.visible = true;
        this._labelBig.visible = false;
        this._bgBig.visible = false;
        this._bgSmall.visible = true;
        this._labelSmall.setString(info);
    } else {
        this._labelSmall.visible = false;
        this._labelBig.visible = true;
        this._bgBig.visible = true;
        this._bgSmall.visible = false;
        this._labelBig.setString(info);
    }
};

ProgressTipsIndicatorController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

ProgressTipsIndicatorController.prototype.close = function (sender) {
    DialogManager.getInstance().close(this.rootNode, true);
};

ProgressTipsIndicatorController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/progress_indicator2.ccbi", null, "ProgressTipsIndicatorController", new ProgressTipsIndicatorController());
    return node;
};

ProgressTipsIndicatorController.close = function() {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.CLOSE_INDICATOR);
};

module.exports = ProgressTipsIndicatorController;