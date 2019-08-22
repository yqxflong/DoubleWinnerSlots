var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var PrizePoolRank = require("../entity/PrizePoolRank");
var AudioHelper = require("../../common/util/AudioHelper");
var JackpotFlagStoneController = require("./JackpotFlagStoneController");
var JackpotInfo = require("../entity/JackpotInfo");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var CommonEvent = require("../../common/events/CommonEvent");
var EventDispatcher = require("../../common/events/EventDispatcher");

var JackpotFlagStoneView = cc.TableViewCell.extend({
    /**
     * @params {BetAccuJackpotInfo}
     */
    jackpotInfo: null,
    flagStoneNode: null,
    ctor: function () {
        this._super();
        this.flagStoneNode = JackpotFlagStoneController.createFromCCB();
        this.addChild(this.flagStoneNode);
        this.flagStoneNode.x = this.flagStoneNode.controller.itemWidth / 2;
        this.flagStoneNode.y = this.flagStoneNode.controller.itemHeight / 2;
    },
    /**
     * @param {BetAccuJackpotInfo} jackpotInfo
     * @param {int} subjectTmplId
     */
    bindData: function (jackpotInfo, subjectTmplId) {
        this.jackpotInfo = jackpotInfo;
        this.flagStoneNode.controller.initWith(jackpotInfo, subjectTmplId);
    }
});

/**
 * Created by alanmars on 15/5/21.
 */
var JackpotEnterController = function () {
    BaseCCBController.call(this);
    this._betPerLineLabel = null;
    this._betPerLineTitleLabel = null;
    this._slotNameLabel = null;
    this._leftItem = null;
    this._rightItem = null;
    this._containerNode = null;
    this._refreshItem = null;

    this._subject = null;
    this._tableView = null;

    this._isRunningAnim = false;
};

Util.inherits(JackpotEnterController, BaseCCBController);


JackpotEnterController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.UPDATE_JACKPOT_INFO_LIST, this.onReceivedJackpotInfos,this);
};

JackpotEnterController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.UPDATE_JACKPOT_INFO_LIST, this.onReceivedJackpotInfos,this);
};

JackpotEnterController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._leftItem.visible = false;
    this._rightItem.visible = false;
    this._betPerLineLabel.visible = false;
    this._betPerLineTitleLabel.visible = false;
    this._refreshItem.visible = false;
};

JackpotEnterController.prototype.onReceivedJackpotInfos = function (event) {
    cc.log("JackpotEnterController.prototype.onReceivedJackpotInfos");
    if(this._subject.jackpotInfoList && this._subject.jackpotInfoList.length > 0) {
        this.showFlagStoneTableView();
    }
};

/**
 *
 * @param {Subject} subject
 */
JackpotEnterController.prototype.initWith = function (subject) {
    this._subject = subject;
    var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
    this._slotNameLabel.setString(subjectTmpl.displayName + " Slots");
    if(this._subject.jackpotInfoList && this._subject.jackpotInfoList.length > 0) {
        this.showFlagStoneTableView();
    }
    ClassicSlotMan.getInstance().sendGetSubjectJackpotInfos(this._subject.subjectId);
};

JackpotEnterController.prototype.showFlagStoneTableView = function () {
    if(!this._tableView) {
        var tableView = new cc.TableView(this, this._containerNode.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        tableView.ignoreAnchorPointForPosition(false);
        tableView.setAnchorPoint(cc.p(0, 0));
        tableView.setPosition(cc.p(0, 0));
        tableView.setDelegate(this);
        this._containerNode.addChild(tableView);
        this._tableView = tableView;
    }
    this._tableView.reloadData();
};

JackpotEnterController.prototype.scrollViewDidScroll = function (view) {
    this._onTableViewOffsetChanged();
};

JackpotEnterController.prototype.scrollViewDidZoom = function (view) {

};

JackpotEnterController.prototype.tableCellTouched = function (table, cell) {
    cc.log("cell touched at index: " + cell.getIdx());

    AudioHelper.playBtnClickSound();
    ClassicSlotMan.getInstance().setJackpotIndex(cell.getIdx());
    var SceneType = require("../../common/enum/SceneType");
    var SceneMan = require("../../common/model/SceneMan");
    SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);
    var self = this;
    this.rootNode.scheduleOnce(function() {
        self.close();
    },0);
};

JackpotEnterController.prototype.tableCellSizeForIndex = function (table, idx) {
    return cc.size(233, 350);
};

JackpotEnterController.prototype.tableCellAtIndex = function (table, idx) {
    var cell = table.dequeueCell();
    if (!cell) {
        cell = new JackpotFlagStoneView();
    }
    cell.bindData(this._subject.jackpotInfoList[idx], this._subject.subjectTmplId);
    return cell;
};

JackpotEnterController.prototype.numberOfCellsInTableView = function (table) {
    return this._subject.jackpotInfoList.length;
};

JackpotEnterController.prototype.horizontalPrev = function (sender) {
    this._leftItem.visible = false;
    this._rightItem.visible = false;

    var offsetX = this._tableView.getContentOffset().x;
    var maxOffsetX = this._tableView.maxContainerOffset().x;
    var moveOffset = Math.min(maxOffsetX - offsetX, 768) + offsetX;
    this._tableView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
    this._isRunningAnim = true;

    this.rootNode.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
};

JackpotEnterController.prototype.horizontalNext = function (sender) {
    this._leftItem.visible = false;
    this._rightItem.visible = false;

    var offsetX = this._tableView.getContentOffset().x;
    var minOffsetX = this._tableView.minContainerOffset().x;
    var moveOffset = Math.max(minOffsetX - offsetX, -768) + offsetX;
    this._tableView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
    this._isRunningAnim = true;

    this.rootNode.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
};

JackpotEnterController.prototype.onTableViewOffsetChanged = function () {
    this._isRunningAnim = false;
    this._onTableViewOffsetChanged();
};

JackpotEnterController.prototype._onTableViewOffsetChanged = function () {
    if(this._isRunningAnim) {
        return;
    }
    var offsetX = Math.round(this._tableView.getContentOffset().x);
    var minOffsetX = Math.round(this._tableView.minContainerOffset().x);
    var maxOffsetX = Math.round(this._tableView.maxContainerOffset().x);
    if(minOffsetX > 0) {
        this._leftItem.visible = false;
        this._rightItem.visible = false;
        return;
    }
    if (offsetX <= minOffsetX) {
        this._leftItem.visible = true;
        this._rightItem.visible = false;
    } else if (offsetX >= maxOffsetX) {
        this._leftItem.visible = false;
        this._rightItem.visible = true;
    } else {
        this._leftItem.visible = true;
        this._rightItem.visible = true;
    }
};

JackpotEnterController.prototype.refreshClicked = function (sender) {
    AudioHelper.playBtnClickSound();

};

JackpotEnterController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

JackpotEnterController.prototype.rightClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.horizontalNext();
};

JackpotEnterController.prototype.leftClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.horizontalPrev();
};

JackpotEnterController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

JackpotEnterController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

JackpotEnterController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_enter.ccbi", null, "JackpotEnterController", new JackpotEnterController());
};

module.exports = JackpotEnterController;