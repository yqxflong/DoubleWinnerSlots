/**
 * Created by qinning on 15/12/14.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var DialogManager = require("../../common/popup/DialogManager");
var ArrowTableView = require("../../common/ext/ArrowTableView");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var SubjectClassify = require("../../slot/enum/SubjectClassify");
var FlagStoneController = require("../../slot/controller/FlagStoneController");
var EventDispatcher = require("../events/EventDispatcher");
var CommonEvent = require("../events/CommonEvent");
var FlagStoneCommingSoonController = require("../../slot/controller/FlagStoneCommingSoonController");
var TaskMan = require("../../task/model/TaskMan");

var FLAG_STONE_WIDTH = 280;
var FLAG_STONE_HEIGHT = 410;

var LobbyFlagStoneItemView = cc.TableViewCell.extend({
    /**
     * @types {cc.Node}
     */
    _flagStoneItemNode: null,

    initWith: function (subject) {
        if (this._flagStoneItemNode) {
            this._flagStoneItemNode.removeFromParent();
        }
        this._flagStoneItemNode = FlagStoneController.createFromCCB(subject.ccbName);
        this.addChild(this._flagStoneItemNode);
        this._flagStoneItemNode.setPosition(cc.p(FLAG_STONE_WIDTH / 2, FLAG_STONE_HEIGHT / 2 + 30));
        this._flagStoneItemNode.controller.initWithSubject(subject);
    },

    initCommingSoonView: function () {
        if (this._flagStoneItemNode) {
            this._flagStoneItemNode.removeFromParent();
        }
        this._flagStoneItemNode = FlagStoneCommingSoonController.createFromCCB("slot/lobby/flagstone/slot_lobby_flagstone_coming_soon.ccbi");
        this.addChild(this._flagStoneItemNode);
        this._flagStoneItemNode.setPosition(cc.p(FLAG_STONE_WIDTH / 2, FLAG_STONE_HEIGHT / 2));
    }
});


var LobbyFreeModeController = function() {
    this._contentNode = null;
    this._leftArrowItem = null;
    this._rightArrowItem = null;
    this._slotsNumLabel = null;
    this._starNumLabel = null;

    this._subjectList = SlotConfigMan.getInstance().getSubjectListByType(SubjectClassify.SUBJECT_CLASSIFY_ALL);

};

Util.inherits(LobbyFreeModeController, BaseCCBController);

LobbyFreeModeController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.CLOSE_SUBJECT_FREE_MODE_DIALOG, this.close, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.UNLOCK_SUBJECT, this.unlockSubject, this);
};

LobbyFreeModeController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.UNLOCK_SUBJECT, this.unlockSubject, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.CLOSE_SUBJECT_FREE_MODE_DIALOG, this.close, this);
};

LobbyFreeModeController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.updateUnlockNum();
    this.showSubjectTableView();
    this._starNumLabel.setString(TaskMan.getInstance().getTaskStarNum());
};

LobbyFreeModeController.prototype.updateUnlockNum = function () {
    var openCount = TaskMan.getInstance().getOpenSubjectCount();
    var allCount = TaskMan.getInstance().getAllSubjectCount();
    this._slotsNumLabel.setString(Util.sprintf("%d/%d", openCount, allCount));
};

LobbyFreeModeController.prototype.showSubjectTableView = function () {
    if (!this._tableView) {
        this._tableView = new ArrowTableView(this, this._contentNode.getContentSize());
        this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._tableView.setDelegate(this);
        this._contentNode.addChild(this._tableView);
        this._tableView.setArrowItem(this._leftArrowItem, this._rightArrowItem);
    }
    this._tableView.reloadData();
};

LobbyFreeModeController.prototype.leftArrowClicked = function (sender) {
    this._tableView.leftArrowClicked(sender);
};

LobbyFreeModeController.prototype.rightArrowClicked = function (sender) {
    this._tableView.rightArrowClicked(sender);
};

LobbyFreeModeController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

LobbyFreeModeController.prototype.scrollViewDidScroll = function (view) {
};

LobbyFreeModeController.prototype.scrollViewDidZoom = function (view) {
};

LobbyFreeModeController.prototype.tableCellTouched = function (table, cell) {
    cc.log("cell touched at index: " + cell.getIdx());
};

LobbyFreeModeController.prototype.tableCellSizeForIndex = function (table, idx) {
    return cc.size(FLAG_STONE_WIDTH, this._contentNode.height);
};

LobbyFreeModeController.prototype.tableCellAtIndex = function (table, idx) {
    var cell = table.dequeueCell();
    if (!cell) {
        cell = new LobbyFlagStoneItemView();
    }
    if (idx < this._subjectList.length) {
        cell.initWith(this._subjectList[idx]);
    }
    //else {
    //    cell.initCommingSoonView();
    //}
    return cell;
};

LobbyFreeModeController.prototype.numberOfCellsInTableView = function (table) {
    return this._subjectList.length;
};

LobbyFreeModeController.prototype.unlockSubject = function (event) {
    this.updateUnlockNum();
};

LobbyFreeModeController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

LobbyFreeModeController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

LobbyFreeModeController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/free_mode/lobby_free_mode.ccbi", null, "LobbyFreeModeController", new LobbyFreeModeController());
};

module.exports = LobbyFreeModeController;